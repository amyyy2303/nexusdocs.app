#include <vector>
#include "Sorting.hpp"
#include <jni.h>
#include <memory>
#include <mutex>
#include <string>

#include "FileTree.hpp"
#include "HashTable.hpp"

// ---------------- TREE ----------------

static std::unique_ptr<FileTree> fileTree;
static std::mutex treeMutex;

// ---------------- HASH TABLE ----------------

static std::unique_ptr<HashTable> hashTable;
static std::mutex hashMutex;

// ---------------- HELPERS ----------------

std::string toStdString(JNIEnv* env, jstring value) {
    if (value == nullptr) return "";

    const char* chars = env->GetStringUTFChars(value, nullptr);
    std::string result(chars);

    env->ReleaseStringUTFChars(value, chars);
    return result;
}

std::string escapeJson(const std::string& value) {
    std::string result;

    for (char c : value) {
        switch (c) {
            case '"': result += "\\\""; break;
            case '\\': result += "\\\\"; break;
            case '\n': result += "\\n"; break;
            case '\r': result += "\\r"; break;
            case '\t': result += "\\t"; break;
            default: result += c;
        }
    }

    return result;
}

std::string documentToJson(const Document& document) {
    return "{"
        "\"id\":\"" + escapeJson(document.id) + "\","
        "\"name\":\"" + escapeJson(document.name) + "\","
        "\"storage\":\"" + escapeJson(document.storage) + "\","
        "\"size\":" + std::to_string(document.size) +
        "}";
}

// ---------------- TREE JSON ----------------

void appendNodeJson(const TreeNode* node, std::string& json) {
    if (node == nullptr) return;

    json += "{";
    json += "\"id\":\"" + escapeJson(node->id) + "\",";
    json += "\"name\":\"" + escapeJson(node->name) + "\",";
    json += "\"type\":\"";
    json += (node->type == NodeType::Folder ? "folder" : "file");
    json += "\",\"children\":[";

    for (size_t i = 0; i < node->children.size(); i++) {
        if (i > 0) json += ",";
        appendNodeJson(node->children[i].get(), json);
    }

    json += "]}";
}

// ---------------- JNI METHODS ----------------

