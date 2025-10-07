import { semanticIndex } from "../../../lib/ai/context/semantic-index";

describe("Semantic Pattern Detection", () => {
  test("should detect semantic patterns with content keywords", () => {
    // Паттерны с семантическим содержимым
    const semanticPatterns = [
      /(картинк[а-я]+\s+с\s+ракетой|изображение\s+с\s+ракетой|фото\s+с\s+ракетой)/,
      /(картинк[а-я]+\s+с\s+солнцем|изображение\s+с\s+солнцем|фото\s+с\s+солнцем)/,
      /(картинк[а-я]+\s+с\s+луной|изображение\s+с\s+луной|фото\s+с\s+луной)/,
      /(картинк[а-я]+\s+с\s+котом|изображение\s+с\s+котом|фото\s+с\s+котом)/,
      /(image|picture|photo)\s+with\s+(rocket|sun|moon|cat)/,
    ];

    semanticPatterns.forEach((pattern) => {
      const keywords = semanticIndex.extractKeywords(pattern.source);
      expect(keywords.length).toBeGreaterThan(0);
      console.log(
        `Pattern: ${pattern.source} → Keywords: ${keywords.join(", ")}`
      );
    });
  });

  test("should not detect non-semantic patterns", () => {
    // Паттерны без семантического содержимого - они не содержат объекты для поиска
    // Проверяем, что они НЕ содержат ключевых слов объектов (ракета, солнце и т.д.)
    const nonSemanticPatterns = [
      /(последн[а-я]+|предыдущ[а-я]+)\s+(изображение|картинка|фото)/,
      /(перв[а-я]+|втор[а-я]+|треть[а-я]+)\s+(изображение|картинка|фото)/,
      /(сгенерированн[а-я]+|созданн[а-я]+)\s+(изображение|картинка|фото)/,
      /(загруженн[а-я]+|загруж[а-я]+)\s+(изображение|картинка|фото)/,
    ];

    const semanticObjectKeywords = ["ракета", "солнце", "луна", "кот", "собака", "rocket", "sun", "moon", "cat", "dog"];

    nonSemanticPatterns.forEach((pattern) => {
      const keywords = semanticIndex.extractKeywords(pattern.source);
      // Проверяем, что извлеченные ключевые слова НЕ содержат семантических объектов
      const hasSemanticObjects = keywords.some(k =>
        semanticObjectKeywords.some(obj => k.includes(obj) || obj.includes(k))
      );
      expect(hasSemanticObjects).toBe(false);
      console.log(
        `Non-semantic pattern: ${pattern.source} → Keywords: ${keywords.join(", ")}`
      );
    });
  });

  test("should extract keywords from various pattern formats", () => {
    const testPatterns = [
      {
        pattern: /(картинк[а-я]+\s+с\s+ракетой)/,
        expectedKeywords: ["картинк", "ракетой"],
      },
      {
        pattern: /(image\s+with\s+sun)/,
        expectedKeywords: ["image", "sun"],
      },
      {
        pattern: /(фото\s+с\s+космическим\s+кораблем)/,
        expectedKeywords: ["фото", "космическим", "кораблем"],
      },
    ];

    testPatterns.forEach(({ pattern, expectedKeywords }) => {
      const keywords = semanticIndex.extractKeywords(pattern.source);
      expectedKeywords.forEach((expected) => {
        expect(keywords.some((k) => k.includes(expected))).toBe(true);
      });
      console.log(
        `Pattern: ${pattern.source} → Extracted: ${keywords.join(", ")}`
      );
    });
  });

  test("should handle edge cases in pattern detection", () => {
    // Паттерны с минимальным содержимым
    const edgeCases = [
      /(фото)/, // только одно слово
      /(image)/, // только одно слово на английском
      /(картинка\s+с\s+а)/, // слово "а" должно быть отфильтровано как стоп-слово
    ];

    edgeCases.forEach((pattern) => {
      const keywords = semanticIndex.extractKeywords(pattern.source);
      console.log(
        `Edge case: ${pattern.source} → Keywords: ${keywords.join(", ")}`
      );
      // Проверяем, что стоп-слова отфильтрованы
      expect(keywords).not.toContain("а");
      expect(keywords).not.toContain("и");
      expect(keywords).not.toContain("с");
    });
  });

  test("should work with real user queries", () => {
    const realQueries = [
      "измени фото с ракетой",
      "возьми картинку с солнцем",
      "используй изображение кота",
      "change the moon image",
      "take the picture with a dog",
    ];

    realQueries.forEach((query) => {
      const keywords = semanticIndex.extractKeywords(query);
      expect(keywords.length).toBeGreaterThan(0);
      console.log(`Query: "${query}" → Keywords: ${keywords.join(", ")}`);
    });
  });
});
