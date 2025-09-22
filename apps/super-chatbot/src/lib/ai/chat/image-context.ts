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
    console.log("🔍 analyzeImageContext: Best match:", {
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
        /(перв[а-я]+|втор[а-я]+|треть[а-я]+|четверт[а-я]+|пят[а-я]+)\s+(изображение|картинка|фото|picture)/,
      weight: 0.8,
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
    // Новые паттерны для лучшего распознавания
    {
      pattern:
        /(возьми|используй|работай\s+с)\s+(перв[а-я]+|втор[а-я]+|треть[а-я]+)\s+(изображение|картинка|фото|picture)/,
      weight: 0.9,
    },
    {
      pattern:
        /(take|use|work\s+with)\s+(the\s+)?(first|second|third)\s+(image|picture|photo)/,
      weight: 0.9,
    },
    // Паттерны для распознавания по типу источника
    {
      pattern:
        /(картинк[а-я]+\s+котор[а-я]+\s+(я|пользователь)\s+загрузил|загруженн[а-я]+\s+мною|мо[я-я]+\s+картинк[а-я]+)/,
      weight: 0.8,
    },
    {
      pattern:
        /(картинк[а-я]+\s+котор[а-я]+\s+создал\s+(бот|ассистент|ии)|сгенерированн[а-я]+\s+ботом|созданн[а-я]+\s+ии)/,
      weight: 0.8,
    },
    // Паттерны для работы с URL изображений
    {
      pattern:
        /(изображение\s+с\s+ссылк[а-я]+|картинк[а-я]+\s+по\s+адресу|фото\s+по\s+url)/,
      weight: 0.7,
    },

    // Семантические паттерны для поиска по содержимому (русские)
    {
      pattern:
        /(картинк[а-я]+\s+с\s+луной|изображение\s+с\s+луной|фото\s+с\s+луной)/,
      weight: 0.9,
    },
    {
      pattern:
        /(картинк[а-я]+\s+с\s+самолетом|изображение\s+с\s+самолетом|фото\s+с\s+самолетом)/,
      weight: 0.9,
    },
    {
      pattern:
        /(картинк[а-я]+\s+с\s+девочкой|изображение\s+с\s+девочкой|фото\s+с\s+девочкой)/,
      weight: 0.9,
    },
    {
      pattern:
        /(картинк[а-я]+\s+с\s+мальчиком|изображение\s+с\s+мальчиком|фото\s+с\s+мальчиком)/,
      weight: 0.9,
    },
    {
      pattern:
        /(картинк[а-я]+\s+с\s+собакой|изображение\s+с\s+собакой|фото\s+с\s+собакой)/,
      weight: 0.9,
    },
    {
      pattern:
        /(картинк[а-я]+\s+с\s+кошкой|изображение\s+с\s+кошкой|фото\s+с\s+кошкой)/,
      weight: 0.9,
    },
    {
      pattern:
        /(картинк[а-я]+\s+с\s+машиной|изображение\s+с\s+машиной|фото\s+с\s+машиной)/,
      weight: 0.9,
    },
    {
      pattern:
        /(картинк[а-я]+\s+с\s+домом|изображение\s+с\s+домом|фото\s+с\s+домом)/,
      weight: 0.9,
    },
    {
      pattern:
        /(картинк[а-я]+\s+с\s+лесом|изображение\s+с\s+лесом|фото\s+с\s+лесом)/,
      weight: 0.9,
    },
    {
      pattern:
        /(картинк[а-я]+\s+с\s+морем|изображение\s+с\s+морем|фото\s+с\s+морем)/,
      weight: 0.9,
    },
    {
      pattern:
        /(картинк[а-я]+\s+где\s+есть|изображение\s+где\s+есть|фото\s+где\s+есть)/,
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
    // Паттерны для распознавания по типу источника (английские)
    {
      pattern:
        /(image\s+(that\s+)?(i|user)\s+uploaded|uploaded\s+by\s+me|my\s+uploaded\s+image)/,
      weight: 0.8,
    },
    {
      pattern:
        /(image\s+(that\s+)?(bot|assistant|ai)\s+created|generated\s+by\s+bot|created\s+by\s+ai)/,
      weight: 0.8,
    },
    // Паттерны для работы с URL изображений (английские)
    {
      pattern:
        /(image\s+from\s+url|picture\s+with\s+link|photo\s+by\s+address)/,
      weight: 0.7,
    },

    // Семантические паттерны для поиска по содержимому (английские)
    {
      pattern: /(image|picture|photo)\s+with\s+(moon|lunar)/,
      weight: 0.9,
    },
    {
      pattern: /(image|picture|photo)\s+with\s+(airplane|plane)/,
      weight: 0.9,
    },
    {
      pattern: /(image|picture|photo)\s+with\s+(girl|woman)/,
      weight: 0.9,
    },
    {
      pattern: /(image|picture|photo)\s+with\s+(boy|man)/,
      weight: 0.9,
    },
    {
      pattern: /(image|picture|photo)\s+with\s+(dog)/,
      weight: 0.9,
    },
    {
      pattern: /(image|picture|photo)\s+with\s+(cat)/,
      weight: 0.9,
    },
    {
      pattern: /(image|picture|photo)\s+with\s+(car|vehicle)/,
      weight: 0.9,
    },
    {
      pattern: /(image|picture|photo)\s+with\s+(house|building)/,
      weight: 0.9,
    },
    {
      pattern: /(image|picture|photo)\s+with\s+(forest|trees)/,
      weight: 0.9,
    },
    {
      pattern: /(image|picture|photo)\s+with\s+(sea|ocean)/,
      weight: 0.9,
    },
    {
      pattern: /(image|picture|photo)\s+that\s+(has|contains|shows)/,
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
    /(перв[а-я]+|втор[а-я]+|треть[а-я]+|четверт[а-я]+|пят[а-я]+|first|second|third|fourth|fifth)/
  );
  if (orderMatch) {
    const order = orderMatch[0];
    let index = 0;

    if (order.includes("перв") || order.includes("first")) index = 0;
    else if (order.includes("втор") || order.includes("second")) index = 1;
    else if (order.includes("треть") || order.includes("third")) index = 2;
    else if (order.includes("четверт") || order.includes("fourth")) index = 3;
    else if (order.includes("пят") || order.includes("fifth")) index = 4;

    const targetImage = chatImages[index];
    console.log("🔍 findTargetImageByPattern: Order pattern matched:", {
      order,
      index,
      totalImages: chatImages.length,
      targetImage: targetImage?.url,
    });
    return targetImage || null;
  }

  // Если паттерн указывает на "последнее" или "предыдущее"
  if (pattern.source.includes("последн") || pattern.source.includes("last")) {
    const result = chatImages[chatImages.length - 1];
    console.log(
      "🔍 findTargetImageByPattern: 'Last' pattern, returning:",
      result?.url
    );
    return result || null;
  }

  if (
    pattern.source.includes("предыдущ") ||
    pattern.source.includes("previous")
  ) {
    const result = chatImages[chatImages.length - 2];
    console.log(
      "🔍 findTargetImageByPattern: 'Previous' pattern, returning:",
      result?.url
    );
    return result || null;
  }

  // Если паттерн указывает на "сгенерированное" изображение
  if (
    pattern.source.includes("сгенерированн") ||
    pattern.source.includes("generated")
  ) {
    const generatedImages = chatImages.filter(
      (img) => img.role === "assistant"
    );
    const result = generatedImages[generatedImages.length - 1];
    console.log(
      "🔍 findTargetImageByPattern: 'Generated' pattern, returning:",
      result?.url
    );
    return result || null;
  }

  // Если паттерн указывает на "загруженное" изображение
  if (
    pattern.source.includes("загруженн") ||
    pattern.source.includes("uploaded") ||
    messageLower.includes("загрузил") ||
    messageLower.includes("uploaded")
  ) {
    const uploadedImages = chatImages.filter((img) => img.role === "user");
    const result = uploadedImages[uploadedImages.length - 1];
    console.log(
      "🔍 findTargetImageByPattern: 'Uploaded' pattern, returning:",
      result?.url
    );
    return result || null;
  }

  // Если паттерн указывает на изображение "которое я загрузил" или "мое"
  if (
    messageLower.includes("котор") &&
    (messageLower.includes("загрузил") || messageLower.includes("я")) &&
    messageLower.includes("картинк")
  ) {
    const uploadedImages = chatImages.filter((img) => img.role === "user");
    const result = uploadedImages[uploadedImages.length - 1];
    console.log(
      "🔍 findTargetImageByPattern: 'My uploaded' pattern, returning:",
      result?.url
    );
    return result || null;
  }

  // Если паттерн указывает на изображение "которое создал бот" или "сгенерированное"
  if (
    (messageLower.includes("создал") &&
      (messageLower.includes("бот") || messageLower.includes("ии"))) ||
    (messageLower.includes("сгенерирован") && messageLower.includes("бот")) ||
    (messageLower.includes("created") &&
      (messageLower.includes("bot") || messageLower.includes("ai"))) ||
    (messageLower.includes("generated") && messageLower.includes("bot"))
  ) {
    const generatedImages = chatImages.filter(
      (img) => img.role === "assistant"
    );
    const result = generatedImages[generatedImages.length - 1];
    console.log(
      "🔍 findTargetImageByPattern: 'Bot created' pattern, returning:",
      result?.url
    );
    return result || null;
  }

  // Если паттерн указывает на изображение "по URL" или "с ссылкой"
  if (
    messageLower.includes("url") ||
    messageLower.includes("ссылк") ||
    messageLower.includes("адрес")
  ) {
    // Ищем последнее изображение с полным URL
    const urlImages = chatImages.filter(
      (img) => img.url && img.url.startsWith("http")
    );
    const result = urlImages[urlImages.length - 1];
    console.log(
      "🔍 findTargetImageByPattern: 'URL' pattern, returning:",
      result?.url
    );
    return result || null;
  }

  // Семантический поиск по содержимому
  if (isSemanticPattern(pattern)) {
    console.log(
      "🔍 findTargetImageByPattern: Semantic pattern detected, searching by content"
    );
    return findImageBySemanticContent(messageLower, chatImages);
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
              // AICODE-DEBUG: Извлекаем fileId из имени вложения
              let extractedFileId: string | undefined;
              let displayPrompt = att.name || "";
              const fileIdRegex = /\[FILE_ID:([a-f0-9-]+)\]\s*(.*)/;
              const match = att.name?.match(fileIdRegex);

              if (match) {
                extractedFileId = match[1]; // Извлекаем fileId
                displayPrompt = match[2].trim(); // Остальная часть имени - это prompt
              }

              console.log("🔍 getChatImages: FileId extraction:", {
                originalName: att.name,
                extractedFileId: extractedFileId || "none",
                displayPrompt: displayPrompt,
                fallbackReason: extractedFileId
                  ? "fileId found"
                  : "no fileId in name",
              });

              const chatImage = {
                url: att.url,
                id: extractedFileId || att.id, // Используем извлеченный fileId, fallback к att.id
                role: msg.role as "user" | "assistant",
                timestamp: msg.createdAt,
                prompt: displayPrompt, // Используем извлеченный prompt
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

/**
 * Проверяет, является ли паттерн семантическим (для поиска по содержимому)
 */
function isSemanticPattern(pattern: RegExp): boolean {
  const semanticKeywords = [
    "луной",
    "самолетом",
    "девочкой",
    "мальчиком",
    "собакой",
    "кошкой",
    "машиной",
    "домом",
    "лесом",
    "морем",
    "где есть",
    "moon",
    "airplane",
    "girl",
    "boy",
    "dog",
    "cat",
    "car",
    "house",
    "forest",
    "sea",
    "has",
    "contains",
    "shows",
  ];

  return semanticKeywords.some((keyword) => pattern.source.includes(keyword));
}

/**
 * Находит изображение по семантическому содержимому
 */
function findImageBySemanticContent(
  messageLower: string,
  chatImages: ChatImage[]
): ChatImage | null {
  console.log(
    "🔍 findImageBySemanticContent: Analyzing message:",
    messageLower
  );

  // Извлекаем ключевые слова из сообщения
  const keywords = extractKeywordsFromMessage(messageLower);
  console.log("🔍 findImageBySemanticContent: Extracted keywords:", keywords);

  if (keywords.length === 0) {
    console.log(
      "🔍 findImageBySemanticContent: No keywords found, returning null"
    );
    return null;
  }

  // Ищем изображения с промптами или именами файлов, содержащими ключевые слова
  const matchingImages = chatImages.filter((img) => {
    // Проверяем промпт
    if (img.prompt) {
      const promptLower = img.prompt.toLowerCase();
      const hasKeywordInPrompt = keywords.some((keyword) =>
        promptLower.includes(keyword.toLowerCase())
      );

      if (hasKeywordInPrompt) {
        console.log(
          "🔍 findImageBySemanticContent: Found matching image by prompt:",
          {
            url: img.url,
            prompt: img.prompt,
            matchedKeywords: keywords.filter((k) =>
              promptLower.includes(k.toLowerCase())
            ),
          }
        );
        return true;
      }
    }

    // Проверяем имя файла (из URL)
    if (img.url) {
      const fileName = img.url.split("/").pop() || "";
      const fileNameLower = fileName.toLowerCase();

      // Ищем частичные совпадения ключевых слов в имени файла
      const hasKeywordInFileName = keywords.some((keyword) => {
        const keywordLower = keyword.toLowerCase();
        // Проверяем точное совпадение
        if (fileNameLower.includes(keywordLower)) {
          return true;
        }
        // Проверяем транслитерацию русских слов
        const transliterated = transliterateRussian(keywordLower);
        if (fileNameLower.includes(transliterated)) {
          return true;
        }
        // Проверяем частичные совпадения для русских слов
        if (keywordLower === "ночной" && fileNameLower.includes("nochnoj")) {
          return true;
        }
        if (keywordLower === "ночь" && fileNameLower.includes("noch")) {
          return true;
        }
        if (keywordLower === "луна" && fileNameLower.includes("luna")) {
          return true;
        }
        if (keywordLower === "moon" && fileNameLower.includes("moon")) {
          return true;
        }
        return false;
      });

      if (hasKeywordInFileName) {
        console.log(
          "🔍 findImageBySemanticContent: Found matching image by filename:",
          {
            url: img.url,
            fileName: fileName,
            matchedKeywords: keywords.filter((k) => {
              const keywordLower = k.toLowerCase();
              return (
                fileNameLower.includes(keywordLower) ||
                (keywordLower === "ночной" &&
                  fileNameLower.includes("nochnoj")) ||
                (keywordLower === "ночь" && fileNameLower.includes("noch")) ||
                (keywordLower === "луна" && fileNameLower.includes("luna")) ||
                (keywordLower === "moon" && fileNameLower.includes("moon"))
              );
            }),
          }
        );
        return true;
      }
    }

    return false;
  });

  // Возвращаем последнее найденное изображение (самое свежее)
  const result = matchingImages[matchingImages.length - 1] || null;

  console.log("🔍 findImageBySemanticContent: Result:", {
    totalMatches: matchingImages.length,
    selectedImage: result?.url,
    selectedPrompt: result?.prompt,
  });

  return result;
}

/**
 * Преобразует русские слова в латинские (транслитерация)
 */
function transliterateRussian(word: string): string {
  const transliterationMap: Record<string, string> = {
    а: "a",
    б: "b",
    в: "v",
    г: "g",
    д: "d",
    е: "e",
    ё: "yo",
    ж: "zh",
    з: "z",
    и: "i",
    й: "y",
    к: "k",
    л: "l",
    м: "m",
    н: "n",
    о: "o",
    п: "p",
    р: "r",
    с: "s",
    т: "t",
    у: "u",
    ф: "f",
    х: "h",
    ц: "ts",
    ч: "ch",
    ш: "sh",
    щ: "sch",
    ъ: "",
    ы: "y",
    ь: "",
    э: "e",
    ю: "yu",
    я: "ya",
  };

  return word
    .toLowerCase()
    .split("")
    .map((char) => transliterationMap[char] || char)
    .join("");
}

/**
 * Извлекает ключевые слова из сообщения для семантического поиска
 */
function extractKeywordsFromMessage(message: string): string[] {
  const messageLower = message.toLowerCase();
  const keywords: string[] = [];

  // Словарь ключевых слов для поиска
  const keywordMap = {
    // Природа
    луна: [
      "луна",
      "moon",
      "лунный",
      "lunar",
      "ночной",
      "nocturnal",
      "ночь",
      "night",
    ],
    солнце: ["солнце", "sun", "солнечный", "sunny"],
    звезды: ["звезды", "stars", "звездный", "stellar"],
    небо: ["небо", "sky", "небесный", "celestial"],
    облака: ["облака", "clouds", "облачный", "cloudy"],
    дождь: ["дождь", "rain", "дождливый", "rainy"],
    снег: ["снег", "snow", "снежный", "snowy"],
    лес: ["лес", "forest", "деревья", "trees", "природа", "nature"],
    море: ["море", "sea", "океан", "ocean", "вода", "water"],
    горы: ["горы", "mountains", "горный", "mountainous"],
    река: ["река", "river", "речной", "riverine"],
    озеро: ["озеро", "lake", "озерный", "lacustrine"],

    // Животные
    собака: ["собака", "dog", "пес", "пёс", "собачка"],
    кошка: ["кошка", "cat", "кот", "котик", "котенок"],
    птица: ["птица", "bird", "птичий", "avian"],
    рыба: ["рыба", "fish", "рыбный", "piscine"],
    лошадь: ["лошадь", "horse", "лошадиный", "equine"],
    корова: ["корова", "cow", "коровьий", "bovine"],
    свинья: ["свинья", "pig", "свиной", "porcine"],

    // Люди
    девочка: ["девочка", "girl", "девушка", "woman", "женщина"],
    мальчик: ["мальчик", "boy", "парень", "man", "мужчина"],
    ребенок: ["ребенок", "child", "детский", "childish"],
    семья: ["семья", "family", "семейный", "familial"],

    // Транспорт
    машина: ["машина", "car", "автомобиль", "авто", "vehicle"],
    самолет: ["самолет", "airplane", "plane", "авиация", "aviation"],
    поезд: ["поезд", "train", "железнодорожный", "railway"],
    велосипед: ["велосипед", "bicycle", "bike", "велосипедный", "cycling"],
    мотоцикл: ["мотоцикл", "motorcycle", "мотоциклетный", "motorcycling"],
    корабль: ["корабль", "ship", "судно", "vessel", "морской", "marine"],

    // Здания
    дом: ["дом", "house", "здание", "building", "домой"],
    замок: ["замок", "castle", "замковый", "castellated"],
    церковь: [
      "церковь",
      "church",
      "храм",
      "temple",
      "религиозный",
      "religious",
    ],
    школа: ["школа", "school", "школьный", "scholastic"],
    больница: ["больница", "hospital", "медицинский", "medical"],

    // Еда
    пицца: ["пицца", "pizza", "пиццерия", "pizzeria"],
    торт: ["торт", "cake", "тортовый", "cakery"],
    фрукты: ["фрукты", "fruits", "фруктовый", "fruity"],
    овощи: ["овощи", "vegetables", "овощной", "vegetable"],

    // Цвета
    красный: ["красный", "red", "краснота", "redness"],
    синий: ["синий", "blue", "синева", "blueness"],
    зеленый: ["зеленый", "green", "зелень", "greenness"],
    желтый: ["желтый", "yellow", "желтизна", "yellowness"],
    черный: ["черный", "black", "чернота", "blackness"],
    белый: ["белый", "white", "белизна", "whiteness"],

    // Эмоции и состояния
    счастливый: ["счастливый", "happy", "радостный", "joyful"],
    грустный: ["грустный", "sad", "печальный", "melancholy"],
    злой: ["злой", "angry", "сердитый", "mad"],
    усталый: ["усталый", "tired", "утомленный", "exhausted"],
  };

  // Ищем ключевые слова в сообщении
  Object.entries(keywordMap).forEach(([category, words]) => {
    const hasCategory = words.some((word) => messageLower.includes(word));
    if (hasCategory) {
      keywords.push(...words);
      console.log(
        `🔍 extractKeywordsFromMessage: Found category "${category}" with words:`,
        words
      );
    }
  });

  // Убираем дубликаты и возвращаем
  const uniqueKeywords = [...new Set(keywords)];
  console.log("🔍 extractKeywordsFromMessage: Final keywords:", uniqueKeywords);

  return uniqueKeywords;
}
