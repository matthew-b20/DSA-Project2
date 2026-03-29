#include "catch/catch_amalgamated.hpp"
#include "../Deap.h"
using namespace std;

// THESE ARE **SHARED** TEST CASES FOR DEAP AND MINMAX
// This is because the Deap and Min-Max have essentially identical functions
// and perform the same tasks

TEST_CASE("Empty Deap", "[Base Case]") {
    Deap<int> d;

    SECTION("Checking the attributes of empty deap") {
        REQUIRE(d.is_empty());
        REQUIRE(d.num_nodes() == 0);
    }

    SECTION("Checking out of range errors", "[Fail]") {
        REQUIRE_THROWS_AS(d.pop_min_node(), out_of_range);
        REQUIRE_THROWS_AS(d.pop_max_node(), out_of_range);
        REQUIRE_THROWS_AS(d.peek_max_node(), out_of_range);
        REQUIRE_THROWS_AS(d.peek_min_node(), out_of_range);
    }
}

TEST_CASE("Deap with one element", "[Simple Deap]") {
    Deap <int> d;
    d.add_node(7, 2);

    SECTION("Size functions work properly") {
        REQUIRE(d.num_nodes() == 1);
        REQUIRE(!d.is_empty());
    }

    SECTION("peek_min/max functions work properly") {
        REQUIRE(d.peek_min_node() == 7);
        REQUIRE(d.peek_max_node() == 7);
    }

    SECTION("pop function works properly") {
        int temp = d.pop_min_node();
        REQUIRE(temp == 7);
        REQUIRE(d.is_empty());
    }

    SECTION("Same as before but with the pop_max function") {
        int temp = d.pop_max_node();
        REQUIRE(temp == 7);
        REQUIRE(d.is_empty());
    }
}

TEST_CASE ("Deap with two elements", "[Simple Deap V2]") {
    Deap<int> d;
    d.add_node(4, 2);
    d.add_node(10, 6);

    SECTION("peek_min/max works properly") {
        REQUIRE(d.peek_min_node() == 4);
        REQUIRE(d.peek_max_node() == 10);
    }

    SECTION("pop functions work properly") {
        REQUIRE(d.pop_min_node() == 4);
        REQUIRE(d.num_nodes() == 1);
        REQUIRE(d.peek_min_node() == 10);
    }

    SECTION("Same as before with pop_max function") {
        REQUIRE(d.pop_max_node() == 10);
        REQUIRE(d.num_nodes() == 1);
        REQUIRE(d.peek_max_node() == 4);
    }
}

TEST_CASE("Size updates and functions properly", "[inserts]") {
    Deap<int> d;

    SECTION("Size is right") {
        for (int i = 1; i <= 10; i++) {
            d.add_node(i, i);
            REQUIRE(d.num_nodes() == i);
        }
    }
}

TEST_CASE("peek_min/max Functions testing across multiple diff values", "[Min/Max Test]") {
    Deap<int> d;
    vector<int> preSetVals = {13, 18, 3, 29, 4, 17, 23};
    for (int val: preSetVals) {
        d.add_node(val, val);
    }

    vector<int> ascPrio = {3, 4, 13, 17, 18, 23, 29};

    SECTION("Get Min/Max Function Testing") {
        REQUIRE(d.peek_max_node() == 29); // highest priority node should be returned
        REQUIRE(d.peek_min_node() == 3); // lowest priority node should be returned
        REQUIRE(d.num_nodes() == 7); // The size should be 7 because getMin shouldn't delete anything
    }

    SECTION("Delete Min Function Testing") {
        for (int i : ascPrio) {
            int temp = d.pop_min_node();
            REQUIRE(temp == i);
        }
        REQUIRE(d.is_empty());
    }
}


TEST_CASE("pop_min working properly with multiple calls", "[deap][deleteMin][ordering]") {
    Deap<int> d;
    vector<int> prios = {40, 10, 70, 25, 55, 5, 90, 33};

    for (int p : prios) {
        d.add_node(p, p);
    }

    vector<int> sortedPrios = prios;
    sort(sortedPrios.begin(), sortedPrios.end());

    SECTION("Each deleteMin returns the next smallest") {
        for (int expected : sortedPrios) {
            int temp = d.pop_min_node();

            REQUIRE(temp == expected);
        }
        REQUIRE(d.is_empty() == true);
    }
}

TEST_CASE("pop_max working with multiple nodes", "[deap][deleteMax][ordering]") {
    Deap<int> d;
    vector<int> prios = {40, 10, 70, 25, 55, 5, 90, 33};

    for (int p : prios) {
        d.add_node(p, p);
    }

    vector<int> sortedDesc = prios;
    sort(sortedDesc.begin(), sortedDesc.end(), greater());

    SECTION("Each deleteMax returns the next largest") {
        for (int expected : sortedDesc) {
            REQUIRE(d.pop_max_node() == expected);
        }
        REQUIRE(d.is_empty() == true);
    }
}

