# Testing Documentation

This directory contains comprehensive tests for the Super Chatbot application, including video generation, monitoring, and admin functionality.

## 🧪 Test Files

### Monitoring Tests

#### `unit/monitoring.test.ts`

Unit tests for the simplified monitoring system.

**What it tests:**

- Health API endpoint functionality
- Metrics API endpoint functionality
- Simple monitor functions (trackApiRequest, getMetrics, getHealthStatus)
- Error handling for API calls
- Data structure validation

**Usage:**

```bash
pnpm test:unit src/tests/unit/monitoring.test.ts
```

#### `unit/admin-system-queries.test.ts`

Unit tests for admin system database queries.

**What it tests:**

- System statistics retrieval
- Database error handling
- Recent activity calculations
- System information formatting
- Balance statistics calculations

**Usage:**

```bash
pnpm test:unit src/tests/unit/admin-system-queries.test.ts
```

#### `unit/admin-components.test.tsx`

Unit tests for admin panel components.

**What it tests:**

- DatabaseInfoCard component rendering
- PerformanceMetricsCard component rendering
- UptimeStatusCard component rendering
- ActivityOverview component rendering
- Loading states and error handling
- Data fetching and display

**Usage:**

```bash
pnpm test:unit src/tests/unit/admin-components.test.tsx
```

#### `integration/monitoring-integration.test.ts`

Integration tests for the monitoring system.

**What it tests:**

- Health API integration
- Metrics API integration
- API performance benchmarks
- Error handling scenarios
- Data consistency between endpoints
- System information validation

**Usage:**

```bash
pnpm test:unit src/tests/integration/monitoring-integration.test.ts
```

### Video Generation Tests

#### `video-generation-smoke-test.js`

Basic smoke test that validates the API payload structure without making actual API calls.

**What it tests:**

- Request ID generation
- Model discovery
- Auth headers creation
- API URL construction
- Payload structure validation
- Environment variable checks

**Usage:**

```bash
npm run test:video
# OR
node tests/video-generation-smoke-test.js
```

### `video-generation-real-test.js`

Advanced test that can optionally make real API calls to SuperDuperAI.

**What it tests:**

- All smoke test validations
- Real API call capabilities (optional)
- Response parsing and error handling
- Environment setup validation

**Usage:**

```bash
# Dry run (no actual API calls)
npm run test:video:dry
# OR
node tests/video-generation-real-test.js

# Live test (makes real API calls)
npm run test:video:live
# OR
node tests/video-generation-real-test.js --live
```

### `video-generation-image-to-video-test.js`

Tests image-to-video model functionality and payload structure.

**What it tests:**

- Image-to-video model detection (VEO, KLING)
- Source image requirement validation
- Correct payload structure for image-to-video models
- Text-to-video model compatibility preservation
- Error handling for missing source images

**Usage:**

```bash
npm run test:video:i2v
# OR
node tests/video-generation-image-to-video-test.js
```

## 🚀 Test Commands

### 🎯 Running Important Tests (Recommended)

```bash
# All important tests (unit + monitoring integration) - 40 tests
pnpm test

# All important tests (unit + monitoring integration) - 32 tests
pnpm test:important

# Monitoring and admin panel tests - 32 tests
pnpm test:monitoring

# Core functionality tests - 27 tests
pnpm test:core
```

### 🎨 Media Generation Tests

```bash
# Image generation tests
pnpm test:image                    # Image generation smoke test (no token needed)
pnpm test:image:inpainting         # Inpainting generation test
pnpm test:image:i2i               # Image-to-image generation test
pnpm test:simple                   # Simple image test
pnpm test:project-image           # Project image endpoint test
pnpm test:final                   # Final generate image test

# Video generation tests
pnpm test:video                   # Video generation smoke test (no token needed)
pnpm test:video:dry               # Video generation real test (dry run)
pnpm test:video:live              # Video generation real test (live)
pnpm test:video:i2v               # Image-to-video generation test

# Component and unit tests for generation
pnpm test:generation              # Unit tests for AI tools, API routes, and utilities
```

### Running All Tests

```bash
# Run all unit tests
pnpm test:unit

# Run all tests with coverage
pnpm test:unit:coverage

# Run tests in watch mode
pnpm test:unit:watch
```

### Running Specific Test Suites

```bash
# Monitoring tests
pnpm test:unit src/tests/unit/monitoring.test.ts
pnpm test:unit src/tests/unit/admin-system-queries.test.ts
pnpm test:unit src/tests/unit/admin-components.test.tsx

# Integration tests
pnpm test:unit src/tests/integration/monitoring-integration.test.ts

# Video generation tests
pnpm test:unit src/tests/video-generation-*.js
```

### Test Structure

```
src/tests/
├── unit/                    # Unit tests
│   ├── monitoring.test.ts
│   ├── admin-system-queries.test.ts
│   └── admin-components.test.tsx
├── integration/             # Integration tests
│   └── monitoring-integration.test.ts
├── e2e/                     # End-to-end tests
│   ├── admin-panel.test.ts
│   ├── artifacts.test.ts
│   └── chat-flow.test.ts
└── routes/                  # API route tests
    ├── chat.test.ts
    └── document.test.ts
```

## 🔧 Environment Setup

For live testing, you need to set environment variables:

```bash
export SUPERDUPERAI_TOKEN="your-api-token-here"
export SUPERDUPERAI_URL="https://dev-editor.superduperai.co"  # Optional, uses default if not set
```

