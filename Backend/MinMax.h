#pragma once
#include <cmath>
#include <stdexcept>
#include <unordered_map>
#include <vector>
using namespace std;

// MinMaxHeap rules:
// A node on a min level is smaller than everything in its subtree below it
// A node on a max level is larger than everything in its subtree below it
//----
// Minimum value will always be the root node
// Maximum value is always on the first max level
// (so you actually need to check the 2 nodes on level 1 and compare to find the max)

template <typename Node> //placeholder b/c using JSON objects
class MinMax {
private:
    struct Entry {
        int priority;
        int insertion_place; //insertion order tiebreaker
        Node node; //JSON object w/ water data

        //OPERATOR OVERLOADING (<, >, <=, >=)
        bool operator<(const Entry& other) const {
            if (priority != other.priority) { //normal
                return priority < other.priority;
            }
            return insertion_place < other.insertion_place; //tiebreaker
        }

        //other operator overloads written super sleek-ly
        //in terms of the original operator overload :D
        bool operator>(const Entry& other) const {
            return other < *this;
        }

        bool operator<=(const Entry& other) const {
            return !(other < *this);
        }

        bool operator>=(const Entry& other) const {
            return !(*this < other);
        }
    };

    //INTERNAL DATA STRUCTURES
    vector<Entry> heap_array;
    unordered_map<Node, int> position;
    int insert_count = 0;

    //HELPERS
    //Returns the index of the parent of a node at index i.
    static int get_parent_index(int const i) {
        return (i + 1) / 2 - 1;
    }

    //Returns the level of a node (0-indexed). Level 0 = root (min level).
    static int level_of(int const i) {
        return floor(log2(i + 1));
    }

    int size() const {
        return heap_array.size();
    }

    //SWAPPING
    void swap_entries(int i, int j) {
        //physically swap the entries in the vector:
        swap(heap_array[i], heap_array[j]);

        //update the hashmap of Node node locations:
        position[heap_array[i].node] = i;
        position[heap_array[j].node] = j;
    }

    //SIFT UPS: For after *INSERTING* an element
    //SIFT UP (for Min)
    void sift_up_min(int i) {
        //jump TWO levels at a time (compare w/ grandparent) b/c of alternating min/max levels
        while (true) {
            int parent_index = get_parent_index(i);
            int grandparent_index = get_parent_index(parent_index);

            if (grandparent_index < 0) {
                break;
            }

            if (heap_array[grandparent_index] > heap_array[i]) {
                swap_entries(grandparent_index, i);
                i = grandparent_index;
            } else {
                break; //grandparent is less than current node, as it should be
            }
        }
    }

    //SIFT UP (for Max)
    void sift_up_max(int i) {
        //near-identical logic to sift_up_min():
        while (true) {
            int parent_index = get_parent_index(i);
            int grandparent_index = get_parent_index(parent_index);

            if (grandparent_index < 0) {
                break;
            }

            if (heap_array[grandparent_index] < heap_array[i]) {
                swap_entries(grandparent_index, i);
                i = grandparent_index;
            } else {
                break; //grandparent is less than current node, as it should be
            }
        }
    }

    //Universal sift-up interface: Checks what level i is on (if on a min or max level)
    //and determines if a parent swap is needed before sift_up_min() OR sift_up_max()
    void sift_up(int i) {
        int parent_index = get_parent_index(i);

        if (level_of(i) % 2 == 0) { // if EVEN (on min level)
            //its parent is on a max level (must be more than everything below it)
            if (parent_index >= 0 && heap_array[parent_index] < heap_array[i]) {
                //swap needed
                swap_entries(parent_index, i);
                sift_up_max(parent_index);
            } else {
                //swap not needed
                sift_up_min(i);
            }
        }
        else { // if ODD (on max level)
            //its parent is on a min level (needs to be less than everything below)
            if (parent_index >= 0 && heap_array[parent_index] > heap_array[i]) {
                swap_entries(parent_index, i);
                sift_up_min(parent_index);
            } else {
                sift_up_max(i);
            }
        }
    }

    //SIFT DOWNS: For after *REMOVING* an element
    //SIFT DOWN (for Min)
    void sift_down_min(int i) {
        int left_index = 2*i + 1;
        int right_index = 2*i + 2;

        //Compare direct children if no grandchildren
        if (size() <= 2*left_index + 1) { //case if no grandchildren
            int best = i;
            if ( left_index < size() && heap_array[left_index] < heap_array[best]) {
                best = left_index;
            }
            if ( right_index <size() && heap_array[right_index] < heap_array[best]) {
                best = right_index;
            }
            if (best != i) {
                swap_entries(i, best);
            }
            return; //RETURN EARLY
        }

        //If there are grandchildren, find the smallest of them
        int grandchildren_indices[4] = { //stack array
            2*left_index+1, 2*left_index+2, 2*right_index+1, 2*right_index+2
        };

        int best = i;
        for (int gc_idx : grandchildren_indices) { //gc_idx = grandchild's index
            if (gc_idx < size() && heap_array[gc_idx] < heap_array[best]) {
                best = gc_idx;
            }
        }

        if (best != i) {
            swap_entries(i, best);
            sift_down_min(best);
        }
    }

