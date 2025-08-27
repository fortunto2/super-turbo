import type { DBMessage } from "@/lib/db/schema";

export interface ImageContext {
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
}

/**
 * Анализирует контекст чата и определяет, к какому изображению обращается пользователь
 */
export async function analyzeImageContext(
  userMessage: string,
  chatImages: ChatImage[], // Изменено с chatHistory: DBMessage[] на chatImages: ChatImage[]
  currentMessageAttachments?: any[]
): Promise<ImageContext> {
  console.log("🔍 analyzeImageContext: Starting analysis", {
    userMessage,
    chatImagesLength: chatImages.length,
    currentMessageAttachments: currentMessageAttachments,
  });

  // 1. Проверяем текущее сообщение на наличие изображений
  if (currentMessageAttachments?.length) {
    console.log("🔍 analyzeImageContext: Checking current message attachments");
    const currentImage = currentMessageAttachments.find(
      (a: any) =>
        typeof a?.url === "string" &&
        /^https?:\/\//.test(a.url) &&
        String(a?.contentType || "").startsWith("image/")
    );

    if (currentImage?.url) {
      console.log(
        "🔍 analyzeImageContext: Found image in current message:",
        currentImage.url
      );
      return {
        sourceImageUrl: currentImage.url,
        confidence: "high",
        reasoning: "Изображение найдено в текущем сообщении пользователя",
      };
    }
  }

  // 2. Проверяем, есть ли изображения в истории чата
  if (chatImages.length === 0) {
    console.log("🔍 analyzeImageContext: No images found in chat history");
    return {
      confidence: "low",
      reasoning: "В истории чата не найдено изображений",
    };
  }

  console.log("🔍 analyzeImageContext: Images from chat history:", {
    totalImages: chatImages.length,
    images: chatImages.map((img) => ({
      url: img.url,
      role: img.role,
      prompt: img.prompt,
      messageIndex: img.messageIndex,
    })),
  });

  if (chatImages.length === 0) {
    console.log("🔍 analyzeImageContext: No images found in chat history");
    return {
      confidence: "low",
      reasoning: "В истории чата не найдено изображений",
    };
  }

  // 3. Анализируем текст сообщения на предмет ссылок на изображения
  const messageLower = userMessage.toLowerCase();
  console.log(
    "🔍 analyzeImageContext: Analyzing message for image references:",
    messageLower
  );

  // Поиск по ключевым словам
  const imageReferences = analyzeImageReferences(messageLower, chatImages);
  console.log(
    "🔍 analyzeImageContext: Found image references:",
    imageReferences
  );

  if (imageReferences.length > 0) {
    // Сортируем по релевантности
    imageReferences.sort((a, b) => b.relevance - a.relevance);
    const bestMatch = imageReferences[0];
    console.log("🔍 analyzeImageContext: Best match:", bestMatch);

    return {
      sourceImageUrl: bestMatch.image.url,
      sourceImageId: bestMatch.image.id,
      confidence: bestMatch.relevance > 0.7 ? "high" : "medium",
      reasoning: `Найдена ссылка на изображение: ${bestMatch.reasoning}`,
    };
  }

  // 4. Если нет явных ссылок, используем эвристики
  console.log(
    "🔍 analyzeImageContext: No explicit references found, trying heuristics"
  );
  const heuristicMatch = findImageByHeuristics(messageLower, chatImages);
  console.log("🔍 analyzeImageContext: Heuristic match:", heuristicMatch);

  if (heuristicMatch) {
    return {
      sourceImageUrl: heuristicMatch.image.url,
      sourceImageId: heuristicMatch.image.id,
      confidence: "medium",
      reasoning: `Изображение выбрано по эвристике: ${heuristicMatch.reasoning}`,
    };
  }

  // 5. По умолчанию используем последнее изображение
  console.log("🔍 analyzeImageContext: Using fallback - last image in chat");
  const lastImage = chatImages[chatImages.length - 1];
  console.log("🔍 analyzeImageContext: Last image:", {
    url: lastImage.url,
    role: lastImage.role,
    prompt: lastImage.prompt,
  });

  return {
    sourceImageUrl: lastImage.url,
    sourceImageId: lastImage.id,
    confidence: "low",
    reasoning: `Используется последнее изображение из чата (${lastImage.role === "assistant" ? "сгенерированное" : "загруженное"})`,
  };
}

