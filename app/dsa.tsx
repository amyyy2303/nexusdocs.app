
import { useEffect, useState } from "react";
import {
    Alert,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";

import {
    buildFileHashTable,
    buildFileTree,
    getNativeDSAStatus,
    searchFileById,
    sortFiles,
    type SortAlgorithm,
} from "@/services/dsa/dsaService";

import { useFileStore } from "@/store/fileStore";
import type { AppFile } from "@/types/file";

const ALGORITHMS: { label: string; value: SortAlgorithm }[] = [
  { label: "Bubble Sort", value: "bubble" },
  { label: "Selection Sort", value: "selection" },
  { label: "Insertion Sort", value: "insertion" },
  { label: "Merge Sort", value: "merge" },
  { label: "Quick Sort", value: "quick" },
];

export default function DSAScreen() {
  const files = useFileStore((state) => state.files);
  const loadFiles = useFileStore((state) => state.loadFiles);

  const [nativeStatus, setNativeStatus] = useState("Not tested");
  const [treeOutput, setTreeOutput] = useState("");
  const [hashOutput, setHashOutput] = useState("");
  const [sortingOutput, setSortingOutput] = useState("");
  const [selectedAlgorithm, setSelectedAlgorithm] =
    useState<SortAlgorithm>("merge");
  const [isRunning, setIsRunning] = useState(false);

  useEffect(() => {
    loadFiles();
  }, [loadFiles]);

  function runNativeStatus() {
    try {
      const status = getNativeDSAStatus();
      setNativeStatus(status);
      return true;
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Native module unavailable";

      setNativeStatus(message);
      return false;
    }
  }

  function runTreeTest() {
    try {
      const tree = buildFileTree(files as AppFile[]);
      setTreeOutput(JSON.stringify(tree, null, 2));
      return true;
    } catch (error) {
      setTreeOutput(
        error instanceof Error ? error.message : "Tree test failed"
      );
      return false;
    }
  }

  function runHashTest() {
    try {
      const stats = buildFileHashTable(files as AppFile[]);
      const firstFile = files[0];

      const lookup = firstFile
        ? searchFileById(firstFile.id)
        : null;

      setHashOutput(
        JSON.stringify(
          {
            statistics: stats,
            testDocumentId: firstFile?.id ?? "No documents available",
            lookupResult: lookup,
          },
          null,
          2
        )
      );

      return true;
    } catch (error) {
      setHashOutput(
        error instanceof Error ? error.message : "Hash Table test failed"
      );
      return false;
    }
  }

  function runSortingTest() {
    if (files.length < 2) {
      setSortingOutput(
        "At least two documents are required to test native sorting."
      );
      return false;
    }

    try {
      const result = sortFiles(
        files as AppFile[],
        selectedAlgorithm,
        "name",
        true
      );

      setSortingOutput(
        JSON.stringify(
          {
            algorithm: selectedAlgorithm,
            inputCount: files.length,
            outputCount: result.length,
            sortedDocuments: result.map((file) => ({
              id: file.id,
              name: file.name,
            })),
          },
          null,
          2
        )
      );

      return true;
    } catch (error) {
      setSortingOutput(
        error instanceof Error ? error.message : "Sorting test failed"
      );
      return false;
    }
  }

  async function runAllTests() {
    setIsRunning(true);

    try {
      await loadFiles();

      // Read the latest store state after loading.
      const latestFiles = useFileStore.getState().files;

      const statusOK = runNativeStatus();

      if (!statusOK) {
        Alert.alert(
          "Native Module Unavailable",
          "Install and run the Android development build to test the C++ engine."
        );
        return;
      }

      try {
        const tree = buildFileTree(latestFiles as AppFile[]);
        setTreeOutput(JSON.stringify(tree, null, 2));
      } catch (error) {
        setTreeOutput(
          error instanceof Error ? error.message : "Tree test failed"
        );
      }

      try {
        const stats = buildFileHashTable(latestFiles as AppFile[]);
        const firstFile = latestFiles[0];
        const lookup = firstFile ? searchFileById(firstFile.id) : null;

        setHashOutput(
          JSON.stringify(
            {
              statistics: stats,
              testDocumentId: firstFile?.id ?? "No documents available",
              lookupResult: lookup,
            },
            null,
            2
          )
        );
      } catch (error) {
        setHashOutput(
          error instanceof Error ? error.message : "Hash Table test failed"
        );
      }

      if (latestFiles.length >= 2) {
        try {
          const result = sortFiles(
            latestFiles as AppFile[],
            selectedAlgorithm,
            "name",
            true
          );

          setSortingOutput(
            JSON.stringify(
              {
                algorithm: selectedAlgorithm,
                inputCount: latestFiles.length,
                outputCount: result.length,
                sortedDocuments: result.map((file) => ({
                  id: file.id,
                  name: file.name,
                })),
              },
              null,
              2
            )
          );
        } catch (error) {
          setSortingOutput(
            error instanceof Error ? error.message : "Sorting test failed"
          );
        }
      } else {
        setSortingOutput(
          "At least two documents are required to test native sorting."
        );
      }

      Alert.alert(
        "Tests Completed",
        "Native DSA test execution finished. Review each result below."
      );
    } finally {
      setIsRunning(false);
    }
  }

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
    >
      <Text style={styles.title}>NexusDocs DSA Lab</Text>
      <Text style={styles.subtitle}>
        Native C++ implementation testing
      </Text>

      <View style={styles.card}>
        <Text style={styles.heading}>Native Engine</Text>
        <Text style={styles.result}>{nativeStatus}</Text>

        <TouchableOpacity
          style={styles.secondaryButton}
          onPress={runNativeStatus}
        >
          <Text style={styles.buttonText}>Check Native Status</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.card}>
        <Text style={styles.heading}>1. Tree</Text>
        <Text style={styles.description}>
          Builds the document category hierarchy using the native C++ tree.
        </Text>

        <TouchableOpacity
          style={styles.secondaryButton}
          onPress={runTreeTest}
        >
          <Text style={styles.buttonText}>Run Tree Test</Text>
        </TouchableOpacity>

        <Text style={styles.output}>{treeOutput || "No result yet"}</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.heading}>2. Hash Table</Text>
        <Text style={styles.description}>
          Builds the document ID index and searches for a document.
        </Text>

        <TouchableOpacity
          style={styles.secondaryButton}
          onPress={runHashTest}
        >
          <Text style={styles.buttonText}>Run Hash Table Test</Text>
        </TouchableOpacity>

        <Text style={styles.output}>{hashOutput || "No result yet"}</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.heading}>3. Sorting Algorithms</Text>
        <Text style={styles.description}>
          Select an algorithm here for academic testing only.
        </Text>

        {ALGORITHMS.map((algorithm) => (
          <TouchableOpacity
            key={algorithm.value}
            style={[
              styles.algorithmButton,
              selectedAlgorithm === algorithm.value &&
                styles.algorithmSelected,
            ]}
            onPress={() => setSelectedAlgorithm(algorithm.value)}
          >
            <Text style={styles.buttonText}>{algorithm.label}</Text>
          </TouchableOpacity>
        ))}

        <TouchableOpacity
          style={styles.primaryButton}
          onPress={runSortingTest}
        >
          <Text style={styles.buttonText}>Run Sorting Test</Text>
        </TouchableOpacity>

        <Text style={styles.output}>
          {sortingOutput || "No result yet"}
        </Text>
      </View>

      <TouchableOpacity
        style={styles.primaryButton}
        onPress={runAllTests}
        disabled={isRunning}
      >
        <Text style={styles.buttonText}>
          {isRunning ? "Running Tests..." : "Run All Tests"}
        </Text>
      </TouchableOpacity>

      <Text style={styles.footer}>
        Documents loaded: {files.length}
      </Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0F172A",
  },
  content: {
    padding: 20,
    paddingTop: 55,
    paddingBottom: 50,
  },
  title: {
    fontSize: 28,
    fontFamily: "Inter_700Bold",
    color: "#F8FAFC",
  },
  subtitle: {
    marginTop: 8,
    marginBottom: 22,
    color: "#94A3B8",
    fontSize: 14,
  },
  card: {
    backgroundColor: "#1E293B",
    borderRadius: 14,
    padding: 16,
    marginBottom: 16,
  },
  heading: {
    color: "#F8FAFC",
    fontSize: 19,
    fontFamily: "Inter_700Bold",
    marginBottom: 8,
  },
  description: {
    color: "#94A3B8",
    fontSize: 13,
    lineHeight: 20,
    marginBottom: 14,
  },
  result: {
    color: "#93C5FD",
    fontSize: 13,
    marginBottom: 12,
  },
  secondaryButton: {
    backgroundColor: "#334155",
    padding: 12,
    borderRadius: 9,
    alignItems: "center",
    marginTop: 6,
  },
  primaryButton: {
    backgroundColor: "#2563EB",
    padding: 14,
    borderRadius: 10,
    alignItems: "center",
    marginTop: 12,
  },
  algorithmButton: {
    backgroundColor: "#334155",
    padding: 11,
    borderRadius: 8,
    marginBottom: 7,
  },
  algorithmSelected: {
    backgroundColor: "#1D4ED8",
    borderWidth: 1,
    borderColor: "#60A5FA",
  },
  buttonText: {
    color: "#FFFFFF",
    fontFamily: "Inter_600SemiBold",
    fontSize: 13,
  },
  output: {
    color: "#CBD5E1",
    fontSize: 11,
    lineHeight: 17,
    marginTop: 14,
    fontFamily: "monospace",
  },
  footer: {
    color: "#64748B",
    textAlign: "center",
    marginTop: 18,
  },
});
