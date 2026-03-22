#pragma once
#include <cmath>
#include <stdexcept>
#include <unordered_map>
#include <vector>
using namespace std;

// DEAP (Double-Ended Heap) rules:
// Index 0 is UNUSED (dummy/sentinel) — this is required for the index math to work correctly.
// Index 1 is the MIN-HEAP root ->smallest value always here -> O(1) getMin
// Index 2 is the MAX-HEAP root -> largest value always here -> O(1) getMax
//
// For any node i in the min-heap, its partner j in the max-heap satisfies:
//   heap_array[i] <= heap_array[j]
//
// The two subtrees interleave in the array level by level:
//   Level 1:  [1=min-root]  [2=max-root]
//   Level 2:  [3,4=min]     [5,6=max]
//   Level 3:  [7..10=min]   [11..14=max]
//
// Partner formula: given node i, its partner is found by:
//   - If i is in the min-heap, partner = i + half_level_size
//   - If i is in the max-heap, partner = i - half_level_size
// where half_level_size = 2^(level-1), level = floor(log2(i)).
//
// Definitions: Online source 

template <typename Node>
class Deap {
private:
    struct Entry {
        int priority;
        int insertion_place;
        Node node;

        bool operator<(const Entry& other) const {
            if (priority != other.priority)
                return priority < other.priority;
            return insertion_place < other.insertion_place;
        }
        bool operator>(const Entry& other) const { return other < *this; }
        bool operator<=(const Entry& other) const { return !(other < *this); }
        bool operator>=(const Entry& other) const { return !(*this < other); }
    };

    // INTERNAL DATA STRUCTURES
    vector<Entry> heap_array;
    unordered_map<Node, int> position;
    int insert_count = 0;
    // Real data starts at index 1

    // HELPERS
    int size() const { return (int)heap_array.size(); }

    // Number of real elements (excluding the dummy at index 0)
    int count() const { return size() - 1; }

    static int left_root()  { return 1; }
    static int right_root() { return 2; }

    // Parent of node i (standard binary heap formula, valid for i >= 2)
    static int get_parent(int i) { return i / 2; }

    // Index i (>= 1), return which level of the full binary tree it sits on
    static int level_of(int i) {
        return (int)floor(log2((double)i));
    }

    // Determine - subtree a node belongs to
    static bool is_in_min_heap(int i) {
        if (i == 1) return true;
        if (i == 2) return false;
        int d = level_of(i);                
        int level_start = 1 << d;            
        int half = 1 << (d - 1);           
        return i < level_start + half;        
    }

    // Find the partner of node i in the opposite subtree
    // Returns -1 if the partner index would be out of bounds
    int find_partner(int i) const {
        if (i == 1) return 2;
        if (i == 2) return 1;

        int d = level_of(i);
        int half = 1 << (d - 1);   // 2^(d-1) = half the nodes on this level

        int partner;
        if (is_in_min_heap(i)) {
            partner = i + half;    
        } else {
            partner = i - half;    
        }

        if (partner >= size()) return -1;
        return partner;
    }

    // SWAPPING
    void swap_entries(int i, int j) {
        swap(heap_array[i], heap_array[j]);
        position[heap_array[i].node] = i;
        position[heap_array[j].node] = j;
    }

    // SIFT UP — called after inserting at position i
    void sift_up(int i) {
        if (i <= 0) return;

        bool in_min = is_in_min_heap(i);
        int partner = find_partner(i);

        // If we are in the min-heap but our value is GREATER than our max-heap
        // partner, swap into the max-heap and continue sifting there (and vice versa)
        if (in_min && partner != -1 && heap_array[i] > heap_array[partner]) {
            swap_entries(i, partner);
            i = partner;
            in_min = false;
        } else if (!in_min && partner != -1 && heap_array[i] < heap_array[partner]) {
            swap_entries(i, partner);
            i = partner;
            in_min = true;
        }

        // Sift up within the subtree - now belong to
        while (i > 2) {
            int parent = get_parent(i);

            // Staying within the SAME subtree: compare with parent and swap if out of order.
           if (in_min) {
                if (heap_array[parent] > heap_array[i]) {
                    swap_entries(parent, i);
                    i = parent;
                } else break;
            } else {
                if (heap_array[parent] < heap_array[i]) {
                    swap_entries(parent, i);
                    i = parent;
                } else break;
            }
        }
    }

