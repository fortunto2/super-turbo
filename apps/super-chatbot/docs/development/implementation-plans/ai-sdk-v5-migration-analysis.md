# AI SDK v5 Migration Analysis & Plan

**Date**: January 15, 2025  
**Type**: Migration Analysis  
**Status**: Planning Phase  
**Target**: AI SDK v5 Migration

## Overview

Данный документ содержит полный анализ текущего использования AI SDK v4.3.16 в проекте Super Chatbot и детальный план миграции к AI SDK v5 с сохранением всего текущего функционала.

## Current State Analysis

### 1. AI SDK Version & Dependencies

**Current Version**: `ai: ^4.3.16`
**Related Packages**:

- `@ai-sdk/react: ^1.2.12`
- `@ai-sdk/azure: ^1.3.23`
- `@ai-sdk/google: ^2.0.14`
- `@ai-sdk/google-vertex: ^3.0.27`

### 2. Core Chat Implementation

#### Main Chat Route (`/api/chat/route.ts`)

**Key Features**:

- **Resumable Streams**: Использует `createResumableStreamContext` с Redis
- **Data Streams**: `createDataStream` для кастомных данных
- **Message Handling**: `appendClientMessage`, `appendResponseMessages`
- **Tools Integration**: 9 активных AI инструментов
- **Experimental Features**:
  - `experimental_activeTools`
  - `experimental_transform` (smoothStream)
  - `experimental_generateMessageId`
  - `experimental_telemetry`

#### Chat Component (`chat.tsx`)

**Key Features**:

- **useChat Hook**: Основной хук для чата
- **Experimental Resume**: `experimental_resume` для восстановления
- **Data Handling**: Обработка `data` массива для кастомных команд
- **SSE Integration**: Специализированные хуки для изображений и видео

### 3. Message System

#### Message Types

- **UIMessage**: Основной тип сообщений из AI SDK
- **DBMessage**: Тип для базы данных
- **Conversion**: Утилиты конвертации между типами

#### Key Message Functions

- `convertDBMessagesToUIMessages()` - конвертация из БД в UI
- `normalizeMessage()` - нормализация сообщений
- `appendClientMessage()` - добавление клиентских сообщений
- `appendResponseMessages()` - добавление ответов

### 4. Tools System

#### Active Tools (9 total)

1. `configureImageGeneration` - настройка генерации изображений
2. `configureVideoGeneration` - настройка генерации видео
3. `configureAudioGeneration` - настройка генерации аудио
4. `configureScriptGeneration` - настройка генерации скриптов
5. `createDocument` - создание документов
6. `updateDocument` - обновление документов
7. `requestSuggestions` - запрос предложений
8. `listVideoModels` - список видео моделей
9. `enhancePromptUnified` - улучшение промптов

#### Tool Structure

```typescript
export const toolName = tool({
  description: "Tool description",
  parameters: z.object({...}),
  execute: async ({...}) => {...}
});
```

### 5. Real-time Features

#### SSE Integration

- **Image SSE**: `useChatImageSSE` - обработка генерации изображений
- **Video SSE**: `useChatVideoSSE` - обработка генерации видео
- **Custom Data Parts**: Передача кастомных данных через потоки

#### Resumable Streams

- **Redis-based**: Использует Redis для восстановления потоков
- **Stream Context**: `createResumableStreamContext`
- **Auto-resume**: `useAutoResume` хук

### 6. Experimental Features Usage

#### Current Experimental APIs

```typescript
// Chat route
experimental_activeTools: [...]
experimental_transform: smoothStream({ chunking: "word" })
experimental_generateMessageId: generateUUID
experimental_telemetry: { isEnabled: boolean, functionId: string }

// Chat component
experimental_resume: UseChatHelpers["experimental_resume"]
experimental_throttle: 100
```

## Migration Plan to AI SDK v5

### Phase 1: Preparation & Analysis

#### 1.1 Update Dependencies

```bash
# Update AI SDK to v5
npm install ai@^5.0.0 @ai-sdk/react@^2.0.0

# Update provider packages
npm install @ai-sdk/azure@^2.0.0 @ai-sdk/google@^3.0.0 @ai-sdk/google-vertex@^4.0.0
```

#### 1.2 Run Migration Codemods

```bash
npx @ai-sdk/codemod upgrade
```

### Phase 2: Core API Changes

#### 2.1 Message System Migration

**Current (v4)**:

