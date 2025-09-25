import { semanticIndex } from "../context/semantic-index";

export interface VideoContext {
  sourceImageUrl?: string;
  sourceImageId?: string;
  confidence: "high" | "medium" | "low";
  reasoning: string;
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
  currentMessageAttachments?: MessageAttachment[]
): Promise<VideoContext> {
  console.log("🎬 analyzeVideoContext: Starting analysis", {
    userMessage,
    chatImagesLength: chatImages.length,
    currentMessageAttachments: currentMessageAttachments,
  });

  // 1. Фильтруем только загруженные пользователем изображения
  const userImages = chatImages.filter((img) => img.role === "user");
  console.log("🎬 analyzeVideoContext: User uploaded images:", {
    totalUserImages: userImages.length,
    images: userImages.map((img) => ({
      url: img.url,
      prompt: img.prompt,
      messageIndex: img.messageIndex,
    })),
  });

  if (userImages.length === 0) {
    console.log("🎬 analyzeVideoContext: No user uploaded images found");
    return {
      confidence: "low",
      reasoning:
        "В истории чата не найдено загруженных пользователем изображений",
    };
  }

  // 2. Анализируем текст сообщения на предмет ссылок на изображения
  const messageLower = userMessage.toLowerCase();
  console.log(
    "🎬 analyzeVideoContext: Analyzing message for image references:",
    messageLower
  );

  // Поиск по ключевым словам для видео-контекста
  const imageReferences = await analyzeVideoImageReferences(
    messageLower,
    userImages
  );
  console.log(
    "🎬 analyzeVideoContext: Found image references:",
    imageReferences
  );

  if (imageReferences.length > 0) {
    // Сортируем по релевантности
    imageReferences.sort((a, b) => b.relevance - a.relevance);
    const bestMatch = imageReferences[0];
    console.log("🎬 analyzeVideoContext: Best match:", {
      image: bestMatch.image,
      relevance: bestMatch.relevance,
      reasoning: bestMatch.reasoning,
    });

    return {
      sourceImageUrl: bestMatch.image.url,
      sourceImageId: bestMatch.image.id,
      confidence: bestMatch.relevance > 0.7 ? "high" : "medium",
      reasoning: `Найдена ссылка на изображение: ${bestMatch.reasoning}`,
    };
  }

  // 3. Если нет явных ссылок, пробуем семантический поиск по загруженным изображениям
  console.log(
    "🎬 analyzeVideoContext: No explicit references found, trying semantic search on user images"
  );
  const semanticMatch = await findUserImageBySemanticContent(
    messageLower,
    userImages
  );
  console.log("🎬 analyzeVideoContext: Semantic match:", semanticMatch);

  if (semanticMatch) {
    return {
      sourceImageUrl: semanticMatch.url,
      sourceImageId: semanticMatch.id,
      confidence: "medium",
      reasoning: `Изображение найдено по семантическому поиску среди загруженных пользователем`,
    };
  }

  // 3.5. Если семантический поиск не дал результатов, пробуем поиск по ключевым словам в сообщении
  console.log(
    "🎬 analyzeVideoContext: No semantic match found, trying keyword-based fallback search"
  );
  const keywordMatch = findUserImageByKeywords(messageLower, userImages);
  console.log("🎬 analyzeVideoContext: Keyword match:", keywordMatch);

  if (keywordMatch) {
    return {
      sourceImageUrl: keywordMatch.url,
      sourceImageId: keywordMatch.id,
      confidence: "medium",
      reasoning: `Изображение найдено по ключевым словам: ${keywordMatch.reasoning}`,
    };
  }

  // 4. Если семантический поиск не дал результатов, используем эвристики для видео
  console.log(
    "🎬 analyzeVideoContext: No semantic match found, trying video heuristics"
  );
  const heuristicMatch = findUserImageByVideoHeuristics(
    messageLower,
    userImages
  );
  console.log("🎬 analyzeVideoContext: Heuristic match:", heuristicMatch);

  if (heuristicMatch) {
    return {
      sourceImageUrl: heuristicMatch.image.url,
      sourceImageId: heuristicMatch.image.id,
      confidence: "medium",
      reasoning: `Изображение выбрано по эвристике для видео: ${heuristicMatch.reasoning}`,
    };
  }

  // 5. Проверяем текущее сообщение на наличие изображений как fallback
  if (currentMessageAttachments?.length) {
    console.log(
      "🎬 analyzeVideoContext: Checking current message attachments as fallback"
    );
    const currentImage = currentMessageAttachments.find(
      (a: MessageAttachment) =>
        typeof a?.url === "string" &&
        /^https?:\/\//.test(a.url) &&
        String(a?.contentType || "").startsWith("image/")
    );

    if (currentImage?.url) {
      console.log(
        "🎬 analyzeVideoContext: Found image in current message as fallback:",
        currentImage.url
      );
      return {
        sourceImageUrl: currentImage.url,
        sourceImageId: currentImage.id,
        confidence: "medium",
        reasoning:
          "Изображение найдено в текущем сообщении пользователя (fallback)",
      };
    }
  }

  // 6. По умолчанию используем последнее загруженное пользователем изображение
  console.log(
    "🎬 analyzeVideoContext: Using final fallback - last user uploaded image"
  );
  const lastUserImage = userImages[userImages.length - 1];
  console.log("🎬 analyzeVideoContext: Last user image:", {
    url: lastUserImage.url,
    prompt: lastUserImage.prompt,
  });

  return {
    sourceImageUrl: lastUserImage.url,
    sourceImageId: lastUserImage.id,
    confidence: "low",
    reasoning: `Используется последнее загруженное пользователем изображение`,
  };
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
