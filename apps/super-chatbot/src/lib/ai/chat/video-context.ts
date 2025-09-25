import {
  semanticIndex,
  temporalAnalyzer,
  userPreferenceLearner,
  contextCache,
  generateMessageHash,
  CacheUtils,
} from "../context";

export interface VideoContext {
  sourceImageUrl?: string;
  sourceImageId?: string;
  confidence: "high" | "medium" | "low";
  reasoning: string;
  metadata?: Record<string, any>;
}

export interface ChatImage {
  url: string;
  id?: string;
  role: "user" | "assistant";
  timestamp: Date;
  prompt?: string;
  messageIndex: number;
  mediaType: "image";
}

/**
 * Анализирует контекст чата для видео-генерации
 * Фокусируется на загруженных пользователем изображениях
 */
interface MessageAttachment {
  url?: string;
  contentType?: string;
  name?: string;
  id?: string;
}

export async function analyzeVideoContext(
  userMessage: string,
  chatImages: ChatImage[],
  currentMessageAttachments?: MessageAttachment[],
  chatId?: string,
  userId?: string
): Promise<VideoContext> {
  console.log(
    "🎬 analyzeVideoContext: Starting enhanced analysis with all 4 systems",
    {
      userMessage,
      chatImagesLength: chatImages.length,
      currentMessageAttachments: currentMessageAttachments,
      chatId,
      userId,
    }
  );

  // 1. КЭШИРОВАНИЕ КОНТЕКСТА - проверяем кэш первым делом
  if (
    chatId &&
    CacheUtils.shouldUseCache(userMessage, currentMessageAttachments)
  ) {
    const messageHash = generateMessageHash(
      userMessage,
      currentMessageAttachments
    );
    const cachedContext = await contextCache.getCachedContext(
      chatId,
      messageHash,
      "video"
    );

    if (cachedContext) {
      console.log(`🎯 VideoContext: Cache HIT for video in chat ${chatId}`);
      return {
        sourceImageUrl: cachedContext.sourceUrl,
        sourceImageId: cachedContext.sourceId,
        confidence: cachedContext.confidence,
        reasoning: `Кэшированный результат: ${cachedContext.reasoning}`,
        metadata: cachedContext.metadata,
      };
    }
  }

  // 2. ПРОВЕРЯЕМ ТЕКУЩЕЕ СООБЩЕНИЕ на наличие изображений (image-to-video)
  if (currentMessageAttachments?.length) {
    console.log("🎬 analyzeVideoContext: Checking current message attachments");
    const currentImage = currentMessageAttachments.find(
      (a: MessageAttachment) =>
        typeof a?.url === "string" &&
        /^https?:\/\//.test(a.url) &&
        String(a?.contentType || "").startsWith("image/")
    );

    if (currentImage?.url) {
      console.log(
        "🎬 analyzeVideoContext: Found image in current message:",
        currentImage.url
      );

      const result = {
        sourceImageUrl: currentImage.url,
        sourceImageId: currentImage.id,
        confidence: "high" as const,
        reasoning:
          "Изображение найдено в текущем сообщении пользователя для image-to-video",
        metadata: {
          source: "current_message",
          contentType: currentImage.contentType,
          timestamp: new Date().toISOString(),
        },
      };

      // Сохраняем в кэш
      if (
        chatId &&
        CacheUtils.shouldUseCache(userMessage, currentMessageAttachments)
      ) {
        const messageHash = generateMessageHash(
          userMessage,
          currentMessageAttachments
        );
        await contextCache.setCachedContext(chatId, messageHash, "video", {
          sourceUrl: result.sourceImageUrl,
          sourceId: result.sourceImageId,
          mediaType: "video" as const,
          confidence: result.confidence,
          reasoning: result.reasoning,
          metadata: result.metadata,
        });
      }

      return result;
    }
  }

  // 3. ПРОВЕРЯЕМ ИСТОРИЮ ЧАТА на наличие изображений
  if (chatImages.length === 0) {
    console.log("🎬 analyzeVideoContext: No images found in chat history");
    return {
      confidence: "low",
      reasoning: "В истории чата не найдено изображений для image-to-video",
      metadata: {
        source: "chat_history",
        totalImages: 0,
        timestamp: new Date().toISOString(),
      },
    };
  }

  console.log("🎬 analyzeVideoContext: Images from chat history:", {
    totalImages: chatImages.length,
    images: chatImages.map((img) => ({
      url: img.url,
      role: img.role,
      prompt: img.prompt,
      messageIndex: img.messageIndex,
    })),
  });

  // 4. ФИЛЬТРУЕМ ТОЛЬКО ЗАГРУЖЕННЫЕ ПОЛЬЗОВАТЕЛЕМ изображения для image-to-video
  const userImages = chatImages.filter((img) => img.role === "user");
  console.log(
    "🎬 analyzeVideoContext: User uploaded images for video generation:",
    {
      totalUserImages: userImages.length,
      images: userImages.map((img) => ({
        url: img.url,
        prompt: img.prompt,
        messageIndex: img.messageIndex,
      })),
    }
  );

  if (userImages.length === 0) {
    console.log("🎬 analyzeVideoContext: No user uploaded images found");
    return {
      confidence: "low",
      reasoning:
        "В истории чата не найдено загруженных пользователем изображений для image-to-video",
      metadata: {
        source: "chat_history",
        totalUserImages: 0,
        timestamp: new Date().toISOString(),
      },
    };
  }

  // 5. АНАЛИЗИРУЕМ ТЕКСТ СООБЩЕНИЯ с использованием всех 4 систем
  const messageLower = userMessage.toLowerCase();
  console.log(
    "🎬 analyzeVideoContext: Analyzing message with all 4 systems:",
    messageLower
  );

  // 5.1. ВРЕМЕННОЙ АНАЛИЗ - ищем временные ссылки
  let temporalMatch = null;
  try {
    console.log("🕒 VideoContext: Analyzing temporal references...");
    const temporalMatches = await temporalAnalyzer.analyzeTemporalReferences(
      userMessage,
      userImages.map((img) => ({
        ...img,
        mediaType: "image" as const,
      }))
    );

    if (temporalMatches.length > 0 && temporalMatches[0].confidence > 0.6) {
      temporalMatch = temporalMatches[0];
      console.log("🕒 VideoContext: Found temporal match:", {
        url: temporalMatch.media.url,
        confidence: temporalMatch.confidence,
        reasoning: temporalMatch.reasoning,
      });
    }
  } catch (error) {
    console.warn("🕒 VideoContext: Temporal analysis failed:", error);
  }

  // 5.2. СЕМАНТИЧЕСКИЙ ПОИСК - ищем по содержимому
  let semanticMatch = null;
  try {
    console.log("🔍 VideoContext: Analyzing semantic content...");
    const semanticResults = semanticIndex.search(messageLower, userImages);

    if (semanticResults.length > 0 && semanticResults[0].relevanceScore > 0.3) {
      semanticMatch = semanticResults[0];
      console.log("🔍 VideoContext: Found semantic match:", {
        url: semanticMatch.image.url,
        score: semanticMatch.relevanceScore,
        reasoning: semanticMatch.reasoning,
      });
    }
  } catch (error) {
    console.warn("🔍 VideoContext: Semantic search failed:", error);
  }

  // 5.3. ПОИСК ПО КЛЮЧЕВЫМ СЛОВАМ (legacy поддержка)
  const imageReferences = await analyzeVideoImageReferences(
    messageLower,
    userImages
  );
  console.log(
    "🎬 analyzeVideoContext: Found image references:",
    imageReferences
  );

  // 6. ВЫБИРАЕМ ЛУЧШИЙ РЕЗУЛЬТАТ из всех систем
  let bestMatch = null;
  let bestScore = 0;
  let bestReasoning = "";
  let bestSource = "";

  // Приоритет 1: Временной анализ (высший приоритет)
  if (temporalMatch && temporalMatch.confidence > bestScore) {
    bestMatch = temporalMatch.media;
    bestScore = temporalMatch.confidence;
    bestReasoning = `Временная ссылка: ${temporalMatch.reasoning}`;
    bestSource = "temporal";
  }

  // Приоритет 2: Семантический поиск
  if (semanticMatch && semanticMatch.relevanceScore > bestScore) {
    bestMatch = semanticMatch.image;
    bestScore = semanticMatch.relevanceScore;
    bestReasoning = `Семантический поиск: ${semanticMatch.reasoning}`;
    bestSource = "semantic";
  }

  // Приоритет 3: Поиск по ключевым словам (legacy)
  if (imageReferences.length > 0) {
    const keywordMatch = imageReferences.sort(
      (a, b) => b.relevance - a.relevance
    )[0];
    if (keywordMatch.relevance > bestScore) {
      bestMatch = keywordMatch.image;
      bestScore = keywordMatch.relevance;
      bestReasoning = `Поиск по ключевым словам: ${keywordMatch.reasoning}`;
      bestSource = "keywords";
    }
  }

  // Приоритет 4: Семантический поиск по загруженным изображениям (fallback)
  if (!bestMatch) {
    console.log(
      "🎬 analyzeVideoContext: No explicit references found, trying semantic search on user images"
    );
    const fallbackSemanticMatch = await findUserImageBySemanticContent(
      messageLower,
      userImages
    );

    if (fallbackSemanticMatch) {
      bestMatch = fallbackSemanticMatch;
      bestScore = 0.5; // Средний приоритет для fallback
      bestReasoning = `Fallback семантический поиск среди загруженных пользователем изображений`;
      bestSource = "fallback_semantic";
    }
  }

  // 7. FALLBACK ПОИСК если основные системы не дали результата
  if (!bestMatch) {
    console.log(
      "🎬 analyzeVideoContext: No match found with main systems, trying fallback methods"
    );

    // Fallback 1: Поиск по ключевым словам
    const keywordMatch = findUserImageByKeywords(messageLower, userImages);
    if (keywordMatch) {
      bestMatch = keywordMatch;
      bestScore = 0.4;
      bestReasoning = `Fallback поиск по ключевым словам: ${keywordMatch.reasoning}`;
      bestSource = "fallback_keywords";
    }

    // Fallback 2: Эвристики для видео
    if (!bestMatch) {
      const heuristicMatch = findUserImageByVideoHeuristics(
        messageLower,
        userImages
      );
      if (heuristicMatch) {
        bestMatch = heuristicMatch.image;
        bestScore = 0.3;
        bestReasoning = `Fallback эвристики для видео: ${heuristicMatch.reasoning}`;
        bestSource = "fallback_heuristics";
      }
    }

    // Fallback 3: Последнее загруженное изображение
    if (!bestMatch && userImages.length > 0) {
      bestMatch = userImages[userImages.length - 1];
      bestScore = 0.2;
      bestReasoning =
        "Fallback: последнее загруженное пользователем изображение";
      bestSource = "fallback_last";
    }
  }

  // 8. ФОРМИРУЕМ РЕЗУЛЬТАТ с метаданными
  if (bestMatch) {
    const confidence =
      bestScore > 0.7 ? "high" : bestScore > 0.4 ? "medium" : "low";

    const result = {
      sourceImageUrl: bestMatch.url,
      sourceImageId: bestMatch.id,
      confidence: confidence as "high" | "medium" | "low",
      reasoning: bestReasoning,
      metadata: {
        source: bestSource,
        score: bestScore,
        totalUserImages: userImages.length,
        timestamp: new Date().toISOString(),
        systems_used: {
          temporal: !!temporalMatch,
          semantic: !!semanticMatch,
          keywords: imageReferences.length > 0,
        },
      },
    };

    console.log("🎬 analyzeVideoContext: Final result:", {
      sourceImageUrl: result.sourceImageUrl,
      confidence: result.confidence,
      reasoning: result.reasoning,
      metadata: result.metadata,
    });

    // 9. СОХРАНЯЕМ В КЭШ
    if (
      chatId &&
      CacheUtils.shouldUseCache(userMessage, currentMessageAttachments)
    ) {
      const messageHash = generateMessageHash(
        userMessage,
        currentMessageAttachments
      );
      await contextCache.setCachedContext(chatId, messageHash, "video", {
        sourceUrl: result.sourceImageUrl,
        sourceId: result.sourceImageId,
        mediaType: "video" as const,
        confidence: result.confidence,
        reasoning: result.reasoning,
        metadata: result.metadata,
      });
    }

    // 10. ЗАПИСЫВАЕМ ВЫБОР ДЛЯ ОБУЧЕНИЯ ПРЕДПОЧТЕНИЙ
    if (userId && chatId) {
      try {
        await userPreferenceLearner.recordUserChoice(
          chatId,
          userId,
          userMessage,
          {
            url: result.sourceImageUrl!,
            id: result.sourceImageId,
            role: "user" as const,
            timestamp: new Date(),
            messageIndex: 0,
            mediaType: "image" as const,
          },
          userImages.map((img) => ({
            ...img,
            mediaType: "image" as const,
          })),
          bestScore,
          bestReasoning
        );
        console.log("🧠 VideoContext: Recorded user choice for learning");
      } catch (error) {
        console.warn("🧠 VideoContext: Failed to record user choice:", error);
      }
    }

    return result;
  }

  // 11. FALLBACK: если ничего не найдено, возвращаем последнее изображение
  console.log(
    "🎬 analyzeVideoContext: No matches found, using last user image as fallback"
  );
  const lastUserImage = userImages[userImages.length - 1];

  const fallbackResult = {
    sourceImageUrl: lastUserImage.url,
    sourceImageId: lastUserImage.id,
    confidence: "low" as const,
    reasoning: `Fallback: используется последнее загруженное пользователем изображение для image-to-video`,
    metadata: {
      source: "fallback_last",
      score: 0.1,
      totalUserImages: userImages.length,
      timestamp: new Date().toISOString(),
      systems_used: {
        temporal: false,
        semantic: false,
        keywords: false,
      },
    },
  };

  console.log("🎬 analyzeVideoContext: Fallback result:", fallbackResult);
  return fallbackResult;
}