/**
 * Анализирует текст сообщения на предмет ссылок на изображения
 */
function analyzeImageReferences(
  messageLower: string,
  chatImages: ChatImage[]
): Array<{ image: ChatImage; relevance: number; reasoning: string }> {
  console.log(
    "🔍 analyzeImageReferences: Starting pattern matching for:",
    messageLower
  );
  const references: Array<{
    image: ChatImage;
    relevance: number;
    reasoning: string;
  }> = [];

  // Русские ссылки на изображения
  const russianPatterns = [
    {
      pattern: /(это|эта|этот)\s+(изображение|картинка|фото|рисунок)/,
      weight: 0.9,
    },
    {
      pattern:
        /(сгенерированн[а-я]+|созданн[а-я]+)\s+(изображение|картинка|фото)/,
      weight: 0.8,
    },
    {
      pattern: /(последн[а-я]+|предыдущ[а-я]+)\s+(изображение|картинка|фото)/,
      weight: 0.7,
    },
    {
      pattern:
        /(перв[а-я]+|втор[а-я]+|треть[а-я]+)\s+(изображение|картинка|фото)/,
      weight: 0.6,
    },
    {
      pattern: /(загруженн[а-я]+|загруж[а-я]+)\s+(изображение|картинка|фото)/,
      weight: 0.7,
    },
    { pattern: /(на\s+этом\s+изображении|в\s+этой\s+картинке)/, weight: 0.9 },
    {
      pattern:
        /(измени|исправь|подправь|сделай)\s+(это\s+изображение|эту\s+картинку)/,
      weight: 0.9,
    },
    {
      pattern:
        /(сделай\s+глаза\s+голубыми|измени\s+цвет|подправь\s+фон|добавь\s+крылья)/,
      weight: 0.8,
    },
  ];

  // Английские ссылки на изображения
  const englishPatterns = [
    { pattern: /(this|that)\s+(image|picture|photo|drawing)/, weight: 0.9 },
    { pattern: /(generated|created)\s+(image|picture|photo)/, weight: 0.8 },
    { pattern: /(last|previous|recent)\s+(image|picture|photo)/, weight: 0.7 },
    { pattern: /(first|second|third)\s+(image|picture|photo)/, weight: 0.6 },
    { pattern: /(uploaded|upload)\s+(image|picture|photo)/, weight: 0.7 },
    { pattern: /(on\s+this\s+image|in\s+this\s+picture)/, weight: 0.9 },
    {
      pattern: /(change|fix|edit|modify)\s+(this\s+image|this\s+picture)/,
      weight: 0.9,
    },
    {
      pattern:
        /(make\s+eyes\s+blue|change\s+color|fix\s+background|add\s+wings)/,
      weight: 0.8,
    },
  ];

  const allPatterns = [...russianPatterns, ...englishPatterns];

  allPatterns.forEach(({ pattern, weight }) => {
    if (pattern.test(messageLower)) {
      // Определяем, какое изображение имеется в виду
      const targetImage = findTargetImageByPattern(
        pattern,
        messageLower,
        chatImages
      );
      if (targetImage) {
        references.push({
          image: targetImage,
          relevance: weight,
          reasoning: `Найдено совпадение с паттерном: ${pattern.source}`,
        });
      }
    }
  });

  return references;
}

/**
 * Находит целевое изображение на основе паттерна в сообщении
 */
