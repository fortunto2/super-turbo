# Тесты для генераторов картинок и видео в блоге

Этот набор тестов покрывает функциональность генерации картинок и видео на страницах блога в super-landing.

## Структура тестов

### 1. `blog-generators.test.ts` - Основные тесты компонентов

Тестирует основные компоненты генераторов:

- `BlogModelGenerator` - универсальный генератор моделей
- `ModelImageGenerator` - генератор изображений
- `ModelVideoGenerator` - генератор видео
- `EnhancedModelVideoGenerator` - улучшенный генератор видео с поддержкой image-to-video

**Покрытие:**

- Рендеринг компонентов с различными конфигурациями
- Обработка различных типов моделей
- Валидация отображения параметров модели
- Тестирование перенаправлений на страницы генерации

### 2. `blog-pages.test.ts` - Тесты страниц блога

Тестирует интеграцию генераторов со страницами блога:

- Генерация метаданных для SEO
- Рендеринг постов блога с генераторами
- Обработка различных локалей
- Обнаружение H1 заголовков в MDX контенте

**Покрытие:**

- Функция `generateMetadata`
- Компонент `BlogPostPage`
- Функция `checkForH1InMDX`
- Обработка fallback локалей

### 3. `blog-api-integration.test.ts` - Тесты интеграции с API

Тестирует интеграцию с API генерации:

- Перенаправления на страницы генерации
- Передача параметров модели через URL
- Обработка различных локалей
- Обработка edge cases

**Покрытие:**

- Интеграция с API генерации изображений
- Интеграция с API генерации видео
- Обработка конфигурации моделей
- Генерация URL и навигация

### 4. `blog-e2e.test.ts` - E2E тесты пользовательских сценариев

Тестирует полные пользовательские сценарии:

- Полный flow генерации изображений
- Полный flow генерации видео
- Мультилокальность
- Edge cases и обработка ошибок

**Покрытие:**

- Полные пользовательские сценарии
- Мультилокальность
- Конфигурация моделей
- Паттерны взаимодействия пользователя
- Доступность и UX

## Запуск тестов

### Установка зависимостей

```bash
cd apps/super-landing
pnpm install
```

### Запуск всех тестов

```bash
pnpm test
```

### Запуск тестов с покрытием

```bash
pnpm test --coverage
```

### Запуск конкретного файла тестов

```bash
pnpm test blog-generators.test.ts
```

### Запуск тестов в watch режиме

```bash
pnpm test --watch
```

### Запуск тестов в UI режиме

```bash
pnpm test --ui
```

## Конфигурация

### Vitest

Тесты используют Vitest как тестовый фреймворк с конфигурацией в `vitest.config.ts`:

- JSDOM environment для тестирования React компонентов
- Поддержка CSS
- Покрытие кода с помощью v8
- Алиасы для путей (@ -> src/)

### Setup файл

`setup.ts` содержит глобальные настройки для тестов:

- Моки для Next.js компонентов
- Моки для браузерных API
- Моки для Framer Motion
- Настройка environment variables

## Моки и зависимости

### Основные моки

- `@/hooks/use-translation` - хук для интернационализации
- `@/lib/models-config` - конфигурация моделей
- `next/navigation` - Next.js навигация
- `framer-motion` - анимации

### Браузерные API

- `window.location` - для тестирования перенаправлений
- `fetch` - для тестирования API вызовов
- `WebSocket` - для тестирования WebSocket соединений

## Примеры тестов

### Тест рендеринга генератора изображений

```typescript
it('should render image generator with correct model information', () => {
  render(<ModelImageGenerator {...defaultProps} />);

  expect(screen.getByText('dall_e_3')).toBeInTheDocument();
  expect(screen.getByText('1024x1024')).toBeInTheDocument();
  expect(screen.getByText('1:1')).toBeInTheDocument();
});
```

### Тест перенаправления на страницу генерации

```typescript
it("should redirect to image generation page when generate button is clicked", async () => {
  const generateButton = screen.getByRole("button", {
    name: /generate image/i,
  });
  fireEvent.click(generateButton);

  await waitFor(() => {
    expect(window.location.href).toBe(
      "http://localhost:3000/en/generate-image?model=dall_e_3"
    );
  });
});
```

### Тест обработки различных локалей

```typescript
it('should handle different locales correctly', async () => {
  render(<ModelImageGenerator {...defaultProps} locale="tr" />);

  const generateButton = screen.getByRole('button', { name: /generate image/i });
  fireEvent.click(generateButton);

  expect(window.location.href).toContain('/tr/generate-image');
});
```

## Покрытие кода

Тесты покрывают:

- ✅ Все основные компоненты генераторов
- ✅ Страницы блога и их интеграцию
- ✅ API интеграцию и навигацию
- ✅ E2E сценарии пользователя
- ✅ Обработку edge cases
- ✅ Мультилокальность
- ✅ Доступность и UX

## Добавление новых тестов

### Для новых компонентов

1. Создайте файл `component-name.test.ts`
2. Импортируйте компонент и зависимости
3. Создайте моки для внешних зависимостей
4. Напишите тесты для всех сценариев использования

### Для новых функций

1. Добавьте тесты в соответствующий файл
2. Покройте все возможные входные данные
3. Протестируйте edge cases и обработку ошибок

### Для новых API интеграций

1. Создайте моки для API вызовов
2. Протестируйте успешные и неуспешные сценарии
3. Проверьте обработку различных типов ответов

## Отладка тестов

### Логирование

```typescript
// Включите логирование для отладки
console.log("Debug info:", { component, props, state });
```

### Визуальная отладка

```bash
# Запустите тесты в UI режиме
pnpm test --ui
```

### Изоляция тестов

```typescript
// Используйте .only для запуска только одного теста
it.only("should test specific functionality", () => {
  // Тест
});
```

## Лучшие практики

1. **Изоляция тестов** - каждый тест должен быть независимым
2. **Чистые моки** - сбрасывайте моки между тестами
3. **Описательные названия** - тесты должны читаться как документация
4. **Покрытие edge cases** - тестируйте граничные случаи
5. **Асинхронность** - правильно обрабатывайте асинхронные операции
6. **Доступность** - тестируйте доступность компонентов

## Troubleshooting

### Ошибки с моками

```bash
# Очистите кэш тестов
pnpm test --clearCache
```

### Проблемы с JSDOM

```bash
# Переустановите зависимости
rm -rf node_modules pnpm-lock.yaml
pnpm install
```

### Проблемы с покрытием

```bash
# Запустите тесты с подробным выводом
pnpm test --coverage --reporter=verbose
```