/**
 * Анализирует текст сообщения на предмет ссылок на изображения для видео-контекста
 */
async function analyzeVideoImageReferences(
  messageLower: string,
  userImages: ChatImage[]
): Promise<Array<{ image: ChatImage; relevance: number; reasoning: string }>> {
  console.log(
    "🎬 analyzeVideoImageReferences: Starting pattern matching for:",
    messageLower
  );

  const references: Array<{
    image: ChatImage;
    relevance: number;
    reasoning: string;
  }> = [];

  // Паттерны для ссылок на загруженные изображения
  const userImagePatterns = [
    // Русские паттерны
    {
      pattern: /(это|это\s+изображение|эта\s+картинка|это\s+фото)/i,
      weight: 0.9,
      description: "Прямая ссылка на изображение",
    },
    {
      pattern:
        /(загруженн[а-я]+|загруж[а-я]+)\s+(изображение|картинк[а-я]+|фото)/i,
      weight: 0.8,
      description: "Ссылка на загруженное изображение",
    },
    {
      pattern: /(мое|мо[её])\s+(изображение|картинк[а-я]+|фото)/i,
      weight: 0.8,
      description: "Ссылка на свое изображение",
    },
    {
      pattern:
        /(последн[а-я]+|предыдущ[а-я]+)\s+(загруженн[а-я]+|загруж[а-я]+)\s+(изображение|картинк[а-я]+|фото)/i,
      weight: 0.7,
      description: "Ссылка на последнее/предыдущее загруженное изображение",
    },
    {
      pattern:
        /(перв[а-я]+|втор[а-я]+|треть[а-я]+)\s+(загруженн[а-я]+|загруж[а-я]+)\s+(изображение|картинк[а-я]+|фото)/i,
      weight: 0.7,
      description: "Ссылка на загруженное изображение по порядку",
    },
    // Паттерны для поиска по содержимому
    {
      pattern:
        /(фото|картинк[а-я]+|изображение)\s+с\s+(мальчик|парень|человек|люди|мужчина)/i,
      weight: 0.8,
      description: "Ссылка на фото с мальчиком/парнем",
    },
    {
      pattern:
        /(фото|картинк[а-я]+|изображение)\s+с\s+(девочка|женщина|девушка)/i,
      weight: 0.8,
      description: "Ссылка на фото с девочкой/женщиной",
    },
    {
      pattern: /(фото|картинк[а-я]+|изображение)\s+с\s+(медведь|bear)/i,
      weight: 0.8,
      description: "Ссылка на фото с медведем",
    },
    {
      pattern: /(фото|картинк[а-я]+|изображение)\s+с\s+(солнце|sun|луна|moon)/i,
      weight: 0.8,
      description: "Ссылка на фото с солнцем/луной",
    },
    // Английские паттерны
    {
      pattern: /(this|this\s+image|this\s+picture|this\s+photo)/i,
      weight: 0.9,
      description: "Direct reference to image",
    },
    {
      pattern: /(uploaded|my)\s+(image|picture|photo)/i,
      weight: 0.8,
      description: "Reference to uploaded image",
    },
    {
      pattern: /(last|previous)\s+(uploaded|my)\s+(image|picture|photo)/i,
      weight: 0.7,
      description: "Reference to last/previous uploaded image",
    },
    {
      pattern: /(first|second|third)\s+(uploaded|my)\s+(image|picture|photo)/i,
      weight: 0.7,
      description: "Reference to uploaded image by order",
    },
    // Английские паттерны для поиска по содержимому
    {
      pattern: /(photo|picture|image)\s+with\s+(boy|man|people|person)/i,
      weight: 0.8,
      description: "Reference to photo with boy/man",
    },
    {
      pattern: /(photo|picture|image)\s+with\s+(girl|woman|lady)/i,
      weight: 0.8,
      description: "Reference to photo with girl/woman",
    },
    {
      pattern: /(photo|picture|image)\s+with\s+(bear|sun|moon)/i,
      weight: 0.8,
      description: "Reference to photo with bear/sun/moon",
    },
    {
      pattern: /(take|use)\s+(photo|picture|image)\s+with\s+(.+)/i,
      weight: 0.7,
      description: "Take/use photo with specific content",
    },
  ];

  // Проверяем паттерны
  for (const { pattern, weight, description } of userImagePatterns) {
    if (pattern.test(messageLower)) {
      console.log(
        `🎬 analyzeVideoImageReferences: Pattern matched: ${description}`
      );

      // Определяем какое изображение выбрать
      let targetImage: ChatImage | null = null;
      let reasoning = description;

      if (messageLower.includes("последн") || messageLower.includes("last")) {
        targetImage = userImages[userImages.length - 1];
        reasoning += " - последнее загруженное изображение";
      } else if (
        messageLower.includes("предыдущ") ||
        messageLower.includes("previous")
      ) {
        targetImage =
          userImages[userImages.length - 2] ||
          userImages[userImages.length - 1];
        reasoning += " - предыдущее загруженное изображение";
      } else if (
        messageLower.includes("перв") ||
        messageLower.includes("first")
      ) {
        targetImage = userImages[0];
        reasoning += " - первое загруженное изображение";
      } else if (
        messageLower.includes("втор") ||
        messageLower.includes("second")
      ) {
        targetImage = userImages[1];
        reasoning += " - второе загруженное изображение";
      } else if (
        messageLower.includes("треть") ||
        messageLower.includes("third")
      ) {
        targetImage = userImages[2];
        reasoning += " - третье загруженное изображение";
      } else {
        // По умолчанию берем последнее загруженное изображение
        targetImage = userImages[userImages.length - 1];
        reasoning += " - последнее загруженное изображение";
      }

      if (targetImage) {
        references.push({
          image: targetImage,
          relevance: weight,
          reasoning,
        });
      }
    }
  }

  return references;
}

