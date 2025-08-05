# Система обработки ошибок баланса

## Описание

Эта система предоставляет централизованную обработку ошибок баланса для всех операций, требующих кредиты. Она автоматически показывает понятные сообщения пользователям и обеспечивает единообразный опыт работы.

## Компоненты системы

### 1. `balance-error-handler.ts`

Основной файл системы, содержащий:

- `handleBalanceError()` - для обработки ошибок в артефактах (с dataStream)
- `createBalanceErrorResponse()` - для обработки ошибок в API маршрутах
- `createBalanceError()` - для создания объектов ошибок
- Локализованные сообщения на русском языке

### 2. `balance-middleware.ts`

Middleware функции для упрощения интеграции:

- `withBalanceCheck()` - полная обертка с проверкой и списанием баланса
- `checkBalanceForArtifact()` - проверка баланса для артефактов
- `checkBalanceForAPI()` - проверка баланса для API маршрутов
- `deductBalanceAfterSuccess()` - списание баланса после операции

### 3. `data-stream-handler.tsx`

Обновлен для поддержки типа "error" в dataStream и автоматического показа toast-уведомлений пользователю.

### 4. Artifact Status

Добавлен новый статус "error" для артефактов, что позволяет UI реагировать на ошибки.

## Использование

### 1. Упрощенный способ (рекомендуется)

С использованием middleware для автоматической обработки:

```typescript
import { withBalanceCheck } from "@/lib/utils/balance-middleware";

// В серверном обработчике артефакта
const result = await withBalanceCheck(
  session.user.id,
  "image-generation",
  "text-to-image",
  multipliers,
  dataStream,
  async () => {
    // Ваша логика генерации
    return await generateImageWithStrategy(...);
  },
  {
    projectId: result.projectId,
    prompt: prompt.substring(0, 100),
    timestamp: new Date().toISOString(),
  }
);

return typeof result === 'string' ? result : formatResult(result);
```

### 2. Ручной способ

#### В серверных обработчиках артефактов

```typescript
import { handleBalanceError, createBalanceError } from "@/lib/utils/balance-error-handler";

// Проверка баланса
const balanceValidation = await validateOperationBalance(...);

if (!balanceValidation.valid) {
  const balanceError = createBalanceError(balanceValidation);
  const errorContent = handleBalanceError(
    balanceError,
    dataStream,
    "text-to-image" // тип операции для локализации
  );

  return errorContent; // вместо throw Error
}
```

#### В API маршрутах

```typescript
import { createBalanceErrorResponse } from "@/lib/utils/balance-error-handler";

if (!balanceValidation.valid) {
  const errorResponse = createBalanceErrorResponse(
    balanceValidation,
    generationType
  );
  return NextResponse.json(errorResponse, { status: 402 });
}
```

### 3. Использование отдельных middleware функций

```typescript
import { checkBalanceForArtifact, deductBalanceAfterSuccess } from "@/lib/utils/balance-middleware";

// Проверка баланса
const { valid, errorContent } = await checkBalanceForArtifact(
  userId,
  "video-generation",
  "text-to-video",
  multipliers,
  dataStream
);

if (!valid) {
  return errorContent!;
}

// Ваша логика...
const result = await generateVideo(...);

// Списание баланса
await deductBalanceAfterSuccess(
  userId,
  "video-generation",
  "text-to-video",
  multipliers,
  { projectId: result.projectId }
);
```

## Поддерживаемые типы операций

Система автоматически переводит типы операций в понятные пользователю названия:

- `text-to-image` → "генерации изображения"
- `image-to-image` → "редактирования изображения"
- `text-to-video` → "генерации видео"
- `image-to-video` → "создания видео из изображения"
- `basic-script` → "генерации сценария"

## Обновленные файлы

### Artifact серверы:

- ✅ `artifacts/image/server.ts`
- ✅ `artifacts/video/server.ts`

### API маршруты:

- ✅ `app/api/generate/image/route.ts`
- ✅ `app/api/generate/video/route.ts`
- ✅ `app/api/generate/script/route.ts`

### UI компоненты:

- ✅ `components/data-stream-handler.tsx`
- ✅ `components/artifact.tsx`

## Преимущества

1. **Ранняя проверка** - баланс проверяется ДО создания артефакта
2. **Централизованность** - все ошибки баланса обрабатываются единообразно
3. **Локализация** - сообщения на русском языке с контекстом операции
4. **Пользовательский опыт** - уведомления перед началом операции
5. **Простота расширения** - легко добавить в новые эндпоинты
6. **Отсутствие exceptions** - ошибки не ломают поток выполнения
7. **Нет пустых артефактов** - артефакты не создаются при недостатке средств

## Тестирование

Для тестирования попробуйте выполнить операцию генерации с недостаточным балансом. Теперь:

- ✅ Пользователь сразу увидит понятное сообщение об ошибке
- ✅ Артефакт НЕ будет создан и открыт
- ✅ Интерфейс останется в текущем состоянии

## Архитектура проверки

**Старая схема:**

```
AI Tool → Create Artifact → Server Handler → Balance Check → Error + Toast
```

**Новая схема:**

```
AI Tool → Balance Check → Error Message (БЕЗ создания артефакта)
```

Это обеспечивает лучший пользовательский опыт, так как пользователь сразу понимает, что операция невозможна, и не видит открывающийся и тут же закрывающийся артефакт.
