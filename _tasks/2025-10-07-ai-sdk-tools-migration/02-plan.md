# AI SDK Tools Migration Plan: Context Analyzers to AI SDK Tools

## Executive Summary

**Objective**: Transform the current regex-based media context analyzers (`VideoContextAnalyzer`, `ImageContextAnalyzer`) into AI SDK tools that the LLM can invoke when it needs to find media in chat history.

**Current State**: Pattern-matching analyzers are called **before** AI tools execute, providing `defaultSourceImageUrl`/`defaultSourceVideoUrl` to tool parameters.

**Target State**: AI SDK tools that the LLM can call **during** conversation to search for media when needed, making media discovery part of the LLM's decision-making process.

**Key Benefit**: Moves media discovery from hardcoded regex patterns into intelligent LLM decision-making, allowing the AI to determine WHEN and HOW to search for media based on conversation context.

---

## 1. Current Architecture Analysis

### 1.1 Existing Context Analyzers

**Location**: `src/lib/ai/context/`

**Key Files**:
- `universal-context.ts` - Base class with core analysis logic
- `image-context-analyzer.ts` - Image-specific patterns (437 lines)
- `video-context-analyzer.ts` - Video-specific patterns + image-to-video (512 lines)
- `index.ts` - Export and registration logic

**Current Flow**:
```
User Message → Chat Route → Context Analyzer (regex patterns)
→ defaultSourceImageUrl extracted → Passed to configure*Generation tool
→ Tool executes with pre-filled sourceImageUrl
```

**Pattern Discovery Methods (in BaseContextAnalyzer)**:
1. **Current Message Check**: `checkCurrentMessage()` - looks for attachments in current message
2. **Reference Analysis**: `analyzeReferences()` - applies regex patterns with weights
3. **Semantic Search**: `findByContent()` - keyword matching in prompts
4. **Heuristics**: `findByHeuristics()` - edit intent detection
5. **Advanced Systems** (imported):
   - Semantic index (embedding-based search)
   - Temporal analysis (time-based references)
   - User preference learning (pattern learning)
   - Context caching (Redis-based)

**Pattern Examples** (from `VideoContextAnalyzer`):
```typescript
// Russian pattern
{
  pattern: /(это|этот)\s+(видео|ролик|фильм|клип)/,
  weight: 0.9,
  description: "Прямая ссылка на видео",
  targetResolver: (message, media) => media[media.length - 1] || null,
}

// English pattern
{
  pattern: /(this|that)\s+(video|clip|movie|film)/,
  weight: 0.9,
  description: "Direct reference to video",
  targetResolver: (message, media) => media[media.length - 1] || null,
}

// Image-to-video pattern
{
  pattern: /(сделай|создай|сгенерируй)\s+(видео|ролик)\s+(из|на\s+основе)\s+(этого|этого\s+изображения)/,
  weight: 0.9,
  description: "Создание видео из изображения",
  targetResolver: (message, media) => {
    const images = media.filter((m) => m.mediaType === "image");
    return images[images.length - 1] || null;
  },
}
```

**Key Insight**: These patterns encode both INTENT detection (what user wants) and TARGET resolution (which media to use).

### 1.2 Integration with AI SDK Tools

**Location**: `src/lib/ai/tools/configure-image-generation.ts` and `configure-video-generation.ts`

**Current Integration Flow**:

1. **In Chat Route** (`src/app/(chat)/api/chat/route.ts:700-800`):
```typescript
// BEFORE streamText is called
const imageAnalyzerManager = new ImageContextAnalyzer();
const imageContextResult = await imageAnalyzerManager.analyzeContext(
  messageToProcess.parts?.[0]?.text || "",
  chatMedia,
  messageToProcess.experimental_attachments || []
);
const defaultSourceImageUrl = imageContextResult.sourceUrl;

// THEN streamText is called with tools
tools: {
  configureImageGeneration: configureImageGeneration({
    createDocument: tools.createDocument,
    session,
    defaultSourceImageUrl, // Pre-filled by analyzer
  }),
}
```

2. **In Tool Implementation** (`configure-image-generation.ts:165-230`):
```typescript
// Tool receives pre-analyzed context
let normalizedSourceUrl = sourceImageUrl;

// Priority 1: defaultSourceImageUrl (legacy support)
if (params?.defaultSourceImageUrl && /^https?:\/\//.test(params.defaultSourceImageUrl)) {
  normalizedSourceUrl = params.defaultSourceImageUrl;
}

// Priority 2: NEW context system
else if (params?.chatId && params?.userMessage) {
  const contextResult = await analyzeImageContext(
    params.userMessage,
    params.chatId,
    params.currentAttachments,
    params.session?.user?.id
  );
  if (contextResult.sourceUrl && contextResult.confidence !== "low") {
    normalizedSourceUrl = contextResult.sourceUrl;
  }
}
```

**Current Problems**:
1. **Dual Analysis**: Context is analyzed TWICE - once in route, once in tool
2. **LLM Blindness**: LLM doesn't know which media exists or was selected
3. **Hardcoded Logic**: Regex patterns can't adapt to conversation nuances
4. **No Feedback Loop**: If search fails, LLM can't adjust strategy

### 1.3 AI SDK Tool Patterns

**Reference Tool**: `src/lib/ai/tools/find-chat-images.ts`

**AI SDK Tool Structure**:
```typescript
export const findChatImages = tool({
  description: "Find recently generated images in the current chat...",
  parameters: z.object({
    limit: z.number().optional().describe("Maximum number..."),
    chatId: z.string().describe("Chat ID to search in..."),
  }),
  execute: async ({ limit = 5, chatId }) => {
    // Tool logic
    const imageArtifacts = await getChatImageArtifacts({ chatId, limit });

    // Return structured response for LLM
    return {
      success: true,
      message: `Found ${imageArtifacts.length} recent images`,
      images: imageArtifacts.map(img => ({
        id: img.id,
        url: img.url,
        prompt: img.prompt,
        createdAt: img.createdAt.toISOString(),
      })),
      suggestion: "You can use any of these images as source...",
    };
  },
});
```

**Key Characteristics**:
1. **Zod Schema**: Type-safe parameters with descriptions for LLM
2. **Async Execute**: Can perform database queries, API calls
3. **Structured Response**: Returns JSON that LLM can understand
4. **LLM-Friendly**: Description helps LLM decide when to use tool

