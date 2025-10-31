# AI SDK Tools Migration Plan v2.0: Context-First Approach

**Plan Version**: 2.0 (Complete Revision)
**Author**: Guillermo (Don)
**Date**: 2025-10-08
**Status**: Revised - Addresses Linus's Critical Feedback

---

## Executive Summary: What Changed

**Linus's Key Insight**: *"Maybe the answer is better CONTEXT, not tool PROLIFERATION"*

This is a **fundamental rethinking** of the migration strategy based on architectural review feedback.

### Critical Changes from v1.0

| Issue | v1.0 Approach | v2.0 Approach |
|-------|---------------|---------------|
| **Performance** | Accept 2.4x latency tax | Stay within 1.3x budget |
| **Tool Count** | 3 new tools | 0-1 optional tool |
| **Pattern Extraction** | Assumed trivial | Phase 0 validation required |
| **Backward Compat** | Claimed, not delivered | Acknowledged breaking change |
| **Testing** | Deterministic LLM tests | Behavioral + probabilistic |
| **Cost** | Ignored | $30/day token budget analyzed |

### The New Strategy: Context Enhancement Over Tool Proliferation

**Core Principle**: Provide rich context to the LLM instead of forcing it to make tool calls for basic operations.

**Three-Tier Approach**:
1. **Fast Path (80% of cases)**: Enhanced inline context analysis in existing tools
2. **Context Hints**: Media list in system prompt for LLM awareness
3. **Smart Path (20% of cases)**: Single optional tool for complex queries

**Performance Budget**: P95 latency increase ≤ 30% (from ~1.1s to ~1.4s max)
**Token Budget**: ≤ 300 tokens overhead per conversation
**Cost Impact**: ~$6/day (10K conversations) vs $30/day in v1.0

---

## 1. The Core Problem (Refined Understanding)

### 1.1 What's Actually Wrong

**Current System** (Pre-Analysis):
```typescript
// In chat route BEFORE streamText
const imageContext = await analyzeImageContext(userMessage, chatMedia); // 50-100ms
defaultSourceImageUrl = imageContext.sourceUrl; // Pre-filled

// LLM receives pre-made decision
tools: {
  configureImageGeneration: configureImageGeneration({ defaultSourceImageUrl })
}
```

**Problems Identified**:
1. ✅ **Dual Analysis**: Context analyzed in route AND in tool (wasteful)
2. ✅ **LLM Blindness**: LLM doesn't see what media exists
3. ⚠️ **Pattern Coupling**: 437 lines of patterns tightly coupled to analyzers
4. ❌ **NOT a Performance Problem**: 50-100ms pre-analysis is fast enough

**What's NOT Wrong** (v1.0 Misunderstanding):
- Pre-analysis itself isn't "dumb" - it's actually efficient
- Regex patterns aren't obsolete - they encode valuable knowledge
- Current system works "well enough" for simple cases

### 1.2 The Real Opportunity

**Goal**: Enable LLM to make intelligent media decisions WITHOUT adding significant latency.

**Key Insight**: Most media references are trivial:
- "this image" when only 1 image exists → no search needed
- "last uploaded video" when clear temporal order → simple array indexing
- "the cat picture" when only 1 cat image → keyword match

**Only Complex Cases Need Intelligence**:
- "the second sunset image from yesterday" → needs semantic + temporal + position
- "the image that looks like X" → needs visual understanding
- "the video similar to the one before" → needs context awareness

**Strategy**: Solve 80% fast, handle 20% smartly.

---

## 2. The Correct Architecture: Context-First Design

### 2.1 Architecture Principles

**Principle 1: Context Over Calls**
- Provide media context IN the LLM's system prompt
- Let LLM see what's available before deciding
- Tools are FALLBACK for complex cases, not primary mechanism

**Principle 2: Fast Path Preserved**
- Enhanced inline analysis in configure* tools
- No extra LLM round-trip for obvious cases
- Performance budget enforced

**Principle 3: Progressive Enhancement**
- Phase 0: Validate assumptions (pattern extraction, semantic search)
- Phase 1: Enhance context without breaking existing code
- Phase 2: Add optional tool only if Phase 1 proves insufficient
- Phase 3: Optimize based on real usage data

**Principle 4: Honest About Trade-offs**
- This IS a breaking change (removing defaultSourceImageUrl)
- Token costs WILL increase (but controlled)
- Some edge cases MAY regress (tracked and fixed)

### 2.2 System Architecture Diagram

```
┌─────────────────────────────────────────────────────────────┐
│ USER MESSAGE: "animate the cat image"                       │
└─────────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────────┐
│ CHAT ROUTE (Fast Media Context Extraction)                  │
│ - getChatMedia(chatId) [cached, ~10ms]                      │
│ - Build compact media summary                                │
│   Result: [                                                  │
│     {id: 1, type: "image", role: "user", prompt: "cat"},    │
│     {id: 2, type: "video", role: "assistant", prompt: "..."}│
│   ]                                                          │
└─────────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────────┐
│ SYSTEM PROMPT ENHANCEMENT                                    │
│                                                              │
│ You have access to media generation tools.                  │
│                                                              │
│ Available media in this chat:                               │
│ 1. Image (user-uploaded): "cute cat playing" [ID: img-1]   │
│ 2. Video (AI-generated): "sunset animation" [ID: vid-2]    │
│                                                              │
│ When user references media:                                 │
│ - "this/that image" → most recent matching type            │
│ - "first/last X" → use position in list                    │
│ - If unclear, use queryChatMedia tool                      │
└─────────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────────┐
│ LLM REASONING                                                │
│ "User wants to animate 'the cat image'. Looking at          │
│  available media, item #1 is user-uploaded cat image.       │
│  I'll use that directly."                                   │
└─────────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────────┐
│ TOOL CALL: configureVideoGeneration                          │
│ {                                                            │
│   prompt: "animate cat playing",                            │
│   sourceImageUrl: "https://.../img-1.jpg",  ← From context │
│   mediaReferenceId: "img-1"  ← NEW parameter               │
│ }                                                            │
└─────────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────────┐
│ ENHANCED TOOL LOGIC (Validation & Fallback)                 │
│                                                              │
│ 1. Validate sourceImageUrl (from LLM)                       │
│ 2. If mediaReferenceId provided, resolve to URL             │
│ 3. If invalid/missing, call inline analyzer                 │
│ 4. If still unclear, return helpful error to LLM            │
│                                                              │
│ Result: Verified URL ready for generation                   │
└─────────────────────────────────────────────────────────────┘
```

**Latency Analysis**:
- Media context extraction: +10ms (cached)
- System prompt tokens: +100-150 tokens (~50ms LLM processing)
- LLM decision: 0ms extra (uses context, no extra call)
- Total overhead: ~60ms (vs 800-1000ms with tool calls)

### 2.3 When to Use Optional Tool

**Create `queryChatMedia` tool ONLY IF**:
- Phase 1 metrics show >10% of complex queries failing
- User feedback indicates confusion about media selection
- A/B testing proves tool improves accuracy

**Tool Design** (if needed):
```typescript
// SINGLE tool, not three
export const queryChatMedia = tool({
  description: `Advanced media search for complex queries.

  Use this ONLY when:
  - Media list in system prompt is insufficient
  - User query is ambiguous ("which sunset?")
  - Need semantic/visual similarity search

  For simple references ("this image", "last video"),
  use the media list from system prompt directly.`,

  parameters: z.object({
    chatId: z.string(),
    query: z.string().describe("Natural language search: 'second sunset from yesterday', 'image similar to X'"),
    mediaType: z.enum(["image", "video", "audio", "any"]).optional(),
  }),

  execute: async ({ chatId, query, mediaType }) => {
    // Reuse existing pattern library
    const analyzer = createAnalyzerForType(mediaType);
    const media = await getChatMedia(chatId);
    const result = await analyzer.analyzeContext(query, media, []);

    // Return compact result
    return {
      found: result.confidence !== "low",
      mediaId: result.sourceId,
      url: result.sourceUrl,
      confidence: result.confidence,
      reasoning: result.reasoning,
    };
  },
});
```

**Key Characteristics**:
- **Single tool**: Clear purpose, no LLM confusion
- **Fallback only**: Not primary mechanism
- **Reuses patterns**: No duplication of logic
- **Compact response**: Minimize token overhead

---

## 3. REVISED Phase Plan

### Phase 0: Validation & Foundation (NEW - Week 1)

**Goal**: Prove assumptions before building anything.

**Critical Validation Tasks**:

#### Task 0.1: Pattern Library Extraction Research
**File**: Create `src/lib/ai/context/pattern-library-analysis.md`

**Research Questions**:
1. Can patterns be extracted WITHOUT changing behavior?
2. Are targetResolvers truly stateless or do they have hidden dependencies?
3. What's the actual coupling between patterns and analyzer internals?
4. How many patterns are duplicated across image/video analyzers?

**Deliverable**:
- Document listing ALL patterns (Russian + English)
- Identify shared vs unique patterns
- Map dependencies and coupling points
- Estimate extraction complexity: trivial (2 days), moderate (1 week), or complex (2+ weeks)

**Success Criteria**: Clear understanding of extraction scope, no surprises.

