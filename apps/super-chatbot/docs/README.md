# Super Chatbot - Документация

AI чат-бот с продвинутыми возможностями генерации медиа контента и унифицированной архитектурой.

## 🏗️ Статус архитектуры

### ✅ Фреймворк генерации медиа (Production Ready)

**Основное достижение**: Успешная миграция на унифицированный фреймворк генерации медиа с **сокращением кода на 94%** и улучшенной поддерживаемостью.

**Текущий статус** (2025-01-27):

- 🎯 **Production Tools**: Используется архитектура фреймворка
- 🛡️ **Chat Generation**: Legacy реализация (проверенная, безопасная) с опциональной интеграцией фреймворка
- 🚀 **Производительность**: Значительное улучшение поддерживаемости кода и пользовательского опыта
- 📦 **Фреймворк**: Полный с генераторами изображений/видео, хуками и компонентами

**Ключевые преимущества**:

- От 1,150+ строк до 50 строк на инструмент (с адаптером)
- Унифицированные паттерны для всех типов медиа
- Лучшая обработка ошибок и управление таймаутами
- Легкое добавление будущих типов медиа (аудио, текст, 3D)

См.: [Завершение миграции](./maintenance/changelog/production-migration-complete.md)

## 📂 Структура документации

### 🚀 Основные разделы

- [**Архитектура системы**](./ARCHITECTURE.md) - Обзор архитектуры, компонентов и потоков данных
- [**AI Возможности**](./AI_CAPABILITIES.md) - Генерация изображений, видео, текста и система контекста
- [**API Интеграция**](./API_INTEGRATION.md) - SuperDuperAI, Azure OpenAI, база данных и мониторинг
- [**Разработка**](./DEVELOPMENT.md) - AI-First методология, AICODE система, тестирование и деплой

### 🔧 Детальная документация

#### Быстрый старт

- [Настройка окружения](./getting-started/environment-setup.md) - Конфигурация среды разработки
- [Руководство по быстрому старту](./getting-started/README.md) - Быстрое начало работы

#### AI Возможности

- [Обзор AI](./ai-capabilities/overview.md) - AI функции и возможности
- [Генерация изображений](./ai-capabilities/image-generation/) - Система генерации изображений
- [Генерация видео](./ai-capabilities/video-generation/) - Система генерации видео
- [Универсальная контекстная система](./ai-capabilities/universal-context-system.md) - Система понимания контекста

#### API Интеграция

- [SuperDuperAI интеграция](./api-integration/superduperai/README.md) - Основная AI интеграция
- [Динамическая интеграция](./api-integration/superduperai/dynamic-integration.md) - Гибкая система интеграций
- [Руководство по API генерации изображений](./api-integration/superduperai/image-generation-api-guide.md) - Полные примеры cURL
- [Руководство по API генерации видео](./api-integration/superduperai/video-generation-api-guide.md) - Полный видео API

#### Архитектура

- [Media Generation Framework](./architecture/media-generation-framework.md) - Унифицированная архитектура генерации медиа
- [API Architecture](./architecture/api-architecture.md) - Backend API дизайн и паттерны
- [WebSocket Architecture](./architecture/websocket-architecture.md) - Real-time коммуникация
- [System Overview](./architecture/system-overview.md) - Обзор системы

#### Разработка

- [AI методология разработки](./development/ai-development-methodology.md) - Двухфазный процесс разработки
- [Unified Tools Navigation System](./development/unified-tools-navigation-system.md) - Централизованная навигация инструментов
- [Implementation Plans](./development/implementation-plans/) - Структурированное планирование разработки
- [AICODE Examples](./development/aicode-examples.md) - Примеры AICODE комментариев
- [Video Generation](./ai-capabilities/video-generation/) - Video generation system with **Strategy Pattern + Fallback System** ⭐
- [Prompt Enhancement](./ai-capabilities/prompt-enhancement/) - AI-powered prompt improvement system

### API Integration

- [SuperDuperAI Integration](./api-integration/superduperai/) - External API integration
- [SSE Implementation](./websockets-implementation/) - Real-time communication

### Maintenance & Changelog

- [Changelog Directory](./maintenance/changelog/) - Detailed change history
- [Maintenance Guide](./maintenance/README.md) - System maintenance procedures

### Reference

- [FAQ](./reference/faq.md) - Frequently asked questions
- [Glossary](./reference/glossary.md) - Technical terminology

## 🚀 Recent Major Updates

### Guest-to-Auth Transition Fix (2025-01-14)

- **Fixed infinite redirect loop** when users tried to transition from authenticated accounts to guest mode
- **Direct guest mode access** after logout instead of forced Auth0 redirect
- **Enhanced auto-login page** with `guest_mode` parameter support for explicit guest mode selection
- **Improved user experience** with seamless transition between authentication modes
- **Zero breaking changes** - all existing Auth0 flows preserved and backward compatible

See: [Guest-to-Auth Transition Fix](./maintenance/changelog/fix-guest-to-auth-transition.md)

### Artifact Share Links (2025-01-15)

- **Direct sharing capability** for all artifact types (image, text, video, spreadsheet)
- **Standalone artifact viewer** at `/artifact/[id]` route for shared links
- **Share button integration** in artifact action bars for easy link copying
- **Secure access control** with authentication checks
- **Consistent display** using existing artifact components
- **Simple navigation** with "Back to Chat" functionality

