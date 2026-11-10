
#include "../include/Sorting.hpp"

#include <algorithm>
#include <utility>

// Compare two files based on the selected field.
bool Sorting::compare(
    const SortableFile& a,
    const SortableFile& b,
    SortField field,
    bool ascending
) {
    bool result = false;

    switch (field) {
        case SortField::Name:
            result = a.name < b.name;
            break;

        case SortField::Size:
            result = a.size < b.size;
            break;

        case SortField::ModifiedAt:
            result = a.modifiedAt < b.modifiedAt;
            break;
    }

    return ascending ? result : !result &&
        (
            field == SortField::Name
                ? a.name != b.name
                : field == SortField::Size
                    ? a.size != b.size
                    : a.modifiedAt != b.modifiedAt
        );
}

// --------------------------------------------------
// BUBBLE SORT
// --------------------------------------------------

void Sorting::bubbleSort(
    std::vector<SortableFile>& files,
    SortField field,
    bool ascending
) {
    int n = static_cast<int>(files.size());

    for (int i = 0; i < n - 1; i++) {

        bool swapped = false;

        for (int j = 0; j < n - i - 1; j++) {

            if (!compare(files[j], files[j + 1], field, ascending)) {

                // Avoid swapping equal elements.
                bool equal = false;

                if (field == SortField::Name) {
                    equal = files[j].name == files[j + 1].name;
                } else if (field == SortField::Size) {
                    equal = files[j].size == files[j + 1].size;
                } else {
                    equal = files[j].modifiedAt == files[j + 1].modifiedAt;
                }

                if (!equal) {
                    std::swap(files[j], files[j + 1]);
                    swapped = true;
                }
            }
        }

        if (!swapped) {
            break;
        }
    }
}

// --------------------------------------------------
// SELECTION SORT
// --------------------------------------------------

void Sorting::selectionSort(
    std::vector<SortableFile>& files,
    SortField field,
    bool ascending
) {
    int n = static_cast<int>(files.size());

    for (int i = 0; i < n - 1; i++) {

        int selected = i;

        for (int j = i + 1; j < n; j++) {

            if (compare(files[j], files[selected], field, ascending)) {
                selected = j;
            }
        }

        if (selected != i) {
            std::swap(files[i], files[selected]);
        }
    }
}

// --------------------------------------------------
// INSERTION SORT
// --------------------------------------------------

void Sorting::insertionSort(
    std::vector<SortableFile>& files,
    SortField field,
    bool ascending
) {
    int n = static_cast<int>(files.size());

    for (int i = 1; i < n; i++) {

        SortableFile key = files[i];

        int j = i - 1;

        while (
            j >= 0 &&
            compare(key, files[j], field, ascending)
        ) {
            files[j + 1] = files[j];
            j--;
        }

        files[j + 1] = key;
    }
}

// --------------------------------------------------
// MERGE SORT
// --------------------------------------------------

void Sorting::merge(
    std::vector<SortableFile>& files,
    int left,
    int middle,
    int right,
    SortField field,
    bool ascending
) {
    std::vector<SortableFile> leftArray(
        files.begin() + left,
        files.begin() + middle + 1
    );

    std::vector<SortableFile> rightArray(
        files.begin() + middle + 1,
        files.begin() + right + 1
    );

    int i = 0;
    int j = 0;
    int k = left;

    while (i < static_cast<int>(leftArray.size()) &&
           j < static_cast<int>(rightArray.size())) {

        if (
            !compare(
                rightArray[j],
                leftArray[i],
                field,
                ascending
            )
        ) {
            files[k++] = leftArray[i++];
        } else {
            files[k++] = rightArray[j++];
        }
    }

    while (i < static_cast<int>(leftArray.size())) {
        files[k++] = leftArray[i++];
    }

    while (j < static_cast<int>(rightArray.size())) {
        files[k++] = rightArray[j++];
    }
}

void Sorting::mergeSortRecursive(
    std::vector<SortableFile>& files,
    int left,
    int right,
    SortField field,
    bool ascending
) {
    if (left >= right) {
        return;
    }

    int middle = left + (right - left) / 2;

    mergeSortRecursive(
        files, left, middle, field, ascending
    );

    mergeSortRecursive(
        files, middle + 1, right, field, ascending
    );

    merge(
        files, left, middle, right, field, ascending
    );
}

void Sorting::mergeSort(
    std::vector<SortableFile>& files,
    SortField field,
    bool ascending
) {
    if (files.empty()) {
        return;
    }

    mergeSortRecursive(
        files,
        0,
        static_cast<int>(files.size()) - 1,
        field,
        ascending
    );
}

// --------------------------------------------------
// QUICK SORT
// --------------------------------------------------

int Sorting::partition(
    std::vector<SortableFile>& files,
    int low,
    int high,
    SortField field,
    bool ascending
) {
    SortableFile pivot = files[high];

    int i = low - 1;

    for (int j = low; j < high; j++) {

        if (compare(files[j], pivot, field, ascending)) {

            i++;

            std::swap(files[i], files[j]);
        }
    }

    std::swap(files[i + 1], files[high]);

    return i + 1;
}

void Sorting::quickSortRecursive(
    std::vector<SortableFile>& files,
    int low,
    int high,
    SortField field,
    bool ascending
) {
    if (low < high) {

        int pivotIndex = partition(
            files, low, high, field, ascending
        );

        quickSortRecursive(
            files,
            low,
            pivotIndex - 1,
            field,
            ascending
        );

        quickSortRecursive(
            files,
            pivotIndex + 1,
            high,
            field,
            ascending
        );
    }
}

void Sorting::quickSort(
    std::vector<SortableFile>& files,
    SortField field,
    bool ascending
) {
    if (files.empty()) {
        return;
    }

    quickSortRecursive(
        files,
        0,
        static_cast<int>(files.size()) - 1,
        field,
        ascending
    );
}
