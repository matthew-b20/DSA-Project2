cmake_minimum_required(VERSION 4.0)
project(OWA_DSA)

set(CMAKE_CXX_STANDARD 20)

include(FetchContent)

# nlohmann/json
FetchContent_Declare(
        nlohmann_json
        URL https://github.com/nlohmann/json/releases/download/v3.11.3/json.tar.xz
)

# Asio (standalone, no Boost)
FetchContent_Declare(
        asio
        GIT_REPOSITORY https://github.com/chriskohlhoff/asio.git
        GIT_TAG        asio-1-30-2
        GIT_SHALLOW    TRUE
)

# Crow
set(CROW_USE_BOOST OFF CACHE BOOL "" FORCE)
set(CROW_ENABLE_SSL OFF CACHE BOOL "" FORCE)

FetchContent_Declare(
        crow
        GIT_REPOSITORY https://github.com/CrowCpp/Crow.git
        GIT_TAG        v1.2.0
        GIT_SHALLOW    TRUE
)

# Download & configure JSON and Asio FIRST (or else Crow won't work)
FetchContent_MakeAvailable(nlohmann_json asio)

# Force Asio to work if it still doesn't want to
set(ASIO_INCLUDE_DIR "${asio_SOURCE_DIR}/asio/include" CACHE PATH "" FORCE)
include_directories(${ASIO_INCLUDE_DIR})

# Configure Crow
FetchContent_MakeAvailable(crow)

# Asio
add_library(asio_headers INTERFACE)
target_include_directories(asio_headers INTERFACE
        ${asio_SOURCE_DIR}/asio/include
)
target_compile_definitions(asio_headers INTERFACE
        ASIO_STANDALONE
        ASIO_ENABLE_OLD_SERVICES
)

# Regular executable
add_executable(OWA_DSA
        DSAProject2/Backend/main.cpp
        DSAProject2/Backend/MinMax.h
        DSAProject2/Backend/Deap.h
        DSAProject2/Backend/HeapWrapper.h
)


target_link_libraries(OWA_DSA PRIVATE
        nlohmann_json::nlohmann_json
        Crow::Crow
        asio_headers
)

# Testing executable
add_executable(OWA_DSA_tests
        DSAProject2/Backend/testing/test.cpp
        DSAProject2/Backend/MinMax.h
        DSAProject2/Backend/Deap.h
        DSAProject2/Backend/HeapWrapper.h
)

target_link_libraries(OWA_DSA_tests PRIVATE
        nlohmann_json::nlohmann_json
        Crow::Crow
        asio_headers
)

#make compatible w/ Windows:
if(WIN32)
    target_link_libraries(OWA_DSA PRIVATE ws2_32 wsock32)
    target_link_libraries(OWA_DSA_tests PRIVATE ws2_32 wsock32)
endif()