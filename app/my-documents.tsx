
import { router } from "expo-router";
import { useEffect, useMemo, useState } from "react";
import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import FileActionMenu from "@/components/file/FileActionMenu";
import UniversalFileCard from "@/components/file/UniversalFileCard";
import SearchBar from "@/components/inputs/SearchBar";

import {
  openFile,
  shareFile,
} from "@/services/open/openFile";

import {
  sortFiles,
  type SortField,
} from "@/services/dsa/dsaService";

import { useFileStore } from "@/store/fileStore";
import type { AppFile } from "@/types/file";

interface FileTreeNode {
  id: string;
  name: string;
  type: "folder" | "file";
  children: FileTreeNode[];
}

const SORT_OPTIONS: { label: string; value: SortField }[] = [
  { label: "Name", value: "name" },
  { label: "Size", value: "size" },
  { label: "Date Modified", value: "modifiedAt" },
];

export default function MyDocuments() {
  const files = useFileStore((state) => state.files);
  const fileTree = useFileStore((state) => state.fileTree);
  const loadFiles = useFileStore((state) => state.loadFiles);
  const favoriteFile = useFileStore((state) => state.favoriteFile);
  const getFileById = useFileStore((state) => state.getFileById);
  const getFilesByCategory = useFileStore(
    (state) => state.getFilesByCategory
  );

  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(
    null
  );

  const [selectedFile, setSelectedFile] = useState<AppFile | null>(null);
  const [menuVisible, setMenuVisible] = useState(false);

  const [sortField, setSortField] = useState<SortField>("modifiedAt");
  const [ascending, setAscending] = useState(false);

  useEffect(() => {
    loadFiles();
  }, [loadFiles]);

  // Get categories from the native-generated Tree.
  // If the native module is unavailable, derive categories from stored files.
  const categories = useMemo(() => {
    const treeCategories =
      (fileTree as FileTreeNode | null)?.children
        ?.filter((node) => node.type === "folder")
        .map((node) => node.name) ?? [];

    const fileCategories = files.map(
      (file) => file.category?.trim() || "Uncategorized"
    );

    return Array.from(
      new Set([...treeCategories, ...fileCategories])
    ).sort((a, b) => a.localeCompare(b));
  }, [fileTree, files]);

  // Get files for the selected category using the Tree-backed store action.
  const categoryFiles = useMemo(() => {
    if (!selectedCategory) {
      return files;
    }

    return getFilesByCategory(selectedCategory);
  }, [files, fileTree, selectedCategory, getFilesByCategory]);

  // Apply search after category filtering.
  const filteredFiles = useMemo(() => {
    const query = search.trim().toLowerCase();

    return categoryFiles.filter((file) =>
      file.name.toLowerCase().includes(query)
    );
  }, [categoryFiles, search]);

  // Safe fallback for platforms where the native C++ module is unavailable.
  function fallbackSort(
    items: AppFile[],
    field: SortField,
    isAscending: boolean
  ): AppFile[] {
    return [...items].sort((a, b) => {
      let comparison = 0;

      if (field === "name") {
        comparison = a.name.localeCompare(b.name);
      } else if (field === "size") {
        comparison = a.size - b.size;
      } else {
        const dateA = a.modifiedAt
          ? new Date(a.modifiedAt).getTime()
          : 0;

        const dateB = b.modifiedAt
          ? new Date(b.modifiedAt).getTime()
          : 0;

        comparison = dateA - dateB;
      }

      return isAscending ? comparison : -comparison;
    });
  }

  // Merge Sort is used internally. Algorithm names are not shown to users.
  function sortDocuments(
    items: AppFile[],
    field: SortField,
    isAscending: boolean
  ): AppFile[] {
    try {
      return sortFiles(items, "merge", field, isAscending);
    } catch (error) {
      console.warn(
        "Native sorting unavailable. Using fallback sorting.",
        error
      );

      return fallbackSort(items, field, isAscending);
    }
  }

  const displayedFiles = useMemo(
    () => sortDocuments(filteredFiles, sortField, ascending),
    [filteredFiles, sortField, ascending]
  );

  function openMenu(file: AppFile) {
    const indexedFile = getFileById(file.id);

    setSelectedFile(indexedFile ?? file);
    setMenuVisible(true);
  }

  function handleSortFieldChange(field: SortField) {
    setSortField(field);
  }

  function toggleSortOrder() {
    setAscending((previous) => !previous);
  }

  return (
    <>
      <ScrollView
        style={styles.container}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <Text style={styles.title}>My Documents</Text>

          <Text style={styles.subtitle}>
            View and manage all your files
          </Text>

          {/* Temporary entry point for testing the DSA implementations */}
          <TouchableOpacity
            style={styles.dsaButton}
            onPress={() => router.push("/dsa")}
            activeOpacity={0.8}
          >
            <Text style={styles.dsaButtonText}>Open DSA Dashboard</Text>
          </TouchableOpacity>
        </View>

        <SearchBar
          value={search}
          onChangeText={setSearch}
        />

        {/* Category browsing powered by the document Tree */}
        <View style={styles.categorySection}>
          <View style={styles.categoryHeader}>
            <Text style={styles.heading}>Browse Categories</Text>

            <Text style={styles.categoryCount}>
              {categories.length}{" "}
              {categories.length === 1 ? "Category" : "Categories"}
            </Text>
          </View>

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.categoryList}
          >
            <TouchableOpacity
              style={[
                styles.categoryChip,
                selectedCategory === null && styles.categoryChipSelected,
              ]}
              onPress={() => setSelectedCategory(null)}
              activeOpacity={0.75}
            >
              <Text
                style={[
                  styles.categoryChipText,
                  selectedCategory === null &&
                    styles.categoryChipTextSelected,
                ]}
              >
                All Documents
              </Text>
            </TouchableOpacity>

            {categories.map((category) => {
              const isSelected = selectedCategory === category;
              const count = getFilesByCategory(category).length;

              return (
                <TouchableOpacity
                  key={category}
                  style={[
                    styles.categoryChip,
                    isSelected && styles.categoryChipSelected,
                  ]}
                  onPress={() => setSelectedCategory(category)}
                  activeOpacity={0.75}
                >
                  <Text
                    style={[
                      styles.categoryChipText,
                      isSelected && styles.categoryChipTextSelected,
                    ]}
                  >
                    📁 {category} ({count})
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.heading}>
              {selectedCategory || "All Documents"}
            </Text>

            <Text style={styles.fileCount}>
              {displayedFiles.length}{" "}
              {displayedFiles.length === 1 ? "File" : "Files"}
            </Text>
          </View>

          {/* Normal document sorting controls */}
          <View style={styles.sortContainer}>
            <Text style={styles.sortLabel}>Sort by</Text>

            <View style={styles.sortOptions}>
              {SORT_OPTIONS.map((option) => {
                const isSelected = sortField === option.value;

                return (
                  <TouchableOpacity
                    key={option.value}
                    style={[
                      styles.sortOption,
                      isSelected && styles.sortOptionSelected,
                    ]}
                    onPress={() => handleSortFieldChange(option.value)}
                    activeOpacity={0.75}
                  >
                    <Text
                      style={[
                        styles.sortOptionText,
                        isSelected && styles.sortOptionTextSelected,
                      ]}
                    >
                      {option.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}

              <TouchableOpacity
                style={styles.orderButton}
                onPress={toggleSortOrder}
                activeOpacity={0.75}
              >
                <Text style={styles.orderButtonText}>
                  {ascending ? "↑" : "↓"}
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          {displayedFiles.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyIcon}>📂</Text>

              <Text style={styles.emptyTitle}>
                No documents found
              </Text>

              <Text style={styles.emptySubtitle}>
                {selectedCategory
                  ? `There are no matching documents in ${selectedCategory}.`
                  : "Your uploaded documents will appear here."}
              </Text>
            </View>
          ) : (
            displayedFiles.map((file) => (
              <UniversalFileCard
                key={file.id}
                file={file}
                onMenuPress={() => openMenu(file)}
              />
            ))
          )}
        </View>

        <View style={{ height: 60 }} />
      </ScrollView>

      <FileActionMenu
        visible={menuVisible}
        file={selectedFile}
        onClose={() => setMenuVisible(false)}
        onOpen={() => {
          if (selectedFile) {
            openFile(selectedFile);
          }

          setMenuVisible(false);
        }}
        onShare={() => {
          if (selectedFile) {
            shareFile(selectedFile);
          }

          setMenuVisible(false);
        }}
        onDownload={() => {
          Alert.alert(
            "Coming Soon",
            "Download feature will be implemented next."
          );

          setMenuVisible(false);
        }}
        onFavorite={async () => {
          if (selectedFile) {
            await favoriteFile(selectedFile.id);

            Alert.alert(
              selectedFile.isFavorite
                ? "Removed from Favorites"
                : "Added to Favorites",
              selectedFile.isFavorite
                ? "The document has been removed from your favorites."
                : "The document has been added to your favorites."
            );
          }

          setMenuVisible(false);
        }}
        onDetails={() => {
          Alert.alert(
            "File Details",
            `Name: ${selectedFile?.name}

Type: ${selectedFile?.mimeType}

Size: ${selectedFile?.size ?? 0} Bytes

Storage: ${selectedFile?.storage}`
          );

          setMenuVisible(false);
        }}
      />
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0F172A",
  },

  header: {
    marginHorizontal: 20,
    marginTop: 55,
    marginBottom: 10,
  },

  title: {
    fontSize: 32,
    fontFamily: "Inter_700Bold",
    color: "#F8FAFC",
  },

  subtitle: {
    marginTop: 8,
    fontSize: 16,
    fontFamily: "Inter_400Regular",
    color: "#94A3B8",
  },

  dsaButton: {
    alignSelf: "flex-start",
    marginTop: 14,
    paddingHorizontal: 16,
    paddingVertical: 11,
    borderRadius: 10,
    backgroundColor: "#1D4ED8",
    borderWidth: 1,
    borderColor: "#3B82F6",
  },

  dsaButtonText: {
    color: "#FFFFFF",
    fontSize: 13,
    fontFamily: "Inter_600SemiBold",
  },

  categorySection: {
    marginHorizontal: 20,
    marginTop: 26,
  },

  categoryHeader: {
    marginBottom: 12,
  },

  categoryCount: {
    marginTop: 5,
    fontSize: 13,
    fontFamily: "Inter_400Regular",
    color: "#94A3B8",
  },

  categoryList: {
    gap: 9,
    paddingRight: 20,
    paddingBottom: 4,
  },

  categoryChip: {
    paddingHorizontal: 15,
    paddingVertical: 11,
    borderRadius: 20,
    backgroundColor: "#1E293B",
    borderWidth: 1,
    borderColor: "#334155",
  },

  categoryChipSelected: {
    backgroundColor: "#1D4ED8",
    borderColor: "#3B82F6",
  },

  categoryChipText: {
    fontSize: 13,
    fontFamily: "Inter_500Medium",
    color: "#CBD5E1",
  },

  categoryChipTextSelected: {
    color: "#FFFFFF",
  },

  section: {
    marginHorizontal: 20,
    marginTop: 25,
  },

  sectionHeader: {
    marginBottom: 10,
  },

  heading: {
    fontSize: 20,
    fontFamily: "Inter_700Bold",
    color: "#F8FAFC",
  },

  fileCount: {
    marginTop: 6,
    fontSize: 14,
    fontFamily: "Inter_500Medium",
    color: "#94A3B8",
  },

  sortContainer: {
    marginTop: 12,
    marginBottom: 16,
  },

  sortLabel: {
    fontSize: 13,
    fontFamily: "Inter_500Medium",
    color: "#94A3B8",
    marginBottom: 10,
  },

  sortOptions: {
    flexDirection: "row",
    alignItems: "center",
    flexWrap: "wrap",
    gap: 8,
  },

  sortOption: {
    paddingHorizontal: 13,
    paddingVertical: 9,
    borderRadius: 20,
    backgroundColor: "#1E293B",
    borderWidth: 1,
    borderColor: "#334155",
  },

  sortOptionSelected: {
    backgroundColor: "#1D4ED8",
    borderColor: "#3B82F6",
  },

  sortOptionText: {
    fontSize: 12,
    fontFamily: "Inter_500Medium",
    color: "#CBD5E1",
  },

  sortOptionTextSelected: {
    color: "#FFFFFF",
  },

  orderButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#1E293B",
    borderWidth: 1,
    borderColor: "#334155",
    justifyContent: "center",
    alignItems: "center",
  },

  orderButtonText: {
    fontSize: 21,
    color: "#F8FAFC",
    fontWeight: "600",
  },

  emptyContainer: {
    marginTop: 60,
    alignItems: "center",
    paddingHorizontal: 30,
  },

  emptyIcon: {
    fontSize: 54,
  },

  emptyTitle: {
    marginTop: 18,
    fontSize: 20,
    fontFamily: "Inter_700Bold",
    color: "#F8FAFC",
  },

  emptySubtitle: {
    marginTop: 8,
    fontSize: 15,
    fontFamily: "Inter_400Regular",
    color: "#94A3B8",
    textAlign: "center",
    lineHeight: 22,
  },
});
