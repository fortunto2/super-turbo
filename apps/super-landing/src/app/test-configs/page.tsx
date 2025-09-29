"use client";

import { useState } from "react";
import {
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Badge,
} from "@turbo-super/ui";
import { getVideoModels, getImageModels } from "@/lib/models-config";

export default function TestConfigsPage() {
  const [testResults, setTestResults] = useState<
    Record<string, { status: string; error?: string }>
  >({});
  const [isTesting, setIsTesting] = useState(false);

  const videoModels = getVideoModels();
  const imageModels = getImageModels();
  const allModels = [...videoModels, ...imageModels];

  const testConfig = async (modelName: string, configName: string) => {
    try {
      const response = await fetch("/api/test-config", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          modelName,
          configName,
        }),
      });

      const result = await response.json();

      setTestResults((prev) => ({
        ...prev,
        [modelName]: {
          status: response.ok ? "success" : "error",
          error: result.error ?? "Unknown error",
        },
      }));
    } catch (error) {
      setTestResults((prev) => ({
        ...prev,
        [modelName]: {
          status: "error",
          error: error instanceof Error ? error.message : "Network error",
        },
      }));
    }
  };

  const testAllConfigs = async () => {
    setIsTesting(true);
    setTestResults({});

    for (const model of allModels) {
      if (model.generationConfigName) {
        await testConfig(model.name, model.generationConfigName);
        // Небольшая задержка между запросами
        await new Promise((resolve) => setTimeout(resolve, 500));
      }
    }
    setIsTesting(false);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "success":
        return "bg-green-500/20 border-green-500/30 text-green-300";
      case "error":
        return "bg-red-500/20 border-red-500/30 text-red-300";
      default:
        return "bg-gray-500/20 border-gray-500/30 text-gray-300";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "success":
        return "✅";
      case "error":
        return "❌";
      default:
        return "⏳";
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-950/40 via-blue-950/40 to-purple-950/40 p-6">
      <div className="max-w-6xl mx-auto space-y-8">
        <h1 className="text-3xl font-bold text-center bg-gradient-to-r from-green-400 via-blue-400 to-purple-400 bg-clip-text text-transparent">
          Test SuperDuperAI Configurations
        </h1>

        <div className="text-center">
          <Button
            onClick={testAllConfigs}
            disabled={isTesting}
            className="bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700"
          >
            {isTesting ? "Testing..." : "Test All Configurations"}
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {allModels.map((model) => (
            <Card
              key={model.name}
              className="bg-white/10 backdrop-blur-sm border border-gray-500/20"
            >
              <CardHeader>
                <CardTitle className="text-lg font-bold text-gray-300">
                  {model.name}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="space-y-1 text-sm">
                  <p>
                    <strong>Type:</strong> {model.type}
                  </p>
                  <p>
                    <strong>Config:</strong>{" "}
                    {model.generationConfigName ?? "None"}
                  </p>

                  {testResults[model.name] && (
                    <div className="mt-2">
                      <Badge
                        className={`${getStatusColor(testResults[model.name].status)} gap-1`}
                      >
                        {getStatusIcon(testResults[model.name].status)}
                        {testResults[model.name].status}
                      </Badge>
                      {testResults[model.name].error && (
                        <p className="text-xs text-red-300 mt-1">
                          {testResults[model.name].error}
                        </p>
                      )}
                    </div>
                  )}
                </div>

                <Button
                  onClick={() =>
                    model.generationConfigName &&
                    testConfig(model.name, model.generationConfigName)
                  }
                  disabled={isTesting || !model.generationConfigName}
                  size="sm"
                  variant="outline"
                  className="w-full"
                >
                  Test Config
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 border border-gray-500/20">
          <h2 className="text-xl font-bold text-gray-300 mb-4">Summary</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div>
              <p>
                <strong>Total Models:</strong> {allModels.length}
              </p>
              <p>
                <strong>Video Models:</strong> {videoModels.length}
              </p>
              <p>
                <strong>Image Models:</strong> {imageModels.length}
              </p>
            </div>
            <div>
              <p>
                <strong>Success:</strong>{" "}
                {
                  Object.values(testResults).filter(
                    (r) => r.status === "success"
                  ).length
                }
              </p>
              <p>
                <strong>Errors:</strong>{" "}
                {
                  Object.values(testResults).filter((r) => r.status === "error")
                    .length
                }
              </p>
              <p>
                <strong>Pending:</strong>{" "}
                {
                  Object.values(testResults).filter(
                    (r) => r.status === "pending"
                  ).length
                }
              </p>
            </div>
            <div>
              <p>
                <strong>Models with Config:</strong>{" "}
                {allModels.filter((m) => m.generationConfigName).length}
              </p>
              <p>
                <strong>Models without Config:</strong>{" "}
                {allModels.filter((m) => !m.generationConfigName).length}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
