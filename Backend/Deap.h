#pragma once
#include <cmath>
#include <stdexcept>
#include <unordered_map>
#include <vector>
#include <iostream>
using namespace std;

// DEAP (Double-Ended Heap) rules:
// Index 0 is not used (dummy) — required for the index math to work correctly
// Index 1 is the MIN-HEAP root > smallest value here
// Index 2 is the MAX-HEAP root > largest value here
// Allows for the extraction of both the min and the max value.
//
// Deap Fundamentals ^^^^^^

template <typename Node>
class Deap {
private:

    struct Entry {
        int priority;
        int insertion_place;
        Node node;

        bool operator<(const Entry& other) const {
            if (priority != other.priority) {
                return priority < other.priority;
            }
            return insertion_place < other.insertion_place;
        }

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

    // Internal data structures
    vector<Entry> heap_array;
    unordered_map<Node,int> position;
    int insert_count = 0;

    // Helpers

    void printHelper() const {
        for (int i = 1; i < size(); i++) {
            cout << heap_array[i].node << ":"
                 << heap_array[i].priority << endl;
        }
    }

    int size() const {
        return (int)heap_array.size();
    }

    // Count
    int count() const {
        return size() - 1;
    }

    // Subtree sifts
    static int left_root() {
        // min -heap root
        return 1;
    }

    static int right_root() {
        // max-heap root
        return 2;
    }

    // Returns the index of the parent of a node at index i
    static int get_parent(int i) {
        // index 0 is a dummy
        return i / 2;
    }

    // Level of a node (0-indexed)
    static int level_of(int i) {
        return (int)floor(log2((double)i));
    }

    // Each level is split down the middle for min vs max heaps
    //  left  half > min-heap
    //  right half > max-heap
    static bool is_in_min_heap(int i) {
        if (i == 1) return true;
        if (i == 2) return false;

        int d = level_of(i);
        int level_start = 1 << d; // Finds the starting index of level using bitwise shifting (2 raised to d)
        int half = 1 << (d - 1);

        return i >= level_start + half;  // left half > min heap
    }

    // Returns the index of i partner
    int find_partner(int i) const {
        if (i == 1) {
            if (size() > 2) {
                return 2;
            }
            else {
                return -1;
            }
        }
        if (i == 2) {
            return 1;
        }

        int d = level_of(i);
        int half = 1 << (d - 1);

        int partner;
        if (is_in_min_heap(i)) {
            partner = i - half;
        } else {
            partner = i + half;
        }

        if (partner >= size() || partner < 1) {
            return -1;
        }
        return partner;
    }

    // Swap
    void swap_entries(int i, int j) {
        swap(heap_array[i], heap_array[j]);
        position[heap_array[i].node] = i;
        position[heap_array[j].node] = j;
    }


    // Sift up - Used for restoring heap order after inserting new element -- OG FUNCTION
    void sift_up(int i) {
        if (i <= 0 || i >= size()) return;

        bool in_min = is_in_min_heap(i);
        int partner = find_partner(i);

        // Check subtree partner
        if (in_min && partner != -1 && heap_array[i] > heap_array[partner]) {
            swap_entries(i, partner);
            i = partner;
            in_min = false;
        } else if (!in_min && partner != -1 && heap_array[i] < heap_array[partner]) {
            swap_entries(i, partner);
            i = partner;
            in_min = true;
        }


        // Move up within the subtree
        while (i > 2) {
            int parent = get_parent(i);

            if (is_in_min_heap(parent) != in_min) {
                parent = get_parent(parent);
            }

            if (parent < 1) break;

            if (in_min) {
                if (heap_array[parent] > heap_array[i]) {
                    swap_entries(parent, i);
                    i = parent;
                } else {
                    break;
                }
            } else {
                if (heap_array[parent] < heap_array[i]) {
                    swap_entries(parent, i);
                    i = parent;
                } else {
                    break;
                }
            }
        }
    }