**Integration Pattern** (from `route.ts:903-934`):
```typescript
tools: {
  ...tools, // Base tools (createDocument, updateDocument, requestSuggestions)
  configureImageGeneration: configureImageGeneration({ ... }),
  configureVideoGeneration: configureVideoGeneration({ ... }),
  listVideoModels,
  findBestVideoModel,
  enhancePromptUnified,
},
experimental_activeTools: [
  "configureImageGeneration",
  "configureVideoGeneration",
  "listVideoModels",
  "findBestVideoModel",
  "enhancePromptUnified",
  "createDocument",
  "updateDocument",
  "requestSuggestions",
],
```

---

## 2. Migration Strategy

### 2.1 Core Concept: From Pre-Analysis to On-Demand Search

**Before** (Current):
```
User: "animate this image"
  ↓
[Context Analyzer runs BEFORE LLM sees message]
  ↓ (finds image via regex)
defaultSourceImageUrl = "https://..."
  ↓
LLM: *receives system prompt with pre-filled URL*
  ↓
LLM: calls configureVideoGeneration(prompt="...", sourceVideoUrl="https://...")
```

**After** (Target):
```
User: "animate this image"
  ↓
LLM: *analyzes intent* "User wants to animate an image"
  ↓
LLM: calls findMediaInChat(mediaType="image", query="last uploaded image")
  ↓
Tool: { success: true, media: [{ url: "https://...", ... }] }
  ↓
LLM: calls configureVideoGeneration(prompt="...", sourceVideoUrl="https://...")
```

**Key Differences**:
- **LLM Decision**: LLM decides WHEN to search for media
- **Transparent Process**: LLM sees search results, can retry with different queries
- **Flexible Queries**: Not limited to hardcoded regex patterns
- **Better Error Handling**: If no media found, LLM can ask user for clarification

### 2.2 Phased Migration Approach

**Phase 1: Create New Tools (Non-Breaking)**
- Create new `findMediaInChat` tool family
- Keep existing analyzer integration working
- Tools can be tested independently

**Phase 2: Hybrid Mode (Transition)**
- Both systems available
- Add flag to prefer new tool-based approach
- Gradual rollout with A/B testing

**Phase 3: Deprecation (Final)**
- Remove pre-analysis from chat route
- Tools become primary media discovery mechanism
- Clean up legacy code

### 2.3 Backward Compatibility Strategy

**Critical**: Existing `configure*Generation` tools must continue working during migration.

**Compatibility Layer**:
```typescript
// In configureImageGeneration
let normalizedSourceUrl = sourceImageUrl; // AI-provided via new tool

// Fallback to legacy system if tool-based discovery not used
if (!normalizedSourceUrl && params?.defaultSourceImageUrl) {
  normalizedSourceUrl = params.defaultSourceImageUrl; // Legacy analyzer
}

// Fallback to inline analysis for transition period
if (!normalizedSourceUrl && params?.chatId && params?.userMessage) {
  const result = await analyzeImageContext(...); // Current system
  normalizedSourceUrl = result.sourceUrl;
}
```

**Migration Flag**:
```typescript
// In chat route
const USE_TOOL_BASED_MEDIA_DISCOVERY =
  process.env.ENABLE_TOOL_MEDIA_DISCOVERY === "true" ||
  session.user.betaFeatures?.includes("tool-media-discovery");

if (!USE_TOOL_BASED_MEDIA_DISCOVERY) {
  // Legacy pre-analysis
  const imageContext = await analyzeImageContext(...);
  defaultSourceImageUrl = imageContext.sourceUrl;
}
```

---

## 3. Detailed Implementation Plan

### 3.1 New AI SDK Tools to Create

#### Tool 1: `findMediaInChat`

**Purpose**: Universal media search tool that LLM can use to find images, videos, or audio in chat history.

**File**: `src/lib/ai/tools/find-media-in-chat.ts`

**Zod Schema**:
```typescript
z.object({
  chatId: z.string().describe("Current chat ID"),
  mediaType: z.enum(["image", "video", "audio", "any"])
    .describe("Type of media to search for"),
  query: z.string().optional()
    .describe("Search query: 'last uploaded', 'with moon', 'generated by assistant', 'first image', etc."),
  limit: z.number().default(5).max(20)
    .describe("Maximum results to return"),
  role: z.enum(["user", "assistant", "any"]).optional()
    .describe("Filter by who created the media: user-uploaded or assistant-generated"),
})
```

**Implementation Strategy**:
```typescript
export const findMediaInChat = (params: { session: Session }) => tool({
  description: `Search for media (images, videos, audio) in current chat history.

Use this tool when user references media like:
- "this image", "that video", "the picture"
- "first/last/previous image"
- "uploaded image", "generated video"
- "image with moon", "picture of cat"

Returns list of media with URLs, IDs, prompts, and creation timestamps.`,

  parameters: zodSchema,

  execute: async ({ chatId, mediaType, query, limit, role }) => {
    // 1. Get all media from chat
    const chatMedia = await contextManager.getChatMedia(chatId);

    // 2. Filter by type
    let filtered = chatMedia.filter(m =>
      mediaType === "any" || m.mediaType === mediaType
    );

    // 3. Filter by role if specified
    if (role && role !== "any") {
      filtered = filtered.filter(m => m.role === role);
    }

    // 4. Apply query-based search
    if (query) {
      // Integrate existing pattern matching logic
      const patterns = parseQueryToPatterns(query);
      filtered = applyPatternMatching(filtered, patterns, query);

      // Try semantic search if pattern matching fails
      if (filtered.length === 0) {
        const semantic = await semanticIndex.findSimilarMedia(query, chatMedia);
        filtered = semantic.map(s => s.media);
      }
    }

    // 5. Sort by timestamp (most recent first)
    filtered.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());

    // 6. Limit results
    filtered = filtered.slice(0, limit);

    // 7. Format response for LLM
    return {
      success: true,
      found: filtered.length,
      media: filtered.map(m => ({
        id: m.id,
        url: m.url,
        type: m.mediaType,
        role: m.role,
        prompt: m.prompt || "No prompt",
        timestamp: m.timestamp.toISOString(),
        messageIndex: m.messageIndex,
      })),
      message: filtered.length > 0
        ? `Found ${filtered.length} ${mediaType} file(s) matching "${query || 'your search'}"`
        : `No ${mediaType} files found matching "${query || 'your search'}"`,
      suggestion: filtered.length === 0
        ? "Try a different search query or ask user to upload/generate media first"
        : `You can now use these media URLs in generate* tools via sourceImageUrl/sourceVideoUrl parameter`,
    };
  },
});
```

**Key Features**:
- Reuses existing pattern matching logic from analyzers
- Falls back to semantic search
- Returns structured, LLM-friendly responses
- Provides helpful suggestions when no media found