```typescript
import { appendClientMessage, appendResponseMessages } from "ai";

const messages = appendClientMessage({
  messages: convertDBMessagesToUIMessages(previousMessages),
  message: normalizeMessage(messageToProcess),
});
```

**Target (v5)**:

```typescript
import { convertToModelMessages } from "ai";

// Create custom UIMessage type
type CustomUIMessage = UIMessage<CustomMetadata, CustomDataParts, CustomTools>;

// Convert UIMessages to ModelMessages for LLM
const modelMessages = convertToModelMessages(uiMessages);

// Use new streamText API
const result = await streamText({
  model: myProvider.languageModel(selectedChatModel),
  messages: modelMessages, // Use converted messages
  // ... other options
});

// Get UIMessage response
return result.toUIMessageStreamResponse({
  originalMessages: uiMessages,
  onFinish: ({ messages, responseMessage }) => {
    // Save complete UIMessage array
    saveChat({ chatId, messages });
  },
});
```

#### 2.2 Data Streams Migration

**Current (v4)**:

```typescript
const stream = createDataStream({
  execute: async (dataStream) => {
    // Custom logic
    dataStream.writeData({
      type: "redirect",
      url: `/chat/${id}`,
    });
  },
});
```

**Target (v5)**:

```typescript
// Use new createUIMessageStream
const stream = createUIMessageStream<CustomUIMessage>({
  execute: async ({ writer }) => {
    // Write custom data parts
    writer.write({
      type: "data-redirect",
      id: "redirect-1",
      url: `/chat/${id}`,
    });
  },
});
```

### Phase 3: Component Migration

#### 3.1 useChat Hook Migration

**Current (v4)**:

```typescript
const {
  messages,
  setMessages,
  handleSubmit,
  input,
  setInput,
  append,
  status,
  stop,
  reload,
  experimental_resume,
  data,
} = useChat({
  id,
  initialMessages,
  api: "/api/chat",
  experimental_throttle: 100,
  sendExtraMessageFields: true,
  generateId: generateUUID,
  onFinish: () => {...},
  onError: (error) => {...},
});
```

**Target (v5)**:

```typescript
const {
  messages,
  setMessages,
  handleSubmit,
  input,
  setInput,
  append,
  status,
  stop,
  reload,
  data,
} = useChat<CustomUIMessage>({
  id,
  initialMessages,
  api: "/api/chat",
  // experimental_throttle removed - use built-in throttling
  sendExtraMessageFields: true,
  generateId: generateUUID,
  onFinish: ({ messages, responseMessage }) => {
    // New onFinish signature
  },
  onError: (error) => {...},
});
```

#### 3.2 Data Parts Handling

**Current (v4)**:

```typescript
useEffect(() => {
  if (data && onDataStream) {
    data.forEach((item: any) => {
      if (item.type === "redirect" && item.url) {
        window.history.replaceState({}, "", item.url);
      }
    });
  }
}, [data, onDataStream]);
```

**Target (v5)**:

```typescript
useEffect(() => {
  if (data && onDataStream) {
    data.forEach((item: any) => {
      if (item.type === "data-redirect" && item.url) {
        window.history.replaceState({}, "", item.url);
      }
    });
  }
}, [data, onDataStream]);
```

### Phase 4: Tools Migration

#### 4.1 Tool Definition Updates

**Current (v4)**:

```typescript
export const configureImageGeneration = tool({
  description: "Configure image generation...",
  parameters: z.object({...}),
  execute: async ({...}) => {...}
});
```

**Target (v5)**:

```typescript
export const configureImageGeneration = tool({
  description: "Configure image generation...",
  inputSchema: z.object({...}), // parameters -> inputSchema
  execute: async ({...}) => {...}
});
```

#### 4.2 Tool Integration

**Current (v4)**:

```typescript
const result = streamText({
  model: myProvider.languageModel(selectedChatModel),
  experimental_activeTools: [
    "configureImageGeneration",
    "configureVideoGeneration",
    // ...
  ],
  tools: {
    configureImageGeneration: configureImageGeneration({...}),
    configureVideoGeneration: configureVideoGeneration({...}),
    // ...
  },
});
```

**Target (v5)**:

```typescript
const result = streamText({
  model: myProvider.languageModel(selectedChatModel),
  // experimental_activeTools removed - tools are always available
  tools: {
    configureImageGeneration: configureImageGeneration({...}),
    configureVideoGeneration: configureVideoGeneration({...}),
    // ...
  },
});
```