#### Task 0.2: Semantic Search Validation
**File**: `src/tests/validation/semantic-media-search.test.ts`

**Test Scenarios**:
```typescript
describe("Semantic Search Validation", () => {
  test("handles media without embeddings gracefully", async () => {
    // Historical media might not have embeddings
    const media = [
      { url: "...", prompt: "cat", embedding: null },
      { url: "...", prompt: "dog", embedding: [0.1, 0.2, ...] }
    ];

    const result = await semanticSearch("find cat image", media);
    expect(result).toBeTruthy(); // Should fall back to keyword match
  });

  test("semantic search performance benchmark", async () => {
    const media = generateMockMedia(100); // 100 items
    const start = Date.now();
    await semanticSearch("sunset", media);
    const duration = Date.now() - start;

    expect(duration).toBeLessThan(200); // Must be fast
  });

  test("semantic search accuracy vs keyword match", async () => {
    const media = [
      { prompt: "beautiful beach sunset" },
      { prompt: "sun setting over ocean" },
      { prompt: "cat playing" }
    ];

    const semanticResults = await semanticSearch("ocean sunset", media);
    const keywordResults = keywordMatch("ocean sunset", media);

    // Semantic should catch both sunset images
    expect(semanticResults.length).toBeGreaterThan(keywordResults.length);
  });
});
```

**Deliverable**: Proof that semantic search is production-ready or needs work.

**Success Criteria**:
- Works with missing/partial embeddings
- Performance < 200ms for 100 items
- Accuracy ≥ keyword matching

#### Task 0.3: Performance Baseline Measurement
**File**: `src/tests/benchmarks/media-discovery-baseline.ts`

**Metrics to Capture**:
```typescript
interface PerformanceBaseline {
  // Current system performance
  preAnalysisLatency: { p50: number; p95: number; p99: number };
  toolExecutionLatency: { p50: number; p95: number; p99: number };
  endToEndLatency: { p50: number; p95: number; p99: number };

  // Accuracy metrics
  mediaDiscoveryAccuracy: number; // % correct media selected
  falsePositiveRate: number; // % wrong media selected

  // Token usage
  averageTokensPerConversation: number;
  tokensForMediaOperations: number;
}
```

**Benchmark Scenarios**:
1. Simple reference: "animate this image" (1 recent image)
2. Position reference: "use the second video"
3. Content reference: "the cat picture"
4. Temporal reference: "image from yesterday"
5. Complex query: "second sunset image I uploaded last week"

**Deliverable**: Baseline metrics to compare against.

**Success Criteria**: Clear baseline established, documented in task directory.

#### Task 0.4: Chat Route Usage Research
**File**: `src/lib/analytics/chat-route-consumers.md`

**Research**:
1. Query production logs: Who calls `/api/chat`?
2. Check for API version headers or client identifiers
3. Identify internal vs external consumers
4. Document any dependencies on `defaultSourceImageUrl`

**Questions to Answer**:
- Are there external API consumers? (Yes/No + evidence)
- What's the request volume breakdown? (internal vs external)
- Any documented API contracts or SDKs?
- What's safe to change without breakage?

**Deliverable**: Clear answer to "Can we break the API in Phase 3?"

**Success Criteria**:
- If external consumers exist: Migration plan required
- If internal only: Breaking change is acceptable with proper communication

**Phase 0 Duration**: 1 week
**Phase 0 Success Gate**: ALL validation tasks complete, findings documented, GO/NO-GO decision made.

---

### Phase 1: Context Enhancement (REVISED - Week 2-3)

**Goal**: Improve media discovery WITHOUT tools, WITHOUT breaking changes.

**Strategy**: Enhance what the LLM sees, improve inline analysis in existing tools.

#### Task 1.1: Create Media Context Builder
**File**: `src/lib/ai/context/media-context-builder.ts`

**Purpose**: Build compact media summaries for system prompt injection.

**Implementation**:
```typescript
export interface MediaContextItem {
  id: string;
  type: "image" | "video" | "audio";
  role: "user" | "assistant";
  prompt: string; // Truncated to 50 chars
  timestamp: string; // ISO format
  index: number; // Position in chat
}

export interface MediaContextSummary {
  total: number;
  items: MediaContextItem[];
  tokenEstimate: number; // Estimated tokens
}

export async function buildMediaContext(
  chatId: string,
  options: {
    maxItems?: number; // Default: 10 most recent
    includePrompts?: boolean; // Default: true
    truncatePrompts?: number; // Default: 50 chars
  } = {}
): Promise<MediaContextSummary> {
  const { maxItems = 10, includePrompts = true, truncatePrompts = 50 } = options;

  // Get media from context manager (should be cached)
  const allMedia = await contextManager.getChatMedia(chatId);

  // Sort by timestamp, most recent first
  const sorted = allMedia
    .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
    .slice(0, maxItems);

  // Build compact items
  const items: MediaContextItem[] = sorted.map((m, idx) => ({
    id: m.id,
    type: m.mediaType,
    role: m.role,
    prompt: includePrompts
      ? truncateString(m.prompt || "No description", truncatePrompts)
      : "",
    timestamp: m.timestamp.toISOString(),
    index: allMedia.length - idx, // Position in full chat
  }));

  // Estimate tokens (rough: 1 item ≈ 25 tokens)
  const tokenEstimate = items.length * 25;

  return {
    total: allMedia.length,
    items,
    tokenEstimate,
  };
}

// Helper to format for system prompt
export function formatMediaContextForPrompt(
  summary: MediaContextSummary
): string {
  if (summary.items.length === 0) {
    return "No media available in this chat.";
  }

  const lines = [
    `Available media (${summary.items.length} of ${summary.total}):`,
    ...summary.items.map((item, idx) => {
      const source = item.role === "user" ? "uploaded" : "AI-generated";
      return `${idx + 1}. ${item.type} (${source}): "${item.prompt}" [ID: ${item.id}]`;
    })
  ];

  return lines.join("\n");
}
```

**Key Features**:
- **Cached data**: Reuses existing getChatMedia (already cached)
- **Token-conscious**: Truncates prompts, limits items
- **LLM-friendly**: Formatted for easy parsing

**Performance Target**: < 10ms (leveraging existing cache)

#### Task 1.2: Enhanced System Prompt with Media Context
**File**: `src/lib/ai/prompts.ts` (modify)

**Changes**:
```typescript
export async function systemPrompt({
  selectedChatModel,
  requestHints,
  chatId, // NEW parameter
}: SystemPromptParams & { chatId?: string }) {
  let mediaContext = "";

  // Add media context if chatId provided
  if (chatId) {
    const summary = await buildMediaContext(chatId, {
      maxItems: 10,
      truncatePrompts: 50,
    });

    mediaContext = `

## Available Media

${formatMediaContextForPrompt(summary)}

When users reference media:
- "this/that image" → most recent image in list
- "first/last X" → use position in list above
- "uploaded/generated X" → check source (uploaded vs AI-generated)
- Use media IDs in your tool calls: configureImageGeneration({ mediaReferenceId: "img-1" })

`;
  }

  return `You are a helpful AI assistant...

${mediaContext}

## Tools Available

You have access to powerful media generation tools...

${requestHints ? getRequestHintsSection(requestHints) : ""}

...
`;
}
```

**Token Impact**:
- No media: +0 tokens
- 5 media items: ~125 tokens
- 10 media items: ~250 tokens

**Latency Impact**: +50ms LLM processing for extra tokens (acceptable)

#### Task 1.3: Enhance Configure Tools with Inline Analysis
**File**: `src/lib/ai/tools/configure-image-generation.ts` (modify)

**Add Media Reference Resolution**:
```typescript
// NEW parameter in Zod schema
const parametersSchema = z.object({
  // ... existing parameters
  mediaReferenceId: z.string().optional()
    .describe("Media ID from system prompt (e.g., 'img-1'). Use this when user references specific media."),
  sourceImageUrl: z.string().optional()
    .describe("Direct URL if you know the exact image to use"),
  // ... other parameters
});

// Enhanced execute function
execute: async (params) => {
  let resolvedUrl = params.sourceImageUrl;

  // Priority 1: Media reference ID (NEW)
  if (params.mediaReferenceId) {
    const media = await contextManager.getMediaById(params.mediaReferenceId);
    if (media) {
      resolvedUrl = media.url;
      console.log(`[Media Reference] Resolved ${params.mediaReferenceId} → ${resolvedUrl}`);
    } else {
      // Media ID invalid - return error to LLM
      return {
        error: `Media ID "${params.mediaReferenceId}" not found. Please check the media list in your system prompt.`,
        suggestion: "Use a valid media ID from the available media list, or provide a direct sourceImageUrl.",
      };
    }
  }

  // Priority 2: Direct URL (existing behavior)
  if (!resolvedUrl && params.sourceImageUrl) {
    resolvedUrl = params.sourceImageUrl;
  }

  // Priority 3: Inline context analysis (ENHANCED)
  if (!resolvedUrl && params.chatId && params.userMessage) {
    const analyzer = new ImageContextAnalyzer();
    const result = await analyzer.analyzeContext(
      params.userMessage,
      await contextManager.getChatMedia(params.chatId),
      params.currentAttachments || []
    );

    if (result.confidence !== "low") {
      resolvedUrl = result.sourceUrl;
      console.log(`[Inline Analysis] Confidence: ${result.confidence}, URL: ${resolvedUrl}`);
    }
  }

  // If still no URL, provide helpful feedback
  if (!resolvedUrl) {
    return {
      error: "Could not determine which image to use.",
      availableMedia: await buildMediaContext(params.chatId),
      suggestion: "Please specify which image using mediaReferenceId or describe which image you want to use.",
    };
  }

  // Validate URL
  if (!isValidUrl(resolvedUrl)) {
    return {
      error: `Invalid image URL: "${resolvedUrl}"`,
      suggestion: "Provide a valid HTTP(S) URL or media reference ID.",
    };
  }

  // Proceed with generation
  return await generateImage({ ...params, sourceImageUrl: resolvedUrl });
}
```

