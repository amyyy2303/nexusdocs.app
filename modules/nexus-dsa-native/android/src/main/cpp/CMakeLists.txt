cmake_minimum_required(VERSION 3.22.1)

project(NexusDSA LANGUAGES CXX)

set(CMAKE_CXX_STANDARD 17)
set(CMAKE_CXX_STANDARD_REQUIRED ON)

get_filename_component(
    MODULE_ROOT
    "${CMAKE_CURRENT_LIST_DIR}/../../../.."
    ABSOLUTE
)

add_library(
    nexus_dsa
    SHARED
    ${MODULE_ROOT}/cpp/src/FileTree.cpp
    ${MODULE_ROOT}/cpp/src/HashTable.cpp
    ${MODULE_ROOT}/cpp/src/Sorting.cpp
    ${CMAKE_CURRENT_LIST_DIR}/nexus_dsa_jni.cpp
)

target_include_directories(
    nexus_dsa
    PRIVATE
    ${MODULE_ROOT}/cpp/include
)

find_library(log-lib log)

target_link_libraries(
    nexus_dsa
    ${log-lib}
)
