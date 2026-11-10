
#ifndef HASH_TABLE_HPP
#define HASH_TABLE_HPP

#include <string>
#include <vector>
#include <list>

struct Document {
    std::string id;
    std::string name;
    std::string storage;
    long long size;
};

class HashTable {
private:
    std::vector<std::list<Document>> table;

    int capacity;
    int currentSize;

    // Converts a document ID into a bucket index.
    int hashFunction(const std::string& key) const;

public:
    explicit HashTable(int tableCapacity = 10);

    // Insert a new document.
    bool insert(const Document& document);

    // Search for a document using its ID.
    Document* search(const std::string& id);

    // Delete a document using its ID.
    bool remove(const std::string& id);

    // Display all buckets and their contents.
    void display() const;

    // Return the number of stored documents.
    int size() const;

    // Return the number of buckets.
    int getCapacity() const;

    // Calculate the load factor.
    double loadFactor() const;

    // Check whether the table is empty.
    bool isEmpty() const;
};

#endif
