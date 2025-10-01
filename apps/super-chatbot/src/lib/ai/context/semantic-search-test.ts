/**
 * Тест для проверки семантического поиска изображений
 */

import { ImageContextAnalyzer } from "./image-context-analyzer";
import type { ChatMedia } from "./universal-context";

// Создаем тестовые данные
const testChatMedia: ChatMedia[] = [
  {
    url: "https://example.com/image1.jpg",
    id: "img1",
    role: "assistant",
    timestamp: new Date("2024-01-01"),
    prompt: "Beautiful landscape with mountains and a lake under the moonlight",
    messageIndex: 0,
    mediaType: "image",
    metadata: {},
  },
  {
    url: "https://example.com/image2.jpg",
    id: "img2",
    role: "assistant",
    timestamp: new Date("2024-01-02"),
    prompt: "A girl with blue eyes and long hair standing in a forest",
    messageIndex: 1,
    mediaType: "image",
    metadata: {},
  },
  {
    url: "https://example.com/image3.jpg",
    id: "img3",
    role: "user",
    timestamp: new Date("2024-01-03"),
    prompt: "Red sports car parked in front of a modern house",
    messageIndex: 2,
    mediaType: "image",
    metadata: {},
  },
  {
    url: "https://example.com/image4.jpg",
    id: "img4",
    role: "assistant",
    timestamp: new Date("2024-01-04"),
    prompt: "Cute dog playing with a ball in the garden",
    messageIndex: 3,
    mediaType: "image",
    metadata: {},
  },
  {
    url: "https://example.com/image5.jpg",
    id: "img5",
    role: "assistant",
    timestamp: new Date("2024-01-05"),
    prompt: "Ocean waves crashing against the shore at sunset",
    messageIndex: 4,
    mediaType: "image",
    metadata: {},
  },
];

// Тестовые случаи
const testCases = [
  {
    message: "возьми картинку с луной",
    expectedImageId: "img1",
    description: "Поиск изображения с луной (русский)",
  },
  {
    message: "image with moon",
    expectedImageId: "img1",
    description: "Поиск изображения с луной (английский)",
  },
  {
    message: "картинка с девочкой",
    expectedImageId: "img2",
    description: "Поиск изображения с девочкой",
  },
  {
    message: "фото с машиной",
    expectedImageId: "img3",
    description: "Поиск изображения с машиной",
  },
  {
    message: "изображение с собакой",
    expectedImageId: "img4",
    description: "Поиск изображения с собакой",
  },
  {
    message: "картинка с морем",
    expectedImageId: "img5",
    description: "Поиск изображения с морем",
  },
  {
    message: "картинка где есть лес",
    expectedImageId: "img2",
    description: "Универсальный поиск по содержимому",
  },
];

export async function testSemanticSearch() {
  console.log("🧪 Starting semantic search tests...");

  const analyzer = new ImageContextAnalyzer();
  let passedTests = 0;
  const totalTests = testCases.length;

  for (const testCase of testCases) {
    console.log(`\n🧪 Testing: ${testCase.description}`);
    console.log(`   Message: "${testCase.message}"`);

    try {
      const result = await analyzer.analyzeContext(
        testCase.message,
        testChatMedia,
        []
      );

      if (result.sourceId === testCase.expectedImageId) {
        console.log(`   ✅ PASSED - Found image: ${result.sourceId}`);
        console.log(`   Reasoning: ${result.reasoningText}`);
        passedTests++;
      } else {
        console.log(
          `   ❌ FAILED - Expected: ${testCase.expectedImageId}, Got: ${result.sourceId}`
        );
        console.log(`   Reasoning: ${result.reasoningText}`);
      }
    } catch (error) {
      console.log(`   ❌ ERROR - ${error}`);
    }
  }

  console.log(`\n🧪 Test Results: ${passedTests}/${totalTests} tests passed`);

  if (passedTests === totalTests) {
    console.log("🎉 All tests passed! Semantic search is working correctly.");
  } else {
    console.log("⚠️  Some tests failed. Check the implementation.");
  }

  return { passedTests, totalTests };
}

// Запуск тестов (если файл выполняется напрямую)
if (require.main === module) {
  testSemanticSearch().catch(console.error);
}