See: [Artifact Share Links Implementation](./maintenance/changelog/artifact-share-links.md)

### Image Artifact Debug Parameters (2025-01-15)

- **Debug parameters display** in collapsible section for image artifacts
- **All generation parameters visible** including prompt, model, resolution, style, etc.
- **Copy parameters as JSON** for easy debugging and sharing
- **Clean UI design** with debug info hidden by default
- **Improved Generate New Image button** - always visible at the bottom

See: [Debug Parameters Display](./maintenance/changelog/image-artifact-debug-parameters.md)

### Enhanced Textarea with Unlimited Prompts (2025-01-28)

- **Removed all prompt length limitations** (was 2000 characters, now unlimited)
- **Real-time character/token counting** with approximate token estimation
- **Fullscreen editing mode** for complex prompt engineering
- **Universal implementation** across all forms (video, image, chat, media settings)
- **Professional workflow support** for AI-first development methodology
- **Responsive design** with accessibility features and keyboard navigation

### Video Model Selection Enhancement (2025-01-28)

- **Fixed Sora prioritization** for text-to-video generation
- **Smart model selection** prioritizes text_to_video over image_to_video models
- **Enhanced default model priority** with Sora as top choice for VIP users
- **Resolved ComfyUI errors** by selecting appropriate model types for text prompts
- **Fixed LTX model fallback issue** that caused `'str' object has no attribute 'read'` errors
- **Added `requireTextToVideo` parameter** to force text-to-video model selection
- **Enhanced API route logic** with automatic generation type detection

### Media Generation Framework (2025-01-27)

- **Complete architecture implementation** with image and video generators
- **Production migration** for tools with 94% code reduction
- **Optional chat integration** with safety fallbacks
- **Universal React hooks** and components for any media type
- **Template Method pattern** for consistent workflows
- **Factory pattern** for extensible generator creation

### Key Technical Achievements

- **BaseMediaGenerator** abstract class with unified workflow
- **MediaGeneratorFactory** singleton with registration system
- **Legacy compatibility layers** for seamless migration
- **Smart polling integration** with 7-minute timeout protection
- **Comprehensive TypeScript support** with type-safe interfaces

## 🎯 Framework Architecture

### Core Components

```
lib/media-generation/
├── core/base-generator.ts        # Abstract base class (400+ lines)
├── factory/generator-factory.ts  # Factory pattern (200+ lines)
├── generators/
│   ├── image-generator.ts        # Image-specific implementation
│   └── video-generator.ts        # Video-specific implementation
├── hooks/
│   ├── use-media-generator.ts    # Universal React hook
│   └── use-*-convenience.ts      # Convenience hooks
└── components/
    └── media-generator-form.tsx  # Universal form component
```

### Usage Examples

```typescript
// Get any generator from factory
const generator = MediaGeneratorFactory.getInstance().create("image");

// Generate with unified workflow
const result = await generator.generate({
  prompt: "A beautiful sunset",
  settings: { model, resolution, style, shotSize },
  chatId: "chat_123",
});

// Universal React hook
const { generateImage, isGenerating, progress } = useMediaGenerator("image");
```

## 🔧 Migration Status

### Production Ready ✅

- **Image Generator Tool**: Using framework architecture
- **Video Generator Tool**: Using framework architecture
- **Legacy Compatibility**: 100% maintained with adapters
- **Safety Mechanisms**: Comprehensive fallbacks implemented

### Optional Integration 🔄

- **Chat Image Generation**: Framework ready, legacy active
- **Chat Video Generation**: Framework ready, legacy active
- **Activation**: Controlled by feature flags for safe rollout

## 📈 Performance Impact

### Tools Improvement

- **Code Reduction**: 94% (1,150+ → 50 lines per tool)
- **Development Speed**: Significantly faster feature addition
- **Maintainability**: Single source of truth for media generation
- **Error Handling**: Centralized and more robust

### User Experience

- **Consistency**: Unified behavior across all media types
- **Reliability**: Better timeout and error recovery
- **Progress Tracking**: Enhanced real-time feedback
- **Performance**: Optimized API calls and resource management

## 🛠️ Development Guidelines

### AI-First Development

- **Two-Phase Process**: Planning → Implementation
- **AICODE Comments**: Persistent memory for AI agents
- **Implementation Plans**: Structured approach with templates
- **Template Approval**: Review process for major changes

### Code Standards

- **TypeScript**: Comprehensive type safety
- **React Patterns**: Hooks and component composition
- **Error Handling**: Graceful degradation and recovery
- **Testing**: Component and integration testing

## 🔍 Quick Links

### For Developers

- [AI Development Methodology](./development/ai-development-methodology.md)
- [Media Generation Framework](./architecture/media-generation-framework.md)
- [Implementation Plans](./development/implementation-plans/)

### For Operations

- [Environment Setup](./getting-started/environment-setup.md)
- [Maintenance Guide](./maintenance/README.md)
- [Migration Completion](./maintenance/changelog/production-migration-complete.md)

### For Users

- [AI Capabilities Overview](./ai-capabilities/overview.md)
- [FAQ](./reference/faq.md)
- [Troubleshooting](./ai-capabilities/image-generation/troubleshooting.md)

---

**Documentation maintained by AI agents following the [AI-First Development Methodology](./development/ai-development-methodology.md)**

_Last Updated: 2025-01-27 - Production Migration Complete_