    // SIFT DOWN — called after removing an element and replacing it with the
    // last element in the array at position i
    void sift_down(int i) {
        if (i <= 0 || i >= size()) return;

        bool in_min = is_in_min_heap(i);

        while (true) {
            int left_child  = 2 * i;
            int right_child = 2 * i + 1;
            int target = i;

            if (in_min) {
                // Min-heap: find the smallest among node and its two children
                if (left_child  < size() && is_in_min_heap(left_child)
                    && heap_array[left_child]  < heap_array[target])
                    target = left_child;
                if (right_child < size() && is_in_min_heap(right_child)
                    && heap_array[right_child] < heap_array[target])
                    target = right_child;
            } else {
                // Max-heap: find the largest among node and its two children
                if (left_child  < size() && !is_in_min_heap(left_child)
                    && heap_array[left_child]  > heap_array[target])
                    target = left_child;
                if (right_child < size() && !is_in_min_heap(right_child)
                    && heap_array[right_child] > heap_array[target])
                    target = right_child;
            }

            if (target == i) break;  

            swap_entries(i, target);
            i = target;
        }


        int partner = find_partner(i);
        if (partner == -1) return;

        if (is_in_min_heap(i) && heap_array[i] > heap_array[partner]) {
            swap_entries(i, partner);
            sift_up(partner);   
        } else if (!is_in_min_heap(i) && heap_array[i] < heap_array[partner]) {
            swap_entries(i, partner);
            sift_up(partner);   
        }
    }

    // ADDING — appends then sifts up
    void add(Entry entry) {
        // heap_array[0] is the dummy - real elements start at index 1.
        int i = size();          
        position[entry.node] = i;
        heap_array.push_back(entry);
        sift_up(i);
    }

    // DELETING — replace the target slot with the last element - then restore order
    Entry remove(int i) {
        if (i <= 0 || i >= size())
            throw out_of_range("Index out of range");

        Entry removed = heap_array[i];
        position.erase(removed.node);

        int last = size() - 1;
        if (i == last) {
            heap_array.pop_back();
        } else {
            heap_array[i] = heap_array[last];
            position[heap_array[i].node] = i;
            heap_array.pop_back();

            // The replacement element can go either direction
            sift_down(i);
            // sift_up handles - if it moved into the wrong subtree
            sift_up(i);
        }

        return removed;
    }

public:
    // Fix: constructor ? - maybe
    Deap() {
        heap_array.emplace_back();  
    }

    void insert(Node node, int priority) {
        Entry entry;
        entry.priority       = priority;
        entry.insertion_place = insert_count++;
        entry.node           = node;
        add(entry);
    }

    Node deleteMin() {
        if (count() == 0) throw out_of_range("Heap is empty");
        return remove(left_root()).node;
    }

    Node deleteMax() {
        if (count() == 0) throw out_of_range("Heap is empty");
        if (count() == 1) return remove(left_root()).node;
        return remove(right_root()).node;
    }

    Node getMin() const {
        if (count() == 0) throw out_of_range("Heap is empty");
        return heap_array[left_root()].node;
    }

    Node getMax() const {
        if (count() == 0) throw out_of_range("Heap is empty");
        if (count() == 1) return heap_array[left_root()].node;
        return heap_array[right_root()].node;
    }

    void clear() {
        heap_array.clear();
        heap_array.emplace_back();  // restore dummy at index 0
        position.clear();
        insert_count = 0;
    }

    bool isEmpty() const { return count() == 0; }
    int  getSize() const { return count(); }
};