/**
 * Анализатор контекста для изображений
 * Расширяет базовую функциональность для работы с изображениями
 */

import {
  BaseContextAnalyzer,
  type MediaType,
  type ChatMedia,
  type ReferencePattern,
} from "./universal-context";

export class ImageContextAnalyzer extends BaseContextAnalyzer {
  mediaType: MediaType = "image";

  getReferencePatterns(): ReferencePattern[] {
    return [
      // Русские паттерны
      {
        pattern: /(это|эта|этот)\s+(изображение|картинка|фото|рисунок)/,
        weight: 0.9,
        description: "Прямая ссылка на изображение",
        targetResolver: (message, media) => media[media.length - 1] || null,
      },
      {
        pattern:
          /(сгенерированн[а-я]+|созданн[а-я]+)\s+(изображение|картинка|фото)/,
        weight: 0.8,
        description: "Ссылка на сгенерированное изображение",
        targetResolver: (message, media) => {
          const generated = media.filter((m) => m.role === "assistant");
          return generated[generated.length - 1] || null;
        },
      },
      {
        pattern: /(последн[а-я]+|предыдущ[а-я]+)\s+(изображение|картинка|фото)/,
        weight: 0.7,
        description: "Ссылка на последнее/предыдущее изображение",
        targetResolver: (message, media) => {
          if (message.includes("предыдущ")) {
            return media[media.length - 2] || null;
          }
          return media[media.length - 1] || null;
        },
      },
      {
        pattern:
          /(перв[а-я]+|втор[а-я]+|треть[а-я]+)\s+(изображение|картинка|фото)/,
        weight: 0.6,
        description: "Ссылка на изображение по порядку",
        targetResolver: (message, media) => {
          if (message.includes("перв")) return media[0] || null;
          if (message.includes("втор")) return media[1] || null;
          if (message.includes("треть")) return media[2] || null;
          return null;
        },
      },
      {
        pattern: /(загруженн[а-я]+|загруж[а-я]+)\s+(изображение|картинка|фото)/,
        weight: 0.7,
        description: "Ссылка на загруженное изображение",
        targetResolver: (message, media) => {
          const uploaded = media.filter((m) => m.role === "user");
          return uploaded[uploaded.length - 1] || null;
        },
      },
      {
        pattern: /(на\s+этом\s+изображении|в\s+этой\s+картинке)/,
        weight: 0.9,
        description: "Ссылка на текущее изображение",
        targetResolver: (message, media) => media[media.length - 1] || null,
      },
      {
        pattern:
          /(измени|исправь|подправь|сделай)\s+(это\s+изображение|эту\s+картинку)/,
        weight: 0.9,
        description: "Команда изменения изображения",
        targetResolver: (message, media) => media[media.length - 1] || null,
      },
      {
        pattern:
          /(сделай\s+глаза\s+голубыми|измени\s+цвет|подправь\s+фон|добавь\s+крылья)/,
        weight: 0.8,
        description: "Конкретные изменения изображения",
        targetResolver: (message, media) => media[media.length - 1] || null,
      },

      // Английские паттерны
      {
        pattern: /(this|that)\s+(image|picture|photo|drawing)/,
        weight: 0.9,
        description: "Direct reference to image",
        targetResolver: (message, media) => media[media.length - 1] || null,
      },
      {
        pattern: /(generated|created)\s+(image|picture|photo)/,
        weight: 0.8,
        description: "Reference to generated image",
        targetResolver: (message, media) => {
          const generated = media.filter((m) => m.role === "assistant");
          return generated[generated.length - 1] || null;
        },
      },
      {
        pattern: /(last|previous|recent)\s+(image|picture|photo)/,
        weight: 0.7,
        description: "Reference to last/previous image",
        targetResolver: (message, media) => {
          if (message.includes("previous")) {
            return media[media.length - 2] || null;
          }
          return media[media.length - 1] || null;
        },
      },
      {
        pattern: /(first|second|third)\s+(image|picture|photo)/,
        weight: 0.6,
        description: "Reference to image by order",
        targetResolver: (message, media) => {
          if (message.includes("first")) return media[0] || null;
          if (message.includes("second")) return media[1] || null;
          if (message.includes("third")) return media[2] || null;
          return null;
        },
      },
      {
        pattern: /(uploaded|upload)\s+(image|picture|photo)/,
        weight: 0.7,
        description: "Reference to uploaded image",
        targetResolver: (message, media) => {
          const uploaded = media.filter((m) => m.role === "user");
          return uploaded[uploaded.length - 1] || null;
        },
      },
      {
        pattern: /(on\s+this\s+image|in\s+this\s+picture)/,
        weight: 0.9,
        description: "Reference to current image",
        targetResolver: (message, media) => media[media.length - 1] || null,
      },
      {
        pattern: /(change|fix|edit|modify)\s+(this\s+image|this\s+picture)/,
        weight: 0.9,
        description: "Command to change image",
        targetResolver: (message, media) => media[media.length - 1] || null,
      },
      {
        pattern:
          /(make\s+eyes\s+blue|change\s+color|fix\s+background|add\s+wings)/,
        weight: 0.8,
        description: "Specific image modifications",
        targetResolver: (message, media) => media[media.length - 1] || null,
      },

      // Семантические паттерны для поиска по содержимому (русские)
      {
        pattern:
          /(картинк[а-я]+\s+с\s+луной|изображение\s+с\s+луной|фото\s+с\s+луной)/,
        weight: 0.9,
        description: "Поиск изображения с луной",
        targetResolver: (message, media) =>
          this.findImageByContent(media, ["луна", "moon", "лунный", "lunar"]),
      },
      {
        pattern:
          /(картинк[а-я]+\s+с\s+самолетом|изображение\s+с\s+самолетом|фото\s+с\s+самолетом)/,
        weight: 0.9,
        description: "Поиск изображения с самолетом",
        targetResolver: (message, media) =>
          this.findImageByContent(media, [
            "самолет",
            "airplane",
            "plane",
            "авиация",
            "aviation",
          ]),
      },
      {
        pattern:
          /(картинк[а-я]+\s+с\s+девочкой|изображение\s+с\s+девочкой|фото\s+с\s+девочкой)/,
        weight: 0.9,
        description: "Поиск изображения с девочкой",
        targetResolver: (message, media) =>
          this.findImageByContent(media, [
            "девочка",
            "girl",
            "девушка",
            "woman",
            "женщина",
          ]),
      },
      {
        pattern:
          /(картинк[а-я]+\s+с\s+мальчиком|изображение\s+с\s+мальчиком|фото\s+с\s+мальчиком)/,
        weight: 0.9,
        description: "Поиск изображения с мальчиком",
        targetResolver: (message, media) =>
          this.findImageByContent(media, [
            "мальчик",
            "boy",
            "парень",
            "man",
            "мужчина",
          ]),
      },
      {
        pattern:
          /(картинк[а-я]+\s+с\s+собакой|изображение\s+с\s+собакой|фото\s+с\s+собакой)/,
        weight: 0.9,
        description: "Поиск изображения с собакой",
        targetResolver: (message, media) =>
          this.findImageByContent(media, [
            "собака",
            "dog",
            "пес",
            "пёс",
            "собачка",
          ]),
      },
      {
        pattern:
          /(картинк[а-я]+\s+с\s+кошкой|изображение\s+с\s+кошкой|фото\s+с\s+кошкой)/,
        weight: 0.9,
        description: "Поиск изображения с кошкой",
        targetResolver: (message, media) =>
          this.findImageByContent(media, [
            "кошка",
            "cat",
            "кот",
            "котик",
            "котенок",
          ]),
      },
      {
        pattern:
          /(картинк[а-я]+\s+с\s+машиной|изображение\s+с\s+машиной|фото\s+с\s+машиной)/,
        weight: 0.9,
        description: "Поиск изображения с машиной",
        targetResolver: (message, media) =>
          this.findImageByContent(media, [
            "машина",
            "car",
            "автомобиль",
            "авто",
            "vehicle",
          ]),
      },
      {
        pattern:
          /(картинк[а-я]+\s+с\s+домом|изображение\s+с\s+домом|фото\s+с\s+домом)/,
        weight: 0.9,
        description: "Поиск изображения с домом",
        targetResolver: (message, media) =>
          this.findImageByContent(media, [
            "дом",
            "house",
            "здание",
            "building",
            "домой",
          ]),
      },
      {
        pattern:
          /(картинк[а-я]+\s+с\s+лесом|изображение\s+с\s+лесом|фото\s+с\s+лесом)/,
        weight: 0.9,
        description: "Поиск изображения с лесом",
        targetResolver: (message, media) =>
          this.findImageByContent(media, [
            "лес",
            "forest",
            "деревья",
            "trees",
            "природа",
            "nature",
          ]),
      },
      {
        pattern:
          /(картинк[а-я]+\s+с\s+морем|изображение\s+с\s+морем|фото\s+с\s+морем)/,
        weight: 0.9,
        description: "Поиск изображения с морем",
        targetResolver: (message, media) =>
          this.findImageByContent(media, [
            "море",
            "sea",
            "океан",
            "ocean",
            "вода",
            "water",
          ]),
      },

      // Семантические паттерны для поиска по содержимому (английские)
      {
        pattern: /(image|picture|photo)\s+with\s+(moon|lunar)/,
        weight: 0.9,
        description: "Search for image with moon",
        targetResolver: (message, media) =>
          this.findImageByContent(media, ["moon", "луна", "lunar", "лунный"]),
      },
      {
        pattern: /(image|picture|photo)\s+with\s+(airplane|plane)/,
        weight: 0.9,
        description: "Search for image with airplane",
        targetResolver: (message, media) =>
          this.findImageByContent(media, [
            "airplane",
            "самолет",
            "plane",
            "авиация",
            "aviation",
          ]),
      },
      {
        pattern: /(image|picture|photo)\s+with\s+(girl|woman)/,
        weight: 0.9,
        description: "Search for image with girl",
        targetResolver: (message, media) =>
          this.findImageByContent(media, [
            "girl",
            "девочка",
            "woman",
            "девушка",
            "женщина",
          ]),
      },
      {
        pattern: /(image|picture|photo)\s+with\s+(boy|man)/,
        weight: 0.9,
        description: "Search for image with boy",
        targetResolver: (message, media) =>
          this.findImageByContent(media, [
            "boy",
            "мальчик",
            "man",
            "парень",
            "мужчина",
          ]),
      },
      {
        pattern: /(image|picture|photo)\s+with\s+(dog)/,
        weight: 0.9,
        description: "Search for image with dog",
        targetResolver: (message, media) =>
          this.findImageByContent(media, [
            "dog",
            "собака",
            "пес",
            "пёс",
            "собачка",
          ]),
      },
      {
        pattern: /(image|picture|photo)\s+with\s+(cat)/,
        weight: 0.9,
        description: "Search for image with cat",
        targetResolver: (message, media) =>
          this.findImageByContent(media, [
            "cat",
            "кошка",
            "кот",
            "котик",
            "котенок",
          ]),
      },
      {
        pattern: /(image|picture|photo)\s+with\s+(car|vehicle)/,
        weight: 0.9,
        description: "Search for image with car",
        targetResolver: (message, media) =>
          this.findImageByContent(media, [
            "car",
            "машина",
            "автомобиль",
            "авто",
            "vehicle",
          ]),
      },
      {
        pattern: /(image|picture|photo)\s+with\s+(house|building)/,
        weight: 0.9,
        description: "Search for image with house",
        targetResolver: (message, media) =>
          this.findImageByContent(media, [
            "house",
            "дом",
            "building",
            "здание",
            "домой",
          ]),
      },
      {
        pattern: /(image|picture|photo)\s+with\s+(forest|trees)/,
        weight: 0.9,
        description: "Search for image with forest",
        targetResolver: (message, media) =>
          this.findImageByContent(media, [
            "forest",
            "лес",
            "trees",
            "деревья",
            "nature",
            "природа",
          ]),
      },
      {
        pattern: /(image|picture|photo)\s+with\s+(sea|ocean)/,
        weight: 0.9,
        description: "Search for image with sea",
        targetResolver: (message, media) =>
          this.findImageByContent(media, [
            "sea",
            "море",
            "ocean",
            "океан",
            "water",
            "вода",
          ]),
      },

      // Универсальные семантические паттерны
      {
        pattern:
          /(картинк[а-я]+\s+где\s+есть|изображение\s+где\s+есть|фото\s+где\s+есть)/,
        weight: 0.8,
        description: "Универсальный поиск по содержимому",
        targetResolver: (message, media) =>
          this.findImageByUniversalContent(message, media),
      },
      {
        pattern: /(image|picture|photo)\s+that\s+(has|contains|shows)/,
        weight: 0.8,
        description: "Universal content search",
        targetResolver: (message, media) =>
          this.findImageByUniversalContent(message, media),
      },
    ];
  }

