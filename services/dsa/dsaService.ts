
import type { AppFile } from "@/types/file";
import NexusDSA from "nexus-dsa-native";

export type SortAlgorithm =
  | "bubble"
  | "selection"
  | "insertion"
  | "merge"
  | "quick";

export type SortField = "name" | "size" | "modifiedAt";

interface SortedRecord {
  id: string;
}

interface FileTreeNode {
  id: string;
  name: string;
  type: "folder" | "file";
  children: FileTreeNode[];
}

const algorithmMap: Record<SortAlgorithm, number> = {
  bubble: 0,
  selection: 1,
  insertion: 2,
  merge: 3,
  quick: 4,
};

const fieldMap: Record<SortField, number> = {
  name: 0,
  size: 1,
  modifiedAt: 2,
};

/**
 * Returns the native module only when the required
 * Android C++ functions are available.
 */
function getNativeDSA() {
  if (
    !NexusDSA ||
    typeof NexusDSA.nativeStatus !== "function" ||
    typeof NexusDSA.sortFiles !== "function"
  ) {
    throw new Error(
      "NexusDocs DSA requires the Android native development build."
    );
  }

  return NexusDSA;
}

/**
 * Builds the document category tree using native C++.
 */
export function buildFileTree(
  files: AppFile[]
): FileTreeNode {
  const native = getNativeDSA();

  const rootId = "nexusdocs-root";

  if (!native.initializeTree(rootId, "NexusDocs")) {
    throw new Error("Unable to initialize the file tree.");
  }

  const categories = new Map<string, AppFile[]>();

  for (const file of files) {
    const category =
      file.category?.trim() || "Uncategorized";

    const categoryFiles = categories.get(category) ?? [];
    categoryFiles.push(file);
    categories.set(category, categoryFiles);
  }

  for (const [category, categoryFiles] of categories) {
    const categoryId = `category:${category}`;

    const folderCreated = native.addTreeNode(
      rootId,
      categoryId,
      category,
      true
    );

    if (!folderCreated) {
      throw new Error(
        `Unable to create tree category: ${category}`
      );
    }

    for (const file of categoryFiles) {
      const added = native.addTreeNode(
        categoryId,
        file.id,
        file.name,
        false
      );

      if (!added) {
        throw new Error(
          `Unable to add file to tree: ${file.name}`
        );
      }
    }
  }

  const treeJson = native.getTreeJson();

  return JSON.parse(treeJson) as FileTreeNode;
}

/**
 * Builds the document ID hash table using native C++.
 */
export function buildFileHashTable(files: AppFile[]) {
  const native = getNativeDSA();

  const capacity = Math.max(10, files.length * 2);

  if (!native.initializeHashTable(capacity)) {
    throw new Error("Unable to initialize the hash table.");
  }

  for (const file of files) {
    const inserted = native.insertDocument(
      file.id,
      file.name,
      file.storage,
      file.size
    );

    if (!inserted) {
      throw new Error(
        `Unable to index document: ${file.name}`
      );
    }
  }

  return JSON.parse(native.getHashTableStats());
}

/**
 * Searches for a document by ID using the native hash table.
 */
export function searchFileById(id: string) {
  const native = getNativeDSA();

  const result = native.searchDocument(id);

  if (!result) {
    return null;
  }

  return JSON.parse(result);
}

/**
 * Removes a document from the native hash table.
 */
export function removeFileFromHashTable(id: string): boolean {
  const native = getNativeDSA();

  return native.removeDocument(id);
}

/**
 * Sorts documents using the selected native C++ algorithm.
 */
export function sortFiles(
  files: AppFile[],
  algorithm: SortAlgorithm,
  field: SortField,
  ascending = true
): AppFile[] {
  const native = getNativeDSA();

  if (files.length <= 1) {
    return [...files];
  }

  const result = native.sortFiles(
    files.map((file) => file.id),
    files.map((file) => file.name),
    files.map((file) => file.size),
    files.map((file) => file.modifiedAt ?? ""),
    algorithmMap[algorithm],
    fieldMap[field],
    ascending
  );

  const sortedRecords = JSON.parse(result) as SortedRecord[];

  if (!Array.isArray(sortedRecords)) {
    throw new Error(
      "Native sorting returned an invalid result."
    );
  }

  const filesById = new Map(
    files.map((file) => [file.id, file])
  );

  return sortedRecords
    .map((record) => filesById.get(record.id))
    .filter((file): file is AppFile => file !== undefined);
}

/**
 * Returns the native C++ module status.
 */
export function getNativeDSAStatus(): string {
  const native = getNativeDSA();

  return native.nativeStatus();
}