    //SIFT DOWN (for Max)
    void sift_down_max(int i) {
        //near-identical logic
        int left_index = 2*i + 1;
        int right_index = 2*i + 2;

        //Compare direct children if no grandchildren
        if (size() <= 2*left_index + 1) { //case if no grandchildren
            int best = i;
            if ( left_index < size() && heap_array[left_index] > heap_array[best]) {
                best = left_index;
            }
            if ( right_index <size() && heap_array[right_index] > heap_array[best]) {
                best = right_index;
            }
            if (best != i) {
                swap_entries(i, best);
            }
            return; //RETURN EARLY
        }

        //If there are grandchildren, find the largest of them
        int grandchildren_indices[4] = { //stack array
            2*left_index+1, 2*left_index+2, 2*right_index+1, 2*right_index+2
        };

        int best = i;
        for (int gc_idx : grandchildren_indices) { //gc_idx = grandchild's index
            if (gc_idx < size() && heap_array[gc_idx] > heap_array[best]) {
                best = gc_idx;
            }
        }

        if (best != i) {
            swap_entries(i, best);
            sift_down_max(best);
        }
    }

    //Universal sift_down interface
    void sift_down(int i) {
        if (level_of(i) % 2 == 0) { //EVEN level
            sift_down_min(i);
        } else { //ODD level
            sift_down_max(i);
        }
    }

    //ADDING
    void add(Entry entry) {
        int i = size();
        position[entry.node] = i;
        heap_array.push_back(entry);
        sift_up(i);
    }

    //DELETING
    Entry remove(int i) {
        int last = size() -1;

        if (i != last) {
            swap_entries(i, last);
        }

        Entry removed = heap_array.back(); //.back() is a built-in vector function (returns but does not remove)
        position.erase(removed.node); //remove the removed node from the has map
        heap_array.pop_back(); //actually remove it from the heap

        if (i < size()) {
            //sift down then sift up in case it went too far
            Node replacement = heap_array[i].node;
            sift_down(i);
            int current_pos = position.at(replacement);
            sift_up(current_pos);
        }

        return removed;
    }


public:
    //nodes that try to get inserted twice just get new priority
    void add_node(const Node& node, int priority = 0) {
        if (position.count(node)) { //if already in the heap
            remove_node(node);
        }
        add({priority, insert_count++, node}); //add to heap
    }

    void remove_node(const Node& node) {
        if (!position.count(node)) { //if invalid node entry
            throw out_of_range("remove_node: node not found");
        }

        remove(position.at(node));
    }

    //RETURN MIN
    Node pop_min_node() {
        if (heap_array.empty()) {
            throw out_of_range("pop_min_node: heap is empty!");
        }

        return remove(0).node;
    }

    //RETURN MAX
    Node pop_max_node() {
        if (heap_array.empty()) {
            throw out_of_range("pop_max_node: heap is empty!");
        }

        if (size() == 1) {
            return remove(0).node;
        }

        //max is one of the two nodes on the 2nd level
        int max_index;
        if (size() >= 3) {
            if (heap_array[2]>heap_array[1]) {
                max_index = 2;
            }
            else {
                max_index = 1;
            }
        }
        else {
            max_index = 1;
        }

        return remove(max_index).node;
    }

    //RETURNS MIN W/O REMOVING
    Node peek_min_node() const {
        if (heap_array.empty()) {
            throw out_of_range("peek_min_node: heap is empty");
        }
        return heap_array[0].node;
    }

    //RETURNS MAX W/O REMOVING
    Node peek_max_node() const {
        if (heap_array.empty()) {
            throw out_of_range("peek_max_node: heap is empty");
        }
        if (heap_array.size() == 1) {
            return heap_array[0].node;
        }
        if (heap_array.size() == 2) {
            return heap_array[1].node;
        }
        //heap is at least 3 big, so compare index 1 and 2 to find largest:
        return (heap_array[1] >= heap_array[2] ? heap_array[1] : heap_array[2]).node;
    }

    bool is_empty()  const {
        return heap_array.empty();
    }

    int  num_nodes() const {
        return heap_array.size();
    }
};