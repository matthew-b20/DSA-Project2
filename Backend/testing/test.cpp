#include "catch/catch_amalgamated.hpp"
#include "../Deap.h"
using namespace std;


/*
TEST_CASE("Test 1: Name", "[tags][here]") {
    SECTION("Name of section") {

    }
}
*/

//MIN-MAX HEAP TESTS


//DEAP TESTS

// Failed Tests:
// - Get Min/Max only works in standalone by themselves
// - Delete Min Works but Not Delete Max
// - Sometimes, some tests pass but then fail without changing anything (two element deap, size tracking)


// 1: Insert
// 2: Delete
// 3: Other functions like, size, getmax, get min, etc.

TEST_CASE("Empty Deap", "[Base Case]") {
    Deap<int> d;

    SECTION("Checking the attributes of empty deap") {
        REQUIRE(d.isEmpty());
        REQUIRE(d.getSize() == 0);
    }

    SECTION("Checking out of range errors", "[Fail]") {
        REQUIRE_THROWS_AS(d.deleteMin(), out_of_range);
        REQUIRE_THROWS_AS(d.deleteMax(), out_of_range);
        REQUIRE_THROWS_AS(d.getMax(), out_of_range);
        REQUIRE_THROWS_AS(d.getMin(), out_of_range);
    }
}

TEST_CASE("Deap with one element", "[Simple Deap]") {
    Deap <int> d;
    d.insert(7, 2);

    SECTION("Size functions work properly") {
        REQUIRE(d.getSize() == 1);
        REQUIRE(!d.isEmpty());
    }

    SECTION("Get Min/Max functions work properly") {
        REQUIRE(d.getMin() == 7);
//        REQUIRE(d.getMax() == 7);
    }

    SECTION("Delete function works properly") {
        int temp = d.deleteMin();
        REQUIRE(temp == 7);
        REQUIRE(d.isEmpty());
    }

    SECTION("same as before but with the delete Max function") {
        int temp = d.deleteMax();
        REQUIRE(temp == 7);
        REQUIRE(d.isEmpty());
    }
}

TEST_CASE ("Deap with two elements", "[Simple Deap V2]") {
    Deap<int> d;
    d.insert(4, 2);
    d.insert(10, 6);

    SECTION("Get Min/Max works properly") {
        REQUIRE(d.getMin() == 4);
        REQUIRE(d.getMax() == 10);
    }

    SECTION("Delete functions work properly") {
        REQUIRE(d.deleteMin() == 4);
        REQUIRE(d.getSize() == 1);
        REQUIRE(d.getMin() == 10);
    }

    SECTION("same as before with delete max function") {
        REQUIRE(d.deleteMax() == 10);
        REQUIRE(d.getSize() == 1);
        REQUIRE(d.getMax() == 4);
    }
}

TEST_CASE("Size updates and functions properly", "[inserts]") {
    Deap<int> d;

    SECTION("Size is right") {
        for (int i = 1; i <= 10; i++) {
            d.insert(i, i);
            REQUIRE(d.getSize() == i);
        }
    }
}

TEST_CASE("Get Min/Max Functions testing across multiple diff values", "[Min/Max Test]") {
    Deap<int> d;
    d.insert(4, 13);
    d.insert(2, 18);
    d.insert(6, 3);
    d.insert(1, 29);
    d.insert(9, 4);
    d.insert(5, 17);
    d.insert(54, 23);

    d.print();

    SECTION("Get Min/Max Function Testing") {
        REQUIRE(d.getMax() == 1); // lowest priority node should be returned
        REQUIRE(d.getMin() == 6);
        REQUIRE(d.getSize() == 7); // The size should be 7 because getMin shouldn't delete anything
    }
}

