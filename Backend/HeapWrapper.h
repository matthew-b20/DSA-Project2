#pragma once

#include <fstream>
#include <stdexcept>
#include <string>
#include <nlohmann/json.hpp>
#include "MinMax.h"

using namespace std;
using json = nlohmann::json; //TYPE ALIAS (renaming type)

//This will be a wrapper to make the Deap and MinMax Heap compatible with the geoJSON data
//and allow each node to be a JSON-style object

//IMPORTANT JSON IMPLEMENTATION NOTE:
//MinMaxHeap uses an unordered_map internally to keep track of the JSON nodes.
//Unordered maps need to have hashable keys, but nlohmann::json doesn't come w/ a hash function
//Which means unordered_map<json, int> would fail unless we specifically make it not fail
//Since each property has a unique location code, then that's what will get used as unique_key

//ADD into the standard namespace b/c hash lives inside namespace std
namespace std {

    template <> //define a specific implementation of a template
    struct hash<json> { //defining hash specifically for json
        size_t operator()(const json& feature) const {

            //SHOULD HOPEFULLY STOP SERVER FROM CRASHING DUE TO ISSUES W/ DEAP:
            if (feature.is_null() || !feature.is_object() || !feature.contains("properties")) {
                return 0;
            }

            const json& properties = feature.at("properties");

            if (properties.contains("LocationCode") && !properties["LocationCode"].is_null()) {
                //hashing only the unique identifier
                string id = properties["LocationCode"].is_string() ?
                    properties["LocationCode"].get<string>() :
                    to_string(properties["LocationCode"].get<float>());

                //hash<string> is the type, {} creates a temporary object, then (id) is called on it
                //the operator() is an instance method so you must create a temp instance w/ {} to use it
                return hash<string>{}(id);
            }

            //Fallback (but shouldn't be needed)
            //hashing the entire dumped feature (if needed) would be very slow
            return hash<string>{}(feature.dump());
        }
    };
}

//I HAVE MADE THIS USING MINMAX HEAP METHODS
//CHAT & MATTHEW -- IF YOU NAMED THE DEAP METHODS SOMETHING ELSE YOU NEED TO RENAME THEM TO MATCH THE MINMAX HEAP
//^if the minmax heap and deap method names don't match, then this won't work
template <typename HeapType>
class HeapWrapper {
private:
    HeapType heap;

    float get_consump(const json& feature) {
        if (!feature.contains("properties")) {
            throw runtime_error("GeoJSONHeap: feature has no 'properties' field");
        }

        const json& properties = feature["properties"];

        return properties[desired_water_bill].template get<float>(); //won't work w/o explicitly "template" for whatever reason
        //^ .get<type>() is nlohmann::json's way of extracting something from a json into a specific C++ type
    }

public:
    string desired_water_bill;

    //Constructor
    HeapWrapper(const json& parsed_geojson, int& billing_period, const string& variable,
        const string& cat, const bool& exclude) {

        desired_water_bill = variable + to_string(billing_period);
        cout << desired_water_bill << endl;

        for (const json& feature : parsed_geojson.at("features")) {
            const auto& props = feature.at("properties");

            // Check if the property exists and is valid
            if (!props.contains(desired_water_bill) ||
                props[desired_water_bill].is_null() ||
                props[desired_water_bill] == -1) {
                continue;
                }

            // Filter by category
            if (cat != "All" && props["PropertyCat"] != cat) {
                continue;
            }

            // Exclude zeroes
            if (exclude && props[desired_water_bill] == 0) {
                continue;
            }

            // Add feature 1X
            add_feature(feature);
        }
    }

    void add_feature(const json& feature) {
        float consump = get_consump(feature);
        heap.add_node(feature, consump); //calls .add_node() (MinMaxHeap/Deap method)
    }

    void remove_feature(const json& feature) {
        heap.remove_node(feature); //calls .remove_node() (MinMaxHea/Deap method)
    }

    json pop_min() {
        return heap.pop_min_node();
    }

    json pop_max() {
        return heap.pop_max_node();
    }

    json peek_min() const {
        return heap.peek_min_node();
    }

    json peek_max() const {
        return heap.peek_max_node();
    }

    bool is_empty()  const {
        return heap.is_empty();
    }

    int  num_nodes() const {
        return heap.num_nodes();
    }

};