/**
 * Семантический поиск по загруженным пользователем изображениям
 */
async function findUserImageBySemanticContent(
  messageLower: string,
  userImages: ChatImage[]
): Promise<ChatImage | null> {
  console.log(
    "🎬 findUserImageBySemanticContent: Starting semantic search for user images",
    {
      message: messageLower,
      userImagesCount: userImages.length,
    }
  );

  try {
    // Сначала пробуем новый семантический индекс
    const semanticResults = semanticIndex.search(messageLower, userImages);

    if (semanticResults.length > 0 && semanticResults[0].relevanceScore > 0.3) {
      const bestMatch = semanticResults[0];
      console.log(
        "🎬 findUserImageBySemanticContent: Found semantic index match:",
        {
          url: bestMatch.image.url,
          score: Math.round(bestMatch.relevanceScore * 100) + "%",
          reasoning: bestMatch.reasoning,
          matchedKeywords: bestMatch.matchedKeywords,
        }
      );
      return bestMatch.image;
    }

    console.log("🎬 findUserImageBySemanticContent: No semantic matches found");
    return null;
  } catch (error) {
    console.warn(
      "🎬 findUserImageBySemanticContent: Semantic search failed:",
      error
    );
    return null;
  }
}

/**
 * Поиск изображения по ключевым словам в сообщении
 */
