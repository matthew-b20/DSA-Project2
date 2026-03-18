#include <iostream>
#include <string>
#include <chrono> // for timing of the methods
#include "../Dependencies/Crow/include/crow.h"
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
        response["Data structure"] = "Min-max";
        response["Billing period"] = billing_period;
        response["Number"] = num;
        response["Variable of interest"] = variable;
        response["Method"] = method;

        if(method == "min") {
            auto start = steady_clock::now();

            //extract num lowest from min-max heap & add to JSON
            auto end = steady_clock::now();
            auto elapsed = duration_cast<nanoseconds>(end-start).count();
            response["Time elapsed (nanoseconds)"] = elapsed;

            cout << "You have reached the MIN-MAX HEAP *min* extraction endpoint.";
        }
        else if (method == "max") {
            auto start = steady_clock::now();

            //extract num highest from min-max heap & add to JSON

            auto end = steady_clock::now();
            auto elapsed = duration_cast<nanoseconds>(end-start).count();
            response["Time elapsed (nanoseconds)"] = elapsed;

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
            response["Time elapsed (nanoseconds)"] = elapsed;

            cout << "You have reached the DEAP *min* extraction endpoint.";
        }
        else if (method == "max") {
            auto start = steady_clock::now();

            //extract num highest from min-max heap & add to JSON

            auto end = steady_clock::now();
            auto elapsed = duration_cast<nanoseconds>(end-start).count();
            response["Time elapsed (nanoseconds)"] = elapsed;

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