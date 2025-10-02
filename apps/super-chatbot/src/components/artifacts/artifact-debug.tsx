"use client";

import { useState, useEffect } from "react";
import { Button } from "@turbo-super/ui";
import { useArtifactContext } from "@/contexts/artifact-context";
import {
  saveArtifactToStorage,
  loadArtifactFromStorage,
  clearArtifactFromStorage,
  getAllSavedArtifacts,
} from "@/lib/utils/artifact-persistence";

interface ArtifactDebugProps {
  chatId: string;
}

export function ArtifactDebug({ chatId }: ArtifactDebugProps) {
  const { artifact, setArtifact } = useArtifactContext();
  const [localStorageData, setLocalStorageData] = useState<string>("");
  const [allArtifacts, setAllArtifacts] = useState<any[]>([]);

  const refreshData = () => {
    // Показываем все данные в localStorage
    const data: Record<string, string> = {};
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key) {
        data[key] = localStorage.getItem(key) || "";
      }
    }
    setLocalStorageData(JSON.stringify(data, null, 2));

    // Показываем все артефакты
    setAllArtifacts(getAllSavedArtifacts());
  };

  useEffect(() => {
    refreshData();
  }, [chatId]);

  const testSave = () => {
    const testArtifact = {
      documentId: `test-doc-${Date.now()}`,
      status: "completed" as const,
      kind: "image",
      title: "Test Image",
      content: '{"imageUrl": "https://example.com/test.jpg"}',
      isVisible: true,
      boundingBox: { top: 0, left: 0, width: 0, height: 0 },
      timestamp: Date.now(),
    };

    console.log("🧪 Testing save with artifact:", testArtifact);
    saveArtifactToStorage(chatId, testArtifact);
    refreshData();
  };

  const saveCurrent = () => {
    console.log("🧪 Saving current artifact state:", artifact);
    saveArtifactToStorage(chatId, artifact);
    refreshData();
  };

  const forceSave = () => {
    const testArtifact = {
      documentId: `force-save-${Date.now()}`,
      status: "completed" as const,
      kind: "image",
      title: "Force Saved Artifact",
      content: '{"imageUrl": "https://example.com/force-saved.jpg"}',
      isVisible: true,
      boundingBox: { top: 0, left: 0, width: 0, height: 0 },
      timestamp: Date.now(),
    };

    console.log("🧪 Force saving artifact:", testArtifact);
    saveArtifactToStorage(chatId, testArtifact);
    refreshData();
  };

  const testLoad = () => {
    console.log("🧪 Testing load for chatId:", chatId);
    const loaded = loadArtifactFromStorage(chatId);
    console.log("🧪 Loaded data:", loaded);
    alert(`Loaded: ${loaded ? JSON.stringify(loaded, null, 2) : "null"}`);
  };

  const testRestore = () => {
    const loaded = loadArtifactFromStorage(chatId);
    if (loaded) {
      console.log("🧪 Testing restore with data:", loaded);
      setArtifact((current) => ({
        ...current,
        documentId: loaded.documentId,
        kind: loaded.kind as any,
        status: loaded.status,
        isVisible: true,
        title: loaded.title,
        content: loaded.content,
        timestamp: loaded.timestamp,
      }));
    } else {
      alert("No data to restore");
    }
  };

  const forceRestore = () => {
    console.log("🧪 Force restoring artifact for chatId:", chatId);
    const loaded = loadArtifactFromStorage(chatId);
    if (loaded) {
      console.log("🧪 Force restore with data:", loaded);
      setArtifact((current) => ({
        ...current,
        documentId: loaded.documentId,
        kind: loaded.kind as any,
        status: loaded.status,
        isVisible: true, // Принудительно делаем видимым
        title: loaded.title,
        content: loaded.content,
        timestamp: loaded.timestamp,
      }));
      console.log("🧪 Force restored artifact successfully");
    } else {
      console.log("🧪 No artifact found to force restore.");
    }
  };

  const testClear = () => {
    console.log("🧪 Testing clear for chatId:", chatId);
    clearArtifactFromStorage(chatId);
    refreshData();
  };

  const clearAll = () => {
    console.log("🧪 Clearing all localStorage");
    localStorage.clear();
    refreshData();
  };

  const checkLocalStorage = () => {
    console.log("🧪 Checking localStorage for artifact keys:");
    const artifactKeys = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key?.startsWith("artifact-")) {
        const value = localStorage.getItem(key);
        artifactKeys.push({ key, value: value ? JSON.parse(value) : null });
      }
    }
    console.log("🧪 Found artifact keys:", artifactKeys);
    alert(`Found ${artifactKeys.length} artifact keys in localStorage`);
  };

  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div className="border rounded-lg bg-muted/50">
      {/* Компактная заголовочная панель */}
      <div className="flex items-center justify-between p-2">
        <div className="flex items-center gap-2">
          <h3 className="text-sm font-medium">Artifact Debug</h3>
          <span className="text-xs text-muted-foreground">
            ({allArtifacts.length} saved)
          </span>
        </div>
        <div className="flex items-center gap-1">
          <Button
            onClick={() => setIsExpanded(!isExpanded)}
            size="sm"
            variant="ghost"
            className="h-6 px-2 text-xs"
          >
            {isExpanded ? "▼" : "▶"}
          </Button>
          <Button
            onClick={saveCurrent}
            size="sm"
            className="h-6 px-2 text-xs"
          >
            Save
          </Button>
          <Button
            onClick={forceSave}
            size="sm"
            className="h-6 px-2 text-xs"
          >
            Force Save
          </Button>
          <Button
            onClick={testRestore}
            size="sm"
            className="h-6 px-2 text-xs"
          >
            Restore
          </Button>
          <Button
            onClick={forceRestore}
            size="sm"
            className="h-6 px-2 text-xs"
          >
            Force Restore
          </Button>
          <Button
            onClick={clearAll}
            size="sm"
            variant="destructive"
            className="h-6 px-2 text-xs"
          >
            Clear
          </Button>
          <Button
            onClick={checkLocalStorage}
            size="sm"
            className="h-6 px-2 text-xs"
          >
            Check Storage
          </Button>
        </div>
      </div>

      {/* Развернутая панель */}
      {isExpanded && (
        <div className="border-t p-2 space-y-3">
          <div className="grid grid-cols-3 gap-1">
            <Button
              onClick={testSave}
              size="sm"
              className="h-6 text-xs"
            >
              Test Save
            </Button>
            <Button
              onClick={testLoad}
              size="sm"
              className="h-6 text-xs"
            >
              Test Load
            </Button>
            <Button
              onClick={testClear}
              size="sm"
              className="h-6 text-xs"
            >
              Test Clear
            </Button>
            <Button
              onClick={refreshData}
              size="sm"
              className="h-6 text-xs"
            >
              Refresh
            </Button>
            <Button
              onClick={testRestore}
              size="sm"
              className="h-6 text-xs"
            >
              Force Restore
            </Button>
            <Button
              onClick={clearAll}
              size="sm"
              variant="destructive"
              className="h-6 text-xs"
            >
              Clear All
            </Button>
          </div>

          <div className="grid grid-cols-1 gap-2">
            <div>
              <h4 className="text-xs font-medium mb-1">Current State:</h4>
              <pre className="text-xs bg-background p-2 rounded border overflow-auto max-h-20">
                {JSON.stringify(artifact, null, 1)}
              </pre>
            </div>

            <div>
              <h4 className="text-xs font-medium mb-1">Saved Artifacts:</h4>
              <pre className="text-xs bg-background p-2 rounded border overflow-auto max-h-20">
                {JSON.stringify(allArtifacts, null, 1)}
              </pre>
            </div>

            <div className="text-xs text-muted-foreground">
              <p>ChatId: {chatId.substring(0, 8)}...</p>
              <p>
                Status: {artifact.status} | Visible:{" "}
                {artifact.isVisible ? "Yes" : "No"}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
