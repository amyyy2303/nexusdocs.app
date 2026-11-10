
#include "../include/FileTree.hpp"

#include <cassert>
#include <iostream>

int main() {

    std::cout << "Starting NexusDocs Tree Tests...\n";

    FileTree tree("root", "NexusDocs");

    // 1. Create folders
    assert(tree.addNode(
        "root", "college", "College", NodeType::Folder
    ));

    assert(tree.addNode(
        "root", "personal", "Personal", NodeType::Folder
    ));

    assert(tree.addNode(
        "college", "assignments", "Assignments",
        NodeType::Folder
    ));

    assert(tree.addNode(
        "college", "projects", "Projects",
        NodeType::Folder
    ));

    // 2. Create documents
    assert(tree.addNode(
        "assignments", "file1", "DSA.pdf", NodeType::File
    ));

    assert(tree.addNode(
        "projects", "file2", "NexusDocs.cpp", NodeType::File
    ));

    assert(tree.addNode(
        "personal", "file3", "Resume.pdf", NodeType::File
    ));

    // 3. Test duplicate ID
    assert(!tree.addNode(
        "root", "college", "Duplicate", NodeType::Folder
    ));

    // 4. Test searching
    assert(tree.findNode("file1") != nullptr);
    assert(tree.findNode("unknown") == nullptr);

    // 5. Test deleting a subtree
    assert(tree.removeNode("projects"));
    assert(tree.findNode("projects") == nullptr);
    assert(tree.findNode("file2") == nullptr);

    // 6. Root cannot be deleted
    assert(!tree.removeNode("root"));

    // 7. Display final tree
    tree.displayTree();

    std::cout << "\nAll Tree tests passed!\n";

    return 0;
}
