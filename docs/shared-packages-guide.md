# Руководство по использованию общих пакетов

Этот документ описывает, как использовать общие пакеты в турборепозитории SuperDuperAI для лучшего переиспользования компонентов и данных.

## 📦 Доступные пакеты

### `@turbo-super/ui` - UI компоненты

Содержит все переиспользуемые UI компоненты, основанные на Radix UI и Tailwind CSS.

### `@turbo-super/shared` - Утилиты и хуки

Содержит общие утилиты, функции форматирования, валидации и React хуки.

### `@turbo-super/data` - Типы и константы

Содержит общие TypeScript типы, константы и конфигурации данных.

## 🚀 Быстрый старт

### Установка зависимостей

```bash
# Установка всех зависимостей
pnpm install

# Сборка общих пакетов
pnpm build
```

### Использование в приложениях

#### UI компоненты

```typescript
// Вместо локальных импортов
import { Button } from "@/components/ui/button";

// Используйте общие пакеты
import { Button, Card, Input, Badge } from "@turbo-super/ui";
```

#### Утилиты и хуки

```typescript
// Форматирование
import { formatDate, formatFileSize, truncateText } from "@turbo-super/shared";

// Валидация
import { isValidEmail, isValidPassword } from "@turbo-super/shared";

// Хуки
import {
  useLocalStorage,
  useMediaQuery,
  useClickOutside,
} from "@turbo-super/shared";
```

#### Типы и константы

```typescript
// Типы данных
import { Artifact, User, Message } from "@turbo-super/data";

// Константы
import { AI_MODELS, STATUS, LIMITS } from "@turbo-super/data";
```

## 📋 Доступные компоненты

### UI компоненты (`@turbo-super/ui`)

#### Button

```typescript
import { Button } from "@turbo-super/ui"

// Варианты
<Button variant="default">Обычная кнопка</Button>
<Button variant="accent">Акцентная кнопка</Button>
<Button variant="outline">Контурная кнопка</Button>
<Button variant="ghost">Призрачная кнопка</Button>

// Размеры
<Button size="sm">Маленькая</Button>
<Button size="default">Обычная</Button>
<Button size="lg">Большая</Button>
<Button size="icon">Иконка</Button>
```

#### Card

```typescript
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@turbo-super/ui"

<Card>
  <CardHeader>
    <CardTitle>Заголовок карточки</CardTitle>
  </CardHeader>
  <CardContent>
    Содержимое карточки
  </CardContent>
  <CardFooter>
    Футер карточки
  </CardFooter>
</Card>
```

#### Input

```typescript
import { Input } from "@turbo-super/ui"

<Input placeholder="Введите текст" />
<Input type="email" placeholder="Email" />
<Input type="password" placeholder="Пароль" />
```

#### Badge

```typescript
import { Badge } from "@turbo-super/ui"

<Badge variant="default">Обычный</Badge>
<Badge variant="secondary">Вторичный</Badge>
<Badge variant="destructive">Ошибка</Badge>
<Badge variant="outline">Контур</Badge>
<Badge variant="accent">Акцент</Badge>
```

#### Tabs

```typescript
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@turbo-super/ui"

<Tabs defaultValue="account">
  <TabsList>
    <TabsTrigger value="account">Аккаунт</TabsTrigger>
    <TabsTrigger value="password">Пароль</TabsTrigger>
  </TabsList>
  <TabsContent value="account">
    Настройки аккаунта
  </TabsContent>
  <TabsContent value="password">
    Изменение пароля
  </TabsContent>
</Tabs>
```

## 🛠️ Доступные утилиты

### Форматирование (`@turbo-super/shared`)

#### Даты

```typescript
import {
  formatDate,
  formatDateTime,
  formatRelativeTime,
} from "@turbo-super/shared";

formatDate(new Date()); // "30 июля 2025"
formatDateTime(new Date()); // "30.07.2025, 22:30"
formatRelativeTime(new Date()); // "только что"
```

#### Числа и файлы

```typescript
import {
  formatNumber,
  formatFileSize,
  formatDuration,
} from "@turbo-super/shared";

formatNumber(1234.56); // "1 234,56"
formatFileSize(1024 * 1024); // "1 МБ"
formatDuration(125); // "2м 5с"
```

#### Текст

```typescript
import { truncateText, capitalizeFirst, slugify } from "@turbo-super/shared";

truncateText("Длинный текст", 10); // "Длинный т..."
capitalizeFirst("hello world"); // "Hello world"
slugify("Привет, мир!"); // "privet-mir"
```

### Валидация (`@turbo-super/shared`)

```typescript
import {
  isValidEmail,
  isValidPassword,
  isValidFileSize,
  validateRequired,
} from "@turbo-super/shared";

isValidEmail("user@example.com"); // true
isValidPassword("Password123"); // { isValid: true, errors: [] }
isValidFileSize(1024, 1000000); // true
validateRequired("", "Имя"); // "Имя обязателен"
```

## 🎣 Доступные хуки

### React хуки (`@turbo-super/shared`)

#### useLocalStorage