function findTargetImageByPattern(
  pattern: RegExp,
  messageLower: string,
  chatImages: ChatImage[]
): ChatImage | null {
  console.log(
    "🔍 findTargetImageByPattern: Finding target for pattern:",
    pattern.source
  );

  // Если паттерн указывает на "это" изображение, ищем последнее
  if (pattern.source.includes("это") || pattern.source.includes("this")) {
    const result = chatImages[chatImages.length - 1] || null;
    console.log(
      "🔍 findTargetImageByPattern: 'This' pattern, returning last image:",
      result?.url
    );
    return result;
  }

  // Если паттерн указывает на порядковый номер
  const orderMatch = messageLower.match(
    /(перв[а-я]+|втор[а-я]+|треть[а-я]+|first|second|third)/
  );
  if (orderMatch) {
    const order = orderMatch[0];
    let index = 0;

    if (order.includes("перв") || order.includes("first")) index = 0;
    else if (order.includes("втор") || order.includes("second")) index = 1;
    else if (order.includes("треть") || order.includes("third")) index = 2;

    return chatImages[index] || null;
  }

  // Если паттерн указывает на "последнее" или "предыдущее"
  if (pattern.source.includes("последн") || pattern.source.includes("last")) {
    return chatImages[chatImages.length - 1] || null;
  }

  if (
    pattern.source.includes("предыдущ") ||
    pattern.source.includes("previous")
  ) {
    return chatImages[chatImages.length - 2] || null;
  }

  // Если паттерн указывает на "сгенерированное" изображение
  if (
    pattern.source.includes("сгенерированн") ||
    pattern.source.includes("generated")
  ) {
    const generatedImages = chatImages.filter(
      (img) => img.role === "assistant"
    );
    return generatedImages[generatedImages.length - 1] || null;
  }

  // Если паттерн указывает на "загруженное" изображение
  if (
    pattern.source.includes("загруженн") ||
    pattern.source.includes("uploaded")
  ) {
    const uploadedImages = chatImages.filter((img) => img.role === "user");
    return uploadedImages[uploadedImages.length - 1] || null;
  }

  return null;
}

/**
 * Находит изображение по эвристикам, если явные ссылки не найдены
 */
function findImageByHeuristics(
  messageLower: string,
  chatImages: ChatImage[]
): { image: ChatImage; reasoning: string } | null {
  console.log(
    "🔍 findImageByHeuristics: Analyzing message for edit intent:",
    messageLower
  );

  // Проверяем на контекст "той же девочки/персонажа"
  const samePersonPatterns = [
    /той\s+же\s+девочк[а-я]+/i,
    /той\s+же\s+девушк[а-я]+/i,
    /того\s+же\s+человек[а-я]+/i,
    /same\s+girl/i,
    /same\s+person/i,
    /same\s+character/i,
    /the\s+same\s+girl/i,
    /the\s+same\s+person/i,
  ];

  const hasSamePersonContext = samePersonPatterns.some((pattern) =>
    pattern.test(messageLower)
  );
  if (hasSamePersonContext) {
    // Ищем последнее сгенерированное изображение (assistant), так как это скорее всего то, что мы редактируем
    const generatedImages = chatImages.filter(
      (img) => img.role === "assistant"
    );
    if (generatedImages.length > 0) {
      const lastGenerated = generatedImages[generatedImages.length - 1];
      console.log(
        "🔍 findImageByHeuristics: Same person context, returning last generated image:",
        lastGenerated.url
      );
      return {
        image: lastGenerated,
        reasoning:
          "контекст 'той же девочки' - используется последнее сгенерированное изображение",
      };
    }
  }

  // Если сообщение содержит слова об изменении/редактировании
  const editWords = [
    "измени",
    "исправь",
    "подправь",
    "сделай",
    "замени",
    "улучши",
    "добавь",
    "change",
    "fix",
    "edit",
    "modify",
    "replace",
    "improve",
    "add",
  ];

  const hasEditIntent = editWords.some((word) => messageLower.includes(word));
  console.log("🔍 findImageByHeuristics: Has edit intent:", hasEditIntent);

  if (hasEditIntent) {
    // Приоритет: последнее сгенерированное изображение, затем последнее загруженное
    const generatedImages = chatImages.filter(
      (img) => img.role === "assistant"
    );
    const uploadedImages = chatImages.filter((img) => img.role === "user");

    let targetImage: ChatImage;
    let reasoning: string;

    if (generatedImages.length > 0) {
      targetImage = generatedImages[generatedImages.length - 1];
      reasoning =
        "контекст редактирования - используется последнее сгенерированное изображение";
    } else if (uploadedImages.length > 0) {
      targetImage = uploadedImages[uploadedImages.length - 1];
      reasoning =
        "контекст редактирования - используется последнее загруженное изображение";
    } else {
      targetImage = chatImages[chatImages.length - 1];
      reasoning =
        "контекст редактирования - используется последнее изображение в чате";
    }

    console.log(
      "🔍 findImageByHeuristics: Edit intent detected, returning:",
      targetImage.url
    );
    return { image: targetImage, reasoning };
  }

  // Если сообщение содержит слова о стиле/качестве
  const styleWords = [
    "стиль",
    "качество",
    "размер",
    "цвет",
    "фон",
    "style",
    "quality",
    "size",
    "color",
    "background",
  ];

  const hasStyleIntent = styleWords.some((word) => messageLower.includes(word));
  if (hasStyleIntent) {
    const result = chatImages[chatImages.length - 1];
    return {
      image: result,
      reasoning: "контекст стиля/качества - используется последнее изображение",
    };
  }

  return null;
}

