# OpenAPI Authentication Architecture

## Проблема

При использовании React Query с OpenAPI клиентом SuperDuperAI возникала проблема с передачей токена авторизации. Токен `SUPERDUPERAI_TOKEN` из переменных окружения попадал в клиентский код, что небезопасно.

## Решение

Реализована архитектура с прокси API роутами, которая обеспечивает:

1. **Безопасность**: Токен авторизации остается только на сервере
2. **Прозрачность**: Клиентский код не изменяется, API остается тем же
3. **Масштабируемость**: Легко добавлять новые эндпоинты

## Архитектура

### Серверная сторона

```typescript
// lib/api/server-openapi.ts
export function initializeServerOpenAPI(): void {
  if (typeof window !== "undefined") {
    throw new Error(
      "initializeServerOpenAPI should only be called on the server"
    );
  }

  const config = getSuperduperAIConfig();

  OpenAPI.BASE = config.url;
  OpenAPI.TOKEN = config.token; // Токен только на сервере
}
```

### Прокси API роуты

```typescript
// app/api/proxy/file/route.ts
export async function GET(request: NextRequest) {
  return createProxyHandler(async () => {
    return FileService.fileGetList(params);
  });
}
```

### Клиентские хуки

```typescript
// lib/api/superduperai/file/query.ts
export const fileKeys = createQueryKeys("file", {
  list: (params: IFileListParams) => ({
    queryKey: [params],
    queryFn: async () => {
      // Вызов прокси API вместо прямого обращения к SuperDuperAI
      const response = await fetch(`/api/proxy/file?${searchParams}`);
      return response.json();
    },
  }),
});
```

## Преимущества

1. **Безопасность**: Токен никогда не попадает в клиентский код
2. **Централизованная авторизация**: Все запросы проходят через серверные роуты
3. **Обработка ошибок**: Единообразная обработка ошибок на сервере
4. **Кеширование**: React Query продолжает работать как обычно
5. **Типизация**: Сохранена полная типизация TypeScript

## Использование

### Для существующих запросов

Просто используйте существующие хуки как обычно:

```typescript
const { data: files } = useFileList({
  projectId,
  sceneId,
  types: [FileTypeEnum.IMAGE, FileTypeEnum.VIDEO],
});
```

### Для новых эндпоинтов

1. Создайте прокси API роут в `app/api/proxy/`
2. Используйте `createProxyHandler` для обработки запросов
3. Создайте клиентский хук с `createClientApiCall`

## Миграция

Все существующие React Query запросы автоматически используют новую архитектуру без изменений в коде компонентов.

## Безопасность

- ✅ Токен авторизации только на сервере
- ✅ Авторизация пользователя проверяется на каждом запросе
- ✅ Обработка ошибок без утечки чувствительной информации
- ✅ Валидация входных параметров
