import {
  semanticIndex,
  temporalAnalyzer,
  userPreferenceLearner,
  contextCache,
  generateMessageHash,
} from '../context';

export interface VideoContext {
  sourceImageUrl?: string;
  sourceImageId?: string;
  confidence: 'high' | 'medium' | 'low';
  reasoning: string;
  metadata?: Record<string, any>;
}

export interface ChatImage {
  url: string;
  id?: string;
  role: 'user' | 'assistant';
  timestamp: Date;
  prompt?: string;
  messageIndex: number;
  mediaType: 'image';
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
  userId?: string,
): Promise<VideoContext> {
  console.log(
    '🎬 analyzeVideoContext: Starting enhanced analysis with all 4 systems',
    {
      userMessage,
      chatImagesLength: chatImages.length,
      currentMessageAttachments: currentMessageAttachments,
      chatId,
      userId,
    },
  );

  // 1. КЭШИРОВАНИЕ КОНТЕКСТА - проверяем кэш первым делом
  if (
    chatId &&
    true // CacheUtils.shouldUseCache(userMessage, currentMessageAttachments)
  ) {
    const messageHash = generateMessageHash(
      userMessage,
      currentMessageAttachments,
    );
    const cachedContext = await contextCache.getCachedContext(
      chatId,
      messageHash,
      'video',
    );

    if (cachedContext) {
      console.log(`🎯 VideoContext: Cache HIT for video in chat ${chatId}`);
      return {
        sourceImageUrl: cachedContext?.sourceUrl || '',
        ...(cachedContext?.sourceId && {
          sourceImageId: cachedContext.sourceId,
        }),
        confidence: cachedContext?.confidence || 'medium',
        reasoning: `Кэшированный результат: ${cachedContext?.reasoning || ''}`,
        ...(cachedContext?.metadata && { metadata: cachedContext.metadata }),
      };
    }
  }

  // 2. ПРОВЕРЯЕМ ТЕКУЩЕЕ СООБЩЕНИЕ на наличие изображений (image-to-video)
  if (currentMessageAttachments?.length) {
    console.log('🎬 analyzeVideoContext: Checking current message attachments');
    const currentImage = currentMessageAttachments.find(
      (a: MessageAttachment) =>
        typeof a?.url === 'string' &&
        /^https?:\/\//.test(a.url) &&
        String(a?.contentType || '').startsWith('image/'),
    );

    if (currentImage?.url) {
      console.log(
        '🎬 analyzeVideoContext: Found image in current message:',
        currentImage.url,
      );

      const result = {
        sourceImageUrl: currentImage.url,
        sourceImageId: currentImage.id,
        confidence: 'high' as const,
        reasoning:
          'Изображение найдено в текущем сообщении пользователя для image-to-video',
        metadata: {
          source: 'current_message',
          contentType: currentImage.contentType,
          timestamp: new Date().toISOString(),
        },
      };

      // Сохраняем в кэш
      if (
        chatId &&
        true // CacheUtils.shouldUseCache(userMessage, currentMessageAttachments)
      ) {
        const messageHash = generateMessageHash(
          userMessage,
          currentMessageAttachments,
        );
        await contextCache.setCachedContext(chatId, messageHash, 'video', {
          sourceUrl: result.sourceImageUrl,
          ...(result.sourceImageId && { sourceId: result.sourceImageId }),
          mediaType: 'video' as const,
          confidence: result.confidence,
          reasoning: result.reasoning,
          ...(result.metadata && { metadata: result.metadata }),
        });
      }

      return {
        sourceImageUrl: result?.sourceImageUrl || '',
        ...(result?.sourceImageId && { sourceImageId: result.sourceImageId }),
        confidence: result?.confidence || 'medium',
        reasoning: result?.reasoning || '',
        ...(result?.metadata && { metadata: result.metadata }),
      };
    }
  }

  // 3. ПРОВЕРЯЕМ ИСТОРИЮ ЧАТА на наличие изображений
  if (chatImages.length === 0) {
    console.log('🎬 analyzeVideoContext: No images found in chat history');
    return {
      confidence: 'low',
      reasoning: 'В истории чата не найдено изображений для image-to-video',
      metadata: {
        source: 'chat_history',
        totalImages: 0,
        timestamp: new Date().toISOString(),
      },
    };
  }

  console.log('🎬 analyzeVideoContext: Images from chat history:', {
    totalImages: chatImages.length,
    images: chatImages.map((img) => ({
      url: img.url,
      role: img.role,
      prompt: img.prompt,
      messageIndex: img.messageIndex,
    })),
  });

  // 4. ФИЛЬТРУЕМ ТОЛЬКО ЗАГРУЖЕННЫЕ ПОЛЬЗОВАТЕЛЕМ изображения для image-to-video
  const userImages = chatImages.filter((img) => img.role === 'user');
  console.log(
    '🎬 analyzeVideoContext: User uploaded images for video generation:',
    {
      totalUserImages: userImages.length,
      images: userImages.map((img) => ({
        url: img.url,
        prompt: img.prompt,
        messageIndex: img.messageIndex,
      })),
    },
  );

  if (userImages.length === 0) {
    console.log('🎬 analyzeVideoContext: No user uploaded images found');
    return {
      confidence: 'low',
      reasoning:
        'В истории чата не найдено загруженных пользователем изображений для image-to-video',
      metadata: {
        source: 'chat_history',
        totalUserImages: 0,
        timestamp: new Date().toISOString(),
      },
    };
  }

  // 5. АНАЛИЗИРУЕМ ТЕКСТ СООБЩЕНИЯ с использованием всех 4 систем
  const messageLower = userMessage.toLowerCase();
  console.log(
    '🎬 analyzeVideoContext: Analyzing message with all 4 systems:',
    messageLower,
  );

  // 5.1. ВРЕМЕННОЙ АНАЛИЗ - ищем временные ссылки
  let temporalMatch = null;
  try {
    console.log('🕒 VideoContext: Analyzing temporal references...');
    const temporalMatches = await temporalAnalyzer.analyzeTemporalReferences(
      userMessage,
      userImages.map((img) => ({
        ...img,
        mediaType: 'image' as const,
      })),
    );

    if (
      temporalMatches.length > 0 &&
      temporalMatches[0]?.confidence &&
      temporalMatches[0].confidence > 0.6
    ) {
      temporalMatch = temporalMatches[0];
      console.log('🕒 VideoContext: Found temporal match:', {
        url: temporalMatch?.media?.url,
        confidence: temporalMatch?.confidence,
        reasoning: temporalMatch?.reasoning,
      });
    }
  } catch (error) {
    console.warn('🕒 VideoContext: Temporal analysis failed:', error);
  }

  // 5.2. СЕМАНТИЧЕСКИЙ ПОИСК - ищем по содержимому
  let semanticMatch = null;
  try {
    console.log('🔍 VideoContext: Analyzing semantic content...');
    const semanticResults = semanticIndex.search(messageLower, userImages);

    if (
      semanticResults.length > 0 &&
      semanticResults[0]?.relevanceScore &&
      semanticResults[0].relevanceScore > 0.3
    ) {
      semanticMatch = semanticResults[0];
      console.log('🔍 VideoContext: Found semantic match:', {
        url: semanticMatch?.image?.url,
        score: semanticMatch?.relevanceScore,
        reasoning: semanticMatch?.reasoning,
      });
    }
  } catch (error) {
    console.warn('🔍 VideoContext: Semantic search failed:', error);
  }

  // 5.3. ПОИСК ПО КЛЮЧЕВЫМ СЛОВАМ (legacy поддержка)
  const imageReferences = await analyzeVideoImageReferences(
    messageLower,
    userImages,
  );
  console.log(
    '🎬 analyzeVideoContext: Found image references:',
    imageReferences,
  );

  // 6. ВЫБИРАЕМ ЛУЧШИЙ РЕЗУЛЬТАТ из всех систем
  let bestMatch = null;
  let bestScore = 0;
  let bestReasoning = '';
  let bestSource = '';

  // Приоритет 1: Временной анализ (высший приоритет)
  if (temporalMatch && temporalMatch.confidence > bestScore) {
    bestMatch = temporalMatch.media;
    bestScore = temporalMatch.confidence;
    bestReasoning = `Временная ссылка: ${temporalMatch.reasoning}`;
    bestSource = 'temporal';
  }

  // Приоритет 2: Семантический поиск
  if (semanticMatch && semanticMatch.relevanceScore > bestScore) {
    bestMatch = semanticMatch.image;
    bestScore = semanticMatch.relevanceScore;
    bestReasoning = `Семантический поиск: ${semanticMatch.reasoning}`;
    bestSource = 'semantic';
  }

  // Приоритет 3: ПОИСК ПО СОДЕРЖИМОМУ ИЗОБРАЖЕНИЙ (по ключевым словам в промпте)
  console.log('🎬 analyzeVideoContext: Searching by image content...');
  const contentMatch = findUserImageByKeywords(messageLower, userImages);
  if (contentMatch?.reasoning) {
    const matchedImage = userImages.find((img) => img.url === contentMatch.url);
    if (matchedImage) {
      // Вычисляем релевантность на основе количества совпавших ключевых слов
      const keywords = extractKeywords(messageLower);
      const matchedKeywords = keywords.filter((keyword) =>
        (matchedImage.prompt || '')
          .toLowerCase()
          .includes(keyword.toLowerCase()),
      );
      const relevance = matchedKeywords.length / Math.max(keywords.length, 1);

      if (relevance > bestScore) {
        bestMatch = matchedImage;
        bestScore = relevance;
        bestReasoning = `Поиск по содержимому: ${contentMatch.reasoning}`;
        bestSource = 'content';
        console.log('🎬 analyzeVideoContext: Content match selected:', {
          url: matchedImage.url,
          relevance: `${Math.round(relevance * 100)}%`,
          reasoning: bestReasoning,
        });
      }
    }
  }

  // Приоритет 4: Поиск по ключевым словам (legacy)
  if (imageReferences.length > 0) {
    const keywordMatch = imageReferences.sort(
      (a, b) => b.relevance - a.relevance,
    )[0];
    if (keywordMatch?.relevance && keywordMatch.relevance > bestScore) {
      bestMatch = keywordMatch?.image;
      bestScore = keywordMatch.relevance;
      bestReasoning = `Поиск по ключевым словам: ${keywordMatch?.reasoning || ''}`;
      bestSource = 'keywords';
    }
  }

  // Приоритет 5: Семантический поиск по загруженным изображениям (fallback)
  if (!bestMatch) {
    console.log(
      '🎬 analyzeVideoContext: No explicit references found, trying semantic search on user images',
    );
    const fallbackSemanticMatch = await findUserImageBySemanticContent(
      messageLower,
      userImages,
    );

    if (fallbackSemanticMatch) {
      bestMatch = fallbackSemanticMatch;
      bestScore = 0.5; // Средний приоритет для fallback
      bestReasoning = `Fallback семантический поиск среди загруженных пользователем изображений`;
      bestSource = 'fallback_semantic';
    }
  }

  // 7. FALLBACK ПОИСК если основные системы не дали результата
  if (!bestMatch) {
    console.log(
      '🎬 analyzeVideoContext: No match found with main systems, trying fallback methods',
    );

    // Fallback 1: Поиск по ключевым словам
    const keywordMatch = findUserImageByKeywords(messageLower, userImages);
    if (keywordMatch) {
      bestMatch = keywordMatch;
      bestScore = 0.4;
      bestReasoning = `Fallback поиск по ключевым словам: ${keywordMatch.reasoning}`;
      bestSource = 'fallback_keywords';
    }

    // Fallback 2: Эвристики для видео
    if (!bestMatch) {
      const heuristicMatch = findUserImageByVideoHeuristics(
        messageLower,
        userImages,
      );
      if (heuristicMatch) {
        bestMatch = heuristicMatch.image;
        bestScore = 0.3;
        bestReasoning = `Fallback эвристики для видео: ${heuristicMatch.reasoning}`;
        bestSource = 'fallback_heuristics';
      }
    }

    // Fallback 3: Последнее загруженное изображение
    if (!bestMatch && userImages.length > 0) {
      bestMatch = userImages[userImages.length - 1];
      bestScore = 0.2;
      bestReasoning =
        'Fallback: последнее загруженное пользователем изображение';
      bestSource = 'fallback_last';
    }
  }

  // 8. ФОРМИРУЕМ РЕЗУЛЬТАТ с метаданными
  if (bestMatch) {
    const confidence =
      bestScore > 0.7 ? 'high' : bestScore > 0.4 ? 'medium' : 'low';

    const result = {
      sourceImageUrl: bestMatch.url,
      sourceImageId: bestMatch.id,
      confidence: confidence as 'high' | 'medium' | 'low',
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

    console.log('🎬 analyzeVideoContext: Final result:', {
      sourceImageUrl: result.sourceImageUrl,
      confidence: result.confidence,
      reasoning: result.reasoning,
      metadata: result.metadata,
    });

    // 9. СОХРАНЯЕМ В КЭШ
    if (
      chatId &&
      true // CacheUtils.shouldUseCache(userMessage, currentMessageAttachments)
    ) {
      const messageHash = generateMessageHash(
        userMessage,
        currentMessageAttachments,
      );
      await contextCache.setCachedContext(chatId, messageHash, 'video', {
        sourceUrl: result.sourceImageUrl,
        ...(result.sourceImageId && { sourceId: result.sourceImageId }),
        mediaType: 'video' as const,
        confidence: result.confidence,
        reasoning: result.reasoning,
        ...(result.metadata && { metadata: result.metadata }),
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
            url: result.sourceImageUrl || '',
            ...(result.sourceImageId && { id: result.sourceImageId }),
            role: 'user' as const,
            timestamp: new Date(),
            messageIndex: 0,
            mediaType: 'image' as const,
          },
          userImages.map((img) => ({
            ...img,
            mediaType: 'image' as const,
          })),
          bestScore,
          bestReasoning,
        );
        console.log('🧠 VideoContext: Recorded user choice for learning');
      } catch (error) {
        console.warn('🧠 VideoContext: Failed to record user choice:', error);
      }
    }

    return {
      sourceImageUrl: result?.sourceImageUrl || '',
      ...(result?.sourceImageId && { sourceImageId: result.sourceImageId }),
      confidence: result?.confidence || 'medium',
      reasoning: result?.reasoning || '',
      ...(result?.metadata && { metadata: result.metadata }),
    };
  }

  // 11. FALLBACK: если ничего не найдено, возвращаем последнее изображение
  console.log(
    '🎬 analyzeVideoContext: No matches found, using last user image as fallback',
  );
  const lastUserImage = userImages[userImages.length - 1];

  const fallbackResult = {
    sourceImageUrl: lastUserImage?.url || '',
    ...(lastUserImage?.id && { sourceImageId: lastUserImage.id }),
    confidence: 'low' as const,
    reasoning: `Fallback: используется последнее загруженное пользователем изображение для image-to-video`,
    metadata: {
      source: 'fallback_last',
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

  console.log('🎬 analyzeVideoContext: Fallback result:', fallbackResult);
  return fallbackResult;
}

/**
 * Анализирует текст сообщения на предмет ссылок на изображения для видео-контекста
 */
async function analyzeVideoImageReferences(
  messageLower: string,
  userImages: ChatImage[],
): Promise<Array<{ image: ChatImage; relevance: number; reasoning: string }>> {
  console.log(
    '🎬 analyzeVideoImageReferences: Starting pattern matching for:',
    messageLower,
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
      description: 'Прямая ссылка на изображение',
    },
    {
      pattern:
        /(загруженн[а-я]+|загруж[а-я]+)\s+(изображение|картинк[а-я]+|фото)/i,
      weight: 0.8,
      description: 'Ссылка на загруженное изображение',
    },
    {
      pattern: /(мое|мо[её])\s+(изображение|картинк[а-я]+|фото)/i,
      weight: 0.8,
      description: 'Ссылка на свое изображение',
    },
    {
      pattern:
        /(последн[а-я]+|предыдущ[а-я]+)\s+(загруженн[а-я]+|загруж[а-я]+)\s+(изображение|картинк[а-я]+|фото)/i,
      weight: 0.7,
      description: 'Ссылка на последнее/предыдущее загруженное изображение',
    },
    {
      pattern:
        /(перв[а-я]+|втор[а-я]+|треть[а-я]+)\s+(загруженн[а-я]+|загруж[а-я]+)\s+(изображение|картинк[а-я]+|фото)/i,
      weight: 0.7,
      description: 'Ссылка на загруженное изображение по порядку',
    },
    // Паттерны для поиска по содержимому
    {
      pattern:
        /(фото|картинк[а-я]+|изображение)\s+с\s+(мальчик|парень|человек|люди|мужчина)/i,
      weight: 0.8,
      description: 'Ссылка на фото с мальчиком/парнем',
    },
    {
      pattern:
        /(фото|картинк[а-я]+|изображение)\s+с\s+(девочка|женщина|девушка)/i,
      weight: 0.8,
      description: 'Ссылка на фото с девочкой/женщиной',
    },
    {
      pattern: /(фото|картинк[а-я]+|изображение)\s+с\s+(медведь|bear)/i,
      weight: 0.8,
      description: 'Ссылка на фото с медведем',
    },
    {
      pattern: /(фото|картинк[а-я]+|изображение)\s+с\s+(солнце|sun|луна|moon)/i,
      weight: 0.8,
      description: 'Ссылка на фото с солнцем/луной',
    },
    // Английские паттерны
    {
      pattern: /(this|this\s+image|this\s+picture|this\s+photo)/i,
      weight: 0.9,
      description: 'Direct reference to image',
    },
    {
      pattern: /(uploaded|my)\s+(image|picture|photo)/i,
      weight: 0.8,
      description: 'Reference to uploaded image',
    },
    {
      pattern: /(last|previous)\s+(uploaded|my)\s+(image|picture|photo)/i,
      weight: 0.7,
      description: 'Reference to last/previous uploaded image',
    },
    {
      pattern: /(first|second|third)\s+(uploaded|my)\s+(image|picture|photo)/i,
      weight: 0.7,
      description: 'Reference to uploaded image by order',
    },
    // Английские паттерны для поиска по содержимому
    {
      pattern: /(photo|picture|image)\s+with\s+(boy|man|people|person)/i,
      weight: 0.8,
      description: 'Reference to photo with boy/man',
    },
    {
      pattern: /(photo|picture|image)\s+with\s+(girl|woman|lady)/i,
      weight: 0.8,
      description: 'Reference to photo with girl/woman',
    },
    {
      pattern: /(photo|picture|image)\s+with\s+(bear|sun|moon)/i,
      weight: 0.8,
      description: 'Reference to photo with bear/sun/moon',
    },
    {
      pattern: /(take|use)\s+(photo|picture|image)\s+with\s+(.+)/i,
      weight: 0.7,
      description: 'Take/use photo with specific content',
    },
  ];

  // Проверяем паттерны
  for (const { pattern, weight, description } of userImagePatterns) {
    if (pattern.test(messageLower)) {
      console.log(
        `🎬 analyzeVideoImageReferences: Pattern matched: ${description}`,
      );

      // Определяем какое изображение выбрать
      let targetImage: ChatImage | null | undefined = null;
      let reasoning = description;

      if (messageLower.includes('последн') || messageLower.includes('last')) {
        targetImage = userImages[userImages.length - 1] || undefined;
        reasoning += ' - последнее загруженное изображение';
      } else if (
        messageLower.includes('предыдущ') ||
        messageLower.includes('previous')
      ) {
        targetImage =
          userImages[userImages.length - 2] ||
          userImages[userImages.length - 1] ||
          undefined;
        reasoning += ' - предыдущее загруженное изображение';
      } else if (
        messageLower.includes('перв') ||
        messageLower.includes('first')
      ) {
        targetImage = userImages[0] || undefined;
        reasoning += ' - первое загруженное изображение';
      } else if (
        messageLower.includes('втор') ||
        messageLower.includes('second')
      ) {
        targetImage = userImages[1] || undefined;
        reasoning += ' - второе загруженное изображение';
      } else if (
        messageLower.includes('треть') ||
        messageLower.includes('third')
      ) {
        targetImage = userImages[2] || undefined;
        reasoning += ' - третье загруженное изображение';
      } else {
        // По умолчанию берем последнее загруженное изображение
        targetImage = userImages[userImages.length - 1] || undefined;
        reasoning += ' - последнее загруженное изображение';
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
  userImages: ChatImage[],
): Promise<ChatImage | null> {
  console.log(
    '🎬 findUserImageBySemanticContent: Starting semantic search for user images',
    {
      message: messageLower,
      userImagesCount: userImages.length,
    },
  );

  try {
    // Сначала пробуем новый семантический индекс
    const semanticResults = semanticIndex.search(messageLower, userImages);

    if (
      semanticResults.length > 0 &&
      semanticResults[0]?.relevanceScore &&
      semanticResults[0].relevanceScore > 0.3
    ) {
      const bestMatch = semanticResults[0] || undefined;
      console.log(
        '🎬 findUserImageBySemanticContent: Found semantic index match:',
        {
          url: bestMatch?.image?.url,
          score: `${Math.round((bestMatch?.relevanceScore || 0) * 100)}%`,
          reasoning: bestMatch?.reasoning,
          matchedKeywords: bestMatch?.matchedKeywords,
        },
      );
      return bestMatch?.image || null;
    }

    console.log('🎬 findUserImageBySemanticContent: No semantic matches found');
    return null;
  } catch (error) {
    console.warn(
      '🎬 findUserImageBySemanticContent: Semantic search failed:',
      error,
    );
    return null;
  }
}

/**
 * Извлекает ключевые слова из сообщения пользователя
 */
function extractKeywords(message: string): string[] {
  // Убираем стоп-слова и извлекаем значимые слова
  const stopWords = new Set([
    'the',
    'a',
    'an',
    'and',
    'or',
    'but',
    'in',
    'on',
    'at',
    'to',
    'for',
    'of',
    'with',
    'by',
    'из',
    'в',
    'на',
    'с',
    'для',
    'от',
    'до',
    'при',
    'под',
    'над',
    'между',
    'через',
    'без',
    'кроме',
    'вместо',
    'вокруг',
    'около',
    'возле',
    'близ',
    'далеко',
    'близко',
    'здесь',
    'там',
    'где',
    'куда',
    'откуда',
    'когда',
    'как',
    'что',
    'кто',
    'какой',
    'чей',
    'который',
    'это',
    'то',
    'такой',
    'такая',
    'такое',
    'такие',
    'весь',
    'вся',
    'всё',
    'все',
    'каждый',
    'каждая',
    'каждое',
    'каждые',
    'любой',
    'любая',
    'любое',
    'любые',
    'некоторый',
    'некоторая',
    'некоторое',
    'некоторые',
    'один',
    'одна',
    'одно',
    'одни',
    'два',
    'две',
    'три',
    'четыре',
    'пять',
    'много',
    'мало',
    'больше',
    'меньше',
    'большой',
    'маленький',
    'хороший',
    'плохой',
    'новый',
    'старый',
    'молодой',
    'красивый',
    'уродливый',
    'быстрый',
    'медленный',
    'легкий',
    'тяжелый',
    'горячий',
    'холодный',
    'теплый',
    'прохладный',
    'сухой',
    'мокрый',
    'чистый',
    'грязный',
    'яркий',
    'темный',
    'светлый',
    'высокий',
    'низкий',
    'длинный',
    'короткий',
    'широкий',
    'узкий',
    'толстый',
    'тонкий',
    'толстый',
    'жирный',
    'худой',
    'сильный',
    'слабый',
    'здоровый',
    'больной',
    'веселый',
    'грустный',
    'счастливый',
    'несчастный',
    'довольный',
    'недовольный',
    'спокойный',
    'беспокойный',
    'уверенный',
    'неуверенный',
    'смелый',
    'трусливый',
    'честный',
    'лживый',
    'добрый',
    'злой',
    'умный',
    'глупый',
    'красивый',
    'уродливый',
    'интересный',
    'скучный',
    'важный',
    'неважный',
    'нужный',
    'ненужный',
    'возможный',
    'невозможный',
    'легкий',
    'трудный',
    'простой',
    'сложный',
    'обычный',
    'необычный',
    'нормальный',
    'ненормальный',
    'правильный',
    'неправильный',
    'хорошо',
    'плохо',
    'да',
    'нет',
    'может',
    'нельзя',
    'нужно',
    'не нужно',
    'можно',
    'нельзя',
    'хочу',
    'не хочу',
    'люблю',
    'не люблю',
    'знаю',
    'не знаю',
    'понимаю',
    'не понимаю',
    'помню',
    'не помню',
    'вижу',
    'не вижу',
    'слышу',
    'не слышу',
    'чувствую',
    'не чувствую',
    'думаю',
    'не думаю',
    'говорю',
    'не говорю',
    'делаю',
    'не делаю',
    'иду',
    'не иду',
    'еду',
    'не еду',
    'летаю',
    'не летаю',
    'плаваю',
    'не плаваю',
    'бегаю',
    'не бегаю',
    'прыгаю',
    'не прыгаю',
    'стою',
    'не стою',
    'сижу',
    'не сижу',
    'лежу',
    'не лежу',
    'сплю',
    'не сплю',
    'ем',
    'не ем',
    'пью',
    'не пью',
    'читаю',
    'не читаю',
    'пишу',
    'не пишу',
    'рисую',
    'не рисую',
    'пою',
    'не пою',
    'танцую',
    'не танцую',
    'играю',
    'не играю',
    'работаю',
    'не работаю',
    'учусь',
    'не учусь',
    'отдыхаю',
    'не отдыхаю',
    'гуляю',
    'не гуляю',
    'путешествую',
    'не путешествую',
    'живу',
    'не живу',
    'умираю',
    'не умираю',
    'рождаюсь',
    'не рождаюсь',
    'взрослею',
    'не взрослею',
    'старею',
    'не старею',
    'болею',
    'не болею',
    'выздоравливаю',
    'не выздоравливаю',
    'лечусь',
    'не лечусь',
    'лечу',
    'не лечу',
    'помогаю',
    'не помогаю',
    'мешаю',
    'не мешаю',
    'спасаю',
    'не спасаю',
    'убиваю',
    'не убиваю',
    'строю',
    'не строю',
    'разрушаю',
    'не разрушаю',
    'создаю',
    'не создаю',
    'уничтожаю',
    'не уничтожаю',
    'покупаю',
    'не покупаю',
    'продаю',
    'не продаю',
    'даю',
    'не даю',
    'беру',
    'не беру',
    'отдаю',
    'не отдаю',
    'получаю',
    'не получаю',
    'теряю',
    'не теряю',
    'находжу',
    'не нахожу',
    'ищу',
    'не ищу',
    'скрываю',
    'не скрываю',
    'показываю',
    'не показываю',
    'открываю',
    'не открываю',
    'закрываю',
    'не закрываю',
    'включаю',
    'не включаю',
    'выключаю',
    'не выключаю',
    'зажигаю',
    'не зажигаю',
    'тушу',
    'не тушу',
    'начинаю',
    'не начинаю',
    'заканчиваю',
    'не заканчиваю',
    'продолжаю',
    'не продолжаю',
    'останавливаю',
    'не останавливаю',
    'меняю',
    'не меняю',
    'сохраняю',
    'не сохраняю',
    'удаляю',
    'не удаляю',
    'добавляю',
    'не добавляю',
    'убираю',
    'не убираю',
    'ставлю',
    'не ставлю',
    'кладу',
    'не кладу',
    'вешаю',
    'не вешаю',
    'снимаю',
    'не снимаю',
    'поднимаю',
    'не поднимаю',
    'опускаю',
    'не опускаю',
    'поднимаюсь',
    'не поднимаюсь',
    'опускаюсь',
    'не опускаюсь',
    'вхожу',
    'не вхожу',
    'выхожу',
    'не выхожу',
    'прихожу',
    'не прихожу',
    'ухожу',
    'не ухожу',
    'возвращаюсь',
    'не возвращаюсь',
    'остаюсь',
    'не остаюсь',
    'уезжаю',
    'не уезжаю',
    'приезжаю',
    'не приезжаю',
    'летаю',
    'не летаю',
    'прилетаю',
    'не прилетаю',
    'улетаю',
    'не улетаю',
    'плыву',
    'не плыву',
    'приплываю',
    'не приплываю',
    'уплываю',
    'не уплываю',
    'бегаю',
    'не бегаю',
    'прибегаю',
    'не прибегаю',
    'убегаю',
    'не убегаю',
    'прыгаю',
    'не прыгаю',
    'припрыгиваю',
    'не припрыгиваю',
    'упрыгиваю',
    'не упрыгиваю',
    'ползу',
    'не ползу',
    'приползаю',
    'не приползаю',
    'уползаю',
    'не уползаю',
    'катаюсь',
    'не катаюсь',
    'прикатываюсь',
    'не прикатываюсь',
    'укатываюсь',
    'не укатываюсь',
    'качаюсь',
    'не качаюсь',
    'прикачиваюсь',
    'не прикачиваюсь',
    'укачиваюсь',
    'не укачиваюсь',
    'верчусь',
    'не верчусь',
    'приворачиваюсь',
    'не приворачиваюсь',
    'уворачиваюсь',
    'не уворачиваюсь',
    'кручусь',
    'не кручусь',
    'прикручиваюсь',
    'не прикручиваюсь',
    'укручиваюсь',
    'не укручиваюсь',
    'трясусь',
    'не трясусь',
    'притряхиваюсь',
    'не притряхиваюсь',
    'утряхиваюсь',
    'не утряхиваюсь',
    'дрожу',
    'не дрожу',
    'придроживаю',
    'не придроживаю',
    'удроживаю',
    'не удроживаю',
    'трясу',
    'не трясу',
    'притряхиваю',
    'не притряхиваю',
    'утряхиваю',
    'не утряхиваю',
    'качаю',
    'не качаю',
    'прикачиваю',
    'не прикачиваю',
    'укачиваю',
    'не укачиваю',
    'верчу',
    'не верчу',
    'приворачиваю',
    'не приворачиваю',
    'уворачиваю',
    'не уворачиваю',
    'кручу',
    'не кручу',
    'прикручиваю',
    'не прикручиваю',
    'укручиваю',
    'не укручиваю',
  ]);

  return message
    .toLowerCase()
    .split(/\s+/)
    .filter((word) => word.length > 2 && !stopWords.has(word))
    .filter((word) => /^[а-яёa-z]+$/.test(word)) // Только буквы
    .slice(0, 10); // Максимум 10 ключевых слов
}

/**
 * Поиск изображения по ключевым словам в сообщении
 */
function findUserImageByKeywords(
  messageLower: string,
  userImages: ChatImage[],
): { url: string; id?: string; reasoning: string } | null {
  console.log(
    '🎬 findUserImageByKeywords: Starting keyword-based search for:',
    messageLower,
  );

  // Извлекаем ключевые слова из сообщения
  const keywords = extractKeywords(messageLower);
  console.log(
    `🎬 findUserImageByKeywords: Keywords from "${messageLower}":`,
    keywords,
  );

  if (keywords.length === 0) {
    console.log(
      `🎬 findUserImageByKeywords: No keywords extracted from message`,
    );
    return null;
  }

  // Ищем изображения по содержимому промптов
  let bestMatch = null;
  let bestRelevance = 0;
  let bestReasoning = '';

  for (const image of userImages) {
    // Проверяем промпт изображения на наличие ключевых слов
    const imagePrompt = image.prompt || '';
    const imagePromptLower = imagePrompt.toLowerCase();

    // Подсчитываем совпадения ключевых слов
    const matchedKeywords = keywords.filter((keyword) =>
      imagePromptLower.includes(keyword.toLowerCase()),
    );

    if (matchedKeywords.length > 0) {
      // Вычисляем релевантность
      const relevance = matchedKeywords.length / keywords.length;

      console.log(`🎬 findUserImageByKeywords: Image match found:`, {
        url: image.url,
        prompt: imagePrompt,
        matchedKeywords,
        relevance: `${Math.round(relevance * 100)}%`,
      });

      if (relevance > bestRelevance) {
        bestMatch = image;
        bestRelevance = relevance;
        bestReasoning = `найдены ключевые слова: ${matchedKeywords.join(', ')}`;
      }
    }
  }

  console.log(`🎬 findUserImageByKeywords: Best match:`, {
    hasMatch: !!bestMatch,
    relevance: bestRelevance,
    reasoning: bestReasoning,
    mediaUrl: bestMatch?.url,
    mediaPrompt: bestMatch?.prompt,
  });

  if (bestMatch && bestRelevance > 0.3) {
    return {
      url: bestMatch?.url || '',
      ...(bestMatch?.id && { id: bestMatch.id }),
      reasoning: bestReasoning,
    };
  }

  console.log('🎬 findUserImageByKeywords: No relevant matches found');
  return null;
}

/**
 * Эвристики для выбора изображения в видео-контексте
 */
function findUserImageByVideoHeuristics(
  messageLower: string,
  userImages: ChatImage[],
): { image: ChatImage; reasoning: string } | null {
  console.log(
    '🎬 findUserImageByVideoHeuristics: Analyzing message for video heuristics:',
    messageLower,
  );

  // Если сообщение содержит слова о создании видео из изображения
  const videoCreationWords = [
    'сделай видео',
    'создай видео',
    'сгенерируй видео',
    'сделай ролик',
    'создай ролик',
    'сгенерируй ролик',
    'оживи',
    'анимируй',
    'сделай движущимся',
    'make video',
    'create video',
    'generate video',
    'animate',
    'bring to life',
    'make it move',
  ];

  const hasVideoCreationIntent = videoCreationWords.some((word) =>
    messageLower.includes(word.toLowerCase()),
  );

  console.log(
    '🎬 findUserImageByVideoHeuristics: Has video creation intent:',
    hasVideoCreationIntent,
  );

  if (hasVideoCreationIntent) {
    console.log(
      '🎬 findUserImageByVideoHeuristics: Video creation intent detected, searching by content',
    );

    // Сначала пробуем найти по содержимому
    const contentMatch = findUserImageByKeywords(messageLower, userImages);
    if (contentMatch) {
      const matchedImage = userImages.find(
        (img) => img.url === contentMatch.url,
      );
      if (matchedImage) {
        console.log(
          '🎬 findUserImageByVideoHeuristics: Found content match:',
          matchedImage.url,
        );
        return {
          image: matchedImage || undefined,
          reasoning: `намерение создания видео + ${contentMatch?.reasoning || ''}`,
        };
      }
    }

    // Fallback: используем последнее загруженное изображение
    const lastUserImage = userImages[userImages.length - 1] || undefined;
    console.log(
      '🎬 findUserImageByVideoHeuristics: No content match, using last image:',
      lastUserImage?.url,
    );

    if (!lastUserImage) {
      return null;
    }

    return {
      image: lastUserImage,
      reasoning:
        'намерение создания видео - используется последнее загруженное изображение',
    };
  }

  return null;
}
