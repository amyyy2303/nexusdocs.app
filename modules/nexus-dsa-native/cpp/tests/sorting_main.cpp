
#include <iostream>
#include <vector>
#include <string>
#include <cassert>

#include "../include/Sorting.hpp"

using namespace std;

bool isSorted(
    const vector<SortableFile>& files,
    SortField field,
    bool ascending
) {
    for (size_t i = 1; i < files.size(); i++) {
        bool outOfOrder = false;

        if (field == SortField::Name) {
            outOfOrder = ascending
                ? files[i - 1].name > files[i].name
                : files[i - 1].name < files[i].name;
        }
        else if (field == SortField::Size) {
            outOfOrder = ascending
                ? files[i - 1].size > files[i].size
                : files[i - 1].size < files[i].size;
        }
        else if (field == SortField::ModifiedAt) {
            outOfOrder = ascending
                ? files[i - 1].modifiedAt > files[i].modifiedAt
                : files[i - 1].modifiedAt < files[i].modifiedAt;
        }

        if (outOfOrder) {
            return false;
        }
    }

    return true;
}

using SortFunction = void (*)(
    vector<SortableFile>&,
    SortField,
    bool
);

void testAlgorithm(
    const string& algorithmName,
    SortFunction sortFunction,
    const vector<SortableFile>& sample
) {
    SortField fields[] = {
        SortField::Name,
        SortField::Size,
        SortField::ModifiedAt
    };

    for (SortField field : fields) {
        for (bool ascending : {true, false}) {
            vector<SortableFile> files = sample;

            sortFunction(files, field, ascending);

            assert(isSorted(files, field, ascending));
        }
    }

    cout << algorithmName << " passed all tests.\n";
}

int main() {
    vector<SortableFile> files = {
        {"1", "Report.pdf", 300, "2026-01-10"},
        {"2", "Assignment.pdf", 100, "2026-03-02"},
        {"3", "Notes.pdf", 200, "2026-02-15"},
        {"4", "Archive.pdf", 400, "2025-12-20"}
    };

    cout << "===== NexusDocs Sorting Tests =====\n\n";

    testAlgorithm(
        "Bubble Sort",
        Sorting::bubbleSort,
        files
    );

    testAlgorithm(
        "Selection Sort",
        Sorting::selectionSort,
        files
    );

    testAlgorithm(
        "Insertion Sort",
        Sorting::insertionSort,
        files
    );

    testAlgorithm(
        "Merge Sort",
        Sorting::mergeSort,
        files
    );

    testAlgorithm(
        "Quick Sort",
        Sorting::quickSort,
        files
    );

    // Test empty input.
    vector<SortableFile> emptyFiles;
    Sorting::mergeSort(emptyFiles, SortField::Name);
    assert(emptyFiles.empty());

    // Test a single-element input.
    vector<SortableFile> singleFile = {
        {"5", "OnlyFile.pdf", 500, "2026-05-01"}
    };

    Sorting::quickSort(singleFile, SortField::Name);
    assert(singleFile.size() == 1);
    assert(singleFile[0].name == "OnlyFile.pdf");

    cout << "\nEmpty and single-file tests passed.\n";
    cout << "\nAll Sorting tests passed!\n";

    return 0;
}