    // Sift down - removes the element at index i and restores heap order
    void sift_down(int i) {
        if (i <= 0 || i >= size()) return;

        bool in_min = is_in_min_heap(i);

        // Push down in the subtree
        while (true) {
            int left_child = 2*i;
            int right_child = 2*i + 1;
            int target = i;

            if (in_min) {
                // Min-heap picks the smallest child
                if (left_child < size()  && is_in_min_heap(left_child) && heap_array[left_child] < heap_array[target]) {
                    target = left_child;
                }
                if (right_child < size() && is_in_min_heap(right_child) && heap_array[right_child] < heap_array[target]) {
                    target = right_child;
                }
            } else {
                // Max-heap > picks the largest child
                if (left_child < size()  && !is_in_min_heap(left_child) && heap_array[left_child] > heap_array[target]) {
                    target = left_child;
                }
                if (right_child < size()  && !is_in_min_heap(right_child) && heap_array[right_child] > heap_array[target]){
                    target = right_child;
                }
            }

            if (target == i) {
                break;
            }

            swap_entries(i, target);
            i = target;
            in_min = is_in_min_heap(i); // Recalculate in_min because of the swap

            int partner = find_partner(i);
            if (partner != -1) {
                if (in_min && heap_array[i] > heap_array[partner]) {
                    swap_entries(i, partner);
                    sift_up(partner);
                    sift_down(i);
                    return;
                }
                else if (!in_min && heap_array[i] < heap_array[partner]) {
                    swap_entries(i, partner);
                    sift_up(i);
                    sift_down(partner);
                    return;
                }
            }
        }

        int partner = find_partner(i);
        if (partner == -1) {
            return;
        }

        if (is_in_min_heap(i) && heap_array[i] > heap_array[partner]) {
            swap_entries(i, partner);
            sift_up(partner);
        }
        else if (!is_in_min_heap(i) && heap_array[i] < heap_array[partner]) {
            swap_entries(i, partner);
            sift_up(partner);
        }
    }


    // Add
    void add(Entry entry) {
        int i = size();
        position[entry.node] = i;
        heap_array.push_back(entry);
        sift_up(i);
    }

    // Remove
    Entry remove(int i) {
        if (i <= 0 || i >= size()) { // checks bounds
            // Stop program - can comment out if needed
            throw out_of_range("Index is out of range");
        }

        Entry removed = heap_array[i];
        // check syntax
        position.erase(removed.node);

        int last = size() - 1;

        if (i == last) {
            // Removing - pop
            heap_array.pop_back();
        }
        else {
            Node moved_node = heap_array[last].node; // saves the node to be moved for proper sifting afterwards

            // moves whatever was last in the array into the place of the element we just removed
            heap_array[i] = heap_array[last];
            position[moved_node] = i;
            heap_array.pop_back();

            // making sure the element we moved is put into the proper place in the deap.
            sift_down(i);
            sift_up(position[moved_node]);

            // iterate through the indexes to make sure everything is in it's proper place
            for (int j = size() - 1; j >= 1; j--) {
                if (j < size()) {
                    sift_up(j);
                }
            }
        }
        return removed;
    }


public:

    // Deap constructor
    Deap() {
        heap_array.emplace_back();  // dummy entry at index 0
    }

    // Insert a node with - priority
    void add_node(Node node, int priority) {
        Entry entry;
        entry.priority = priority;
        entry.insertion_place = insert_count++;
        entry.node = node;
        add(entry);
    }

    // Remove + return the node with the LOWEST priority
    Node pop_min_node() {
        if (count() == 0) {
            // Stop program - can comment out if needed
            throw out_of_range("Heap is empty");
        }
        // The minimum is always at index 1
        return remove(left_root()).node;
    }

    // Remove + return the node with the HIGHEST priority
    Node pop_max_node() {
        if (count() == 0) {
            // Stop program - can comment out if needed
            throw out_of_range("Heap is empty");
        }
        if (count() == 1) {
            return remove(left_root()).node;
        }
        return remove(right_root()).node;
    }

    // Node with the LOWEST priority without removing it
    Node peek_min_node() const {
        if (count() == 0) {
            // Stop program - can comment out if needed
            throw out_of_range("Heap is empty");
        }
        return heap_array[left_root()].node;
    }

    // Node with the HIGHEST priority without removing it
    Node peek_max_node() const {
        if (count() == 0) {
            // Stop program can comment out if needed
            throw out_of_range("Heap is empty");
        }
        if (count() == 1) {
            return heap_array[left_root()].node;
        }
        return heap_array[right_root()].node;
    }

    // Remove all elements and reset
    void clear() {
        heap_array.clear();
        heap_array.emplace_back();  // restore dummy at index 0
        position.clear();
        insert_count = 0;
    }

    bool is_empty() const {
        return count() == 0;
    }

    int num_nodes() const {
        return count();
    }

    // Function added for testing and debugging deap test cases
    void print() const {
        printHelper();
    }
};