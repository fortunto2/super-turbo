"use client";

import { useState } from "react";
import { Button } from "@turbo-super/ui";
import { Card, CardContent, CardHeader, CardTitle } from "@turbo-super/ui";
import { Badge } from "@turbo-super/ui";

const TEST_CONFIGS = [
  // Azure OpenAI конфигурации
  { name: "Sora", config: "azure-openai/sora", type: "video" },
  { name: "GPT-Image-1", config: "azure-openai/gpt-image-1", type: "image" },

  // Google Cloud конфигурации
  { name: "Google Imagen 4", config: "google-cloud/imagen4", type: "image" },
  { name: "Google Imagen 3", config: "google-cloud/imagen3", type: "image" },
  {
    name: "Imagen4 Ultra",
    config: "google-cloud/imagen4-ultra",
    type: "image",
  },

  // FAL AI конфигурации
  { name: "Flux Pro", config: "fal-ai/flux-pro/v1.1-ultra", type: "image" },

  // ComfyUI конфигурации (возможно не работают)
  { name: "VEO3", config: "comfyui/veo3", type: "video" },
  { name: "VEO2", config: "comfyui/veo2", type: "video" },
  { name: "Kling", config: "comfyui/kling", type: "video" },
  { name: "LTX", config: "comfyui/ltx", type: "video" },
  { name: "Flux", config: "comfyui/flux", type: "image" },
];

export default function TestWorkingConfigsPage() {
  const [testResults, setTestResults] = useState<
    Record<string, { status: string; error?: string }>
  >({});
  const [isTesting, setIsTesting] = useState(false);

  const testConfig = async (configName: string, _type: string) => {
    try {
      const response = await fetch("/api/test-config", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          modelName: configName,
          configName,
        }),
      });

      const result = await response.json();

      setTestResults((prev) => ({
        ...prev,
        [configName]: {
          status: response.ok ? "success" : "error",
          error: result.error || "Unknown error",
        },
      }));
    } catch (error) {
      setTestResults((prev) => ({
        ...prev,
        [configName]: {
          status: "error",
          error: error instanceof Error ? error.message : "Network error",
        },
      }));
    }
  };

  const testAllConfigs = async () => {
    setIsTesting(true);
    setTestResults({});

    for (const config of TEST_CONFIGS) {
      await testConfig(config.config, config.type);
      // Небольшая задержка между запросами
      await new Promise((resolve) => setTimeout(resolve, 1000));
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

  const workingConfigs = TEST_CONFIGS.filter(
    (config) => testResults[config.config]?.status === "success"
  );

  const brokenConfigs = TEST_CONFIGS.filter(
    (config) => testResults[config.config]?.status === "error"
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-950/40 via-blue-950/40 to-purple-950/40 p-6">
      <div className="max-w-6xl mx-auto space-y-8">
        <h1 className="text-3xl font-bold text-center bg-gradient-to-r from-green-400 via-blue-400 to-purple-400 bg-clip-text text-transparent">
          Test Working SuperDuperAI Configurations
        </h1>

        <div className="text-center space-y-4">
          <Button
            onClick={testAllConfigs}
            disabled={isTesting}
            className="bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700"
          >
            {isTesting ? "Testing..." : "Test All Configurations"}
          </Button>

          <div className="text-sm text-gray-300">
            This will test all possible SuperDuperAI configurations to find
            which ones actually work.
          </div>
        </div>

        {/* Working Configurations */}
        {workingConfigs.length > 0 && (
          <div className="space-y-4">
            <h2 className="text-2xl font-bold text-green-300">
              ✅ Working Configurations
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {workingConfigs.map((config) => (
                <Card
                  key={config.config}
                  className="bg-green-950/20 backdrop-blur-sm border border-green-500/20"
                >
                  <CardHeader>
                    <CardTitle className="text-lg font-bold text-green-300">
                      {config.name}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <p className="text-sm">
                      <strong>Config:</strong> {config.config}
                    </p>
                    <p className="text-sm">
                      <strong>Type:</strong> {config.type}
                    </p>
                    <Badge className="bg-green-500/20 border-green-500/30 text-green-300">
                      ✅ Working
                    </Badge>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Broken Configurations */}
        {brokenConfigs.length > 0 && (
          <div className="space-y-4">
            <h2 className="text-2xl font-bold text-red-300">
              ❌ Broken Configurations
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {brokenConfigs.map((config) => (
                <Card
                  key={config.config}
                  className="bg-red-950/20 backdrop-blur-sm border border-red-500/20"
                >
                  <CardHeader>
                    <CardTitle className="text-lg font-bold text-red-300">
                      {config.name}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <p className="text-sm">
                      <strong>Config:</strong> {config.config}
                    </p>
                    <p className="text-sm">
                      <strong>Type:</strong> {config.type}
                    </p>
                    <Badge className="bg-red-500/20 border-red-500/30 text-red-300">
                      ❌ Broken
                    </Badge>
                    {testResults[config.config]?.error && (
                      <p className="text-xs text-red-300 mt-1">
                        {testResults[config.config].error}
                      </p>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* All Configurations */}
        <div className="space-y-4">
          <h2 className="text-2xl font-bold text-gray-300">
            All Configurations
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {TEST_CONFIGS.map((config) => (
              <Card
                key={config.config}
                className="bg-white/10 backdrop-blur-sm border border-gray-500/20"
              >
                <CardHeader>
                  <CardTitle className="text-lg font-bold text-gray-300">
                    {config.name}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="space-y-1 text-sm">
                    <p>
                      <strong>Config:</strong> {config.config}
                    </p>
                    <p>
                      <strong>Type:</strong> {config.type}
                    </p>

                    {testResults[config.config] && (
                      <div className="mt-2">
                        <Badge
                          className={`${getStatusColor(testResults[config.config].status)} gap-1`}
                        >
                          {getStatusIcon(testResults[config.config].status)}
                          {testResults[config.config].status}
                        </Badge>
                        {testResults[config.config].error && (
                          <p className="text-xs text-red-300 mt-1">
                            {testResults[config.config].error}
                          </p>
                        )}
                      </div>
                    )}
                  </div>

                  <Button
                    onClick={() => testConfig(config.config, config.type)}
                    disabled={isTesting}
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
        </div>

        {/* Summary */}
        <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 border border-gray-500/20">
          <h2 className="text-xl font-bold text-gray-300 mb-4">Summary</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm">
            <div>
              <p>
                <strong>Total Configs:</strong> {TEST_CONFIGS.length}
              </p>
              <p>
                <strong>Working:</strong> {workingConfigs.length}
              </p>
            </div>
            <div>
              <p>
                <strong>Broken:</strong> {brokenConfigs.length}
              </p>
              <p>
                <strong>Not Tested:</strong>{" "}
                {TEST_CONFIGS.length -
                  workingConfigs.length -
                  brokenConfigs.length}
              </p>
            </div>
            <div>
              <p>
                <strong>Video Configs:</strong>{" "}
                {TEST_CONFIGS.filter((c) => c.type === "video").length}
              </p>
              <p>
                <strong>Image Configs:</strong>{" "}
                {TEST_CONFIGS.filter((c) => c.type === "image").length}
              </p>
            </div>
            <div>
              <p>
                <strong>Success Rate:</strong>{" "}
                {TEST_CONFIGS.length > 0
                  ? Math.round(
                      (workingConfigs.length / TEST_CONFIGS.length) * 100
                    )
                  : 0}
                %
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