### Phase 5: Experimental Features Migration

#### 5.1 Removed Experimental APIs

**Features to Remove**:

- `experimental_activeTools` - tools are always available
- `experimental_throttle` - built-in throttling
- `experimental_transform` - use new streaming options
- `experimental_generateMessageId` - handled automatically
- `experimental_resume` - new resume mechanism
- `experimental_telemetry` - new telemetry system

#### 5.2 New Features to Implement

**Agentic Loop Control**:

```typescript
const result = await streamText({
  // ... other options
  maxSteps: 5, // Already implemented
  // New loop control features available
});
```

**Data Parts**:

```typescript
// Server-side
writer.write({
  type: "data-image-progress",
  id: "progress-1",
  progress: 50,
  message: "Generating image...",
});

// Client-side
data.forEach((item) => {
  if (item.type === "data-image-progress") {
    // Update UI with progress
  }
});
```

### Phase 6: Resumable Streams Migration

#### 6.1 Current Implementation

```typescript
const streamContext = getStreamContext();
if (streamContext) {
  return new Response(
    await streamContext.resumableStream(streamId, () => stream)
  );
}
```

#### 6.2 Migration Strategy

- **Keep Current**: Resumable streams API remains compatible
- **Update**: Use new `toUIMessageStreamResponse` for better integration
- **Test**: Ensure Redis-based resumption still works

### Phase 7: Testing & Validation

#### 7.1 Test Coverage Areas

1. **Chat Functionality**: Basic chat flow
2. **Tool Execution**: All 9 tools working
3. **SSE Integration**: Image and video SSE
4. **Resumable Streams**: Stream resumption
5. **Data Parts**: Custom data transmission
6. **Message Persistence**: Database integration
7. **Error Handling**: Error scenarios

#### 7.2 Validation Checklist

- [ ] All tools execute correctly
- [ ] Message history preserved
- [ ] SSE connections working
- [ ] Stream resumption functional
- [ ] Custom data parts transmitted
- [ ] Error handling improved
- [ ] Performance maintained or improved

### Phase 8: Rollout Strategy

#### 8.1 Staged Rollout

1. **Development Environment**: Full testing
2. **Staging Environment**: User acceptance testing
3. **Production**: Gradual rollout with monitoring

#### 8.2 Rollback Plan

- **Database**: No schema changes required
- **Dependencies**: Can rollback to v4 if needed
- **Configuration**: Environment variables unchanged

## Key Migration Benefits

### 1. Improved Type Safety

- **Full-stack typing**: From server to client
- **Custom message types**: Tailored to application needs
- **Better tool integration**: Type-safe tool calls

### 2. Enhanced Performance

- **Built-in optimizations**: Better streaming performance
- **Reduced bundle size**: Removed experimental APIs
- **Improved caching**: Better provider caching

### 3. Better Developer Experience

- **Cleaner APIs**: Removed experimental prefixes
- **Better error handling**: More descriptive errors
- **Improved debugging**: Better telemetry and logging

### 4. Future-Proof Architecture

- **Agentic capabilities**: Ready for advanced AI features
- **Extensible design**: Easy to add new features
- **Standards compliance**: Following AI SDK best practices

## Risk Assessment

### High Risk Areas

1. **Message Conversion**: Complex conversion logic
2. **SSE Integration**: Real-time features
3. **Tool Execution**: 9 different tools
4. **Resumable Streams**: Redis dependency

### Mitigation Strategies

1. **Comprehensive Testing**: Full test suite
2. **Gradual Migration**: Feature-by-feature migration
3. **Monitoring**: Real-time error tracking
4. **Rollback Plan**: Quick rollback capability

## Timeline Estimate

- **Phase 1-2**: 2-3 days (Dependencies & Core API)
- **Phase 3-4**: 3-4 days (Components & Tools)
- **Phase 5-6**: 2-3 days (Experimental Features & Streams)
- **Phase 7**: 2-3 days (Testing)
- **Phase 8**: 1-2 days (Rollout)

**Total Estimate**: 10-15 days

## Conclusion

Миграция к AI SDK v5 представляет значительные улучшения в типизации, производительности и архитектуре. План миграции учитывает все текущие функции и обеспечивает их сохранение с улучшениями. Ключевые области внимания - система сообщений, инструменты и интеграция SSE.

**Рекомендация**: Выполнить миграцию поэтапно с тщательным тестированием на каждом этапе.
