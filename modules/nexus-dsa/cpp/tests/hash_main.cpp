
#include "../include/HashTable.hpp"

#include <cassert>
#include <iostream>

int main() {

    std::cout << "Starting NexusDocs Hash Table Tests...\n";

    // Create hash table with 5 buckets.
    HashTable hashTable(5);

    // 1. Test empty table.
    assert(hashTable.isEmpty());
    assert(hashTable.size() == 0);

    // 2. Insert documents.
    assert(hashTable.insert({
        "doc101", "DSA Notes.pdf", "Local", 2048
    }));

    assert(hashTable.insert({
        "doc102", "Resume.pdf", "Google Drive", 1024
    }));

    assert(hashTable.insert({
        "doc103", "Project.cpp", "OneDrive", 4096
    }));

    assert(hashTable.insert({
        "doc104", "Assignment.pdf", "Local", 3072
    }));

    // 3. Test duplicate ID.
    assert(!hashTable.insert({
        "doc101", "Duplicate.pdf", "Local", 500
    }));

    assert(hashTable.size() == 4);

    // 4. Search existing document.
    Document* found = hashTable.search("doc101");

    assert(found != nullptr);
    assert(found->name == "DSA Notes.pdf");

    // 5. Search nonexistent document.
    assert(hashTable.search("unknown") == nullptr);

    // 6. Test collision handling.
    // These documents are stored using separate chaining
    // if their hash function returns the same bucket.
    int capacity = hashTable.getCapacity();

    std::cout << "\nHash Table Capacity: "
              << capacity << std::endl;

    // 7. Display hash table.
    hashTable.display();

    // 8. Test load factor.
    std::cout << "\nLoad Factor: "
              << hashTable.loadFactor()
              << std::endl;

    assert(hashTable.loadFactor() > 0.0);

    // 9. Delete a document.
    assert(hashTable.remove("doc102"));

    assert(hashTable.search("doc102") == nullptr);

    assert(hashTable.size() == 3);

    // 10. Delete nonexistent document.
    assert(!hashTable.remove("unknown"));

    // 11. Display final table.
    std::cout << "\nAfter Deletion:\n";

    hashTable.display();

    std::cout << "\nAll Hash Table tests passed!\n";
        // Test collision handling using separate chaining.
    std::cout  << "\n===== Collision Handling Test =====\n";

    HashTable collisionTable(5);

    Document fileA = {"a", "File A.pdf", "Local", 100};
    Document fileF = {"f", "File F.pdf", "Google Drive", 200};

    assert(collisionTable.insert(fileA));
    assert(collisionTable.insert(fileF));

    // Both keys should be stored and searchable.
    assert(collisionTable.search("a") != nullptr);
    assert(collisionTable.search("f") != nullptr);

    assert(collisionTable.size() == 2);

    std::cout  << "Both colliding documents were inserted successfully.\n";
    std::cout  << "Both documents can be searched successfully.\n";

    collisionTable.display();

    assert(collisionTable.remove("a"));
    assert(collisionTable.search("f") != nullptr);
    assert(collisionTable.size() == 1);

    std::cout  << "Collision handling tests passed!\n";

    return 0;
}
