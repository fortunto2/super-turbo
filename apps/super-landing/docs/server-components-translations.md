# Типизированные переводы в серверных компонентах

## Проблема

В серверных компонентах Next.js 15 нельзя использовать React хуки, включая `useTranslation`. Это приводит к ошибкам:

```typescript
// ❌ Ошибка в серверном компоненте
export default async function MyPage() {
  const { t } = useTranslation("en"); // Error: Hooks can only be called inside React function components
  return <h1>{t("hero.title")}</h1>;
}
```

## Решение

Создана функция `getTranslation` для серверных компонентов с полной типизацией:

```typescript
// ✅ Правильно для серверных компонентов
import { getTranslation } from "@/lib/translations";

export default async function MyPage() {
  const { t } = getTranslation("en");
  return <h1>{t("hero.title")}</h1>; // Автодополнение работает!
}
```

## Использование

### Импорт

```typescript
import { getTranslation } from "@/lib/translations";
import type { Locale } from "@/config/i18n-config";
```

### Получение функции перевода

```typescript
export default async function MyPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const { t } = getTranslation(locale as Locale);
  
  return (
    <div>
      <h1>{t("hero.title")}</h1>
      <p>{t("hero.description")}</p>
    </div>
  );
}
```

### Полный пример

```typescript
import { getTranslation } from "@/lib/translations";
import type { Locale } from "@/config/i18n-config";
import type { SuperLandingTranslationKey } from "@/types/translations";

interface PageProps {
  params: Promise<{ locale: string }>;
}

export default async function BlogPage({ params }: PageProps) {
  const { locale } = await params;
  const { t } = getTranslation(locale as Locale);
  
  // ✅ Автодополнение работает для всех ключей!
  const breadcrumbItems = [
    { label: t("navbar.home"), href: `/${locale}` },
    { label: t("navbar.blog"), href: `/${locale}/blog` },
  ];
  
  return (
    <div>
      <nav>
        {breadcrumbItems.map((item, index) => (
          <a key={index} href={item.href}>
            {item.label}
          </a>
        ))}
      </nav>
      
      <main>
        <h1>{t("blog.page_title")}</h1>
        <p>{t("blog.description")}</p>
      </main>
    </div>
  );
}
```

## Преимущества

### 🚀 **Полная типизация**
- Автодополнение для всех 318+ ключей переводов
- Проверка типов на этапе компиляции
- TypeScript ошибки при использовании несуществующих ключей

### 🔧 **Серверные компоненты**
- Работает в async функциях
- Поддерживает App Router
- Оптимизировано для SSR

### 💡 **Отличный DX**
- Тот же API, что и `useTranslation`
- Автодополнение в IDE
- Безопасный рефакторинг

## Различия с useTranslation

| Аспект | useTranslation | getTranslation |
|--------|----------------|----------------|
| **Тип компонента** | Клиентский | Серверный |
| **Хук** | ✅ Да | ❌ Нет |
| **Async** | ❌ Нет | ✅ Да |
| **Типизация** | ✅ Полная | ✅ Полная |
| **Автодополнение** | ✅ Да | ✅ Да |

## Структура файлов

```
apps/super-landing/
├── src/
│   ├── lib/
│   │   └── translations.ts           # getTranslation функция
│   ├── hooks/
│   │   └── use-translation.ts        # useTranslation хук
│   └── types/
│       └── translations.ts           # Типы переводов
└── docs/
    ├── server-components-translations.md  # Эта документация
    └── translation-typings.md             # Общая документация
```

## Миграция

### Из useTranslation в getTranslation

```typescript
// Было (клиентский компонент)
"use client";
import { useTranslation } from "@/hooks/use-translation";

export function MyComponent() {
  const { t } = useTranslation("en");
  return <h1>{t("hero.title")}</h1>;
}

// Стало (серверный компонент)
import { getTranslation } from "@/lib/translations";

export default async function MyPage() {
  const { t } = getTranslation("en");
  return <h1>{t("hero.title")}</h1>;
}
```

## Troubleshooting

### Ошибка "Cannot find name 't'"

1. Убедитесь, что импортировали `getTranslation`
2. Проверьте, что вызываете `getTranslation(locale)`
3. Убедитесь, что деструктурируете `{ t }`

### Нет автодополнения

1. Проверьте, что типы сгенерированы: `npm run generate-translation-types`
2. Убедитесь, что импорт типов корректный
3. Перезапустите TypeScript сервер в IDE

### Ошибки типов

1. Проверьте, что `locale` имеет правильный тип `Locale`
2. Убедитесь, что используете правильные ключи переводов
3. Запустите проверку типов: `npx tsc --noEmit`

## Заключение

Функция `getTranslation` обеспечивает **полную типизацию переводов в серверных компонентах** с теми же преимуществами, что и `useTranslation`:

- ✅ **Автодополнение** для всех ключей
- ✅ **Проверка типов** на этапе компиляции  
- ✅ **Серверные компоненты** поддержка
- ✅ **Тот же API** что и useTranslation

Теперь вы можете использовать типизированные переводы как в клиентских, так и в серверных компонентах! 🎉
