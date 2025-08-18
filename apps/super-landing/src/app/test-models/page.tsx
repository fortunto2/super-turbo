"use client";

import {
  getVideoModels,
  getImageModels,
  getModelConfig,
  supportsImageToVideo,
} from "@/lib/models-config";

export default function TestModelsPage() {
  const videoModels = getVideoModels();
  const imageModels = getImageModels();

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-950/40 via-blue-950/40 to-purple-950/40 p-6">
      <div className="max-w-6xl mx-auto space-y-8">
        <h1 className="text-3xl font-bold text-center bg-gradient-to-r from-green-400 via-blue-400 to-purple-400 bg-clip-text text-transparent">
          Test Models Configuration
        </h1>

        {/* Video Models */}
        <div className="space-y-4">
          <h2 className="text-2xl font-bold text-green-300">Video Models</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {videoModels.map((model) => (
              <div
                key={model.name}
                className="bg-white/10 backdrop-blur-sm rounded-lg p-4 border border-green-500/20"
              >
                <h3 className="font-bold text-green-300 mb-2">{model.name}</h3>
                <div className="space-y-1 text-sm">
                  <p>
                    <strong>Type:</strong> {model.type}
                  </p>
                  <p>
                    <strong>Supports Image-to-Video:</strong>{" "}
                    {model.supportsImageToVideo ? "✅ Yes" : "❌ No"}
                  </p>
                  <p>
                    <strong>Supports Text-to-Video:</strong>{" "}
                    {model.supportsTextToVideo ? "✅ Yes" : "❌ No"}
                  </p>
                  {model.maxDuration && (
                    <p>
                      <strong>Max Duration:</strong> {model.maxDuration}s
                    </p>
                  )}
                  {model.aspectRatio && (
                    <p>
                      <strong>Aspect Ratio:</strong> {model.aspectRatio}
                    </p>
                  )}
                  {model.width && model.height && (
                    <p>
                      <strong>Resolution:</strong> {model.width}x{model.height}
                    </p>
                  )}
                  <p className="text-muted-foreground text-xs">
                    {model.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Image Models */}
        <div className="space-y-4">
          <h2 className="text-2xl font-bold text-blue-300">Image Models</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {imageModels.map((model) => (
              <div
                key={model.name}
                className="bg-white/10 backdrop-blur-sm rounded-lg p-4 border border-blue-500/20"
              >
                <h3 className="font-bold text-blue-300 mb-2">{model.name}</h3>
                <div className="space-y-1 text-sm">
                  <p>
                    <strong>Type:</strong> {model.type}
                  </p>
                  <p>
                    <strong>Supports Image-to-Video:</strong>{" "}
                    {model.supportsImageToVideo ? "✅ Yes" : "❌ No"}
                  </p>
                  <p>
                    <strong>Supports Text-to-Video:</strong>{" "}
                    {model.supportsTextToVideo ? "✅ Yes" : "❌ No"}
                  </p>
                  {model.width && model.height && (
                    <p>
                      <strong>Resolution:</strong> {model.width}x{model.height}
                    </p>
                  )}
                  <p className="text-muted-foreground text-xs">
                    {model.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Upload Requirements */}
        <div className="space-y-4">
          <h2 className="text-2xl font-bold text-yellow-300">
            Upload Requirements Summary
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 border border-yellow-500/20">
              <h3 className="font-bold text-yellow-300 mb-2">
                Models with Image Upload
              </h3>
              <div className="space-y-1 text-sm">
                {videoModels
                  .filter((model) => model.supportsImageToVideo)
                  .map((model) => (
                    <p
                      key={model.name}
                      className="text-yellow-200"
                    >
                      ✅ {model.name} - Requires source image for image-to-video
                    </p>
                  ))}
              </div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 border border-green-500/20">
              <h3 className="font-bold text-green-300 mb-2">
                Models without Image Upload
              </h3>
              <div className="space-y-1 text-sm">
                {videoModels
                  .filter((model) => !model.supportsImageToVideo)
                  .map((model) => (
                    <p
                      key={model.name}
                      className="text-green-200"
                    >
                      ❌ {model.name} - Text-to-video only
                    </p>
                  ))}
                {imageModels.map((model) => (
                  <p
                    key={model.name}
                    className="text-green-200"
                  >
                    ❌ {model.name} - Text-to-image only
                  </p>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Test Individual Models */}
        <div className="space-y-4">
          <h2 className="text-2xl font-bold text-purple-300">
            Test Individual Models
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[
              "Veo2",
              "Veo3",
              "Sora",
              "Kling 2.1",
              "LTX",
              "Google Imagen 4",
              "GPT-Image-1",
            ].map((modelName) => {
              const config = getModelConfig(modelName);
              const supportsI2V = supportsImageToVideo(modelName);

              return (
                <div
                  key={modelName}
                  className="bg-white/10 backdrop-blur-sm rounded-lg p-4 border border-purple-500/20"
                >
                  <h3 className="font-bold text-purple-300 mb-2">
                    {modelName}
                  </h3>
                  <div className="space-y-1 text-sm">
                    <p>
                      <strong>Config Found:</strong>{" "}
                      {config ? "✅ Yes" : "❌ No"}
                    </p>
                    <p>
                      <strong>Supports Image-to-Video:</strong>{" "}
                      {supportsI2V ? "✅ Yes" : "❌ No"}
                    </p>
                    {config && (
                      <>
                        <p>
                          <strong>Type:</strong> {config.type}
                        </p>
                        <p>
                          <strong>Generation Config:</strong>{" "}
                          {config.generationConfigName}
                        </p>
                      </>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
