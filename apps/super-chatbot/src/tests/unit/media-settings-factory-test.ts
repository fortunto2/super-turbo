import {
  getImageGenerationConfig,
  getVideoGenerationConfig,
  clearMediaSettingsCache,
} from "@/lib/config/media-settings-factory";

async function testMediaSettingsFactory() {
  console.log("🏭 MediaSettings Factory Test");
  console.log("==================================================");

  try {
    // Clear cache to ensure fresh data
    clearMediaSettingsCache();

    // Test image generation config
    console.log("\n🖼️  Testing Image Generation Config Factory...");
    const imageConfig = await getImageGenerationConfig();

    console.log("✅ Image config loaded:");
    console.log(`  - Type: ${imageConfig.type}`);
    console.log(`  - Models: ${imageConfig.availableModels.length}`);
    console.log(`  - Resolutions: ${imageConfig.availableResolutions.length}`);
    console.log(`  - Styles: ${imageConfig.availableStyles.length}`);
    console.log(`  - Shot Sizes: ${imageConfig.availableShotSizes.length}`);
    console.log(`  - Default Model: ${imageConfig.defaultSettings.model.name}`);

    // Test video generation config
    console.log("\n🎬 Testing Video Generation Config Factory...");
    const videoConfig = await getVideoGenerationConfig();

    console.log("✅ Video config loaded:");
    console.log(`  - Type: ${videoConfig.type}`);
    console.log(`  - Models: ${videoConfig.availableModels.length}`);
    console.log(`  - Resolutions: ${videoConfig.availableResolutions.length}`);
    console.log(`  - Styles: ${videoConfig.availableStyles.length}`);
    console.log(`  - Shot Sizes: ${videoConfig.availableShotSizes.length}`);
    console.log(`  - Frame Rates: ${videoConfig.availableFrameRates.length}`);
    console.log(`  - Default Model: ${videoConfig.defaultSettings.model.name}`);

    // Test caching
    console.log("\n⚡ Testing Caching...");
    const startTime = Date.now();
    const cachedImageConfig = await getImageGenerationConfig();
    const cachedVideoConfig = await getVideoGenerationConfig();
    const cacheTime = Date.now() - startTime;

    console.log(`✅ Cached configs loaded in ${cacheTime}ms`);
    console.log(`  - Same image config: ${imageConfig === cachedImageConfig}`);
    console.log(`  - Same video config: ${videoConfig === cachedVideoConfig}`);

    // Test model types
    console.log("\n🔍 Testing Model Types...");

    const imageModels = imageConfig.availableModels;
    const videoModels = videoConfig.availableModels;

    const textToImageModels = imageModels.filter(
      (m) => m.type === "text_to_image"
    );
    const imageToImageModels = imageModels.filter(
      (m) => m.type === "image_to_image"
    );
    const textToVideoModels = videoModels.filter(
      (m) => m.type === "text_to_video"
    );
    const imageToVideoModels = videoModels.filter(
      (m) => m.type === "image_to_video"
    );

    console.log("📊 Model Distribution:");
    console.log(`  Image Models:`);
    console.log(`    - Text-to-Image: ${textToImageModels.length}`);
    console.log(`    - Image-to-Image: ${imageToImageModels.length}`);
    console.log(`  Video Models:`);
    console.log(`    - Text-to-Video: ${textToVideoModels.length}`);
    console.log(`    - Image-to-Video: ${imageToVideoModels.length}`);

    // Test default model selection
    console.log("\n🎯 Testing Default Model Selection...");

    const defaultImageModel = imageConfig.defaultSettings.model;
    const defaultVideoModel = videoConfig.defaultSettings.model;

    console.log("📋 Default Models:");
    console.log(
      `  Image: ${defaultImageModel.name} (${defaultImageModel.type})`
    );
    console.log(
      `  Video: ${defaultVideoModel.name} (${defaultVideoModel.type})`
    );

    // Verify default models are appropriate
    const isImageModelAppropriate =
      defaultImageModel.type === "text_to_image" ||
      defaultImageModel.type === "image_to_image";
    const isVideoModelAppropriate =
      defaultVideoModel.type === "text_to_video" ||
      defaultVideoModel.type === "image_to_video";

    console.log(`  Image model appropriate: ${isImageModelAppropriate}`);
    console.log(`  Video model appropriate: ${isVideoModelAppropriate}`);

    // Test model adapter fields
    console.log("\n🔧 Testing Model Adapter Fields...");

    const sampleImageModel = imageModels[0];
    const sampleVideoModel = videoModels[0];

    const requiredFields = [
      "name",
      "type",
      "source",
      "params",
      "id",
      "description",
      "value",
      "workflowPath",
      "price",
    ];

    const imageModelHasAllFields = sampleImageModel
      ? requiredFields.every((field) => field in sampleImageModel)
      : false;
    const videoModelHasAllFields = sampleVideoModel
      ? requiredFields.every((field) => field in sampleVideoModel)
      : false;

    console.log(
      `✅ Image model has all required fields: ${imageModelHasAllFields}`
    );
    console.log(
      `✅ Video model has all required fields: ${videoModelHasAllFields}`
    );

    if (!imageModelHasAllFields) {
      console.log(
        "❌ Missing image model fields:",
        sampleImageModel
          ? requiredFields.filter((field) => !(field in sampleImageModel))
          : "No image model available"
      );
    }

    if (!videoModelHasAllFields) {
      console.log(
        "❌ Missing video model fields:",
        sampleVideoModel
          ? requiredFields.filter((field) => !(field in sampleVideoModel))
          : "No video model available"
      );
    }

    console.log("\n✅ MediaSettings Factory test completed successfully!");
    console.log("🎯 Ready for component integration");
  } catch (error) {
    console.error("❌ Factory test failed:", error);
    process.exit(1);
  }
}

testMediaSettingsFactory();
