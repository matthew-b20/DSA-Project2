#include <iostream>
#include <string>
#include <chrono> // for timing of the methods
#include <utility> // for move()
#include "./Crow/include/crow.h"
#include "HeapWrapper.h"
#include "MinMax.h"
#include "Deap.h"
using namespace std;
using namespace chrono;

// HELPER FUNCTION -- formats a single JSON parcel into a Crow JSON object
crow::json::wvalue formatParcel(const Parcel& parcel, const string& desired_water_bill) {
    crow::json::wvalue entry;
    entry["Address"] = parcel.address;
    entry["LocationCode"] = parcel.location_code;
    entry["Consump"] = parcel.consumption;

    //special handling for coords
    crow::json::wvalue::list coords;
    coords.push_back(parcel.lat);
    coords.push_back(parcel.lon);
    entry["Coordinates"] = std::move(coords); //fast ideally

    return entry;
}

int main() {
    //parse file before routes start
    ifstream file("/Users/charlotte/CLionProjects/OWA_DSA/DSAProject2/OviedoWaterWide.geojson");
    json parsed_geojson = nlohmann::json::parse(file);

    crow::SimpleApp app;

    CROW_ROUTE(app, "/")([](){
        return "You have successfully reached the Crow server :D";
    });

    // UNIFIED ROUTE: Handles both MinMax and DEAP!
    CROW_ROUTE(app, "/<string>/<int>/<int>/<string>/<string>/<string>/<int>/<string>")
    ([&parsed_geojson](string data_structure, int billing_period, int num, string variable, string method, string cat, int exclude, string subdiv){

        //Validate method
        if (method != "Min" && method != "Max" && method != "Both") {
            return crow::response(400, "Invalid method argument.");
        }

        //Initialize the base JSON to be returned
        crow::json::wvalue response;
        response["DataStructure"] = data_structure;
        response["BillingPeriod"] = billing_period;
        response["Number"] = num;
        response["VariableOfInterest"] = variable;
        response["Method"] = method;
        response["PropertyCategory"] = cat;
        response["ExcludeZeroes"] = exclude;

        // Start the clock, tickity-tock
        auto start = steady_clock::now();

        // Delegation to a specific one of the heaps
        if (data_structure == "minmax") {
            //make MinMaxHeap
            //hardcoding file path for now b/c it doesn't seem to want to work otherwise...
            HeapWrapper<MinMax<Parcel>> heap(parsed_geojson,billing_period, variable, cat, exclude, subdiv);

            if (method == "Min" || method == "Both") {
                crow::json::wvalue::list min_users;

                for (int i = 0; i < num && !heap.is_empty(); i++) {
                    min_users.push_back(formatParcel(heap.pop_min(), heap.desired_water_bill));
                }

                response["MinUsers"] = std::move(min_users);
            }

            if (method == "Max" || method == "Both") {
                crow::json::wvalue::list max_users;

                for (int i = 0; i < num && !heap.is_empty(); i++) {
                    max_users.push_back(formatParcel(heap.pop_max(), heap.desired_water_bill));
                }

                response["MaxUsers"] = std::move(max_users);
            }
        }

        else if (data_structure == "deap") {
            //implement Deap logic here using the same approach
            //make Deap
            //hardcoding file path for now b/c it doesn't seem to want to work otherwise...
            HeapWrapper<Deap<Parcel>> heap(parsed_geojson,billing_period, variable, cat, exclude, subdiv);

            if (method == "Min" || method == "Both") {
                crow::json::wvalue::list min_users;

                for (int i = 0; i < num && !heap.is_empty(); i++) {
                    min_users.push_back(formatParcel(heap.pop_min(), heap.desired_water_bill));
                }

                response["MinUsers"] = std::move(min_users);
            }

            if (method == "Max" || method == "Both") {
                crow::json::wvalue::list max_users;

                for (int i = 0; i < num && !heap.is_empty(); i++) {
                    max_users.push_back(formatParcel(heap.pop_max(), heap.desired_water_bill));
                }

                response["MaxUsers"] = std::move(max_users);
            }
        }

        else {
            return crow::response(400, "Unknown data structure.");
        }

        // End clock and add the time to the return JSON
        auto end = steady_clock::now();
        response["Time"] = duration_cast<milliseconds>(end - start).count();

        return crow::response(response);
    });

    app.port(18080).multithreaded().run();
    return 0;
}