function findUserImageByKeywords(
  messageLower: string,
  userImages: ChatImage[]
): { url: string; id?: string; reasoning: string } | null {
  console.log(
    "🎬 findUserImageByKeywords: Starting keyword-based search for:",
    messageLower
  );

  // Ключевые слова для поиска изображений
  const keywordPatterns = [
    // Русские ключевые слова
    {
      keywords: ["мальчик", "парень", "человек", "мужчина"],
      description: "с мальчиком/парнем",
    },
    {
      keywords: ["девочка", "женщина", "девушка"],
      description: "с девочкой/женщиной",
    },
    { keywords: ["медведь", "bear"], description: "с медведем" },
    {
      keywords: ["солнце", "sun", "луна", "moon"],
      description: "с солнцем/луной",
    },
    { keywords: ["собака", "dog", "кот", "cat"], description: "с животным" },
    { keywords: ["машина", "car", "автомобиль"], description: "с машиной" },
    { keywords: ["дом", "house", "здание"], description: "с домом/зданием" },
    {
      keywords: ["природа", "nature", "лес", "forest"],
      description: "с природой",
    },
    // Английские ключевые слова
    {
      keywords: ["boy", "man", "person", "people"],
      description: "with boy/man",
    },
    { keywords: ["girl", "woman", "lady"], description: "with girl/woman" },
    { keywords: ["animal", "pet"], description: "with animal" },
    { keywords: ["landscape", "nature"], description: "with landscape" },
  ];

  // Ищем совпадения ключевых слов
  for (const pattern of keywordPatterns) {
    const hasKeyword = pattern.keywords.some((keyword) =>
      messageLower.includes(keyword.toLowerCase())
    );

    if (hasKeyword) {
      console.log(
        `🎬 findUserImageByKeywords: Found keyword pattern: ${pattern.description}`
      );

      // Возвращаем последнее загруженное изображение с объяснением
      const lastImage = userImages[userImages.length - 1];
      if (lastImage) {
        return {
          url: lastImage.url,
          id: lastImage.id,
          reasoning: `найдено по ключевому слову "${pattern.description}" - используется последнее загруженное изображение`,
        };
      }
    }
  }

  console.log("🎬 findUserImageByKeywords: No keyword patterns matched");
  return null;
}

