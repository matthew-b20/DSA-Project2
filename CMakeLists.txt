cmake_minimum_required(VERSION 3.27)
project(DSA_Project2)

set(CMAKE_CXX_STANDARD 20)

set(SOURCE_DIR ${CMAKE_CURRENT_SOURCE_DIR}/Backend)
# For the crow server to work, you need to download standalone asio from  https://think-async.com/Asio/
# and put it into the backend folder.

# Replace the paths here with the paths on your machine.

add_executable(DSA_Project2
        "${SOURCE_DIR}/main.cpp"
        "${SOURCE_DIR}/MinMax.h"
        "${SOURCE_DIR}/Deap.h"
        "${SOURCE_DIR}/GeoJSONHeapWrapper.h"
        "${SOURCE_DIR}/GeoJSONHeapWrapper.cpp"
        "${SOURCE_DIR}/Deap.cpp"
        "${SOURCE_DIR}/MinMax.cpp")

# replace the asio-1.36.0 with whatever standalone asio version you downloaded and named it.
target_include_directories(DSA_Project2 PRIVATE
        "${SOURCE_DIR}/Crow/include"
        "${SOURCE_DIR}/asio-1.36.0/asio-1.36.0/include"
)


target_link_libraries(DSA_Project2 PRIVATE
        ws2_32
        wsock32
        mswsock
)

target_compile_definitions(DSA_Project2 PRIVATE
        CROW_USE_ASIO
        ASIO_STANDALONE
        _WIN32_WINNT=0x0601
)