```typescript
import { useLocalStorage } from "@turbo-super/shared"

function MyComponent() {
  const [value, setValue, removeValue] = useLocalStorage("key", "default")

  return (
    <div>
      <p>Значение: {value}</p>
      <button onClick={() => setValue("новое значение")}>
        Обновить
      </button>
      <button onClick={removeValue}>
        Удалить
      </button>
    </div>
  )
}
```

#### useMediaQuery

```typescript
import { useMediaQuery, useIsMobile, useIsDesktop } from "@turbo-super/shared"

function ResponsiveComponent() {
  const isMobile = useIsMobile()
  const isDesktop = useIsDesktop()
  const isDarkMode = useMediaQuery("(prefers-color-scheme: dark)")

  return (
    <div>
      {isMobile && <MobileLayout />}
      {isDesktop && <DesktopLayout />}
      {isDarkMode && <DarkModeIndicator />}
    </div>
  )
}
```

#### useClickOutside

```typescript
import { useClickOutside } from "@turbo-super/shared"
import { useRef } from "react"

function Dropdown() {
  const ref = useRef<HTMLDivElement>(null)

  useClickOutside(ref, () => {
    // Закрыть dropdown при клике вне элемента
    console.log("Клик вне элемента")
  })

  return <div ref={ref}>Dropdown content</div>
}
```

## 📊 Доступные типы

### Типы данных (`@turbo-super/data`)

#### Артефакты

```typescript
import {
  Artifact,
  ImageArtifact,
  VideoArtifact,
  ArtifactType,
  ArtifactStatus,
} from "@turbo-super/data";

const imageArtifact: ImageArtifact = {
  id: "123",
  type: "image",
  title: "Мое изображение",
  status: "completed",
  url: "https://example.com/image.jpg",
  width: 1024,
  height: 1024,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};
```

#### API типы

```typescript
import {
  ApiResponse,
  PaginatedResponse,
  User,
  Message,
} from "@turbo-super/data";

const apiResponse: ApiResponse<User> = {
  success: true,
  data: {
    id: "123",
    email: "user@example.com",
    role: "user",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
};
```

## 🔧 Константы

### Константы (`@turbo-super/data`)

```typescript
import {
  AI_MODELS,
  STATUS,
  LIMITS,
  IMAGE_SIZES,
  ERROR_CODES,
} from "@turbo-super/data";

// Модели AI
AI_MODELS.TEXT.GPT_4; // "gpt-4"
AI_MODELS.IMAGE.DALL_E_3; // "dall-e-3"

// Статусы
STATUS.COMPLETED; // "completed"
STATUS.PROCESSING; // "processing"

// Лимиты
LIMITS.MAX_FILE_SIZE; // 104857600 (100MB)
LIMITS.MAX_MESSAGE_LENGTH; // 10000

// Размеры изображений
IMAGE_SIZES.MEDIUM; // { width: 1024, height: 1024 }
```

## 🔄 Миграция существующих приложений

### Автоматическая миграция

```bash
# Запуск скрипта миграции
node scripts/migrate-to-shared-packages.js
```

### Ручная миграция

1. **Замените импорты компонентов:**

```typescript
// Было
import { Button } from "@/components/ui/button";

// Стало
import { Button } from "@turbo-super/ui";
```

2. **Замените импорты утилит:**

```typescript
// Было
import { formatDate } from "@/lib/utils";

// Стало
import { formatDate } from "@turbo-super/shared";
```

3. **Замените импорты типов:**

```typescript
// Было
import { Artifact } from "@/types/artifact-types";

// Стало
import { Artifact } from "@turbo-super/data";
```

4. **Удалите дублированные файлы:**

```bash
# Удалите локальные копии компонентов
rm src/components/ui/button.tsx
rm src/components/ui/card.tsx
rm src/components/ui/input.tsx
# и т.д.
```

## 🧪 Тестирование

### Проверка импортов

```bash
# Проверка TypeScript
pnpm type-check

# Проверка линтера
pnpm lint

# Запуск приложений
pnpm dev
```

### Отладка проблем

1. Убедитесь, что пакеты собраны: `pnpm build`
2. Проверьте зависимости в package.json
3. Очистите кэш: `pnpm clean`
4. Переустановите зависимости: `pnpm install`

## 📝 Лучшие практики

### 1. Используйте общие пакеты

- Всегда импортируйте компоненты из `@turbo-super/ui`
- Используйте утилиты из `@turbo-super/shared`
- Применяйте типы из `@turbo-super/data`

### 2. Избегайте дублирования

- Не создавайте локальные копии компонентов
- Не дублируйте утилиты в приложениях
- Используйте общие константы

### 3. Следуйте конвенциям

- Используйте TypeScript для всех компонентов
- Добавляйте JSDoc комментарии
- Следуйте единому стилю кода

### 4. Тестируйте изменения

- Проверяйте работу после миграции
- Тестируйте на разных устройствах
- Убедитесь в совместимости

## 🆘 Поддержка

При возникновении проблем:

1. Проверьте документацию
2. Посмотрите примеры в коде
3. Создайте issue в репозитории
4. Обратитесь к команде разработки

## 📚 Дополнительные ресурсы

- [Документация Radix UI](https://www.radix-ui.com/)
- [Документация Tailwind CSS](https://tailwindcss.com/)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [React Hooks](https://react.dev/reference/react/hooks)
