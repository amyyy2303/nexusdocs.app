
import { create } from "zustand";

import {
  deleteFile,
  getFiles,
  saveFile,
  StoredFile,
  toggleFavorite,
} from "@/services/storage/storage";

import {
  buildFileHashTable,
  buildFileTree,
  searchFileById,
} from "@/services/dsa/dsaService";

import type { AppFile } from "@/types/file";

interface FileTreeNode {
  id: string;
  name: string;
  type: "folder" | "file";
  children: FileTreeNode[];
}

interface FileStore {
  files: StoredFile[];
  fileTree: FileTreeNode | null;

  loadFiles: () => Promise<void>;
  clearFiles: () => void;
  addFile: (file: StoredFile) => Promise<void>;
  removeFile: (id: string) => Promise<void>;
  favoriteFile: (id: string) => Promise<void>;

  getFileById: (id: string) => StoredFile | undefined;
  getFilesByCategory: (category: string) => StoredFile[];
}

// Build both native data structures from the existing stored documents.
function syncDocumentStructures(
  files: StoredFile[]
): FileTreeNode | null {
  try {
    buildFileHashTable(files as AppFile[]);
  } catch (error) {
    console.warn("Hash Table synchronization unavailable:", error);
  }

  try {
    return buildFileTree(files as AppFile[]) as FileTreeNode;
  } catch (error) {
    console.warn("Document Tree synchronization unavailable:", error);
    return null;
  }
}

export const useFileStore = create<FileStore>((set, get) => ({
  files: [],
  fileTree: null,

  loadFiles: async () => {
    const files = await getFiles();
    const fileTree = syncDocumentStructures(files);

    set({ files, fileTree });
  },

  clearFiles: () => {
    const fileTree = syncDocumentStructures([]);
    set({ files: [], fileTree });
  },

  addFile: async (file) => {
    await saveFile(file);

    const files = await getFiles();
    const fileTree = syncDocumentStructures(files);

    set({ files, fileTree });
  },

  removeFile: async (id) => {
    await deleteFile(id);

    const files = await getFiles();
    const fileTree = syncDocumentStructures(files);

    set({ files, fileTree });
  },

  favoriteFile: async (id) => {
    await toggleFavorite(id);

    const files = await getFiles();
    const fileTree = syncDocumentStructures(files);

    set({ files, fileTree });
  },

  getFileById: (id) => {
    const files = get().files;

    try {
      const indexedDocument = searchFileById(id);

      if (indexedDocument) {
        return files.find((file) => file.id === indexedDocument.id);
      }
    } catch (error) {
      console.warn("Native Hash Table lookup unavailable:", error);
    }

    return files.find((file) => file.id === id);
  },

  getFilesByCategory: (category) => {
    const { files, fileTree } = get();

    // Find the category folder in the native-generated tree.
    const categoryNode = fileTree?.children?.find(
      (node) => node.type === "folder" && node.name === category
    );

    if (!categoryNode) {
      return files.filter(
        (file) => (file.category?.trim() || "Uncategorized") === category
      );
    }

    // Resolve the file IDs stored in that category's tree node.
    const fileIds = new Set(
      categoryNode.children
        .filter((node) => node.type === "file")
        .map((node) => node.id)
    );

    return files.filter((file) => fileIds.has(file.id));
  },
}));
