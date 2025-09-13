# Простое решение для авторизации OpenAPI

## Проблема

Нужно передавать токен `SUPERDUPERAI_TOKEN` в заголовки всех запросов к SuperDuperAI API, не создавая отдельные прокси для каждого эндпоинта.

## Решение

Создана простая архитектура с автоматическим добавлением токена:

### 1. Глобальная настройка OpenAPI (`lib/api/openapi-setup.ts`)

```typescript
export function setupOpenAPI(): void {
  if (typeof window === "undefined") {
    // На сервере - используем реальный URL и токен
    const config = getSuperduperAIConfig();
    OpenAPI.BASE = config.url;
    OpenAPI.TOKEN = config.token;
  } else {
    // На клиенте - используем прокси через API роуты
    OpenAPI.BASE = window.location.origin;
    OpenAPI.TOKEN = undefined;
  }
}
```

### 2. Перехватчик axios (`lib/api/axios-interceptor.ts`)

Автоматически перенаправляет запросы к SuperDuperAI через универсальный прокси:

```typescript
// Запросы к /api/v1/* автоматически перенаправляются на /api/proxy/*
const proxyUrl = config.url.replace(/^.*\/api\/v1\//, "/api/proxy/");
```

### 3. Универсальный прокси API (`app/api/proxy/[...path]/route.ts`)

Обрабатывает все запросы к SuperDuperAI и автоматически добавляет токен:

```typescript
const response = await fetch(fullUrl, {
  method,
  headers: {
    Authorization: `Bearer ${process.env.SUPERDUPERAI_TOKEN}`,
    "Content-Type": "application/json",
  },
  body: body ? JSON.stringify(body) : undefined,
});
```

### 4. Настройка в QueryProvider

```typescript
export const QueryProvider = ({ children }: { children: ReactNode }) => {
  useEffect(() => {
    setupOpenAPI(); // Настраиваем один раз
  }, []);
  // ...
};
```

## Преимущества

✅ **Один раз настроил - везде работает**  
✅ **Не нужно создавать прокси для каждого эндпоинта**  
✅ **Токен автоматически добавляется в заголовки**  
✅ **Работает со всеми существующими React Query хуками**  
✅ **Безопасно - токен только на сервере**

## Использование

Все существующие хуки работают без изменений:

```typescript
const { data: files } = useFileList({
  projectId,
  sceneId,
  types: [FileTypeEnum.IMAGE, FileTypeEnum.VIDEO],
});
```

## Как это работает

1. **На сервере**: OpenAPI использует реальный URL и токен напрямую
2. **На клиенте**:
   - OpenAPI использует дефолтные настройки
   - Axios interceptor перехватывает запросы к `/api/v1/*`
   - Перенаправляет их на `/api/proxy/*`
   - Прокси добавляет токен и делает запрос к SuperDuperAI

## Безопасность

- ✅ Токен `SUPERDUPERAI_TOKEN` никогда не попадает в клиентский код
- ✅ Все запросы проходят через серверный прокси с авторизацией
- ✅ Автоматическая обработка ошибок
