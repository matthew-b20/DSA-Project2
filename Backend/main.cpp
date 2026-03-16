#include <iostream>
#include <string>
#include "../Dependencies/Crow/include/crow.h"
using namespace std;

int main() {
    crow::SimpleApp app;

    //TESTING
    CROW_ROUTE(app, "/")([](){
        return "You have successfully reached the Crow server :D";
    });

    //MIN-MAX HEAP ROUTE
    CROW_ROUTE(app, "/minmax/<int>/<string>")([](int num, string method){
        if(method == "min") {
            //extract num lowest from min-max heap
            return "You have reached the MIN-MAX HEAP *min* extraction endpoint.";
        }
        else if (method == "max") {
            //extract num highest from min-max heap
            return "You have reached the MIN-MAX HEAP *max* extraction endpoint.";
        }
        else {
            return "You have reached the MIN-MAX HEAP endpoint but your arguments are invalid.";
        }
    });

    //DEAP ROUTE
    CROW_ROUTE(app, "/deap/<int>/<string>")([](int num, string method){
        if(method == "min") {
            //extract num lowest from min-max heap
            return "You have reached the DEAP *min* extraction endpoint.";
        }
        else if (method == "max") {
            //extract num highest from min-max heap
            return "You have reached the DEAP *max* extraction endpoint.";
        }
        else {
            return "You have reached the DEAP endpoint but your arguments are invalid.";
        }
    });

    app.port(18080).multithreaded().run(); //multithreading recommended by docs

    return 0;
}