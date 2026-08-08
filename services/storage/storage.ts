import { auth } from "@/services/auth/firebase";
import { AppFile } from "@/types/file";
import AsyncStorage from "@react-native-async-storage/async-storage";

export type StoredFile = AppFile;

/**
 * Returns a unique AsyncStorage key for
 * the currently logged in Firebase user.
 */
function getStorageKey() {
  const uid = auth.currentUser?.uid;

  if (!uid) {
    throw new Error("No authenticated user.");
  }

  return `NEXUSDOCS_FILES_${uid}`;
}

// ---------------- Existing Functions ----------------

export async function getFiles(): Promise<StoredFile[]> {
  const data = await AsyncStorage.getItem(
    getStorageKey()
  );

  if (!data) return [];

  return JSON.parse(data);
}

export async function saveFile(
  file: StoredFile
) {
  const files = await getFiles();

  const alreadyExists = files.find(
    (item) => item.id === file.id
  );

  if (alreadyExists) {
    return;
  }

  files.unshift(file);

  await AsyncStorage.setItem(
    getStorageKey(),
    JSON.stringify(files)
  );
}

export async function deleteFile(
  id: string
) {
  const files = await getFiles();

  const updated = files.filter(
    (file) => file.id !== id
  );

  await AsyncStorage.setItem(
    getStorageKey(),
    JSON.stringify(updated)
  );
}

export async function renameFile(
  id: string,
  newName: string
) {
  const files = await getFiles();

  const updated = files.map((file) =>
    file.id === id
      ? {
          ...file,
          name: newName,
        }
      : file
  );

  await AsyncStorage.setItem(
    getStorageKey(),
    JSON.stringify(updated)
  );
}

export async function toggleFavorite(
  id: string
) {
  const files = await getFiles();

  const updated = files.map((file) =>
    file.id === id
      ? {
          ...file,
          isFavorite: !file.isFavorite,
        }
      : file
  );

  await AsyncStorage.setItem(
    getStorageKey(),
    JSON.stringify(updated)
  );
}

// ---------------- Storage Screen Helpers ----------------

export async function getStorageStats() {
  const files = await getFiles();

  const totalStorage = files.reduce(
    (sum, file) => sum + (file.size || 0),
    0
  );

  return {
    totalStorage,
    downloadCount: files.length,
    cacheSize: 0,
    files,
  };
}

export async function deleteAllOfflineFiles() {
  await AsyncStorage.setItem(
    getStorageKey(),
    JSON.stringify([])
  );
}

export function formatSize(bytes: number) {
  if (bytes < 1024)
    return `${bytes} B`;

  if (bytes < 1024 * 1024)
    return `${(
      bytes / 1024
    ).toFixed(1)} KB`;

  if (bytes < 1024 * 1024 * 1024)
    return `${(
      bytes /
      1024 /
      1024
    ).toFixed(2)} MB`;

  return `${(
    bytes /
    1024 /
    1024 /
    1024
  ).toFixed(2)} GB`;
}

export function formatDate(
  date?: string
) {
  if (!date) return "Unknown";

  try {
    return new Date(
      date
    ).toLocaleDateString();
  } catch {
    return "Unknown";
  }
}