#### Tool 2: `analyzeMediaReference`

**Purpose**: Analyze a specific user message to understand what media they're referring to.

**File**: `src/lib/ai/tools/analyze-media-reference.ts`

**Use Case**: When LLM is unsure which media user means, it can use this tool to get detailed analysis.

**Zod Schema**:
```typescript
z.object({
  chatId: z.string().describe("Current chat ID"),
  userMessage: z.string().describe("User message to analyze for media references"),
  mediaType: z.enum(["image", "video", "audio"]).optional()
    .describe("Expected media type if known"),
})
```

**Implementation**:
```typescript
export const analyzeMediaReference = (params: { session: Session }) => tool({
  description: `Analyze a user message to detect media references and find the specific media they're talking about.

Use this when user message contains references like:
- "animate THIS" - which image?
- "edit the picture" - which one?
- "use second video" - which second?

Returns the most likely media match with confidence score and reasoning.`,

  parameters: zodSchema,

  execute: async ({ chatId, userMessage, mediaType }) => {
    // Get all media
    const chatMedia = await contextManager.getChatMedia(chatId);

    // Use existing analyzer logic
    const analyzer = mediaType === "image"
      ? new ImageContextAnalyzer()
      : new VideoContextAnalyzer();

    const result = await analyzer.analyzeContext(
      userMessage,
      chatMedia,
      [] // No current attachments
    );

    return {
      success: result.confidence !== "low",
      confidence: result.confidence,
      reasoning: result.reasoning,
      media: result.sourceUrl ? {
        url: result.sourceUrl,
        id: result.sourceId,
        type: result.mediaType,
        metadata: result.metadata,
      } : null,
      suggestion: result.confidence === "low"
        ? "Cannot determine which media user is referring to. Ask user to be more specific or use findMediaInChat to show available options."
        : `User is referring to ${result.mediaType} at ${result.sourceUrl}`,
    };
  },
});
```

#### Tool 3: `listAvailableMedia`

**Purpose**: Quick overview of what media exists in current chat.

**File**: `src/lib/ai/tools/list-available-media.ts`

**Zod Schema**:
```typescript
z.object({
  chatId: z.string().describe("Current chat ID"),
  groupBy: z.enum(["type", "role", "recent"]).default("type")
    .describe("How to group results"),
})
```

**Implementation**:
```typescript
export const listAvailableMedia = (params: { session: Session }) => tool({
  description: `Get a summary of all media available in current chat.

Use this when:
- User asks "what images do we have?"
- You need to know what media is available before suggesting actions
- Starting a conversation about media

Returns grouped summary of available media.`,

  parameters: zodSchema,

  execute: async ({ chatId, groupBy }) => {
    const chatMedia = await contextManager.getChatMedia(chatId);

    const summary = {
      total: chatMedia.length,
      byType: {
        images: chatMedia.filter(m => m.mediaType === "image").length,
        videos: chatMedia.filter(m => m.mediaType === "video").length,
        audio: chatMedia.filter(m => m.mediaType === "audio").length,
      },
      byRole: {
        uploaded: chatMedia.filter(m => m.role === "user").length,
        generated: chatMedia.filter(m => m.role === "assistant").length,
      },
      recent: chatMedia
        .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
        .slice(0, 3)
        .map(m => ({
          type: m.mediaType,
          role: m.role,
          prompt: m.prompt?.substring(0, 50) + "...",
          timestamp: m.timestamp.toISOString(),
        })),
    };

    return {
      success: true,
      summary,
      message: `Chat has ${summary.total} media files: ${summary.byType.images} images, ${summary.byType.videos} videos, ${summary.byType.audio} audio`,
    };
  },
});
```

### 3.2 Refactoring Existing Code

#### File: `src/lib/ai/context/query-parser.ts` (NEW)

**Purpose**: Extract pattern matching logic into reusable query parser.

**Content**:
```typescript
/**
 * Parses natural language queries into search patterns
 * Reuses existing regex patterns from analyzers
 */

export interface ParsedQuery {
  intent: "reference" | "search" | "position" | "temporal";
  patterns: ReferencePattern[];
  keywords: string[];
  filters: {
    role?: "user" | "assistant";
    position?: number;
    timeframe?: "recent" | "old";
  };
}

export function parseQueryToPatterns(
  query: string,
  mediaType: MediaType
): ParsedQuery {
  // Reuse patterns from existing analyzers
  const analyzer = createAnalyzerForType(mediaType);
  const allPatterns = analyzer.getReferencePatterns();

  // Match query against patterns
  const matchedPatterns = allPatterns.filter(p =>
    p.pattern.test(query.toLowerCase())
  );

  // Extract keywords
  const keywords = extractKeywords(query);

  // Detect filters
  const filters = detectFilters(query);

  return {
    intent: detectIntent(matchedPatterns),
    patterns: matchedPatterns,
    keywords,
    filters,
  };
}

function detectIntent(patterns: ReferencePattern[]): ParsedQuery["intent"] {
  // Classify based on pattern descriptions
  if (patterns.some(p => p.description.includes("order") || p.description.includes("порядку"))) {
    return "position";
  }
  if (patterns.some(p => p.description.includes("last") || p.description.includes("previous"))) {
    return "temporal";
  }
  if (patterns.some(p => p.description.includes("with") || p.description.includes("с"))) {
    return "search";
  }
  return "reference";
}

function extractKeywords(query: string): string[] {
  // Reuse keyword extraction from BaseContextAnalyzer
  const commonWords = new Set([...]);
  return query
    .toLowerCase()
    .replace(/[^\w\s]/g, " ")
    .split(/\s+/)
    .filter(word => word.length > 2 && !commonWords.has(word));
}

function detectFilters(query: string): ParsedQuery["filters"] {
  const filters: ParsedQuery["filters"] = {};

  // Role detection
  if (/(uploaded|загруженн|my|мо[йяе])/i.test(query)) {
    filters.role = "user";
  }
  if (/(generated|созданн|assistant|бот)/i.test(query)) {
    filters.role = "assistant";
  }

  // Position detection
  const positionMatch = query.match(/(first|перв|1st|второ|second|2nd|треть|third|3rd)/i);
  if (positionMatch) {
    const positions = {
      first: 0, перв: 0, "1st": 0,
      second: 1, второ: 1, "2nd": 1,
      third: 2, треть: 2, "3rd": 2,
    };
    filters.position = positions[positionMatch[1].toLowerCase() as keyof typeof positions] ?? undefined;
  }

  // Timeframe detection
  if (/(last|recent|latest|последн|недавн)/i.test(query)) {
    filters.timeframe = "recent";
  }

  return filters;
}
```

