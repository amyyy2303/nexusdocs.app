import { create } from "zustand";

import {
  deleteFile,
  getFiles,
  saveFile,
  StoredFile,
  toggleFavorite,
} from "@/services/storage/storage";

interface FileStore {
  files: StoredFile[];

  loadFiles: () => Promise<void>;

  clearFiles: () => void;

  addFile: (
    file: StoredFile
  ) => Promise<void>;

  removeFile: (
    id: string
  ) => Promise<void>;

  favoriteFile: (
    id: string
  ) => Promise<void>;
}

export const useFileStore =
  create<FileStore>((set) => ({
    files: [],

    loadFiles: async () => {
      const files = await getFiles();

      set({
        files,
      });
    },

    clearFiles: () => {
      set({
        files: [],
      });
    },

    addFile: async (file) => {
      await saveFile(file);

      const files =
        await getFiles();

      set({
        files,
      });
    },

    removeFile: async (id) => {
      await deleteFile(id);

      const files =
        await getFiles();

      set({
        files,
      });
    },

    favoriteFile: async (id) => {
      await toggleFavorite(id);

      const files =
        await getFiles();

      set({
        files,
      });
    },
  }));