## 📋 Test Data

Tests use the following data structure (from your actual request):

```json
{
  "prompt": "Ocean waves gently crashing on a sandy beach at golden hour, cinematic style",
  "style": "flux_steampunk",
  "resolution": "1920x1080",
  "model": "comfyui/ltx",
  "duration": 10,
  "frameRate": 30
}
```

## 🎯 Expected Results

### Smoke Test Output:

```
✅ Test 1 - Request ID generation: vid_123456789_abc123
✅ Test 2 - Model discovery: comfyui/ltx
✅ Test 3 - Auth headers: [ 'Content-Type', 'Authorization', 'User-Agent' ]
✅ Test 4 - API URL: https://dev-editor.superduperai.co/api/v1/file/generate-video
✅ Test 5 - API Payload structure: [JSON object]
✅ Test 6 - Payload validation: All required fields present
✅ Test 7 - Full request object created
✅ Test 8 - Environment check
🎉 All smoke tests passed!
```

### Real Test Success (Live):

```
✅ API call successful!
🎬 Video generation should be starting...
🆔 Project ID: abc-123-def-456
```

### Real Test Error Examples:

```
❌ API call failed
🔍 Status: 401
💡 Check your SUPERDUPERAI_TOKEN

❌ API call failed
🔍 Status: 400
💡 Check the request payload structure
```

## 🐛 Debugging

### Common Issues:

1. **Missing Environment Variables**
   - Set `SUPERDUPERAI_TOKEN` for live tests
   - Optionally set `SUPERDUPERAI_URL`

2. **API Payload Issues**
   - Check smoke test output for validation errors
   - Compare with working image generation structure

3. **Model Not Found**
   - Verify model ID `comfyui/ltx` exists in your SuperDuperAI instance
   - Check available models via API

4. **Authentication Failed**
   - Verify API token is correct and not expired
   - Check API URL is correct

## 🎨 Media Generation Tests Overview

### Image Generation Tests

**`final-generate-image-test.js`**

- Тестирует полный поток генерации изображений
- Проверяет API вызовы и WebSocket события
- Валидирует структуру ответов

**`image-generation-debug-test.js`**

- Отладочные тесты для генерации изображений
- Тестирует API вызовы и WebSocket соединения
- Проверяет обработку ошибок

**`inpainting-generation-test.js`**

- Тестирует inpainting генерацию изображений
- Проверяет валидацию масок и исходных изображений
- Тестирует API вызовы для inpainting

**`image-to-image-generation-test.js`**

- Тестирует image-to-image генерацию изображений
- Проверяет валидацию исходных изображений
- Тестирует выбор моделей для image-to-image

**`simple-image-test.js`**

- Простые тесты генерации изображений
- Базовые API вызовы без сложной логики

**`project-image-endpoint-test.js`**

- Тестирует endpoint для генерации изображений в проектах
- Проверяет интеграцию с проектной системой

### AI Tools and Component Tests

**`configure-image-generation.test.ts`**

- Тестирует AI инструмент для генерации изображений
- Проверяет валидацию параметров и создание документов
- Тестирует различные типы генерации (text-to-image, image-to-image)

**`configure-video-generation.test.ts`**

- Тестирует AI инструмент для генерации видео
- Проверяет поддержку различных типов генерации (text-to-video, image-to-video, video-to-video)
- Тестирует валидацию параметров и создание документов

**`model-utils.test.ts`**

- Тестирует утилиты для работы с моделями генерации
- Проверяет нормализацию типов генерации
- Тестирует выбор моделей для image-to-image генерации

**`image-generation-route.test.ts`**

- Тестирует API роут для генерации изображений
- Проверяет аутентификацию и валидацию запросов
- Тестирует обработку различных типов генерации

**`ai-tools-balance.test.ts`**

- Тестирует утилиты для проверки баланса пользователей
- Проверяет валидацию операций и форматирование ошибок
- Тестирует обработку различных типов операций

### Video Generation Tests

**`video-generation-smoke-test.js`**

- Дымовые тесты для генерации видео
- Проверяет структуру payload без реальных API вызовов
- Валидирует конфигурацию и модели

**`video-file-endpoint-test.js`**

- Тестирует endpoint для работы с видео файлами
- Проверяет загрузку и обработку видео

**`video-model-selection-test.js`**

- Тестирует выбор моделей для генерации видео
- Проверяет доступность различных видео моделей

- Тесты для исправления payload структуры
- Проверяет корректность данных запроса

### E2E Tests for Chat Generation

**`e2e/chat-flow.test.ts`**

- E2E тесты для основного потока чата
- Тестирует генерацию контента в чате
- Проверяет интеграцию с UI

**`e2e/artifacts.test.ts`**

- E2E тесты для артефактов
- Тестирует создание и отображение артефактов
- Проверяет переключение видимости

## 🔄 Usage in Development

1. **Before making changes:** Run smoke test to ensure baseline works
2. **After changes:** Run both smoke and dry run tests
3. **For real testing:** Use live test with valid credentials
4. **For CI/CD:** Use smoke test only (no API credentials needed)

## 🎬 Integration with Main App

The test structure matches the actual video generation API in:

- `lib/ai/api/generate-video.ts`
- `lib/ai/tools/configure-video-generation.ts`

Any changes to the main API should be reflected in these tests.