/**
 * Эвристики для выбора изображения в видео-контексте
 */
function findUserImageByVideoHeuristics(
  messageLower: string,
  userImages: ChatImage[]
): { image: ChatImage; reasoning: string } | null {
  console.log(
    "🎬 findUserImageByVideoHeuristics: Analyzing message for video heuristics:",
    messageLower
  );

  // Если сообщение содержит слова о создании видео из изображения
  const videoCreationWords = [
    "сделай видео",
    "создай видео",
    "сгенерируй видео",
    "сделай ролик",
    "создай ролик",
    "сгенерируй ролик",
    "оживи",
    "анимируй",
    "сделай движущимся",
    "make video",
    "create video",
    "generate video",
    "animate",
    "bring to life",
    "make it move",
  ];

  const hasVideoCreationIntent = videoCreationWords.some((word) =>
    messageLower.includes(word.toLowerCase())
  );

  console.log(
    "🎬 findUserImageByVideoHeuristics: Has video creation intent:",
    hasVideoCreationIntent
  );

  if (hasVideoCreationIntent) {
    // По умолчанию используем последнее загруженное пользователем изображение
    const lastUserImage = userImages[userImages.length - 1];
    console.log(
      "🎬 findUserImageByVideoHeuristics: Video creation intent detected, returning:",
      lastUserImage.url
    );
    return {
      image: lastUserImage,
      reasoning:
        "намерение создания видео - используется последнее загруженное изображение",
    };
  }

  return null;
}
