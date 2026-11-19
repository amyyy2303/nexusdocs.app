
#include "../include/HashTable.hpp"

#include <iostream>
#include <stdexcept>
#include <iomanip>

HashTable::HashTable(int tableCapacity)
    : capacity(tableCapacity), currentSize(0) {

    if (tableCapacity <= 0) {
        throw std::invalid_argument(
            "Hash table capacity must be positive."
        );
    }

    table.resize(capacity);
}

// Hash function using polynomial hashing.
int HashTable::hashFunction(
    const std::string& key
) const {

    unsigned long long hash = 0;

    for (unsigned char character : key) {
        hash = (hash * 31 + character) % capacity;
    }

    return static_cast<int>(hash);
}

// Insert a document into the hash table.
bool HashTable::insert(
    const Document& document
) {

    if (document.id.empty()) {
        return false;
    }

    int index = hashFunction(document.id);

    // Prevent duplicate document IDs.
    for (const auto& existing : table[index]) {
        if (existing.id == document.id) {
            return false;
        }
    }

    // Separate chaining handles collisions.
    table[index].push_back(document);

    currentSize++;

    return true;
}

// Search for a document using its ID.
Document* HashTable::search(
    const std::string& id
) {

    int index = hashFunction(id);

    for (auto& document : table[index]) {

        if (document.id == id) {
            return &document;
        }
    }

    return nullptr;
}

// Delete a document using its ID.
bool HashTable::remove(
    const std::string& id
) {

    int index = hashFunction(id);

    auto& bucket = table[index];

    for (auto it = bucket.begin(); it != bucket.end(); ++it) {

        if (it->id == id) {

            bucket.erase(it);

            currentSize--;

            return true;
        }
    }

    return false;
}

// Display all buckets.
void HashTable::display() const {

    std::cout << "\nNEXUSDOCS HASH TABLE\n";
    std::cout << "--------------------\n";

    for (int i = 0; i < capacity; i++) {

        std::cout << "Bucket " << i << ": ";

        if (table[i].empty()) {
            std::cout << "Empty";
        } else {

            for (const auto& document : table[i]) {

                std::cout
                    << "[ID: " << document.id
                    << ", Name: " << document.name
                    << ", Size: " << document.size << " bytes]";

                if (&document != &table[i].back()) {
                    std::cout << " -> ";
                }
            }
        }

        std::cout << std::endl;
    }
}

// Return the number of documents.
int HashTable::size() const {
    return currentSize;
}

// Return the number of buckets.
int HashTable::getCapacity() const {
    return capacity;
}

// Calculate load factor.
double HashTable::loadFactor() const {

    return static_cast<double>(currentSize) / capacity;
}

// Check whether table is empty.
bool HashTable::isEmpty() const {
    return currentSize == 0;
}
