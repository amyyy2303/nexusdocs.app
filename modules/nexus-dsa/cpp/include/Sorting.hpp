
#ifndef SORTING_HPP
#define SORTING_HPP

#include <string>
#include <vector>

struct SortableFile {
    std::string id;
    std::string name;
    long long size;
    std::string modifiedAt;
};

enum class SortField {
    Name,
    Size,
    ModifiedAt
};

class Sorting {
private:
    static bool compare(
        const SortableFile& a,
        const SortableFile& b,
        SortField field,
        bool ascending
    );

    static void merge(
        std::vector<SortableFile>& files,
        int left,
        int middle,
        int right,
        SortField field,
        bool ascending
    );

    static void mergeSortRecursive(
        std::vector<SortableFile>& files,
        int left,
        int right,
        SortField field,
        bool ascending
    );

    static int partition(
        std::vector<SortableFile>& files,
        int low,
        int high,
        SortField field,
        bool ascending
    );

    static void quickSortRecursive(
        std::vector<SortableFile>& files,
        int low,
        int high,
        SortField field,
        bool ascending
    );

public:
    static void bubbleSort(
        std::vector<SortableFile>& files,
        SortField field,
        bool ascending = true
    );

    static void selectionSort(
        std::vector<SortableFile>& files,
        SortField field,
        bool ascending = true
    );

    static void insertionSort(
        std::vector<SortableFile>& files,
        SortField field,
        bool ascending = true
    );

    static void mergeSort(
        std::vector<SortableFile>& files,
        SortField field,
        bool ascending = true
    );

    static void quickSort(
        std::vector<SortableFile>& files,
        SortField field,
        bool ascending = true
    );
};

#endif