  extractMediaFromMessage(attachment: any): ChatMedia[] {
    if (!this.isValidMediaAttachment(attachment)) {
      return [];
    }

    // Извлекаем fileId и prompt из имени вложения
    let extractedFileId: string | undefined;
    let displayPrompt = attachment.name || "";

    const fileIdRegex = /\[FILE_ID:([a-f0-9-]+)\]\s*(.*)/;
    const match = attachment.name?.match(fileIdRegex);

    if (match) {
      extractedFileId = match[1];
      displayPrompt = match[2].trim();
    }

    return [
      {
        url: attachment.url,
        id: extractedFileId || attachment.id,
        role: "user", // Будет переопределено в менеджере
        timestamp: new Date(), // Будет переопределено в менеджере
        prompt: displayPrompt,
        messageIndex: 0, // Будет переопределено в менеджере
        mediaType: "image",
        metadata: this.extractMetadata(attachment),
      },
    ];
  }

  protected isValidMediaAttachment(attachment: any): boolean {
    return (
      typeof attachment?.url === "string" &&
      /^https?:\/\//.test(attachment.url) &&
      String(attachment?.contentType || "").startsWith("image/")
    );
  }

  protected extractMetadata(attachment: any): Record<string, any> {
    return {
      contentType: attachment?.contentType,
      name: attachment?.name,
      size: attachment?.size,
      dimensions: attachment?.dimensions,
    };
  }

