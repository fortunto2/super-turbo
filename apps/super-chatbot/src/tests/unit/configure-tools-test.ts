import { configureImageGeneration } from "@/lib/ai/tools/configure-image-generation";
import { configureVideoGeneration } from "@/lib/ai/tools/configure-video-generation";

console.log("🔧 Testing AI Tools with OpenAPI Integration");
console.log("==================================================");

async function testVideoTool() {
  console.log("\n🎬 Testing Video Generation Tool...");

  try {
    const tool = configureVideoGeneration(undefined);
    const result = await tool.execute?.({}, {} as any);

    console.log("✅ Video tool executed successfully");
    console.log("📋 Result type:", (result as any).type);
    console.log(
      "📋 Available models:",
      (result as any).availableModels?.length || 0
    );
    console.log(
      "📋 Model names:",
      (result as any).availableModels
        ?.slice(0, 3)
        .map((m: any) => m.id || m.name) || []
    );

    return true;
  } catch (error) {
    console.error("❌ Video tool failed:", error);
    return false;
  }
}

async function testImageTool() {
  console.log("\n🎨 Testing Image Generation Tool...");

  try {
    const tool = configureImageGeneration(undefined);
    const result = await tool.execute?.({}, {} as any);

    console.log("✅ Image tool executed successfully");
    console.log("📋 Result type:", (result as any).type);
    console.log(
      "📋 Available models:",
      (result as any).availableModels?.length || 0
    );
    console.log(
      "📋 Model names:",
      (result as any).availableModels
        ?.slice(0, 3)
        .map((m: any) => m.id || m.name) || []
    );

    return true;
  } catch (error) {
    console.error("❌ Image tool failed:", error);
    return false;
  }
}

async function main() {
  const videoResult = await testVideoTool();
  const imageResult = await testImageTool();

  console.log("\n📊 Test Results:");
  console.log("==================================================");
  console.log(`🎬 Video Tool: ${videoResult ? "✅ PASS" : "❌ FAIL"}`);
  console.log(`🎨 Image Tool: ${imageResult ? "✅ PASS" : "❌ FAIL"}`);

  if (videoResult && imageResult) {
    console.log("\n🎉 All AI tools working with OpenAPI integration!");
  } else {
    console.log("\n⚠️  Some tools need fixing");
    process.exit(1);
  }
}

main().catch(console.error);