TEST_CASE("pop_min and pop_max work properly with each other", "[deap][mixed]") {
    Deap<int> d;
    // inserting 1 through 10
    for (int i = 1; i <= 10; i++) {
        d.add_node(i, i);
    }

    SECTION("Alternating deleteMin / deleteMax peels from both ends") {
        REQUIRE(d.pop_min_node() == 1);
        REQUIRE(d.pop_max_node() == 10);
        REQUIRE(d.pop_min_node() == 2);
        REQUIRE(d.pop_max_node() == 9);
        REQUIRE(d.pop_min_node() == 3);
        REQUIRE(d.pop_max_node() == 8);
        REQUIRE(d.num_nodes() == 4);
    }
}

TEST_CASE("testing insertion order is working properly", "[insertion_order]") {
    Deap<int> d;

    d.add_node(100, 5);
    d.add_node(200, 5);
    d.add_node(300, 5);

    SECTION("deleteMin with equal priorities respects insertion order") {
        REQUIRE(d.pop_min_node() == 100);
        REQUIRE(d.pop_min_node() == 200);
        REQUIRE(d.pop_min_node() == 300);
    }
}

TEST_CASE("Testing with lots of numbers", "[complex deap]") {
    Deap<int> d;
    int N = 200;

    for (int i = N; i >= 1; i--) {
        d.add_node(i, i);
    }

    REQUIRE(d.num_nodes() == N);
    REQUIRE(d.peek_min_node() == 1);
    REQUIRE(d.peek_max_node() == N);

    SECTION("deleteMin produces fully sorted ascending sequence") {
        for (int expected = 1; expected <= N; expected++) {
            REQUIRE(d.pop_min_node() == expected);
        }
        REQUIRE(d.is_empty() == true);
    }

    SECTION("deleteMax produces fully sorted descending sequence") {
        // Re-insert since sections share the original state
        Deap<int> d2;
        for (int i = N; i >= 1; i--) d2.add_node(i, i);

        for (int expected = N; expected >= 1; expected--) {
            REQUIRE(d2.pop_max_node() == expected);
        }
        REQUIRE(d2.is_empty() == true);
    }
}

TEST_CASE("Testing clear function", "[clear]") {
    Deap<int> d;
    for (int i = 1; i <= 5; i++) {
        d.add_node(i, i);
    }

    SECTION("After clear, Deap is empty") {
        d.clear();
        REQUIRE(d.is_empty() == true);
        REQUIRE(d.num_nodes() == 0);
    }

    SECTION("After clear, exceptions still thrown correctly") {
        d.clear();
        REQUIRE_THROWS_AS(d.peek_min_node(), out_of_range);
        REQUIRE_THROWS_AS(d.peek_max_node(), out_of_range);
        REQUIRE_THROWS_AS(d.pop_min_node(), out_of_range);
        REQUIRE_THROWS_AS(d.pop_max_node(), out_of_range);
    }

    SECTION("After clear, Deap can be reused normally") {
        d.clear();
        d.add_node(99, 99);
        d.add_node(1, 1);
        REQUIRE(d.peek_min_node() == 1);
        REQUIRE(d.peek_max_node() == 99);
        REQUIRE(d.num_nodes() == 2);
    }
}

TEST_CASE("Validating deap rules after operations to ensure its maintained", "[properties]") {
    Deap<int> d;
    vector<int> vals = {15, 3, 9, 22, 7, 11, 18, 1, 25, 6};

    SECTION("getMin <= getMax at every intermediate state") {
        for (int val : vals) {
            d.add_node(val, val);
            // After every insert, min must be <= max
            REQUIRE(d.peek_min_node() <= d.peek_max_node());
        }

        while (d.num_nodes() > 1) {
            REQUIRE(d.peek_min_node() <= d.peek_max_node());
            // Alternate removing from each end
            d.pop_min_node();
            if (!d.is_empty()) {
                REQUIRE(d.peek_min_node() <= d.peek_max_node());
                d.pop_max_node();
            }
        }
    }
}

TEST_CASE("Negative numbers testing", "[negative]") {
    Deap<int> d;
    d.add_node(1, -10);
    d.add_node(2, 0);
    d.add_node(3, 10);
    d.add_node(4, -5);

    SECTION("getMin returns node with most negative priority") {
        REQUIRE(d.peek_min_node() == 1);
    }

    SECTION("getMax returns node with highest priority") {
        REQUIRE(d.peek_max_node() == 3);
    }

    SECTION("deleteMin ascending across negative/zero/positive") {
        REQUIRE(d.pop_min_node() == 1);
        REQUIRE(d.pop_min_node() == 4);
        REQUIRE(d.pop_min_node() == 2);
        REQUIRE(d.pop_min_node() == 3);
    }
}