extern "C" {

// STATUS

JNIEXPORT jstring JNICALL
Java_expo_modules_nexusdsa_NexusDSAModule_nativeGetStatus(
    JNIEnv* env, jobject
) {
    return env->NewStringUTF("NexusDSA C++ core loaded");
}

// TREE

JNIEXPORT jboolean JNICALL
Java_expo_modules_nexusdsa_NexusDSAModule_nativeInitializeTree(
    JNIEnv* env, jobject, jstring rootId, jstring rootName
) {
    std::lock_guard<std::mutex> lock(treeMutex);

    fileTree = std::make_unique<FileTree>(
        toStdString(env, rootId),
        toStdString(env, rootName)
    );

    return JNI_TRUE;
}

JNIEXPORT jboolean JNICALL
Java_expo_modules_nexusdsa_NexusDSAModule_nativeAddTreeNode(
    JNIEnv* env, jobject,
    jstring parentId, jstring id, jstring name, jboolean isFolder
) {
    std::lock_guard<std::mutex> lock(treeMutex);

    if (!fileTree) return JNI_FALSE;

    return fileTree->addNode(
        toStdString(env, parentId),
        toStdString(env, id),
        toStdString(env, name),
        isFolder ? NodeType::Folder : NodeType::File
    ) ? JNI_TRUE : JNI_FALSE;
}

JNIEXPORT jboolean JNICALL
Java_expo_modules_nexusdsa_NexusDSAModule_nativeRemoveTreeNode(
    JNIEnv* env, jobject, jstring id
) {
    std::lock_guard<std::mutex> lock(treeMutex);

    if (!fileTree) return JNI_FALSE;

    return fileTree->removeNode(toStdString(env, id))
        ? JNI_TRUE : JNI_FALSE;
}

JNIEXPORT jstring JNICALL
Java_expo_modules_nexusdsa_NexusDSAModule_nativeGetTreeJson(
    JNIEnv* env, jobject
) {
    std::lock_guard<std::mutex> lock(treeMutex);

    if (!fileTree) return env->NewStringUTF("null");

    std::string json;
    appendNodeJson(fileTree->getRoot(), json);

    return env->NewStringUTF(json.c_str());
}

// HASH TABLE

JNIEXPORT jboolean JNICALL
Java_expo_modules_nexusdsa_NexusDSAModule_nativeInitializeHashTable(
    JNIEnv*, jobject, jint capacity
) {
    std::lock_guard<std::mutex> lock(hashMutex);

    if (capacity <= 0) return JNI_FALSE;

    hashTable = std::make_unique<HashTable>(capacity);

    return JNI_TRUE;
}

JNIEXPORT jboolean JNICALL
Java_expo_modules_nexusdsa_NexusDSAModule_nativeInsertDocument(
    JNIEnv* env, jobject,
    jstring id, jstring name, jstring storage, jlong size
) {
    std::lock_guard<std::mutex> lock(hashMutex);

    if (!hashTable || size < 0) return JNI_FALSE;

    Document document{
        toStdString(env, id),
        toStdString(env, name),
        toStdString(env, storage),
        static_cast<long long>(size)
    };

    return hashTable->insert(document) ? JNI_TRUE : JNI_FALSE;
}

JNIEXPORT jstring JNICALL
Java_expo_modules_nexusdsa_NexusDSAModule_nativeSearchDocument(
    JNIEnv* env, jobject, jstring id
) {
    std::lock_guard<std::mutex> lock(hashMutex);

    if (!hashTable) return env->NewStringUTF("null");

    Document* document = hashTable->search(toStdString(env, id));

    if (document == nullptr) return env->NewStringUTF("null");

    std::string json = documentToJson(*document);

    return env->NewStringUTF(json.c_str());
}

JNIEXPORT jboolean JNICALL
Java_expo_modules_nexusdsa_NexusDSAModule_nativeRemoveDocument(
    JNIEnv* env, jobject, jstring id
) {
    std::lock_guard<std::mutex> lock(hashMutex);

    if (!hashTable) return JNI_FALSE;

    return hashTable->remove(toStdString(env, id))
        ? JNI_TRUE : JNI_FALSE;
}

JNIEXPORT jstring JNICALL
Java_expo_modules_nexusdsa_NexusDSAModule_nativeGetHashTableStats(
    JNIEnv* env, jobject
) {
    std::lock_guard<std::mutex> lock(hashMutex);

    if (!hashTable) return env->NewStringUTF("null");

    std::string json =
        "{"
        "\"size\":" + std::to_string(hashTable->size()) + ","
        "\"capacity\":" + std::to_string(hashTable->getCapacity()) + ","
        "\"loadFactor\":" + std::to_string(hashTable->loadFactor()) + ","
        "\"isEmpty\":" + std::string(hashTable->isEmpty() ? "true" : "false") +
        "}";

    return env->NewStringUTF(json.c_str());
}

JNIEXPORT jstring JNICALL
Java_expo_modules_nexusdsa_NexusDSAModule_nativeSortFiles(
    JNIEnv* env,
    jobject,
    jobjectArray ids,
    jobjectArray names,
    jlongArray sizes,
    jobjectArray modifiedAt,
    jint algorithm,
    jint field,
    jboolean ascending
) {
    jsize count = env->GetArrayLength(ids);

    if (env->GetArrayLength(names) != count ||
        env->GetArrayLength(sizes) != count ||
        env->GetArrayLength(modifiedAt) != count) {
        return nullptr;
    }

    std::vector<SortableFile> files;
    files.reserve(count);

    jlong* sizeValues = env->GetLongArrayElements(sizes, nullptr);

    for (jsize i = 0; i < count; i++) {
        auto id = static_cast<jstring>(
            env->GetObjectArrayElement(ids, i)
        );
        auto name = static_cast<jstring>(
            env->GetObjectArrayElement(names, i)
        );
        auto date = static_cast<jstring>(
            env->GetObjectArrayElement(modifiedAt, i)
        );

        files.push_back({
            toStdString(env, id),
            toStdString(env, name),
            static_cast<long long>(sizeValues[i]),
            toStdString(env, date)
        });

        env->DeleteLocalRef(id);
        env->DeleteLocalRef(name);
        env->DeleteLocalRef(date);
    }

    env->ReleaseLongArrayElements(sizes, sizeValues, JNI_ABORT);

    SortField sortField;

    switch (field) {
        case 0: sortField = SortField::Name; break;
        case 1: sortField = SortField::Size; break;
        case 2: sortField = SortField::ModifiedAt; break;
        default: return nullptr;
    }

    bool order = ascending == JNI_TRUE;

    switch (algorithm) {
        case 0:
            Sorting::bubbleSort(files, sortField, order);
            break;
        case 1:
            Sorting::selectionSort(files, sortField, order);
            break;
        case 2:
            Sorting::insertionSort(files, sortField, order);
            break;
        case 3:
            Sorting::mergeSort(files, sortField, order);
            break;
        case 4:
            Sorting::quickSort(files, sortField, order);
            break;
        default:
            return nullptr;
    }

    std::string json = "[";

    for (size_t i = 0; i < files.size(); i++) {
        if (i > 0) json += ",";

        json += "{";
        json += "\"id\":\"" + escapeJson(files[i].id) + "\",";
        json += "\"name\":\"" + escapeJson(files[i].name) + "\",";
        json += "\"size\":" + std::to_string(files[i].size) + ",";
        json += "\"modifiedAt\":\"" +
                escapeJson(files[i].modifiedAt) + "\"";
        json += "}";
    }

    json += "]";

    return env->NewStringUTF(json.c_str());
}

}
