#include <iostream>
#include <string>
#include <chrono> // for timing of the methods
#include "./Crow/include/crow.h"
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
        // JSON initialization and standard fields
        crow::json::wvalue response;
        response["DataStructure"] = "Min-max";
        response["BillingPeriod"] = billing_period;
        response["Number"] = num;
        response["VariableOfInterest"] = variable;
        response["Method"] = method;

        //ADD FAKE USERS FOR NOW (FOR TESTING)
        crow::json::wvalue::list min_users;

        for (auto& [address, location_code, consumption, lng, lat] : vector<tuple<string, string, int, double, double>>{
            {"123 Oak St", "12345", 1, -81.1637, 28.6700},
            {"456 Maple Ave", "54321", 2, -81.1589, 28.6723},
            {"789 Pine Rd", "12312", 3, -81.1712, 28.6651},
            {"321 Elm Blvd", "32132", 4, -81.1558, 28.6689},
            {"654 Cedar Ln", "11111", 5, -81.1680, 28.6742},
        }) {
            crow::json::wvalue entry;
            entry["Address"] = address;
            entry["LocationCode"] = location_code;
            entry["Consump"] = consumption;
            entry["Coordinates"] = vector<double>{lng, lat};
            min_users.push_back(move(entry));
        }

        crow::json::wvalue::list max_users = min_users;
        response["MinUsers"] = move(min_users);
        response["MaxUsers"] = move(max_users); //just pretending for now
        //END OF FAKE USER ADDING

        if(method == "min") {
            auto start = steady_clock::now();

            //extract num lowest from min-max heap & add to JSON
            auto end = steady_clock::now();
            auto elapsed = duration_cast<nanoseconds>(end-start).count();
            response["Time"] = elapsed;

            cout << "You have reached the MIN-MAX HEAP *min* extraction endpoint.";
        }
        else if (method == "max") {
            auto start = steady_clock::now();

            //extract num highest from min-max heap & add to JSON

            auto end = steady_clock::now();
            auto elapsed = duration_cast<nanoseconds>(end-start).count();
            response["Time"] = elapsed;

            cout << "You have reached the MIN-MAX HEAP *max* extraction endpoint.";
        }
        else {
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

        if(method == "min") {
            auto start = steady_clock::now();

            //extract num lowest from min-max heap & add to JSON

            auto end = steady_clock::now();
            auto elapsed = duration_cast<nanoseconds>(end-start).count();
            response["Time"] = elapsed;

            cout << "You have reached the DEAP *min* extraction endpoint.";
        }
        else if (method == "max") {
            auto start = steady_clock::now();

            //extract num highest from min-max heap & add to JSON

            auto end = steady_clock::now();
            auto elapsed = duration_cast<nanoseconds>(end-start).count();
            response["Time"] = elapsed;

            cout << "You have reached the DEAP *max* extraction endpoint.";
        }
        else {
            cout << "You have reached the DEAP endpoint but your arguments are invalid.";
        }

        return response;
    });

    app.port(18080).multithreaded().run(); //multithreading recommended by docs

    return 0;
}