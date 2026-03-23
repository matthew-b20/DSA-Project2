#pragma once

#include <fstream>
#include <stdexcept>
#include <string>
#include <nlohmann/json.hpp>
#include "MinMaxHeap.hpp"

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
            const json& properties = feature.at("properties");

            if (properties.contains("LocationCode") && !properties["LocationCode"].is_null()) {
                //hashing only the unique identifier
                string id = properties["LocationCode"].dump(); //.dump() serializes the JSON into a string

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
class GeoJSONHeapWrapper {
private:
    HeapType<json> heap;

    static int get_consump(const json& feature) {
        if (!feature.contains("properties")) {
            throw runtime_error("GeoJSONHeap: feature has no 'properties' field");
        }

        const json& properties = feature["properties"];

        if (!properties.contains("Consump") || properties["Consump"].is_null()) {
                throw runtime_error("GeoJSOnHeap: feature is missing 'Consump' property");
        }

        return properties["Consump"].get<int>();
        //^ .get<type>() is nhloman::json's way of extracting something from a json into a specific C++ type
    }

public:
    //Constructor
    GeoJSONHeapWrapper(const string& filepath) {
        load_file(filepath);
    }

    //Custom GeoJSON file loader
    //Reads a GeoJSON file and inserts all of its features into the heap
    void load_file(const string& filepath) {
        ifstream file(filepath);
        if (!file.is_open()) {
            throw runtime_error("GeoJSONHeap: could not open file: " + filepath);
        }

        json geojson = nhlomann::parse(file);

        for (const json& feature : geojson.at("features")) {
            add_feature(feature);
        }
    }

    void add_feature(const json& feature) {
        int consump = get_consump(feature);
        heap.add_node(feature, consump); //calls .add_node() (MinMaxHeap method)
    }

    void remove_feature(const json& feature) {
        heap.remove_node(feature); //calls .remove_node() (MinMaxHeap method)
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