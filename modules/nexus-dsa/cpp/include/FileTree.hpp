
#ifndef FILE_TREE_HPP
#define FILE_TREE_HPP

#include <memory>
#include <string>
#include <vector>

enum class NodeType {
    Folder,
    File
};

struct TreeNode {
    std::string id;
    std::string name;
    NodeType type;

    TreeNode* parent;

    std::vector<std::unique_ptr<TreeNode>> children;

    TreeNode(
        const std::string& nodeId,
        const std::string& nodeName,
        NodeType nodeType
    );
};

class FileTree {
private:
    std::unique_ptr<TreeNode> root;

    TreeNode* findNodeRecursive(
        TreeNode* current,
        const std::string& id
    ) const;

    bool removeNodeRecursive(
        TreeNode* current,
        const std::string& id
    );

    void printRecursive(
        const TreeNode* current,
        int depth
    ) const;

public:
    FileTree(
        const std::string& rootId,
        const std::string& rootName
    );

    bool addNode(
        const std::string& parentId,
        const std::string& id,
        const std::string& name,
        NodeType type
    );

    TreeNode* findNode(
        const std::string& id
    ) const;

    bool removeNode(
        const std::string& id
    );

    void displayTree() const;

    TreeNode* getRoot() const;
};

#endif
