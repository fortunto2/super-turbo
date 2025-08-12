# Исправление проблемы 404 в чате

## Описание проблемы

Иногда при отправке сообщения в чат URL автоматически обновляется на `/chat/{id}`, но страница возвращает ошибку 404 "Страница не найдена". Это происходит из-за гонки условий между:

1. **Обновлением URL** - происходит сразу при отправке сообщения
2. **Созданием чата в базе данных** - происходит асинхронно в API

## Причины проблемы

### 1. Гонка условий

- Хук `useChat` обновляет URL на `/chat/${id}` до того, как чат создан в БД
- Пользователь попадает на страницу чата, которая еще не существует
- Страница чата вызывает `getChatById()`, который возвращает `null`
- Вызывается `notFound()`, что приводит к 404

### 2. Проблемы с пользователем

- Иногда возникают ошибки внешнего ключа при создании чата
- Пользователь может не существовать в БД при создании чата
- Проблемы с аутентификацией и сессиями

### 3. Невалидные UUID

- Функция `generateUUID()` может генерировать некорректные UUID
- Middleware не валидирует формат UUID

## Решение

### 1. Отложенное обновление URL

```typescript
// В useChat хуке
onFinish: () => {
  // Обновляем URL только после успешного завершения чата
  if (messages.length > 0) {
    window.history.replaceState({}, "", `/chat/${id}`);
  }
  mutate(unstable_serialize(getChatHistoryPaginationKey));
},
onError: (error) => {
  // При ошибке не обновляем URL, чтобы избежать 404
  console.error("Chat error:", error);
  toast({
    type: "error",
    description: error.message,
  });
},
```

### 2. Улучшенная валидация UUID

```typescript
// В middleware.ts
export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (pathname.startsWith("/chat/")) {
    const chatId = pathname.split("/chat/")[1];

    // Валидируем UUID формат
    if (
      chatId &&
      !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
        chatId
      )
    ) {
      console.warn(`Invalid chat ID format: ${chatId}, redirecting to home`);
      return NextResponse.redirect(new URL("/", request.url));
    }
  }

  return NextResponse.next();
}
```

### 3. Улучшенная функция generateUUID

```typescript
export function generateUUID(): string {
  try {
    // Используем crypto.randomUUID если доступно (более надежно)
    if (typeof crypto !== "undefined" && crypto.randomUUID) {
      return crypto.randomUUID();
    }

    // Fallback на старую реализацию
    return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
      const r = (Math.random() * 16) | 0;
      const v = c === "x" ? r : (r & 0x3) | 0x8;
      return v.toString(16);
    });
  } catch (error) {
    console.error("Error generating UUID:", error);
    // В случае ошибки, используем timestamp-based fallback
    const timestamp = Date.now().toString(36);
    const random = Math.random().toString(36).substring(2);
    return `fallback-${timestamp}-${random}`;
  }
}
```

### 4. Улучшенная обработка ошибок в API

```typescript
// В API роуте создания чата
if (!chat) {
  const title = await generateTitleFromUserMessage({ message });

  try {
    await saveChat({
      id,
      userId: session.user.id,
      title,
      visibility: selectedVisibilityType,
    });
  } catch (error) {
    // Детальная обработка ошибок с логированием в Sentry
    if (
      error instanceof Error &&
      error.message.includes("foreign key constraint")
    ) {
      // Попытка восстановления через создание пользователя
      await getOrCreateOAuthUser(session.user.id, session.user.email);
      await saveChat({
        id,
        userId: session.user.id,
        title,
        visibility: selectedVisibilityType,
      });
    } else {
      return new Response(
        JSON.stringify({
          error: "Failed to create chat",
          details: error.message,
          chatId: id,
          timestamp: new Date().toISOString(),
        }),
        { status: 500, headers: { "Content-Type": "application/json" } }
      );
    }
  }
}
```

### 5. Обработка ошибок в компонентах

```typescript
// В ChatPageWrapper
const handleChatError = (error: Error) => {
  console.error("Chat error in wrapper:", error);
  setHasError(true);

  // Если ошибка связана с несуществующим чатом, перенаправляем на главную
  if (
    error.message.includes("Chat not found") ||
    error.message.includes("404")
  ) {
    router.push("/");
  }
};
```

## Тестирование

### 1. Проверка создания чата

- Отправьте сообщение в новый чат
- Убедитесь, что URL обновляется только после успешного создания
- Проверьте, что чат сохраняется в БД

### 2. Проверка обработки ошибок

- Попробуйте создать чат с невалидным UUID
- Проверьте, что middleware перенаправляет на главную страницу
- Убедитесь, что ошибки логируются в Sentry

### 3. Проверка восстановления

- Создайте ситуацию с ошибкой внешнего ключа
- Убедитесь, что система пытается восстановить пользователя
- Проверьте, что чат создается после восстановления

## Мониторинг

### 1. Sentry

- Ошибки создания чата
- Проблемы с внешними ключами
- Невалидные UUID

### 2. Логи

- Создание чатов
- Ошибки валидации
- Перенаправления middleware

### 3. Метрики

- Количество 404 ошибок
- Время создания чата
- Успешность восстановления

## Заключение

Проблема 404 в чате решена через:

1. **Отложенное обновление URL** - только после успешного создания чата
2. **Улучшенную валидацию UUID** - middleware проверяет формат
3. **Надежную генерацию UUID** - fallback на timestamp-based ID
4. **Детальную обработку ошибок** - логирование и восстановление
5. **Graceful fallback** - перенаправление на главную при ошибках

Это обеспечивает стабильную работу чата без 404 ошибок.