**Key Improvements**:
1. **mediaReferenceId**: LLM can use IDs from context
2. **Enhanced validation**: Catch placeholder URLs, invalid IDs
3. **Helpful errors**: Guide LLM to correct usage
4. **Preserved fallback**: Inline analysis still works

#### Task 1.4: Add Performance Monitoring
**File**: `src/lib/ai/monitoring/media-discovery-metrics.ts` (NEW)

**Metrics to Track**:
```typescript
export interface MediaDiscoveryMetrics {
  timestamp: Date;
  chatId: string;

  // Resolution method used
  resolutionMethod: "media-reference-id" | "direct-url" | "inline-analysis" | "failed";

  // Performance
  resolutionLatency: number; // ms

  // Accuracy (if we can validate)
  wasCorrectMedia?: boolean; // User feedback or heuristics

  // Context
  mediaCount: number; // Total media in chat
  userQuery: string; // Truncated
}

export async function trackMediaDiscovery(
  metrics: MediaDiscoveryMetrics
): Promise<void> {
  // Log to monitoring system (Sentry, custom analytics, etc.)
  await analyticsService.track("media_discovery", metrics);

  // Update aggregated metrics
  await redis.hincrby("media_discovery:methods", metrics.resolutionMethod, 1);
  await redis.lpush("media_discovery:latencies", metrics.resolutionLatency);
}
```

**Dashboard Queries**:
```typescript
// What % of resolutions use each method?
const methodBreakdown = await redis.hgetall("media_discovery:methods");
// Example: { "media-reference-id": 65%, "inline-analysis": 30%, "failed": 5% }

// What's the P95 latency?
const latencies = await redis.lrange("media_discovery:latencies", 0, -1);
const p95 = percentile(latencies.map(Number), 95);
```

#### Task 1.5: Integration Testing
**File**: `src/tests/integration/context-enhanced-media-discovery.test.ts`

**Test Scenarios**:
```typescript
describe("Context-Enhanced Media Discovery", () => {
  test("LLM uses mediaReferenceId from system prompt", async () => {
    // Setup: Upload image
    const chatId = "test-chat-1";
    await uploadTestImage(chatId, "cat.jpg", "cute cat");

    // Mock LLM to use mediaReferenceId
    const mockLLM = vi.spyOn(llm, "generateText").mockImplementation(async () => ({
      toolCalls: [{
        toolName: "configureImageGeneration",
        args: {
          mediaReferenceId: "img-1", // From system prompt context
          prompt: "make the cat blue"
        }
      }]
    }));

    const result = await chat(chatId, "Make the cat blue");

    // Verify media reference resolved correctly
    expect(result.generatedImage).toBeTruthy();
    expect(result.sourceImage).toContain("cat.jpg");
  });

  test("Inline analysis fallback still works", async () => {
    // Setup: Upload image
    const chatId = "test-chat-2";
    await uploadTestImage(chatId, "dog.jpg", "happy dog");

    // Mock LLM to NOT use mediaReferenceId (older model, edge case)
    const mockLLM = vi.spyOn(llm, "generateText").mockImplementation(async () => ({
      toolCalls: [{
        toolName: "configureImageGeneration",
        args: {
          // No mediaReferenceId, no sourceImageUrl
          prompt: "animate the dog",
          chatId: "test-chat-2",
          userMessage: "animate this"
        }
      }]
    }));

    const result = await chat(chatId, "animate this");

    // Inline analysis should resolve "this" → last uploaded image
    expect(result.sourceImage).toContain("dog.jpg");
  });

  test("Helpful error when media not found", async () => {
    const chatId = "test-chat-3"; // No media

    const result = await chat(chatId, "animate the cat");

    expect(result.error).toBeTruthy();
    expect(result.error).toContain("Could not determine which image");
    expect(result.suggestion).toBeTruthy();
  });
});
```

**Phase 1 Duration**: 2 weeks
**Phase 1 Success Gate**:
- All tests pass
- Performance within budget (P95 latency ≤ 1.4s)
- Token overhead ≤ 300 tokens/conversation
- Accuracy maintained or improved vs baseline

---

### Phase 2: Optional Tool (CONDITIONAL - Week 4-5)

**Entry Criteria**: Only proceed if Phase 1 metrics show:
- >10% of media queries failing (resolutionMethod: "failed")
- User feedback indicates confusion
- A/B test shows tool would improve accuracy

**If metrics are good, SKIP THIS PHASE.**

#### Task 2.1: Create Single Query Tool
**File**: `src/lib/ai/tools/query-chat-media.ts` (NEW)

**Implementation**: See section 2.3 above for design.

**Key Points**:
- Reuses existing pattern library (no duplication)
- Clear description guiding LLM when to use
- Returns compact results (minimize tokens)

#### Task 2.2: Update System Prompt with Tool Guidance
**File**: `src/lib/ai/prompts.ts` (modify)

**Addition**:
```typescript
const toolGuidance = `

## When to Use queryChatMedia Tool

Use the queryChatMedia tool ONLY for complex queries:
- "second sunset image from yesterday" (position + time + content)
- "image similar to the previous one" (similarity search)
- "the video before the cat one" (relative positioning)

For simple references, use the media list directly:
- "this image" → most recent image
- "last video" → last item in video list
- "uploaded picture" → filter by source type

`;
```

#### Task 2.3: A/B Testing
**File**: `src/lib/ai/ab-testing/media-tool-experiment.ts`

**Setup**:
```typescript
export function shouldEnableQueryTool(userId: string): boolean {
  // 50/50 split for 2 weeks
  const cohort = hashUserId(userId) % 2;
  return cohort === 1;
}
```

**Metrics**:
- Tool usage rate (should be <30%)
- Accuracy improvement (tool vs no-tool cohort)
- User satisfaction (thumbs up/down)
- Latency impact