  protected getEditWords(): string[] {
    return [
      // Русские слова
      "измени",
      "исправь",
      "подправь",
      "сделай",
      "замени",
      "улучши",
      "добавь",
      "убери",
      "измени",
      "переделай",
      "отредактируй",
      "модифицируй",

      // Английские слова
      "change",
      "fix",
      "edit",
      "modify",
      "replace",
      "improve",
      "add",
      "remove",
      "redesign",
      "update",
      "adjust",
      "enhance",
    ];
  }

  /**
   * Находит изображение по содержимому (анализ промптов и имен файлов)
   */
  private findImageByContent(
    media: ChatMedia[],
    keywords: string[]
  ): ChatMedia | null {
    console.log("🔍 findImageByContent: Searching for keywords:", keywords);

    // Ищем изображения с промптами или именами файлов, содержащими ключевые слова
    const matchingImages = media.filter((img) => {
      // Проверяем промпт
      if (img.prompt) {
        const promptLower = img.prompt.toLowerCase();
        const hasKeywordInPrompt = keywords.some((keyword) =>
          promptLower.includes(keyword.toLowerCase())
        );

        if (hasKeywordInPrompt) {
          console.log(
            "🔍 findImageByContent: Found matching image by prompt:",
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
          const transliterated = this.transliterateRussian(keywordLower);
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
            "🔍 findImageByContent: Found matching image by filename:",
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

    console.log("🔍 findImageByContent: Result:", {
      totalMatches: matchingImages.length,
      selectedImage: result?.url,
      selectedPrompt: result?.prompt,
    });

    return result;
  }

  /**
   * Универсальный поиск по содержимому (извлекает ключевые слова из сообщения)
   */
  private findImageByUniversalContent(
    message: string,
    media: ChatMedia[]
  ): ChatMedia | null {
    console.log("🔍 findImageByUniversalContent: Analyzing message:", message);

    // Извлекаем ключевые слова из сообщения
    const keywords = this.extractKeywordsFromMessage(message);
    console.log(
      "🔍 findImageByUniversalContent: Extracted keywords:",
      keywords
    );

    if (keywords.length === 0) {
      console.log(
        "🔍 findImageByUniversalContent: No keywords found, returning null"
      );
      return null;
    }

    return this.findImageByContent(media, keywords);
  }

  /**
   * Преобразует русские слова в латинские (транслитерация)
   */
  private transliterateRussian(word: string): string {
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
  private extractKeywordsFromMessage(message: string): string[] {
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
    console.log(
      "🔍 extractKeywordsFromMessage: Final keywords:",
      uniqueKeywords
    );

    return uniqueKeywords;
  }
}