/**
 * Получает изображения из истории чата
 */
export async function getChatImages(chatId: string): Promise<ChatImage[]> {
  try {
    // Импортируем функцию получения сообщений
    const { getMessagesByChatId } = await import("@/lib/db/queries");

    const messages = await getMessagesByChatId({ id: chatId });
    console.log("🔍 getChatImages: Raw messages from DB:", {
      chatId,
      totalMessages: messages.length,
      messages: messages.map((msg) => ({
        id: msg.id,
        role: msg.role,
        hasAttachments: !!msg.attachments,
        attachmentsLength: Array.isArray(msg.attachments)
          ? msg.attachments.length
          : "not array",
        attachments: msg.attachments,
      })),
    });

    const chatImages: ChatImage[] = [];

    messages.forEach((msg, index) => {
      try {
        const attachments = msg.attachments as any[];
        console.log(`🔍 Processing message ${index}:`, {
          role: msg.role,
          attachments: attachments,
          isArray: Array.isArray(attachments),
        });

        if (Array.isArray(attachments)) {
          attachments.forEach((att, attIndex) => {
            console.log(`🔍 Processing attachment ${attIndex}:`, {
              url: att?.url,
              contentType: att?.contentType,
              name: att?.name,
              id: att?.id,
              isValidUrl:
                typeof att?.url === "string" && /^https?:\/\//.test(att?.url),
              isImage: String(att?.contentType || "").startsWith("image/"),
            });

            if (
              typeof att?.url === "string" &&
              /^https?:\/\//.test(att.url) &&
              String(att?.contentType || "").startsWith("image/")
            ) {
              const chatImage = {
                url: att.url,
                id: att.id,
                role: msg.role as "user" | "assistant",
                timestamp: msg.createdAt,
                prompt: att.name,
                messageIndex: index,
              };

              console.log("🔍 Adding chat image:", chatImage);
              chatImages.push(chatImage);
            }
          });
        }
      } catch (error) {
        console.warn("Error parsing message attachments:", error);
      }
    });

    console.log("🔍 getChatImages: Final result:", {
      totalImages: chatImages.length,
      images: chatImages.map((img) => ({
        url: img.url,
        role: img.role,
        prompt: img.prompt,
        messageIndex: img.messageIndex,
      })),
    });

    return chatImages;
  } catch (error) {
    console.error("Error getting chat images:", error);
    return [];
  }
}
