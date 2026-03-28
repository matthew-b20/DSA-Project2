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

struct Parcel {
    string address;
    string location_code;
    float consumption;
    double lat;
    double lon;

    //operator overload needed for hash?
    bool operator==(const Parcel& other) const {
        return location_code == other.location_code;
    }
};

//Custom hashing for Parcel type
namespace std {
    template <>
    struct hash<Parcel> {
        size_t operator()(const Parcel& parcel) const {
            return hash<string>{}(parcel.location_code);
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

public:
    string desired_water_bill;

    //Constructor
    HeapWrapper(const json& parsed_geojson, int& billing_period, const string& variable,
        const string& cat, const int& exclude, string const& subdiv) {

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

            // Filter by subdivision code
            if (subdiv != "All") {
                if (!props.contains("SubdivisionCode") ||
                    props["SubdivisionCode"].is_null() ||
                    props["SubdivisionCode"] != subdiv) {
                    continue;
                    }
            }

            // Exclude zeroes
            if ((exclude == 1) && (props[desired_water_bill] == 0)) {
                continue;
            }

            // Construct Parcel from feature

            // Skip parcel entirely if somehow got corrupted and no longer has a unique ID for the hash map
            if (!props.contains("LocationCode") || props["LocationCode"].is_null()) {
                continue;
            }

            Parcel parcel;

            // Also handle the address extraction safely if it maybe got corrupted
            parcel.address = (!props.contains("Address") || props["Address"].is_null()) ?
                 "Unknown Address" : props["Address"].get<string>();

            // Handle LocationCode as either a number or a string
            if (props["LocationCode"].is_number()) {
                // Extract as an integer and convert to string
                parcel.location_code = to_string(props["LocationCode"].get<long long>());
            } else {
                parcel.location_code = props["LocationCode"].get<string>();
            }
            parcel.consumption = props[desired_water_bill].template get<float>();
            parcel.lat = feature["geometry"]["coordinates"][0].get<double>();
            parcel.lon = feature["geometry"]["coordinates"][1].get<double>();

            // Add feature
            add_feature(parcel);
        }
    }

    void add_feature(const Parcel& feature) {
        heap.add_node(feature, feature.consumption); //calls .add_node() (MinMaxHeap/Deap method)
    }

    void remove_feature(const Parcel& feature) {
        heap.remove_node(feature); //calls .remove_node() (MinMaxHea/Deap method)
    }

    Parcel pop_min() {
        return heap.pop_min_node();
    }

    Parcel pop_max() {
        return heap.pop_max_node();
    }

    Parcel peek_min() const {
        return heap.peek_min_node();
    }

    Parcel peek_max() const {
        return heap.peek_max_node();
    }

    bool is_empty()  const {
        return heap.is_empty();
    }

    int  num_nodes() const {
        return heap.num_nodes();
    }
};