#### File: `src/lib/ai/context/pattern-matcher.ts` (NEW)

**Purpose**: Apply patterns and filters to media list.

**Content**:
```typescript
import type { ChatMedia, ReferencePattern } from "./universal-context";
import type { ParsedQuery } from "./query-parser";

export function applyPatternMatching(
  media: ChatMedia[],
  patterns: ReferencePattern[],
  originalQuery: string
): ChatMedia[] {
  if (patterns.length === 0) return media;

  // Apply each pattern's targetResolver
  const matches: Array<{ media: ChatMedia; weight: number }> = [];

  for (const pattern of patterns) {
    const resolved = pattern.targetResolver(originalQuery, media);
    if (resolved) {
      matches.push({ media: resolved, weight: pattern.weight });
    }
  }

  // Sort by weight, return unique media
  matches.sort((a, b) => b.weight - a.weight);

  const uniqueMedia = new Map<string, ChatMedia>();
  for (const match of matches) {
    if (!uniqueMedia.has(match.media.url)) {
      uniqueMedia.set(match.media.url, match.media);
    }
  }

  return Array.from(uniqueMedia.values());
}

export function applyFilters(
  media: ChatMedia[],
  filters: ParsedQuery["filters"]
): ChatMedia[] {
  let filtered = [...media];

  // Role filter
  if (filters.role) {
    filtered = filtered.filter(m => m.role === filters.role);
  }

  // Position filter
  if (typeof filters.position === "number") {
    const item = filtered[filters.position];
    filtered = item ? [item] : [];
  }

  // Timeframe filter
  if (filters.timeframe === "recent") {
    const now = Date.now();
    filtered = filtered.filter(m =>
      now - m.timestamp.getTime() < 24 * 60 * 60 * 1000 // Last 24 hours
    );
  }

  return filtered;
}
```

### 3.3 Integration Points

#### Chat Route Changes

**File**: `src/app/(chat)/api/chat/route.ts`

**Current (lines 700-800)**:
```typescript
// Pre-analysis before streamText
const imageContext = await analyzeImageContext(...);
const videoContext = await analyzeVideoContext(...);
const defaultSourceImageUrl = imageContext.sourceUrl;
const defaultSourceVideoUrl = videoContext.sourceUrl;
```

**Transition (Phase 2)**:
```typescript
// Feature flag controlled
const USE_TOOL_DISCOVERY = process.env.ENABLE_TOOL_MEDIA_DISCOVERY === "true";

let defaultSourceImageUrl, defaultSourceVideoUrl;

if (!USE_TOOL_DISCOVERY) {
  // Legacy pre-analysis
  const imageContext = await analyzeImageContext(...);
  const videoContext = await analyzeVideoContext(...);
  defaultSourceImageUrl = imageContext.sourceUrl;
  defaultSourceVideoUrl = videoContext.sourceUrl;
} else {
  // Tools will handle discovery
  defaultSourceImageUrl = undefined;
  defaultSourceVideoUrl = undefined;
}
```

**Final (Phase 3)**:
```typescript
// Remove pre-analysis entirely
// Media discovery now handled by AI SDK tools
```

#### Tool Registration

**File**: `src/app/(chat)/api/chat/route.ts` (lines 903-934)

**Add New Tools**:
```typescript
import { findMediaInChat } from "@/lib/ai/tools/find-media-in-chat";
import { analyzeMediaReference } from "@/lib/ai/tools/analyze-media-reference";
import { listAvailableMedia } from "@/lib/ai/tools/list-available-media";

// In streamText call
tools: {
  ...tools,

  // New media discovery tools
  findMediaInChat: findMediaInChat({ session }),
  analyzeMediaReference: analyzeMediaReference({ session }),
  listAvailableMedia: listAvailableMedia({ session }),

  // Existing tools (updated to work without pre-filled URLs)
  configureImageGeneration: configureImageGeneration({
    createDocument: tools.createDocument,
    session,
    chatId: id,
    userMessage: messageToProcess.parts?.[0]?.text || "",
    currentAttachments: messageToProcess.experimental_attachments || [],
  }),
  configureVideoGeneration: configureVideoGeneration({
    createDocument: tools.createDocument,
    session,
    chatId: id,
    userMessage: messageToProcess.parts?.[0]?.text || "",
    currentAttachments: messageToProcess.experimental_attachments || [],
  }),

  // ... other tools
},

experimental_activeTools: [
  // Add new tools to active list
  "findMediaInChat",
  "analyzeMediaReference",
  "listAvailableMedia",

  // Existing tools
  "configureImageGeneration",
  "configureVideoGeneration",
  // ... others
],
```

#### System Prompt Updates

**File**: `src/lib/ai/prompts.ts`

**Add Media Discovery Guidance**:
```typescript
export function systemPrompt({ selectedChatModel, requestHints }: SystemPromptParams) {
  return `You are a helpful AI assistant with access to powerful media generation tools.

## Media Discovery Tools

When users reference media (images, videos, audio) in their messages:

1. **Use findMediaInChat** to search for specific media:
   - "this image" → findMediaInChat({ mediaType: "image", query: "last uploaded" })
   - "the video with cat" → findMediaInChat({ mediaType: "video", query: "with cat" })
   - "first picture" → findMediaInChat({ mediaType: "image", query: "first image" })

2. **Use listAvailableMedia** to see what's available:
   - When user asks "what images do we have?"
   - Before suggesting media-based actions

3. **Use analyzeMediaReference** when unsure:
   - Ambiguous references: "animate that" (which media?)
   - Complex queries: "edit the picture I uploaded yesterday"

## Media Generation Workflow

CORRECT approach:
1. User: "animate this image"
2. You: Call findMediaInChat({ mediaType: "image", query: "last uploaded" })
3. Tool returns: { url: "https://...", id: "..." }
4. You: Call configureVideoGeneration({ prompt: "...", sourceVideoUrl: "https://..." })

