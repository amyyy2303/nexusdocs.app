
#include "../include/FileTree.hpp"

#include <iostream>
#include <algorithm>

TreeNode::TreeNode(
    const std::string& nodeId,
    const std::string& nodeName,
    NodeType nodeType
) {
    id = nodeId;
    name = nodeName;
    type = nodeType;
    parent = nullptr;
}

FileTree::FileTree(
    const std::string& rootId,
    const std::string& rootName
) {
    root = std::make_unique<TreeNode>(
        rootId,
        rootName,
        NodeType::Folder
    );
}

TreeNode* FileTree::findNodeRecursive(
    TreeNode* current,
    const std::string& id
) const {

    if (current == nullptr) {
        return nullptr;
    }

    if (current->id == id) {
        return current;
    }

    for (const auto& child : current->children) {

        TreeNode* result =
            findNodeRecursive(child.get(), id);

        if (result != nullptr) {
            return result;
        }
    }

    return nullptr;
}

TreeNode* FileTree::findNode(
    const std::string& id
) const {

    return findNodeRecursive(root.get(), id);
}

bool FileTree::addNode(
    const std::string& parentId,
    const std::string& id,
    const std::string& name,
    NodeType type
) {

    if (id.empty() || name.empty() || findNode(id)) {
        return false;
    }

    TreeNode* parentNode = findNode(parentId);

    if (
        parentNode == nullptr ||
        parentNode->type != NodeType::Folder
    ) {
        return false;
    }

    auto newNode = std::make_unique<TreeNode>(
        id,
        name,
        type
    );

    newNode->parent = parentNode;

    parentNode->children.push_back(
        std::move(newNode)
    );

    return true;
}

bool FileTree::removeNodeRecursive(
    TreeNode* current,
    const std::string& id
) {

    if (current == nullptr) {
        return false;
    }

    auto& children = current->children;

    auto it = std::find_if(
        children.begin(),
        children.end(),
        [&id](const std::unique_ptr<TreeNode>& child) {
            return child->id == id;
        }
    );

    if (it != children.end()) {

        children.erase(it);

        return true;
    }

    for (const auto& child : children) {

        if (removeNodeRecursive(child.get(), id)) {
            return true;
        }
    }

    return false;
}

bool FileTree::removeNode(
    const std::string& id
) {

    if (root == nullptr || root->id == id) {
        return false;
    }

    return removeNodeRecursive(root.get(), id);
}

void FileTree::printRecursive(
    const TreeNode* current,
    int depth
) const {

    if (current == nullptr) {
        return;
    }

    for (int i = 0; i < depth; i++) {
        std::cout << "  ";
    }

    if (current->type == NodeType::Folder) {
        std::cout << "[FOLDER] ";
    } else {
        std::cout << "[FILE]   ";
    }

    std::cout << current->name
              << " (ID: " << current->id << ")"
              << std::endl;

    for (const auto& child : current->children) {
        printRecursive(child.get(), depth + 1);
    }
}

void FileTree::displayTree() const {

    std::cout << "\nNEXUSDOCS FILE TREE\n";
    std::cout << "-------------------\n";

    printRecursive(root.get(), 0);
}

TreeNode* FileTree::getRoot() const {
    return root.get();
}
