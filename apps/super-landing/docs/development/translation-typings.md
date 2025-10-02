# Система типизации переводов SuperDuperAI

## Обзор

Система автоматически генерирует TypeScript типы для всех ключей переводов из словаря `en.ts`, обеспечивая полную типизацию и автодополнение при работе с переводами.

## Автоматическая генерация типов

### Команда генерации

```bash
# Из корневой директории проекта
npm run generate-translation-types

# Или из packages/shared
cd packages/shared && npm run generate-types
```

### Что происходит

1. **Парсинг словаря**: Скрипт читает `packages/shared/src/translation/dictionaries/super-landing/en.ts`
2. **Извлечение ключей**: Рекурсивно извлекает все ключи переводов (включая вложенные)
3. **Генерация типов**: Создает `SuperLandingTranslationKey` union type со всеми ключами
4. **Обновление файла**: Записывает типы в `packages/shared/src/translation/types.ts`

### Автоматическое обновление

После добавления новых ключей в словарь просто запустите команду генерации - все новые ключи автоматически появятся в типах!

## Структура типов

### Основные типы

```typescript
// Автоматически генерируется из словаря
export type SuperLandingTranslationKey = 
  | "blog.page_title"
  | "site.name"
  | "footer.pages.about"
  | "stripe_payment.generate_ai_images"
  | "stripe_payment.generate_image_desc"
  // ... и еще 314 ключей
  | "stripe_payment.failed_create_checkout";

// Базовые типы системы переводов
export type Locale = "en" | "ru" | "tr" | "es" | "hi";
export interface LocaleConfig { /* ... */ }
export interface LocaleMap { /* ... */ }
export interface Dictionary { /* ... */ }
export interface TranslationConfig { /* ... */ }
export type NestedDictionary = { /* ... */ };
```

### Типы для функций перевода

```typescript
// Строгая типизация
export type TranslationFunction = <T = string>(
  key: SuperLandingTranslationKey,
  fallback?: T
) => T;

// Гибкая типизация с поддержкой строк (для обратной совместимости)
export type FlexibleTranslationFunction = <T = string>(
  key: SuperLandingTranslationKey | string,
  fallback?: T
) => T;

// Параметры для интерполяции
export type TranslationParams = Record<string, string | number>;
```

## Использование

### Клиентские компоненты - useTranslation

```typescript
import { useTranslation } from "@/hooks/use-translation";

export function MyComponent() {
  const { t } = useTranslation("en");
  
  return (
    <div>
      {/* ✅ Автодополнение работает! */}
      <h1>{t("hero.title")}</h1>
      <p>{t("hero.description")}</p>
      
      {/* ✅ Вложенные ключи поддерживаются */}
      <p>{t("footer.pages.about")}</p>
      
      {/* ✅ Новые ключи для image variant */}
      <button>{t("stripe_payment.generate_ai_images")}</button>
      <p>{t("stripe_payment.generate_image_desc")}</p>
      
      {/* ❌ TypeScript ошибка - такого ключа нет */}
      {/* <p>{t("nonexistent.key")}</p> */}
    </div>
  );
}
```

### Типизированные функции

```typescript
import type { SuperLandingTranslationKey } from "@/types/translations";

// Функция с типизированными параметрами
export function getLocalizedMessage(
  key: SuperLandingTranslationKey,
  params?: Record<string, string | number>
) {
  // Автодополнение для key работает!
  return key;
}

// Массив с типизированными ключами
export const requiredKeys: SuperLandingTranslationKey[] = [
  "hero.title",
  "hero.description",
  "stripe_payment.generate_ai_images",
  "stripe_payment.generate_image_desc",
];

### Серверные компоненты - getTranslation

```typescript
import { getTranslation } from "@/lib/translations";
import type { Locale } from "@/config/i18n-config";

export default async function MyPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const { t } = getTranslation(locale as Locale);
  
  // ✅ Автодополнение работает и в серверных компонентах!
  return (
    <div>
      <h1>{t("hero.title")}</h1>
      <p>{t("hero.description")}</p>
      <nav>
        <a href={`/${locale}`}>{t("navbar.home")}</a>
        <a href={`/${locale}/blog`}>{t("navbar.blog")}</a>
      </nav>
    </div>
  );
}
```

**Важно**: В серверных компонентах используйте `getTranslation` вместо `useTranslation` для получения полной типизации.
```

## Преимущества

### 1. **Автодополнение**
- IDE показывает все доступные ключи переводов
- Подсказки при наборе `t("hero.` → показывает все ключи hero

### 2. **Проверка типов**
- TypeScript ошибки при использовании несуществующих ключей
- Защита от опечаток в ключах переводов

### 3. **Автоматическое обновление**
- Новые ключи автоматически добавляются в типы
- Не нужно вручную обновлять типы при изменении словаря

### 4. **Рефакторинг**
- Безопасное переименование ключей
- IDE автоматически обновляет все использования

## Миграция

### Для существующего кода

1. **Импорт типов**: Замените ручные типы на импорт из `@/types/translations`
2. **Автодополнение**: Начните использовать `t("` и увидите все доступные ключи
3. **Проверка ошибок**: Исправьте TypeScript ошибки для несуществующих ключей

### Пример миграции

```typescript
// Было (ручные типы)
type OldTranslationKey = "hero.title" | "hero.description";

// Стало (автоматические типы)
import type { SuperLandingTranslationKey } from "@/types/translations";
// SuperLandingTranslationKey содержит ВСЕ ключи автоматически!
```

## Структура файлов

```
packages/shared/
├── scripts/
│   └── generate-translation-types.js    # Скрипт генерации
├── src/translation/
│   ├── dictionaries/super-landing/
│   │   ├── en.ts                        # Основной словарь
│   │   ├── ru.ts                        # Русский
│   │   ├── es.ts                        # Испанский
│   │   ├── tr.ts                        # Турецкий
│   │   └── hi.ts                        # Хинди
│   └── types.ts                         # Автоматически генерируемые типы

apps/super-landing/
├── src/types/
│   └── translations.ts                   # Реэкспорт типов
└── docs/
    └── translation-typings.md            # Эта документация
```

## Команды

```bash
# Генерация типов
npm run generate-translation-types

# Проверка типов в super-landing
cd apps/super-landing && npx tsc --noEmit

# Сборка проекта
npm run build
```

## Troubleshooting

### Ошибка "Cannot find name 'SuperLandingTranslationKey'"

1. Убедитесь, что типы сгенерированы: `npm run generate-translation-types`
2. Проверьте импорт: `import type { SuperLandingTranslationKey } from "@/types/translations"`
3. Убедитесь, что `packages/shared` правильно экспортирует типы

### Типы не обновляются

1. Запустите генерацию заново: `npm run generate-translation-types`
2. Проверьте, что изменения в `en.ts` сохранены
3. Убедитесь, что скрипт может прочитать файл словаря

### Проблемы с автодополнением

1. Перезапустите TypeScript сервер в IDE
2. Проверьте, что `tsconfig.json` правильно настроен
3. Убедитесь, что пути к типам корректны

## Заключение

Новая система автоматической генерации типов обеспечивает:

- **Полную типизацию** всех ключей переводов
- **Автодополнение** в IDE
- **Проверку типов** на этапе компиляции
- **Автоматическое обновление** при изменении словаря
- **Нулевые затраты** на поддержку типов

Просто добавляйте новые ключи в словарь и запускайте `npm run generate-translation-types` - все остальное происходит автоматически!