WRONG approach (DON'T DO THIS):
1. User: "animate this image"
2. You: Call configureVideoGeneration({ prompt: "...", sourceVideoUrl: "this-image" })
   ❌ Never use placeholder URLs like "this-image" or "user-uploaded-image"

## Error Handling

If findMediaInChat returns no results:
- Ask user to clarify which media they mean
- Suggest uploading/generating media first
- Offer to list available media

${requestHints ? getRequestHintsSection(requestHints) : ""}

// ... rest of system prompt
`;
}
```

### 3.4 Testing Strategy

#### Unit Tests

**File**: `src/tests/unit/ai-tools/find-media-in-chat.test.ts`

```typescript
import { describe, it, expect, vi } from "vitest";
import { findMediaInChat } from "@/lib/ai/tools/find-media-in-chat";
import type { ChatMedia } from "@/lib/ai/context";

describe("findMediaInChat", () => {
  const mockSession = { user: { id: "user-123" } };

  const mockMedia: ChatMedia[] = [
    {
      url: "https://example.com/image1.jpg",
      id: "img-1",
      role: "user",
      timestamp: new Date("2025-10-07T10:00:00Z"),
      prompt: "A beautiful sunset",
      messageIndex: 0,
      mediaType: "image",
    },
    {
      url: "https://example.com/image2.jpg",
      id: "img-2",
      role: "assistant",
      timestamp: new Date("2025-10-07T11:00:00Z"),
      prompt: "A cat playing with moon",
      messageIndex: 1,
      mediaType: "image",
    },
  ];

  it("should find last uploaded image", async () => {
    vi.spyOn(contextManager, "getChatMedia").mockResolvedValue(mockMedia);

    const tool = findMediaInChat({ session: mockSession });
    const result = await tool.execute({
      chatId: "chat-123",
      mediaType: "image",
      query: "last uploaded",
      limit: 5,
    });

    expect(result.success).toBe(true);
    expect(result.found).toBe(1);
    expect(result.media[0].id).toBe("img-1");
    expect(result.media[0].role).toBe("user");
  });

  it("should find image by content (moon)", async () => {
    vi.spyOn(contextManager, "getChatMedia").mockResolvedValue(mockMedia);

    const tool = findMediaInChat({ session: mockSession });
    const result = await tool.execute({
      chatId: "chat-123",
      mediaType: "image",
      query: "with moon",
      limit: 5,
    });

    expect(result.success).toBe(true);
    expect(result.found).toBe(1);
    expect(result.media[0].id).toBe("img-2");
    expect(result.media[0].prompt).toContain("moon");
  });

  it("should return helpful message when no media found", async () => {
    vi.spyOn(contextManager, "getChatMedia").mockResolvedValue([]);

    const tool = findMediaInChat({ session: mockSession });
    const result = await tool.execute({
      chatId: "chat-123",
      mediaType: "video",
      query: "with cat",
      limit: 5,
    });

    expect(result.success).toBe(true);
    expect(result.found).toBe(0);
    expect(result.message).toContain("No video files found");
    expect(result.suggestion).toBeTruthy();
  });
});
```

#### Integration Tests

**File**: `src/tests/integration/tool-based-media-discovery.test.ts`

```typescript
import { describe, it, expect } from "vitest";
import { streamText } from "ai";
import { myProvider } from "@/lib/ai/providers";
import { findMediaInChat } from "@/lib/ai/tools/find-media-in-chat";
import { configureVideoGeneration } from "@/lib/ai/tools/configure-video-generation";

describe("Tool-based Media Discovery Integration", () => {
  it("should discover media and generate video in single conversation", async () => {
    const mockCreateDocument = {
      execute: vi.fn().mockResolvedValue({ id: "doc-123" }),
    };

    const result = await streamText({
      model: myProvider.languageModel("chat-model"),
      messages: [
        {
          role: "user",
          content: "Animate the image with cat I uploaded earlier",
        },
      ],
      tools: {
        findMediaInChat: findMediaInChat({ session: mockSession }),
        configureVideoGeneration: configureVideoGeneration({
          createDocument: mockCreateDocument,
          session: mockSession,
          chatId: "chat-123",
        }),
      },
      maxSteps: 3,
    });

    // Expect LLM to:
    // 1. Call findMediaInChat first
    // 2. Get media URL
    // 3. Call configureVideoGeneration with that URL

    const toolCalls = result.toolCalls;
    expect(toolCalls[0].toolName).toBe("findMediaInChat");
    expect(toolCalls[1].toolName).toBe("configureVideoGeneration");
    expect(toolCalls[1].args.sourceVideoUrl).toBeTruthy();
  });
});
```

#### E2E Tests

**File**: `src/tests/e2e/media-discovery.spec.ts`

```typescript
import { test, expect } from "@playwright/test";

test.describe("Tool-based Media Discovery", () => {
  test("should find and animate uploaded image", async ({ page }) => {
    // 1. Login
    await page.goto("/");
    await page.click("text=Sign In");
    // ... auth flow

    // 2. Upload image
    await page.click("text=New Chat");
    const fileInput = page.locator("input[type=file]");
    await fileInput.setInputFiles("./fixtures/test-cat.jpg");
    await page.click("button:has-text('Send')");

    // Wait for image to appear
    await expect(page.locator("img[alt*='test-cat']")).toBeVisible();

    // 3. Request animation
    await page.fill("textarea", "Animate this image with cat");
    await page.click("button:has-text('Send')");

    // 4. Verify tool calls in network
    const toolCallRequest = await page.waitForRequest(req =>
      req.url().includes("/api/chat") &&
      req.postData()?.includes("findMediaInChat")
    );

    expect(toolCallRequest).toBeTruthy();

    // 5. Verify video generation started
    await expect(page.locator("text=Generating video")).toBeVisible({ timeout: 10000 });
  });
});
```

---

## 4. File-by-File Implementation Checklist

### 4.1 New Files to Create

| File | Purpose | Lines (Est.) | Dependencies |
|------|---------|-------------|--------------|
| `src/lib/ai/tools/find-media-in-chat.ts` | Main media search tool | ~250 | `universal-context`, `query-parser` |
| `src/lib/ai/tools/analyze-media-reference.ts` | Reference analysis tool | ~150 | `image-context-analyzer`, `video-context-analyzer` |
| `src/lib/ai/tools/list-available-media.ts` | Media summary tool | ~100 | `universal-context` |
| `src/lib/ai/context/query-parser.ts` | Query to patterns converter | ~200 | `universal-context` |
| `src/lib/ai/context/pattern-matcher.ts` | Apply patterns to media | ~100 | `universal-context`, `query-parser` |
| `src/tests/unit/ai-tools/find-media-in-chat.test.ts` | Unit tests | ~300 | `vitest` |
| `src/tests/integration/tool-based-media-discovery.test.ts` | Integration tests | ~200 | `vitest`, `ai` |
| `src/tests/e2e/media-discovery.spec.ts` | E2E tests | ~150 | `playwright` |

**Total New Code**: ~1,450 lines

### 4.2 Files to Modify

| File | Changes | Impact |
|------|---------|--------|
| `src/app/(chat)/api/chat/route.ts` | Add tool imports, feature flag, remove pre-analysis (Phase 3) | High |
| `src/lib/ai/prompts.ts` | Add media discovery guidance | Medium |
| `src/lib/ai/tools/configure-image-generation.ts` | Update to work without `defaultSourceImageUrl` | Medium |
| `src/lib/ai/tools/configure-video-generation.ts` | Update to work without `defaultSourceVideoUrl` | Medium |
| `src/lib/ai/context/universal-context.ts` | Extract reusable functions | Low |
| `src/lib/ai/context/index.ts` | Export new utilities | Low |

### 4.3 Files to Keep (Backward Compatibility)

| File | Reason | Eventually Remove? |
|------|--------|-------------------|
| `src/lib/ai/context/image-context-analyzer.ts` | Contains pattern library | Phase 3 (extract patterns first) |
| `src/lib/ai/context/video-context-analyzer.ts` | Contains pattern library | Phase 3 (extract patterns first) |
| `src/lib/ai/context/universal-context.ts` | Core context management | Keep (refactor) |

---

## 5. Migration Phases Timeline

### Phase 1: Foundation (Week 1-2)

**Goal**: Create new tools without breaking existing functionality.

**Tasks**:
1. ✅ Create `query-parser.ts` - extract pattern matching logic
2. ✅ Create `pattern-matcher.ts` - apply patterns to media
3. ✅ Create `find-media-in-chat.ts` - main search tool
4. ✅ Create `analyze-media-reference.ts` - reference analysis
5. ✅ Create `list-available-media.ts` - media summary
6. ✅ Write unit tests for all new tools
7. ✅ Add tools to chat route (inactive, for testing)

**Success Criteria**:
- All unit tests pass
- Tools can be manually tested via API
- No impact on existing user flows

### Phase 2: Hybrid Mode (Week 3-4)

**Goal**: Run both systems in parallel, validate tool-based approach.

**Tasks**:
1. ✅ Add feature flag `ENABLE_TOOL_MEDIA_DISCOVERY`
2. ✅ Update system prompt with media discovery guidance
3. ✅ Enable tools in `experimental_activeTools`
4. ✅ Add integration tests
5. ✅ Run A/B test with 10% users
6. ✅ Monitor tool usage metrics
7. ✅ Collect feedback and iterate

**Success Criteria**:
- Tool-based discovery works in real conversations
- User satisfaction maintained or improved
- LLM successfully uses tools without explicit instruction

**Metrics to Track**:
- Tool call success rate
- Media discovery accuracy
- User session length (engagement)
- Error rates (media not found)
- Latency (tool calls add overhead)

### Phase 3: Deprecation (Week 5-6)

**Goal**: Remove pre-analysis, make tools primary mechanism.

**Tasks**:
1. ✅ Remove `defaultSourceImageUrl`/`defaultSourceVideoUrl` logic
2. ✅ Clean up pre-analysis code from chat route
3. ✅ Update configure*Generation tools to require explicit URLs
4. ✅ Add comprehensive error handling
5. ✅ Write migration guide for developers
6. ✅ Update documentation

**Success Criteria**:
- All users on tool-based system
- Old analyzer code removed
- No regression in functionality
- Clear developer documentation

---

## 6. Risk Assessment & Mitigation

### Risk 1: LLM Doesn't Use Tools Correctly

**Likelihood**: Medium
**Impact**: High

**Symptoms**:
- LLM calls `configureVideoGeneration` without calling `findMediaInChat` first
- LLM passes placeholder URLs like "this-image" instead of actual URLs
- LLM misunderstands when to search for media

**Mitigation**:
1. **Strong System Prompt**: Provide clear examples of correct workflow
2. **Tool Descriptions**: Write LLM-optimized descriptions with use cases
3. **Validation**: Reject placeholder URLs in configure*Generation tools
4. **Fallback**: If no URL provided, tool can auto-call findMediaInChat
5. **Monitoring**: Track tool usage patterns, identify issues early

**Example Validation**:
```typescript
// In configureVideoGeneration
if (sourceVideoUrl && !isValidUrl(sourceVideoUrl)) {
  return {
    error: "Invalid sourceVideoUrl. Please use findMediaInChat tool first to get actual media URL.",
    suggestion: "Call findMediaInChat({ mediaType: 'image', query: 'last uploaded' }) to find media",
  };
}
```

### Risk 2: Performance Degradation

**Likelihood**: Medium
**Impact**: Medium

**Symptoms**:
- Extra tool calls add latency (user waits longer)
- Multiple round-trips to database
- Increased API costs (more tokens for tool calls)

**Mitigation**:
1. **Caching**: Reuse existing context cache system
2. **Batching**: Fetch all media once, cache in tool execution
3. **Optimization**: Index media by chatId for fast lookups
4. **Limits**: Cap search results to prevent large responses
5. **Monitoring**: Track P95 latency, set alerts

**Performance Targets**:
- Tool execution: < 500ms
- Total extra latency: < 1s per conversation
- Token overhead: < 200 tokens per tool call

### Risk 3: Backward Compatibility Break

**Likelihood**: Low (with proper phasing)
**Impact**: High

**Symptoms**:
- Existing user flows break
- Media discovery stops working
- Regression in accuracy

**Mitigation**:
1. **Feature Flag**: Keep old system available during transition
2. **Gradual Rollout**: 10% → 50% → 100% over 2 weeks
3. **Rollback Plan**: Can disable tools via env variable
4. **Testing**: Comprehensive integration and E2E tests
5. **Monitoring**: Real-time error tracking, automated rollback on spike

**Rollback Procedure**:
```bash
# Emergency rollback
export ENABLE_TOOL_MEDIA_DISCOVERY=false
pm2 restart app
# Old system takes over immediately
```

### Risk 4: Pattern Library Loss

**Likelihood**: Low
**Impact**: Medium

**Symptoms**:
- Queries that worked with regex fail with tools
- Language-specific patterns (Russian) not handled
- Edge cases missed

**Mitigation**:
1. **Pattern Preservation**: Extract all patterns to `query-parser.ts`
2. **Test Coverage**: Convert existing analyzer tests to tool tests
3. **Fallback**: If pattern matching fails, use semantic search
4. **Documentation**: Document all pattern types and examples
5. **Regression Tests**: Test suite covering all pattern categories

**Pattern Migration Checklist**:
- [ ] Direct references: "this image", "that video"
- [ ] Position-based: "first image", "last video"
- [ ] Role-based: "uploaded image", "generated video"
- [ ] Content-based: "image with moon", "video with cat"
- [ ] Temporal: "recent image", "previous video"
- [ ] Russian language: Same patterns in Cyrillic
- [ ] Image-to-video: "animate this image"
- [ ] Edit intent: "edit this picture"

---

## 7. Success Metrics

### 7.1 Technical Metrics

**Tool Usage**:
- `findMediaInChat` call rate: > 80% of media generation requests
- Tool success rate: > 90% (found media when it exists)
- Average tool calls per conversation: 1-2

**Performance**:
- P50 tool latency: < 300ms
- P95 tool latency: < 800ms
- Total conversation latency increase: < 1s
- Cache hit rate: > 60%

**Accuracy**:
- Media discovery accuracy: > 95% (matches user intent)
- False positive rate: < 5% (wrong media selected)
- No media found (when exists): < 10%

**Code Quality**:
- Test coverage: > 85%
- TypeScript strict mode: No errors
- Linter: No warnings
- Bundle size increase: < 50KB

### 7.2 User Experience Metrics

**Engagement**:
- Session duration: Maintained or increased
- Media generation rate: Maintained or increased
- Feature adoption: > 70% of users try media features

**Satisfaction**:
- Error rate: < 5% of conversations
- User reports of "AI couldn't find media": < 2%
- Thumbs up/down ratio: Maintained or improved

**Conversion**:
- Trial to paid conversion: Maintained or increased
- Feature usage retention: > 80% (users who try it, keep using it)

### 7.3 Monitoring Dashboard

**Key Indicators**:
```
┌─────────────────────────────────────────────────┐
│ Tool-Based Media Discovery Metrics              │
├─────────────────────────────────────────────────┤
│ Tool Call Success Rate:        93.2% ✅        │
│ Average Latency:              427ms ✅         │
│ Cache Hit Rate:                68.5% ✅        │
│ Media Discovery Accuracy:      96.1% ✅        │
│ Error Rate:                     3.2% ✅        │
│ Active Users (Phase 2):           10% 🟡       │
├─────────────────────────────────────────────────┤
│ Alerts:                                         │
│ • None                                          │
└─────────────────────────────────────────────────┘
```

**Alert Thresholds**:
- Tool success rate < 85%: Warning
- P95 latency > 1s: Warning
- Error rate > 10%: Critical
- Cache hit rate < 40%: Investigate

---

## 8. Documentation Plan

### 8.1 Developer Documentation

**File**: `apps/super-chatbot/docs/ai-capabilities/tool-based-media-discovery.md`

**Content**:
- Architecture overview
- Tool descriptions and parameters
- Integration guide for new features
- Testing guide
- Troubleshooting common issues

### 8.2 Migration Guide

**File**: `apps/super-chatbot/docs/development/media-discovery-migration-guide.md`

**Content**:
- Why we migrated
- Before vs After comparison
- Phase-by-phase rollout
- Feature flag usage
- Rollback procedures
- FAQ

### 8.3 API Reference

**File**: `apps/super-chatbot/docs/api-integration/media-tools-reference.md`

**Content**:
- Tool signatures with Zod schemas
- Response formats
- Error codes
- Usage examples
- Best practices

### 8.4 User-Facing Documentation

**Update**: `apps/super-chatbot/docs/ai-capabilities/overview.md`

**Add Section**:
```markdown
## Smart Media Discovery

Our AI can now intelligently find media in your chat history:

**Examples**:
- "Animate the image with the cat" → AI searches for cat image
- "Edit my last photo" → AI finds most recent uploaded image
- "Use the second video" → AI selects second video in history

**Benefits**:
- More natural conversation flow
- No need to remember exact media names
- Works with both uploaded and generated media
```

---

## 9. Next Steps After Migration

### 9.1 Future Enhancements

**Enhanced Query Understanding**:
- NLP-based query parsing (not just regex)
- Multi-language support beyond English/Russian
- Context-aware disambiguation

**Advanced Search**:
- Visual similarity search (image embeddings)
- Audio content search (transcription-based)
- Cross-media search (find video from image description)

**User Preferences**:
- Learn user's preferred media selection patterns
- Personalized search ranking
- Remember frequently used media

**Performance Optimizations**:
- Pre-compute embeddings for semantic search
- Index media by content tags
- Predictive caching based on conversation flow

### 9.2 Potential New Tools

**`compareMedia`**:
- Compare two media side-by-side
- Useful for "which is better" questions

**`suggestMediaActions`**:
- Analyze media, suggest what user can do with it
- "You can: animate, edit background, upscale, etc."

**`createMediaPlaylist`**:
- Group related media
- "Show me all sunset images"

---

## 10. Conclusion

This migration transforms media discovery from a **rule-based pre-processing step** into an **intelligent, LLM-driven capability**. By leveraging AI SDK tools, we:

1. **Empower the LLM**: Make decisions about when and how to search for media
2. **Improve Flexibility**: Not limited to hardcoded patterns
3. **Enhance User Experience**: More natural conversation flow
4. **Maintain Compatibility**: Phased approach prevents disruption
5. **Enable Future Growth**: Foundation for advanced media features

**Key Takeaway**: We're not just migrating code—we're fundamentally improving how the AI understands and works with user media.

---

## Appendix A: Code Examples

### Example 1: LLM Conversation Flow (Before vs After)

**Before** (Pre-analysis):
```
User: "animate the cat image"
  ↓
[System pre-analyzes message]
  - Detects: image-to-video intent
  - Finds: last image with "cat" in prompt
  - Sets: defaultSourceImageUrl = "https://..."
  ↓
LLM: "I'll create a video from that image"
LLM calls: configureVideoGeneration({
  prompt: "cat animation",
  sourceVideoUrl: "https://..." // Pre-filled
})
```

**After** (Tool-based):
```
User: "animate the cat image"
  ↓
LLM: "User wants to animate an image with cat. Let me find it."
LLM calls: findMediaInChat({
  mediaType: "image",
  query: "with cat"
})
  ↓
Tool returns: {
  media: [{ url: "https://...", prompt: "cute cat playing" }]
}
  ↓
LLM: "Found the image! Now creating video..."
LLM calls: configureVideoGeneration({
  prompt: "animate cat playing",
  sourceVideoUrl: "https://..." // From tool result
})
```

**Advantages of After**:
- LLM sees what media was found
- Can retry if wrong media selected
- Can ask user for clarification
- Transparent reasoning process

### Example 2: Error Handling (Before vs After)

**Before**:
```
User: "animate the moon image"
  ↓
[System pre-analyzes]
  - No image with "moon" found
  - Falls back to last image (cat)
  - Sets: defaultSourceImageUrl = "https://.../cat.jpg"
  ↓
LLM calls: configureVideoGeneration({
  sourceVideoUrl: "https://.../cat.jpg" // Wrong image!
})
  ↓
Result: Video of cat, not moon (user confused)
```

**After**:
```
User: "animate the moon image"
  ↓
LLM calls: findMediaInChat({
  mediaType: "image",
  query: "with moon"
})
  ↓
Tool returns: {
  found: 0,
  message: "No images found matching 'with moon'",
  suggestion: "Ask user to clarify or upload image"
}
  ↓
LLM: "I couldn't find an image with moon in our chat.
     Could you upload the image you'd like me to animate?"
  ↓
Result: Clear communication, user knows to upload image
```

### Example 3: Complex Query (Advantage of Tools)

**User**: "Create a video from the sunset picture I uploaded yesterday, but make it more dramatic"

**Before** (Limited):
```
[System analyzes]
- Pattern match: "picture I uploaded"
- Finds: last uploaded image (might not be sunset)
- No understanding of "yesterday" timing
- No understanding of "dramatic" style preference
```

**After** (Intelligent):
```
LLM: "User wants video from specific uploaded image"
LLM calls: findMediaInChat({
  mediaType: "image",
  query: "uploaded yesterday sunset",
  role: "user"
})
  ↓
Tool: Checks timestamps, finds images from ~24h ago,
      filters for "sunset" in prompt
  ↓
LLM calls: configureVideoGeneration({
  prompt: "dramatic cinematic sunset, enhanced colors,
          slow motion clouds",
  sourceVideoUrl: "https://...",
  style: "cinematic" // Interprets "dramatic"
})
```

**Result**: Correct image found, style intent understood

---

## Appendix B: Environment Variables

### New Environment Variables

```bash
# Feature flag for tool-based media discovery
ENABLE_TOOL_MEDIA_DISCOVERY=false  # default: false (Phase 1-2)
# Set to true in Phase 3

# Performance tuning
MEDIA_SEARCH_CACHE_TTL=3600  # Cache TTL in seconds (default: 1 hour)
MEDIA_SEARCH_MAX_RESULTS=20  # Max results per search (default: 20)

# Monitoring
MEDIA_TOOLS_TELEMETRY=true  # Enable metrics tracking (default: true)
```

### Configuration Example

```typescript
// src/lib/config/media-tools.ts
export const mediaToolsConfig = {
  enabled: process.env.ENABLE_TOOL_MEDIA_DISCOVERY === "true",
  cache: {
    ttl: Number(process.env.MEDIA_SEARCH_CACHE_TTL) || 3600,
  },
  search: {
    maxResults: Number(process.env.MEDIA_SEARCH_MAX_RESULTS) || 20,
    enableSemanticFallback: true,
  },
  telemetry: {
    enabled: process.env.MEDIA_TOOLS_TELEMETRY !== "false",
  },
};
```

---

## Appendix C: Sample Test Scenarios

### Test Scenario 1: Basic Image Reference

```typescript
test("finds last uploaded image with direct reference", async () => {
  // Setup
  await uploadImage("cat.jpg", "A cute cat");

  // Act
  const response = await chat("Edit this image to make cat blue");

  // Assert
  expect(response.toolCalls).toContainEqual({
    toolName: "findMediaInChat",
    args: { mediaType: "image", query: expect.stringContaining("last") },
  });

  expect(response.toolCalls).toContainEqual({
    toolName: "configureImageGeneration",
    args: {
      sourceImageUrl: expect.stringMatching(/cat\.jpg/),
      prompt: expect.stringContaining("blue cat"),
    },
  });
});
```

### Test Scenario 2: Semantic Search

```typescript
test("finds image by content description", async () => {
  // Setup
  await uploadImage("image1.jpg", "A dog in the park");
  await uploadImage("image2.jpg", "A cat on the moon");
  await uploadImage("image3.jpg", "A sunset over ocean");

  // Act
  const response = await chat("Animate the space cat image");

  // Assert
  const mediaResult = response.toolResults.find(
    r => r.toolName === "findMediaInChat"
  );

  expect(mediaResult.result.media[0].prompt).toContain("moon");
  // Found image2.jpg based on "space" → "moon" semantic match
});
```

### Test Scenario 3: Error Recovery

```typescript
test("handles missing media gracefully", async () => {
  // Setup: No images uploaded

  // Act
  const response = await chat("Animate my sunset photo");

  // Assert
  const mediaResult = response.toolResults.find(
    r => r.toolName === "findMediaInChat"
  );

  expect(mediaResult.result.found).toBe(0);
  expect(mediaResult.result.suggestion).toBeTruthy();

  // LLM should respond with helpful message
  expect(response.text).toMatch(
    /couldn't find|no.*found|upload.*image/i
  );
});
```

---

## Appendix D: Migration Checklist

### Pre-Migration
- [ ] Review and approve plan
- [ ] Set up feature flag infrastructure
- [ ] Create monitoring dashboards
- [ ] Prepare rollback procedures
- [ ] Notify team of upcoming changes

### Phase 1: Foundation
- [ ] Create `query-parser.ts`
- [ ] Create `pattern-matcher.ts`
- [ ] Create `find-media-in-chat.ts`
- [ ] Create `analyze-media-reference.ts`
- [ ] Create `list-available-media.ts`
- [ ] Write unit tests (>85% coverage)
- [ ] Add tools to chat route (inactive)
- [ ] Manual testing via API
- [ ] Code review and approval

### Phase 2: Hybrid Mode
- [ ] Enable feature flag for 10% users
- [ ] Update system prompt
- [ ] Activate tools in experimental_activeTools
- [ ] Monitor metrics for 3 days
- [ ] Increase to 50% if metrics good
- [ ] Collect user feedback
- [ ] Iterate on tool descriptions
- [ ] Increase to 100% if metrics excellent

### Phase 3: Deprecation
- [ ] Remove defaultSourceImageUrl logic
- [ ] Remove defaultSourceVideoUrl logic
- [ ] Clean up pre-analysis code
- [ ] Update configure*Generation tools
- [ ] Remove old analyzer tests
- [ ] Update documentation
- [ ] Announce deprecation in changelog

### Post-Migration
- [ ] Archive old analyzer code
- [ ] Create developer migration guide
- [ ] Update onboarding materials
- [ ] Plan future enhancements
- [ ] Celebrate success! 🎉

---

**Plan Version**: 1.0
**Created**: 2025-10-07
**Author**: Guillermo (Claude Code Agent)
**Status**: Ready for Review
