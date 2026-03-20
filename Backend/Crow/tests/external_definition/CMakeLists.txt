project(test_external_definition)

add_executable(
  ${PROJECT_NAME}
        main.cpp
)

target_include_directories(
  ${PROJECT_NAME}
  PRIVATE .
)

target_link_libraries(
  ${PROJECT_NAME}
  PUBLIC Crow::Crow
)
