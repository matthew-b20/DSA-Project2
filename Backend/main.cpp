#include <iostream>
#include <string>
#include <chrono> // for timing of the methods
#include "./Crow/include/crow.h"
#include "GeoJSONHeapWrapper.h"
#include "MinMax.h"
using namespace std;
using namespace chrono;

int main() {
    crow::SimpleApp app;

    //TESTING
    CROW_ROUTE(app, "/")([](){
        return "You have successfully reached the Crow server :D";
    });

    //MIN-MAX HEAP ROUTE
    CROW_ROUTE(app, "/minmax/<int>/<int>/<string>/<string>")([](int billing_period, int num, string variable, string method){
        //make MinMaxHeap
        //hardcoding file path for now b/c it doesn't seem to want to work otherwise...
        GeoJSONHeapWrapper<MinMax<json>> MinMaxHeap("/Users/charlotte/CLionProjects/OWA_DSA/DSAProject2/OviedoWaterJSON.geojson");

        // JSON initialization and standard fields
        crow::json::wvalue response;
        response["DataStructure"] = "Min-max";
        response["BillingPeriod"] = billing_period;
        response["Number"] = num;
        response["VariableOfInterest"] = variable;
        response["Method"] = method;

        if(method == "Min" || method == "Both") {
            auto start = steady_clock::now();

            //extract num lowest from min-max heap & add to JSON
            crow::json::wvalue::list min_users;
            for (int i = 0; i < num; i++) {
                json parcel = MinMaxHeap.pop_min(); // returns json object that needs to be parsed and added to return json
                crow::json::wvalue entry;
                entry["Address"] = parcel.at("properties")["Address"].get<string>();
                entry["LocationCode"] =  parcel.at("properties")["LocationCode"].get<float>();;
                entry["Consump"] =  parcel.at("properties")["Consump"].get<float>();;

                //special handling for coords
                crow::json::wvalue::list coords;
                coords.push_back(parcel.at("geometry")["coordinates"][0].get<double>());
                coords.push_back(parcel.at("geometry")["coordinates"][1].get<double>());
                entry["Coordinates"] = move(coords);

                min_users.push_back(move(entry));
            }

            response["MinUsers"] = move(min_users);

            auto end = steady_clock::now();
            auto elapsed = duration_cast<nanoseconds>(end-start).count();
            response["Time"] = elapsed;

            cout << "You have reached the MIN-MAX HEAP *min* extraction endpoint.";
        }
        if (method == "Max" || method == "Both") {
            auto start = steady_clock::now();

            //extract num highest from min-max heap & add to JSON
            crow::json::wvalue::list max_users;
            for (int i = 0; i < num; i++) {
                json parcel = MinMaxHeap.pop_max(); // returns json object that needs to be parsed and added to return json
                crow::json::wvalue entry;
                entry["Address"] = parcel.at("properties")["Address"].get<string>();
                entry["LocationCode"] =  parcel.at("properties")["LocationCode"].get<float>(); //will change to int later once i fix the geoJSON
                entry["Consump"] =  parcel.at("properties")["Consump"].get<float>();;

                //special handling for coords
                crow::json::wvalue::list coords;
                coords.push_back(parcel.at("geometry")["coordinates"][0].get<double>());
                coords.push_back(parcel.at("geometry")["coordinates"][1].get<double>());
                entry["Coordinates"] = move(coords);

                max_users.push_back(move(entry));
            }

            response["MaxUsers"] = move(max_users);

            auto end = steady_clock::now();
            auto elapsed = duration_cast<nanoseconds>(end-start).count();
            response["Time"] = elapsed;

            cout << "You have reached the MIN-MAX HEAP *max* extraction endpoint.";
        }
        if (method != "Max" && method != "Min" && method != "Both") {
            cout << "You have reached the MIN-MAX HEAP endpoint but your arguments are invalid.";
        }

        return response;
    });

    //DEAP ROUTE
    CROW_ROUTE(app, "/deap/<int>/<int>/<string>/<string>")([](int billing_period, int num, string variable, string method){
        // JSON initialization and standard fields
        crow::json::wvalue response;
        response["Data structure"] = "deap";
        response["Billing period"] = billing_period;
        response["Number"] = num;
        response["Variable of interest"] = variable;
        response["Method"] = method;

        if(method == "Min" || method == "Both") {
            auto start = steady_clock::now();

            //extract num lowest from min-max heap & add to JSON

            auto end = steady_clock::now();
            auto elapsed = duration_cast<nanoseconds>(end-start).count();
            response["Time"] = elapsed;

            cout << "You have reached the DEAP *min* extraction endpoint.";
        }
        if (method == "Max" || method == "Both") {
            auto start = steady_clock::now();

            //extract num highest from min-max heap & add to JSON

            auto end = steady_clock::now();
            auto elapsed = duration_cast<nanoseconds>(end-start).count();
            response["Time"] = elapsed;

            cout << "You have reached the DEAP *max* extraction endpoint.";
        }
        if (method != "Min" && method != "Max" && method != "Both") {
            cout << "You have reached the DEAP endpoint but your arguments are invalid.";
        }

        return response;
    });

    app.port(18080).multithreaded().run(); //multithreading recommended by docs

    return 0;
}