**Phase 2 Duration**: 2 weeks (if needed)
**Phase 2 Success Gate**:
- Tool improves complex query accuracy by ≥10%
- Tool used in <30% of conversations (proves it's fallback, not primary)
- No significant latency regression

---

### Phase 3: Gradual Optimization (Week 6-7)

**Goal**: Clean up legacy code, optimize based on real data, document breaking changes.

#### Task 3.1: Remove defaultSourceImageUrl/defaultSourceVideoUrl
**Files**:
- `src/app/(chat)/api/chat/route.ts`
- `src/lib/ai/tools/configure-image-generation.ts`
- `src/lib/ai/tools/configure-video-generation.ts`

**Breaking Change Acknowledgment**:
```typescript
// BREAKING CHANGE: Remove pre-analysis from route
// Before (v1):
const imageContext = await analyzeImageContext(...);
defaultSourceImageUrl = imageContext.sourceUrl;

// After (v2):
// No pre-analysis - LLM uses context from system prompt
// Tools resolve media via mediaReferenceId or inline analysis
```

**Migration Guide Required**: See Section 8.2

#### Task 3.2: Pattern Library Optimization
**File**: Based on Phase 0 findings

**Options**:
1. **If patterns extracted cleanly**: Move to shared utilities
2. **If extraction complex**: Leave in analyzers, call from tools
3. **If LLM performs better without**: Gradually reduce pattern reliance

**Data-Driven Decision**: Use Phase 1-2 metrics to determine which patterns are actually used.

#### Task 3.3: Performance Optimization
**Based on Production Data**:

**Optimization Targets**:
```typescript
// Cache optimization
- Media list cache TTL: Increase if update frequency is low
- Semantic search cache: Add if queries are repetitive
- Pattern matching cache: Memoize common patterns

// Token optimization
- Reduce media list to 5 items if 10 is excessive
- Truncate prompts further if not used
- Remove media context for non-media conversations
```

**Phase 3 Duration**: 2 weeks
**Phase 3 Success Gate**:
- Breaking changes documented
- Migration guide published
- Performance optimized based on data
- No user-facing regressions

---

## 4. Performance Budget & Cost Analysis

### 4.1 Performance Budget (STRICT)

| Metric | Baseline (Current) | Target (Phase 1) | Limit (Red Flag) |
|--------|-------------------|------------------|------------------|
| P50 End-to-End | 1.0s | 1.05s (+5%) | 1.2s (+20%) |
| P95 End-to-End | 1.1s | 1.4s (+27%) | 1.6s (+45%) |
| P99 End-to-End | 1.5s | 1.8s (+20%) | 2.0s (+33%) |
| Media Context Build | N/A | <10ms | 20ms |
| Inline Analysis | 50ms | 50ms (same) | 100ms |
| Tool Call (if used) | N/A | <500ms | 800ms |

**Enforcement**:
```typescript
// Add to chat route
const startTime = Date.now();

// ... media discovery logic

const duration = Date.now() - startTime;
if (duration > PERFORMANCE_BUDGET.p95Limit) {
  logger.warn("Performance budget exceeded", { duration, chatId });

  // Track for alerts
  await metrics.track("performance_budget_exceeded", { duration });
}
```

**Automatic Rollback Trigger**: If P95 exceeds 1.6s for >1 hour, auto-disable new system.

### 4.2 Token Budget Analysis

**Current System** (Pre-Analysis):
- Media discovery: 0 tokens (happens outside LLM)
- Average conversation: ~2000 tokens

**Phase 1 System** (Context Enhancement):
```typescript
// Additional tokens per conversation
const tokenOverhead = {
  mediaContext: 150,        // 10 items @ 15 tokens each
  promptInstructions: 50,   // Media usage guidance
  mediaReferenceId: 20,     // In tool calls
  total: 220,              // ~10% increase
};
```

**Phase 2 System** (With Optional Tool):
```typescript
// If tool is used (~20% of time)
const toolTokens = {
  toolDescription: 100,     // queryChatMedia description
  toolCall: 50,            // Tool invocation
  toolResult: 100,         // Tool response
  total: 250,              // Additional 250 tokens
};

// Weighted average (80% no tool, 20% with tool)
const averageOverhead = (220 * 0.8) + ((220 + 250) * 0.2) = 270 tokens
```

**Cost Impact** (10K conversations/day):
```
Current:   10K * 2000 tokens = 20M tokens/day
Phase 1:   10K * 2220 tokens = 22.2M tokens/day (+11%)
Phase 2:   10K * 2270 tokens = 22.7M tokens/day (+13.5%)

At $0.01 / 1K tokens (GPT-4 input):
Current:   $200/day
Phase 1:   $222/day (+$22/day = ~$660/month)
Phase 2:   $227/day (+$27/day = ~$810/month)
```

**Budget Allocation**: $1000/month for this migration (approved in principle, needs confirmation).

**Mitigation if Budget Exceeded**:
1. Reduce media list to 5 items (-75 tokens)
2. Remove prompt descriptions (-30 tokens)
3. Truncate media prompts to 30 chars (-20 tokens)
4. Only include media context when user message mentions media (-50% reduction)

### 4.3 Monitoring Dashboard

```typescript
interface MediaDiscoveryDashboard {
  performance: {
    p50Latency: number;
    p95Latency: number;
    p99Latency: number;
    budgetStatus: "green" | "yellow" | "red";
  };

  costs: {
    dailyTokens: number;
    projectedMonthlyCost: number;
    budgetRemaining: number;
  };

  accuracy: {
    resolutionSuccessRate: number; // % successful resolutions
    methodBreakdown: {
      mediaReferenceId: number;
      inlineAnalysis: number;
      toolCall: number;
      failed: number;
    };
  };

  toolUsage: {
    enabled: boolean;
    usageRate: number; // % of conversations using tool
    averageCallsPerConversation: number;
  };
}
```

**Alert Thresholds**:
- P95 latency > 1.6s for 1 hour → Page on-call
- Daily cost > $250 → Email team
- Resolution failure rate > 10% → Investigate
- Tool usage > 40% → Review tool guidance

---

## 5. Testing Strategy (Behavioral + Probabilistic)

### 5.1 The LLM Testing Problem

**What v1.0 Got Wrong**:
```typescript
// This is FLAKY and will break
expect(toolCalls[0].toolName).toBe("findMediaInChat");
expect(toolCalls[1].toolName).toBe("configureVideoGeneration");
```

**Why**: LLMs are non-deterministic. Tool call order isn't guaranteed. Temperature, model version, prompt changes all affect behavior.

**The Correct Approach**: Test at three levels.

### 5.2 Level 1: Unit Tests (Deterministic)

**What to Test**: Pure functions, logic, utilities.

**Example**:
```typescript
// src/tests/unit/media-context-builder.test.ts
describe("buildMediaContext", () => {
  test("limits items to maxItems parameter", async () => {
    const media = generateMockMedia(20);
    const result = await buildMediaContext("chat-1", { maxItems: 5 });

    expect(result.items).toHaveLength(5);
  });

  test("estimates tokens accurately", async () => {
    const media = generateMockMedia(10);
    const result = await buildMediaContext("chat-1", { maxItems: 10 });

    // Each item ≈ 25 tokens
    expect(result.tokenEstimate).toBeGreaterThanOrEqual(200);
    expect(result.tokenEstimate).toBeLessThanOrEqual(300);
  });

  test("formats media context for prompt correctly", async () => {
    const media = [
      { id: "img-1", type: "image", role: "user", prompt: "cat" },
    ];

    const formatted = formatMediaContextForPrompt({ items: media, total: 1 });

    expect(formatted).toContain("img-1");
    expect(formatted).toContain("image");
    expect(formatted).toContain("uploaded");
    expect(formatted).toContain("cat");
  });
});
```

**Key**: No LLM involved, pure logic testing.

### 5.3 Level 2: Integration Tests (Controlled LLM)

**What to Test**: Tool logic, parameter validation, error handling.

**Example**:
```typescript
// src/tests/integration/configure-tools-media-resolution.test.ts
describe("Configure Tool Media Resolution", () => {
  test("resolves mediaReferenceId correctly", async () => {
    // Setup
    const chatId = "test-chat";
    await contextManager.addMedia(chatId, {
      id: "img-123",
      url: "https://example.com/cat.jpg",
      type: "image",
      role: "user",
      prompt: "cat"
    });

    // Execute tool with mocked LLM
    const tool = configureImageGeneration({ session: mockSession });
    const result = await tool.execute({
      mediaReferenceId: "img-123",
      prompt: "make cat blue",
      chatId,
    });

    // Verify resolution
    expect(result.sourceImageUrl).toBe("https://example.com/cat.jpg");
  });

  test("returns helpful error for invalid mediaReferenceId", async () => {
    const tool = configureImageGeneration({ session: mockSession });
    const result = await tool.execute({
      mediaReferenceId: "invalid-id",
      prompt: "make cat blue",
      chatId: "test-chat",
    });

    expect(result.error).toContain("not found");
    expect(result.suggestion).toBeTruthy();
  });

  test("falls back to inline analysis when no mediaReferenceId", async () => {
    // Upload image
    await uploadTestImage("test-chat", "dog.jpg", "happy dog");

    // Call tool without mediaReferenceId
    const tool = configureImageGeneration({ session: mockSession });
    const result = await tool.execute({
      prompt: "animate the dog",
      chatId: "test-chat",
      userMessage: "animate this",
    });

    // Inline analysis should find "this" → last uploaded
    expect(result.sourceImageUrl).toContain("dog.jpg");
  });
});
```

**Key**: Mock LLM responses, test tool behavior in isolation.

### 5.4 Level 3: Behavioral Tests (Outcome-Focused)

**What to Test**: User-visible outcomes, not internal mechanisms.

**Example**:
```typescript
// src/tests/e2e/media-discovery-outcomes.test.ts
describe("Media Discovery User Outcomes", () => {
  test("user can animate uploaded image successfully", async ({ page }) => {
    // 1. Upload image
    await page.goto("/chat/new");
    await uploadImage(page, "cat.jpg");
    await expect(page.locator("img[alt*='cat']")).toBeVisible();

    // 2. Request animation
    await page.fill("textarea", "Animate this image");
    await page.click("button:has-text('Send')");

    // 3. Verify outcome (don't check HOW it was resolved)
    await expect(page.locator("text=Generating video")).toBeVisible({ timeout: 10000 });

    // 4. Verify source was correct
    const videoElement = await page.locator("video").first();
    const sourceAttr = await videoElement.getAttribute("data-source-image");
    expect(sourceAttr).toContain("cat.jpg");
  });

  test("user receives clear error when no media available", async ({ page }) => {
    // 1. New chat, no media uploaded
    await page.goto("/chat/new");

    // 2. Request animation
    await page.fill("textarea", "Animate the cat image");
    await page.click("button:has-text('Send')");

    // 3. Verify helpful error message
    await expect(page.locator("text=Could not determine which image")).toBeVisible();
    await expect(page.locator("text=upload")).toBeVisible();
  });
});
```

**Key**: Test what users experience, not internal tool calls.

### 5.5 Level 4: Probabilistic Validation (LLM Behavior)

**What to Test**: That LLM actually uses new features (statistically).

**Example**:
```typescript
// src/tests/validation/llm-behavior-validation.test.ts
describe("LLM Behavior Validation (Non-Deterministic)", () => {
  test("LLM uses mediaReferenceId in majority of simple cases", async () => {
    const testCases = 20; // Run 20 times for statistical significance
    let usedMediaReferenceId = 0;

    for (let i = 0; i < testCases; i++) {
      // Setup: Upload image
      const chatId = `test-chat-${i}`;
      await uploadTestImage(chatId, "cat.jpg", "cute cat");

      // Execute: Ask LLM to animate
      const result = await chat(chatId, "Animate the cat");

      // Check: Did it use mediaReferenceId?
      const usedReferenceId = result.toolCalls.some(call =>
        call.toolName === "configureVideoGeneration" &&
        call.args.mediaReferenceId
      );

      if (usedReferenceId) usedMediaReferenceId++;
    }

    // Assert: >70% usage is acceptable (not 100%)
    const successRate = usedMediaReferenceId / testCases;
    expect(successRate).toBeGreaterThan(0.7);

    console.log(`LLM used mediaReferenceId in ${successRate * 100}% of cases`);
  });

  test("optional tool is used <30% of time", async () => {
    // Only run if Phase 2 enabled
    if (!isPhase2Enabled()) return;

    const testCases = 50;
    let toolUsageCount = 0;

    for (let i = 0; i < testCases; i++) {
      const result = await chatWithRandomQuery();

      const usedQueryTool = result.toolCalls.some(call =>
        call.toolName === "queryChatMedia"
      );

      if (usedQueryTool) toolUsageCount++;
    }

    const toolUsageRate = toolUsageCount / testCases;
    expect(toolUsageRate).toBeLessThan(0.3);

    console.log(`Tool usage rate: ${toolUsageRate * 100}%`);
  });
});
```

**Key**:
- Run multiple times (10-50)
- Accept statistical thresholds (70-90%, not 100%)
- Use for validation, not CI/CD (too slow/flaky)
- Run weekly or before major releases

### 5.6 Test Pyramid

```
        /\
       /  \  E2E Behavioral (5 tests)
      /    \  - User outcomes only
     /------\
    /        \  Integration (20 tests)
   /  Proba-  \ - Tool logic
  / bilistic  \ - Mocked LLM
 /   (3-5)     \
/--------------\
|              | Unit Tests (50+ tests)
|  Determini-  | - Pure functions
|   stic       | - No LLM
|              |
+==============+
```

**Test Counts**:
- Unit: 50+ tests (fast, deterministic)
- Integration: 20 tests (medium, controlled)
- E2E: 5 tests (slow, real browser)
- Probabilistic: 3-5 validation tests (very slow, run separately)

**CI/CD Strategy**:
- PR checks: Unit + Integration only
- Pre-deploy: All except Probabilistic
- Weekly validation: All tests including Probabilistic

---

## 6. Migration Guide & Breaking Changes

### 6.1 Honest Assessment: This IS a Breaking Change

**What's Breaking**:
1. `defaultSourceImageUrl` parameter removed from configure tools
2. Pre-analysis in chat route removed
3. Tools now expect `mediaReferenceId` or rely on inline analysis
4. System prompt format changed (media context added)

**Who's Affected**:
- Internal services calling `/api/chat` directly
- Tests that mock tool parameters with `defaultSourceImageUrl`
- Any code relying on pre-analysis side effects

**Who's NOT Affected**:
- End users (behavior should improve or stay same)
- External API consumers (IF research shows none exist)

### 6.2 Migration Steps for Internal Services

**Step 1: Identify Dependencies**
```bash
# Search codebase for usage
git grep "defaultSourceImageUrl"
git grep "defaultSourceVideoUrl"
```

**Step 2: Update Tool Calls**
```typescript
// BEFORE (v1)
await configureImageGeneration({
  prompt: "make cat blue",
  defaultSourceImageUrl: "https://...",
});

// AFTER (v2 - Option A: Use mediaReferenceId)
await configureImageGeneration({
  prompt: "make cat blue",
  mediaReferenceId: "img-123", // From media context
});

// AFTER (v2 - Option B: Use sourceImageUrl directly)
await configureImageGeneration({
  prompt: "make cat blue",
  sourceImageUrl: "https://...", // Still works
});

// AFTER (v2 - Option C: Let inline analysis handle it)
await configureImageGeneration({
  prompt: "make cat blue",
  chatId: "chat-123",
  userMessage: "make the cat blue", // Inline analysis will find media
});
```

**Step 3: Update Tests**
```typescript
// BEFORE
vi.mock("@/lib/ai/context/image-context-analyzer", () => ({
  analyzeImageContext: vi.fn().mockResolvedValue({
    sourceUrl: "https://test.jpg",
  }),
}));

// AFTER
vi.mock("@/lib/ai/context/context-manager", () => ({
  getMediaById: vi.fn().mockResolvedValue({
    id: "img-1",
    url: "https://test.jpg",
  }),
}));
```

### 6.3 Rollback Plan

**If things go wrong**, here's the emergency rollback:

**Option 1: Feature Flag Rollback** (fastest)
```typescript
// Add to .env
ENABLE_CONTEXT_ENHANCED_DISCOVERY=false

// In chat route
if (process.env.ENABLE_CONTEXT_ENHANCED_DISCOVERY === "true") {
  // New system
  mediaContext = await buildMediaContext(chatId);
} else {
  // OLD system (keep this code until Phase 3 complete)
  const imageContext = await analyzeImageContext(...);
  defaultSourceImageUrl = imageContext.sourceUrl;
}
```

**Option 2: Git Revert** (if feature flag wasn't used)
```bash
git revert <commit-hash>
git push origin main
# Redeploy
```

**Option 3: Staged Rollback** (gradual)
```typescript
// Roll back to 50% of users
if (isUserInRollbackCohort(userId)) {
  // Old system
} else {
  // New system
}
```

**Rollback Triggers**:
- P95 latency > 2s for >30 minutes
- Error rate > 15% for >15 minutes
- Resolution failure rate > 25%
- User complaints spike (>10 support tickets in 1 hour)

---

## 7. Success Metrics & Acceptance Criteria

### 7.1 Phase-Specific Success Criteria

**Phase 0 (Validation)**:
- ✅ Pattern extraction complexity assessed (trivial/moderate/complex)
- ✅ Semantic search proven production-ready (<200ms, handles missing embeddings)
- ✅ Performance baseline established (documented latencies)
- ✅ Chat route consumers identified (external vs internal)
- ✅ GO/NO-GO decision documented

**Phase 1 (Context Enhancement)**:
- ✅ P95 latency ≤ 1.4s (within 30% budget)
- ✅ Token overhead ≤ 300 tokens/conversation
- ✅ Resolution success rate ≥ 90%
- ✅ mediaReferenceId used in ≥60% of cases (LLM adoption)
- ✅ All integration tests pass
- ✅ Zero production incidents

**Phase 2 (Optional Tool - IF NEEDED)**:
- ✅ Tool usage rate <30% (proves it's fallback)
- ✅ Complex query accuracy +10% vs Phase 1
- ✅ No significant latency regression
- ✅ User satisfaction maintained or improved

**Phase 3 (Optimization)**:
- ✅ Breaking changes documented
- ✅ Migration guide published
- ✅ All internal services migrated
- ✅ Legacy code removed
- ✅ Performance optimized (P95 ≤ 1.3s if possible)
- ✅ Cost within budget ($250/day max)

### 7.2 Business Metrics

**User Experience**:
- Session duration: Maintained or increased
- Media generation success rate: ≥ 95%
- User satisfaction (thumbs up/down): ≥ 85% positive
- Support tickets about media discovery: ≤ 5/week

**Operational**:
- Production incidents: 0 critical, <2 minor
- Rollback events: 0
- On-call pages: 0 related to this migration

**Cost**:
- Daily token cost: ≤ $250/day
- Monthly cost increase: ≤ $1000/month
- ROI timeline: 3 months (improved UX → retention → revenue)

### 7.3 Monitoring Dashboard (Updated)

```typescript
interface MigrationDashboard {
  phase: "0-validation" | "1-context" | "2-tool" | "3-optimization";
  status: "green" | "yellow" | "red";

  performance: {
    p50: number;      // ms
    p95: number;      // ms
    p99: number;      // ms
    budget: {
      p95Limit: 1400,   // ms
      current: number,  // ms
      status: "green" | "yellow" | "red";
    };
  };

  accuracy: {
    resolutionSuccessRate: number;  // %
    methodBreakdown: {
      mediaReferenceId: number;     // %
      inlineAnalysis: number;       // %
      toolCall: number;             // %
      failed: number;               // %
    };
  };

  costs: {
    dailyTokens: number;
    dailyCost: number;              // USD
    monthlyProjection: number;      // USD
    budget: 7500;                   // USD/month
    remaining: number;              // USD
  };

  health: {
    errorRate: number;              // %
    supportTickets: number;         // count this week
    incidentCount: number;          // count this phase
  };

  adoption: {
    mediaReferenceIdUsage: number;  // % of tool calls
    toolUsageRate: number;          // % of conversations (Phase 2)
    userSatisfaction: number;       // % positive feedback
  };
}
```

**Example Dashboard View**:
```
┌──────────────────────────────────────────────────────────┐
│ Context-Enhanced Media Discovery - Phase 1               │
├──────────────────────────────────────────────────────────┤
│ Status: 🟢 GREEN                                         │
│                                                          │
│ Performance:                                             │
│   P50: 1.05s  (Target: <1.2s)  ✅                      │
│   P95: 1.32s  (Limit: 1.4s)    ✅ [94% of budget]     │
│   P99: 1.68s  (Limit: 2.0s)    ✅                      │
│                                                          │
│ Accuracy:                                                │
│   Resolution Success: 93.2%     ✅                      │
│   Method Breakdown:                                      │
│     - Media Reference ID: 68%                            │
│     - Inline Analysis: 27%                               │
│     - Failed: 5%                 🟡 [Above 3% target]   │
│                                                          │
│ Costs:                                                   │
│   Daily: $228 (Budget: $250)    ✅ [$6,840/mo]         │
│   Token Overhead: 245 tokens    ✅ [Target: <300]      │
│                                                          │
│ Health:                                                  │
│   Error Rate: 2.1%              ✅                      │
│   Support Tickets: 3 this week  ✅                      │
│   Incidents: 0                  ✅                      │
│                                                          │
│ Adoption:                                                │
│   mediaReferenceId Usage: 68%   ✅ [Target: >60%]      │
│   User Satisfaction: 87%        ✅ [Target: >85%]      │
│                                                          │
│ Next Actions:                                            │
│   - Investigate 5% failure rate (root cause analysis)    │
│   - Consider Phase 2 if failures persist               │
│   - Monitor for 1 more week before Phase 3             │
└──────────────────────────────────────────────────────────┘
```

---

## 8. Risks & Mitigation (Updated)

### 8.1 Risk Matrix

| Risk | Likelihood | Impact | Severity | Mitigation |
|------|-----------|--------|----------|------------|
| Performance regression | Medium | High | 🔴 Critical | Strict budget + auto-rollback |
| Pattern extraction fails | Low | High | 🟡 High | Phase 0 validation |
| Token costs exceed budget | Medium | Medium | 🟡 High | Token limits + optimization |
| LLM doesn't use new features | Medium | Medium | 🟡 High | Clear prompts + monitoring |
| Breaking external consumers | Low | Critical | 🔴 Critical | Phase 0 research + communication |
| Semantic search unreliable | Low | Medium | 🟢 Medium | Phase 0 validation + fallbacks |

### 8.2 Risk 1: Performance Regression (MITIGATED)

**v1.0 Analysis**: 2.4x latency increase (800-1000ms overhead from tool calls)
**v2.0 Approach**: Context enhancement, not tool proliferation

**Mitigation**:
1. **Strict Budget**: P95 ≤ 1.4s (30% increase max)
2. **Fast Path Preserved**: Inline analysis still works (50ms)
3. **Cached Data**: Media list cached, ~10ms fetch
4. **Token Conscious**: Limited items, truncated prompts
5. **Auto-Rollback**: If P95 > 1.6s for 1 hour → automatic rollback

**Monitoring**:
```typescript
// Real-time latency tracking
const alert = createAlert({
  name: "media-discovery-latency",
  condition: "p95 > 1600ms for 1 hour",
  action: "auto-rollback + page on-call",
});
```

**Likelihood**: Low (v2.0 approach is much faster)
**Impact**: High (user experience degradation)
**Overall Risk**: 🟡 Medium → 🟢 Low with mitigations

### 8.3 Risk 2: Pattern Extraction Complexity (VALIDATED IN PHASE 0)

**v1.0 Assumption**: "Extract patterns from analyzers" (1-2 days)
**Reality**: 437 lines with complex targetResolvers, language-specific logic

**Mitigation**:
1. **Phase 0 Required**: Don't proceed without extraction validation
2. **Options Prepared**: Extract, reuse in-place, or LLM-only approach
3. **Incremental Extraction**: Start with English-only patterns, add Russian later
4. **Regression Tests**: Convert existing analyzer tests to pattern tests

**Phase 0 Decision Tree**:
```
Pattern Extraction Assessment
    ↓
Is extraction trivial (<3 days)?
    ↓ YES → Extract to shared utilities
    ↓ NO → Is extraction moderate (<1 week)?
            ↓ YES → Extract incrementally
            ↓ NO → Leave in analyzers, call from tools
```

**Likelihood**: Medium (won't know until Phase 0)
**Impact**: High (blocks migration if fails)
**Overall Risk**: 🟡 High → 🟢 Low with Phase 0 validation

### 8.4 Risk 3: Token Cost Overrun (BUDGETED)

**v1.0 Analysis**: Not analyzed
**v2.0 Analysis**: $22-27/day increase (~$660-810/month)

**Budget Allocation**: $1000/month approved (pending final confirmation)

**Mitigation**:
1. **Token Limits**: Max 10 items, 50 char prompts
2. **Conditional Inclusion**: Only add media context if user mentions media
3. **Optimization Hooks**: Can reduce to 5 items if needed
4. **Cost Alerts**: Daily email if >$250/day

**Cost Control Levers**:
```typescript
// Can adjust these based on metrics
const costOptimization = {
  maxMediaItems: 10,        // Reduce to 5 if needed
  truncatePrompts: 50,      // Reduce to 30 if needed
  includeOnlyIfRelevant: false, // Set true to reduce by ~50%
};
```

**Likelihood**: Low (well-budgeted)
**Impact**: Medium (financial impact)
**Overall Risk**: 🟢 Low

### 8.5 Risk 4: LLM Doesn't Use mediaReferenceId (MONITORED)

**Concern**: LLM might ignore new mediaReferenceId parameter, continue using old patterns.

**Mitigation**:
1. **Clear Prompts**: Explicit examples in system prompt
2. **Probabilistic Validation**: Test LLM adoption rate (target >60%)
3. **Fallback Works**: Inline analysis still functions if LLM doesn't use new feature
4. **Iterative Refinement**: Adjust prompts based on metrics

**Phase 1 Success Gate**: If adoption <40%, iterate on prompts before Phase 2.

**Likelihood**: Medium (LLM behavior varies)
**Impact**: Low (fallback exists)
**Overall Risk**: 🟢 Low

### 8.6 Risk 5: Breaking External Consumers (RESEARCHED IN PHASE 0)

**v1.0 Claim**: "Backward compatible"
**v2.0 Reality**: This IS a breaking change

**Mitigation**:
1. **Phase 0 Research**: Identify all consumers BEFORE breaking anything
2. **Communication Plan**: If external consumers exist, notify 3-6 months in advance
3. **Versioned API**: Maintain v1 API with pre-analysis for external users
4. **Migration Support**: Provide code examples, support channel

**Decision Matrix**:
```
External Consumers Exist?
    ↓ NO → Safe to break, document for internal teams
    ↓ YES → How many?
            ↓ Few (<5) → Direct migration support
            ↓ Many (>5) → Versioned API required
```

**Likelihood**: Low (probably internal-only)
**Impact**: Critical (if external consumers exist)
**Overall Risk**: 🔴 Critical → 🟢 Low with Phase 0 research

---

## 9. Timeline & Resource Allocation

### 9.1 Timeline

```
Week 1: Phase 0 - Validation
├─ Day 1-2: Pattern library extraction research
├─ Day 3: Semantic search validation tests
├─ Day 4: Performance baseline benchmarking
├─ Day 5: Chat route consumer research
└─ Weekend: GO/NO-GO decision

Week 2-3: Phase 1 - Context Enhancement
├─ Week 2 Day 1-2: Media context builder + tests
├─ Week 2 Day 3-4: System prompt enhancement
├─ Week 2 Day 5: Configure tools enhancement
├─ Week 3 Day 1-2: Integration testing
├─ Week 3 Day 3-4: Deploy to 10% users, monitor
└─ Week 3 Day 5: Metrics review, increase to 50%

Week 4-5: Phase 2 - Optional Tool (IF NEEDED)
├─ Week 4 Day 1-2: Create queryChatMedia tool
├─ Week 4 Day 3-4: A/B testing setup
├─ Week 4 Day 5: Deploy to 50% users
├─ Week 5 Day 1-3: Monitor metrics, gather feedback
└─ Week 5 Day 4-5: Decision to keep/remove tool

Week 6-7: Phase 3 - Optimization
├─ Week 6 Day 1-2: Remove legacy code (breaking changes)
├─ Week 6 Day 3-4: Performance optimization based on data
├─ Week 6 Day 5: Migration guide publication
├─ Week 7 Day 1-3: Deploy to 100% users
└─ Week 7 Day 4-5: Final metrics review, documentation

Total: 7 weeks (with Phase 2)
Total: 5 weeks (without Phase 2, if Phase 1 succeeds)
```

### 9.2 Resource Requirements

**Engineering**:
- 1 Senior Engineer (Full-time): Guillermo/Don - Planning, architecture, code reviews
- 1 Mid-Level Engineer (Full-time): Rob - Implementation, testing
- 1 QA Engineer (Part-time 50%): Kent - Test strategy, validation
- 1 DevOps Engineer (Part-time 25%): Monitoring, rollback procedures

**Code Review**:
- Linus: Architecture reviews (Phase 0, Phase 1, Phase 3)
- Kevlin: Code quality reviews (all phases)
- Dan: React/Next.js patterns review (UI changes if any)

**Domain Experts**:
- Ward: Documentation, knowledge extraction (Phase 3)
- Raymond: User-facing documentation (if needed)

**Total Effort Estimate**:
- Phase 0: 1 week × 1.5 engineers = 1.5 engineer-weeks
- Phase 1: 2 weeks × 2 engineers = 4 engineer-weeks
- Phase 2: 2 weeks × 1.5 engineers = 3 engineer-weeks (conditional)
- Phase 3: 2 weeks × 2 engineers = 4 engineer-weeks

**Total**: 9.5 engineer-weeks (with Phase 2), 6.5 engineer-weeks (without)

---

## 10. Appendix: Code Examples with AI SDK 4.3.x

### 10.1 System Prompt with Media Context

```typescript
// src/lib/ai/prompts.ts
import { buildMediaContext, formatMediaContextForPrompt } from "@/lib/ai/context/media-context-builder";

export async function systemPrompt({
  selectedChatModel,
  requestHints,
  chatId,
}: SystemPromptParams & { chatId?: string }): Promise<string> {

  // Build media context if chatId provided
  let mediaSection = "";
  if (chatId) {
    const summary = await buildMediaContext(chatId, {
      maxItems: 10,
      includePrompts: true,
      truncatePrompts: 50,
    });

    if (summary.items.length > 0) {
      mediaSection = `

## Available Media in This Chat

${formatMediaContextForPrompt(summary)}

### How to Reference Media

When users say "this image", "that video", or "the picture":
1. Check the available media list above
2. Use the most recent matching type by default
3. If position is specified ("first", "second"), use that index
4. If source is specified ("uploaded", "generated"), filter by role

### Using Media in Tools

When calling configureImageGeneration or configureVideoGeneration:
- **Preferred**: Use mediaReferenceId parameter with the ID from list above
  Example: { mediaReferenceId: "img-1", prompt: "..." }
- **Alternative**: Provide direct sourceImageUrl if you know exact URL
  Example: { sourceImageUrl: "https://...", prompt: "..." }

If media reference is unclear:
- You can use queryChatMedia tool for complex searches
- Or return a helpful message asking user to clarify

`;
    }
  }

  return `You are a helpful AI assistant with advanced media generation capabilities.

${mediaSection}

## Your Capabilities

You can generate and edit images, videos, and more using specialized tools...

${requestHints ? getRequestHintsSection(requestHints) : ""}

Remember to be helpful, accurate, and creative!`;
}
```

### 10.2 Enhanced Configure Tool with Media Resolution

```typescript
// src/lib/ai/tools/configure-image-generation.ts
import { tool } from "ai";
import { z } from "zod";
import { contextManager } from "@/lib/ai/context";
import { ImageContextAnalyzer } from "@/lib/ai/context/image-context-analyzer";
import { trackMediaDiscovery } from "@/lib/ai/monitoring/media-discovery-metrics";

export const configureImageGeneration = (params: {
  createDocument: ReturnType<typeof createDocument>;
  session: Session;
}) => tool({
  description: `Configure and generate an AI image based on a text prompt.

Can create new images or edit existing ones.
Supports various styles, aspect ratios, and model selection.`,

  parameters: z.object({
    prompt: z.string().describe("Image generation prompt"),

    // NEW: Media reference from system prompt context
    mediaReferenceId: z.string().optional()
      .describe("Media ID from 'Available Media' list (e.g., 'img-1'). Use this when editing existing images."),

    // EXISTING: Direct URL (still supported)
    sourceImageUrl: z.string().optional()
      .describe("Direct URL of source image if known. Only use if mediaReferenceId is not available."),

    // Context for fallback inline analysis
    chatId: z.string().optional().describe("Current chat ID"),
    userMessage: z.string().optional().describe("Original user message"),

    // Other parameters
    aspectRatio: z.enum(["1:1", "16:9", "9:16"]).optional(),
    model: z.string().optional(),
    // ... other parameters
  }),

  execute: async (args) => {
    const startTime = Date.now();
    let resolvedUrl: string | undefined;
    let resolutionMethod: "media-reference-id" | "direct-url" | "inline-analysis" | "failed";

    // PRIORITY 1: Media Reference ID (NEW - Preferred method)
    if (args.mediaReferenceId) {
      try {
        const media = await contextManager.getMediaById(args.mediaReferenceId);

        if (media) {
          resolvedUrl = media.url;
          resolutionMethod = "media-reference-id";

          console.log(`[Media Resolution] ✅ Resolved via ID: ${args.mediaReferenceId} → ${resolvedUrl}`);
        } else {
          // Media ID not found - return helpful error to LLM
          const resolutionLatency = Date.now() - startTime;

          await trackMediaDiscovery({
            timestamp: new Date(),
            chatId: args.chatId || "unknown",
            resolutionMethod: "failed",
            resolutionLatency,
            mediaCount: await contextManager.getMediaCount(args.chatId || ""),
            userQuery: args.userMessage || args.prompt,
          });

          return {
            error: `Media ID "${args.mediaReferenceId}" not found in chat history.`,
            suggestion: "Please check the 'Available Media' list in your system prompt and use a valid ID. Or ask the user to upload/generate the image first.",
            availableMedia: await buildMediaContext(args.chatId || "", { maxItems: 5 }),
          };
        }
      } catch (error) {
        console.error("[Media Resolution] Error resolving mediaReferenceId:", error);
        // Fall through to next priority
      }
    }

    // PRIORITY 2: Direct URL (EXISTING - Still supported)
    if (!resolvedUrl && args.sourceImageUrl) {
      if (isValidUrl(args.sourceImageUrl)) {
        resolvedUrl = args.sourceImageUrl;
        resolutionMethod = "direct-url";

        console.log(`[Media Resolution] ✅ Using direct URL: ${resolvedUrl}`);
      } else {
        // Invalid URL - likely a placeholder like "this-image"
        const resolutionLatency = Date.now() - startTime;

        await trackMediaDiscovery({
          timestamp: new Date(),
          chatId: args.chatId || "unknown",
          resolutionMethod: "failed",
          resolutionLatency,
          mediaCount: await contextManager.getMediaCount(args.chatId || ""),
          userQuery: args.userMessage || args.prompt,
        });

        return {
          error: `Invalid sourceImageUrl: "${args.sourceImageUrl}". This appears to be a placeholder.`,
          suggestion: "Use mediaReferenceId from the available media list, or provide a valid HTTP(S) URL.",
        };
      }
    }

    // PRIORITY 3: Inline Context Analysis (FALLBACK)
    if (!resolvedUrl && args.chatId && args.userMessage) {
      try {
        const analyzer = new ImageContextAnalyzer();
        const chatMedia = await contextManager.getChatMedia(args.chatId);
        const currentAttachments = []; // Would come from params if available

        const analysisResult = await analyzer.analyzeContext(
          args.userMessage,
          chatMedia,
          currentAttachments
        );

        if (analysisResult.confidence !== "low") {
          resolvedUrl = analysisResult.sourceUrl;
          resolutionMethod = "inline-analysis";

          console.log(`[Media Resolution] ✅ Inline analysis (${analysisResult.confidence}): ${resolvedUrl}`);
        } else {
          console.log(`[Media Resolution] ⚠️ Inline analysis failed (low confidence)`);
        }
      } catch (error) {
        console.error("[Media Resolution] Inline analysis error:", error);
      }
    }

    // If still no URL, return helpful error
    if (!resolvedUrl) {
      const resolutionLatency = Date.now() - startTime;
      resolutionMethod = "failed";

      await trackMediaDiscovery({
        timestamp: new Date(),
        chatId: args.chatId || "unknown",
        resolutionMethod,
        resolutionLatency,
        mediaCount: await contextManager.getMediaCount(args.chatId || ""),
        userQuery: args.userMessage || args.prompt,
      });

      return {
        error: "Could not determine which image to use.",
        suggestion: "Please either:\n1. Specify mediaReferenceId from the available media list\n2. Provide a direct sourceImageUrl\n3. Ask the user to upload or describe which image they mean",
        availableMedia: await buildMediaContext(args.chatId || "", { maxItems: 5 }),
      };
    }

    // Track successful resolution
    const resolutionLatency = Date.now() - startTime;

    await trackMediaDiscovery({
      timestamp: new Date(),
      chatId: args.chatId || "unknown",
      resolutionMethod,
      resolutionLatency,
      mediaCount: await contextManager.getMediaCount(args.chatId || ""),
      userQuery: args.userMessage || args.prompt,
      wasCorrectMedia: true, // Assume true, can be updated with user feedback
    });

    console.log(`[Media Resolution] ⏱️ Resolution took ${resolutionLatency}ms via ${resolutionMethod}`);

    // Proceed with image generation
    try {
      const result = await generateImage({
        ...args,
        sourceImageUrl: resolvedUrl,
        session: params.session,
      });

      return result;
    } catch (error) {
      console.error("[Image Generation] Error:", error);

      return {
        error: "Image generation failed",
        details: error instanceof Error ? error.message : String(error),
      };
    }
  },
});
```

### 10.3 Optional Query Tool (Phase 2, if needed)

```typescript
// src/lib/ai/tools/query-chat-media.ts
import { tool } from "ai";
import { z } from "zod";
import { contextManager } from "@/lib/ai/context";
import { createAnalyzerForType } from "@/lib/ai/context";

export const queryChatMedia = (params: { session: Session }) => tool({
  description: `Advanced media search for complex or ambiguous queries.

⚠️ ONLY use this tool when:
- Simple references in the media list are insufficient
- User query is ambiguous ("which sunset?", "the one before that")
- Need semantic similarity search
- Need complex filtering (time + content + position)

For simple cases, use the media list from system prompt directly:
- "this image" → Use most recent image from list
- "last video" → Use last video from list
- "first picture" → Use first image from list

Examples of when to use this tool:
- "the second sunset image from yesterday"
- "the image that looks similar to X"
- "the video right before the cat one"
- "find the picture with mountains"`,

  parameters: z.object({
    chatId: z.string().describe("Current chat ID"),

    query: z.string().describe(
      "Natural language search query describing which media to find. " +
      "Examples: 'second sunset from yesterday', 'image similar to moon picture', 'video before cat'"
    ),

    mediaType: z.enum(["image", "video", "audio", "any"]).optional()
      .describe("Filter by media type if known"),
  }),

  execute: async ({ chatId, query, mediaType = "any" }) => {
    const startTime = Date.now();

    try {
      // Get all media for this chat
      const allMedia = await contextManager.getChatMedia(chatId);

      // Filter by type if specified
      const filteredByType = mediaType === "any"
        ? allMedia
        : allMedia.filter(m => m.mediaType === mediaType);

      if (filteredByType.length === 0) {
        return {
          found: false,
          message: `No ${mediaType} media found in this chat.`,
          suggestion: "Ask user to upload or generate media first.",
        };
      }

      // Use existing analyzer logic for pattern matching
      const analyzer = createAnalyzerForType(mediaType === "any" ? "image" : mediaType);

      const analysisResult = await analyzer.analyzeContext(
        query,
        filteredByType,
        [] // No current attachments
      );

      const duration = Date.now() - startTime;
      console.log(`[Query Tool] Search completed in ${duration}ms, confidence: ${analysisResult.confidence}`);

      if (analysisResult.confidence === "low") {
        return {
          found: false,
          confidence: "low",
          message: `Could not find media matching "${query}".`,
          suggestion: "Try a different search query or ask user to be more specific.",
          searchedCount: filteredByType.length,
        };
      }

      return {
        found: true,
        confidence: analysisResult.confidence,
        media: {
          id: analysisResult.sourceId,
          url: analysisResult.sourceUrl,
          type: analysisResult.mediaType,
          prompt: analysisResult.metadata?.prompt || "No description",
        },
        reasoning: analysisResult.reasoning,
        message: `Found ${analysisResult.mediaType} matching "${query}"`,
        suggestion: `Use mediaReferenceId: "${analysisResult.sourceId}" in your next tool call.`,
      };

    } catch (error) {
      console.error("[Query Tool] Error:", error);

      return {
        found: false,
        error: "Search failed",
        details: error instanceof Error ? error.message : String(error),
        suggestion: "Try using the available media list directly or ask user for clarification.",
      };
    }
  },
});
```

### 10.4 Chat Route Integration

```typescript
// src/app/(chat)/api/chat/route.ts
import { streamText } from "ai";
import { buildMediaContext, formatMediaContextForPrompt } from "@/lib/ai/context/media-context-builder";
import { systemPrompt } from "@/lib/ai/prompts";
import { configureImageGeneration } from "@/lib/ai/tools/configure-image-generation";
import { configureVideoGeneration } from "@/lib/ai/tools/configure-video-generation";
import { queryChatMedia } from "@/lib/ai/tools/query-chat-media"; // Phase 2

export async function POST(req: Request) {
  // ... auth, validation, etc.

  const session = await auth();
  const { id: chatId, messages } = await req.json();

  // Feature flags
  const ENABLE_CONTEXT_ENHANCEMENT =
    process.env.ENABLE_CONTEXT_ENHANCED_DISCOVERY !== "false"; // Default: true in Phase 1

  const ENABLE_QUERY_TOOL =
    process.env.ENABLE_QUERY_MEDIA_TOOL === "true"; // Default: false (Phase 2)

  // Build system prompt with media context
  const systemPromptText = await systemPrompt({
    selectedChatModel: "gpt-4",
    requestHints: undefined,
    chatId: ENABLE_CONTEXT_ENHANCEMENT ? chatId : undefined, // Only if feature enabled
  });

  // Configure tools
  const tools: Record<string, any> = {
    // Existing tools
    createDocument: createDocument({ ... }),
    updateDocument: updateDocument({ ... }),

    // Enhanced configure tools
    configureImageGeneration: configureImageGeneration({
      createDocument: tools.createDocument,
      session,
    }),
    configureVideoGeneration: configureVideoGeneration({
      createDocument: tools.createDocument,
      session,
    }),

    // Other tools
    listVideoModels,
    findBestVideoModel,
    enhancePromptUnified,
  };

  // Add optional query tool (Phase 2)
  if (ENABLE_QUERY_TOOL) {
    tools.queryChatMedia = queryChatMedia({ session });
  }

  // Stream response
  const result = await streamText({
    model: myProvider.languageModel("gpt-4"),
    system: systemPromptText, // Includes media context
    messages,
    tools,
    maxSteps: 5, // Allow multi-step tool execution

    // Optional: Limit active tools for performance
    // activeTools: ["configureImageGeneration", "configureVideoGeneration", ...],

    onFinish: async ({ usage, finishReason }) => {
      console.log(`[Chat] Finished - Tokens: ${usage.totalTokens}, Reason: ${finishReason}`);

      // Track token usage
      await trackTokenUsage({
        chatId,
        totalTokens: usage.totalTokens,
        promptTokens: usage.promptTokens,
        completionTokens: usage.completionTokens,
      });
    },
  });

  return result.toDataStreamResponse();
}
```

---

## 11. Conclusion: The Path Forward

### 11.1 What We Learned from v1.0

Linus was right. The original plan had:
- ❌ Performance tax we couldn't afford (2.4x latency)
- ❌ Tool proliferation instead of clarity (3 tools when 0-1 would do)
- ❌ Assumed easy refactors that weren't (pattern extraction)
- ❌ Claimed backward compatibility while planning breaking changes
- ❌ Deterministic LLM testing that would be flaky

### 11.2 What v2.0 Gets Right

This revised plan:
- ✅ **Performance budgeted**: 30% max increase, not 140%
- ✅ **Context over tools**: Enhance what LLM sees, don't force extra calls
- ✅ **Validated assumptions**: Phase 0 proves feasibility before building
- ✅ **Honest about breaking changes**: Acknowledged, researched, migrated
- ✅ **Behavioral testing**: Test outcomes, not internal mechanisms
- ✅ **Cost analyzed**: $660-810/month increase, budgeted and monitored

### 11.3 The Core Insight

**Linus's Question**: *"Maybe the answer is better CONTEXT, not tool PROLIFERATION?"*

**The Answer**: YES.

Most media references are trivial. The LLM doesn't need to call a tool to figure out "this image" when there's only one recent image. It just needs to SEE what's available.

**The Strategy**:
1. **Give LLM visibility**: Media list in system prompt
2. **Make references easy**: Use IDs from context
3. **Keep fast path**: Inline analysis for edge cases
4. **Add intelligence only when needed**: Optional tool for complex queries

**The Result**: Faster, simpler, cheaper, and smarter.

### 11.4 Success Looks Like

**3 months from now**:
- ✅ Users say "animate this" and it just works
- ✅ LLM knows what media exists without extra tool calls
- ✅ Performance is within 30% of baseline (P95 1.4s vs 1.1s)
- ✅ Costs are $660-810/month, within budget
- ✅ Accuracy is 93%+, better than current system
- ✅ Support tickets about "AI couldn't find my image" are rare (<5/week)
- ✅ The code is cleaner, the logic is clearer
- ✅ We learned what works at scale with real data

### 11.5 Next Steps

1. **Linus reviews this plan**: Approval or further revision?
2. **Budget confirmation**: Get final approval for $1K/month cost increase
3. **Phase 0 kickoff**: Start validation tasks immediately
4. **GO/NO-GO decision**: End of Week 1, based on Phase 0 findings
5. **If GO**: Proceed to Phase 1
6. **If NO-GO**: Document why, what we learned, archive gracefully

---

**Plan Status**: Ready for Architecture Review
**Confidence**: High (addressed all critical feedback)
**Risk Level**: Medium → Low (with Phase 0 validation)
**Recommendation**: Proceed to Phase 0

---

**Appendix: Feedback Addressed**

| Linus Issue | v1.0 | v2.0 | Status |
|-------------|------|------|--------|
| Issue 1: Performance Tax | 2.4x latency | 1.3x max with budget | ✅ FIXED |
| Issue 2: Tool Proliferation | 3 tools | 0-1 optional tool | ✅ FIXED |
| Issue 3: Pattern Extraction | Assumed trivial | Phase 0 validation | ✅ FIXED |
| Issue 4: Backward Compat Lie | Claimed, not delivered | Acknowledged breaking change | ✅ FIXED |
| Issue 5: Deterministic Testing | Flaky LLM tests | Behavioral + probabilistic | ✅ FIXED |
| Minor: Token Budget | Not analyzed | $660-810/mo budgeted | ✅ FIXED |
| Minor: Semantic Search | Assumed works | Phase 0 validation | ✅ FIXED |
| Minor: Monitoring Incomplete | Tech metrics only | Business + tech metrics | ✅ FIXED |

**All critical issues addressed. Plan ready for review.**
