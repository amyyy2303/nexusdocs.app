
package expo.modules.nexusdsa

import expo.modules.kotlin.modules.Module
import expo.modules.kotlin.modules.ModuleDefinition
import java.net.URL

class NexusDSAModule : Module() {

    // ==================== NATIVE STATUS ====================

    private external fun nativeGetStatus(): String

    // ==================== TREE METHODS ====================
    private external fun nativeSortFiles(
    ids: Array<String>,
    names: Array<String>,
    sizes: LongArray,
    modifiedAt: Array<String>,
    algorithm: Int,
    field: Int,
    ascending: Boolean
): String

    private external fun nativeInitializeTree(
        rootId: String,
        rootName: String
    ): Boolean

    private external fun nativeAddTreeNode(
        parentId: String,
        id: String,
        name: String,
        isFolder: Boolean
    ): Boolean

    private external fun nativeRemoveTreeNode(
        id: String
    ): Boolean

    private external fun nativeGetTreeJson(): String

    // ==================== HASH TABLE METHODS ====================

    private external fun nativeInitializeHashTable(
        capacity: Int
    ): Boolean

    private external fun nativeInsertDocument(
        id: String,
        name: String,
        storage: String,
        size: Long
    ): Boolean

    private external fun nativeSearchDocument(
        id: String
    ): String

    private external fun nativeRemoveDocument(
        id: String
    ): Boolean

    private external fun nativeGetHashTableStats(): String

    // ==================== NATIVE LIBRARY ====================

    companion object {
        init {
            System.loadLibrary("nexus_dsa")
        }
    }

    // ==================== EXPO MODULE DEFINITION ====================

    override fun definition() = ModuleDefinition {

        Name("NexusDSA")

        Constant("PI") {
            Math.PI
        }

        Events("onChange")

        Function("hello") {
            "Hello from NexusDSA!"
        }

        Function("nativeStatus") {
            nativeGetStatus()
        }
        Function("sortFiles") {
    ids: List<String>,
    names: List<String>,
    sizes: List<Long>,
    modifiedAt: List<String>,
    algorithm: Int,
    field: Int,
    ascending: Boolean ->

    require(ids.size == names.size &&
            ids.size == sizes.size &&
            ids.size == modifiedAt.size) {
        "All file arrays must have the same length"
    }

    nativeSortFiles(
        ids.toTypedArray(),
        names.toTypedArray(),
        sizes.map { it.toLong() }.toLongArray(),
        modifiedAt.toTypedArray(),
        algorithm,
        field,
        ascending
    )
}

        // ==================== TREE OPERATIONS ====================

        Function("initializeTree") {
            rootId: String,
            rootName: String ->

            nativeInitializeTree(rootId, rootName)
        }

        Function("addTreeNode") {
            parentId: String,
            id: String,
            name: String,
            isFolder: Boolean ->

            nativeAddTreeNode(parentId, id, name, isFolder)
        }

        Function("removeTreeNode") { id: String ->
            nativeRemoveTreeNode(id)
        }

        Function("getTreeJson") {
            nativeGetTreeJson()
        }

        // ==================== HASH TABLE OPERATIONS ====================

        Function("initializeHashTable") { capacity: Int ->
            nativeInitializeHashTable(capacity)
        }

        Function("insertDocument") {
            id: String,
            name: String,
            storage: String,
            size: Long ->

            nativeInsertDocument(id, name, storage, size)
        }

        Function("searchDocument") { id: String ->
            nativeSearchDocument(id)
        }

        Function("removeDocument") { id: String ->
            nativeRemoveDocument(id)
        }

        Function("getHashTableStats") {
            nativeGetHashTableStats()
        }

        // ==================== EXISTING ASYNC FUNCTION ====================

        AsyncFunction("setValueAsync") { value: String ->
            sendEvent("onChange", mapOf("value" to value))
        }

        // ==================== EXISTING VIEW ====================

        View(NexusDSAView::class) {
            Prop("url") { view: NexusDSAView, url: URL ->
                view.webView.loadUrl(url.toString())
            }

            Events("onLoad")
        }
    }
}
