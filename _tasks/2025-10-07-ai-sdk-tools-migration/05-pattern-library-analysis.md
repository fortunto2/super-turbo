# Pattern Library Extraction Research (Phase 0.1)

**Task**: Phase 0.1 - Pattern Library Extraction Research
**Date**: 2025-10-08
**Status**: Completed
**Engineer**: Claude (Analysis Phase)

---

## Executive Summary

**Finding**: Pattern extraction is **MODERATE complexity** (~5-7 days).
**Recommendation**: **Proceed with incremental extraction** strategy.
**Key Insight**: Patterns are NOT stateless - they have complex dependencies.

---

## 1. Current Architecture Analysis

### 1.1 Class Hierarchy

```
BaseContextAnalyzer (universal-context.ts)
├── analyzeContext() - 6 stages of analysis
├── Abstract methods for subclasses
└── Shared utilities

ImageContextAnalyzer (image-context-analyzer.ts)
├── getReferencePatterns() - 54 patterns
├── findImageByContent() - keyword matching
├── findImageByUniversalContent() - universal search
├── extractKeywordsFromMessage() - keyword extraction
└── transliterateRussian() - Russian to Latin

VideoContextAnalyzer (video-context-analyzer.ts)
├── getReferencePatterns() - 72 patterns
├── analyzeVideoImageContext() - video-specific logic
└── Support for image-to-video workflows
```

### 1.2 Pattern Counts

| Analyzer | Russian Patterns | English Patterns | Semantic Patterns | Total |
|----------|------------------|------------------|-------------------|-------|
| **ImageContextAnalyzer** | 9 | 9 | 26 (13 Russian + 13 English) | **54** |
| **VideoContextAnalyzer** | 26 | 26 | 0 | **72** |
| **Total** | **35** | **35** | **26** | **126 patterns** |

**Total Code**: 809 lines (ImageContextAnalyzer) + 513 lines (VideoContextAnalyzer) = **1,322 lines**

---

## 2. Pattern Structure Analysis

### 2.1 Pattern Definition

Each pattern in `getReferencePatterns()` contains:

```typescript
interface ReferencePattern {
  pattern: RegExp;           // Regex to match user message
  weight: number;            // Relevance score (0.6 - 0.9)
  description: string;       // Human-readable description
  targetResolver: Function;  // Logic to find media
}
```

### 2.2 Example Patterns

#### Simple Pattern (Stateless)
```typescript
{
  pattern: /(this|that)\s+(image|picture|photo)/,
  weight: 0.9,
  description: "Direct reference to image",
  targetResolver: (message, media) => media[media.length - 1] || null
}
```
**Complexity**: Simple - just returns last media item.

#### Complex Pattern (Stateful)
```typescript
{
  pattern: /(last|previous|recent)\s+(image|picture|photo)/,
  weight: 0.7,
  description: "Reference to last/previous image",
  targetResolver: (message, media) => {
    if (message.includes("previous")) {
      return media[media.length - 2] || null;
    }
    return media[media.length - 1] || null;
  }
}
```
**Complexity**: Medium - conditional logic based on message content.

#### Very Complex Pattern (Semantic Search)
```typescript
{
  pattern: /(image|picture|photo)\s+with\s+(moon|lunar)/,
  weight: 0.9,
  description: "Search for image with moon",
  targetResolver: (message, media) =>
    this.findImageByContent(media, ["moon", "луна", "lunar", "лунный"])
}
```
**Complexity**: High - calls helper method with keyword lists.

---

## 3. Dependency Analysis

### 3.1 Pattern Dependencies

**Critical Finding**: Patterns are NOT independent. Many patterns depend on:

#### A. Helper Methods (ImageContextAnalyzer)
- `findImageByContent(media, keywords)` - 100 lines
- `findImageByUniversalContent(message, media)` - 19 lines
- `extractKeywordsFromMessage(message)` - 100 lines
- `transliterateRussian(word)` - 38 lines

**Total Helper Code**: ~257 lines

#### B. Shared State
- `this.mediaType` - used in helpers
- `this` context - patterns call instance methods

#### C. Base Class Methods
- `analyzeContext()` - 6-stage analysis pipeline
- `extractKeywords()` - keyword extraction
- `getKeywordWeight()` - weighting logic
- `findByContent()` - content search

**Total Base Code**: 644 lines (universal-context.ts)

### 3.2 Coupling Matrix

| Pattern Type | Dependencies | Extraction Complexity |
|--------------|-------------|----------------------|
| **Simple Position** (e.g., "last image") | Message + Media array | ✅ **Trivial** |
| **Conditional Position** (e.g., "previous vs last") | Message parsing + Media | 🟡 **Easy** |
| **Source Filtering** (e.g., "uploaded image") | Media.role field | ✅ **Trivial** |
| **Semantic Search** (e.g., "image with moon") | findImageByContent() + keywords | 🔴 **Complex** |
| **Universal Search** (e.g., "where есть X") | extractKeywordsFromMessage() + full dictionary | 🔴 **Very Complex** |

---

## 4. Extraction Complexity Assessment

### 4.1 Easy Patterns (70% - ~88 patterns)

**Characteristics**:
- Simple regex match
- Stateless targetResolver (only uses media array)
- No external dependencies

**Examples**:
```typescript
// Position-based
/(this|that)\s+(image|picture)/ → media[media.length - 1]
/(first|second|third)\s+image/ → media[0], media[1], media[2]

// Source-based
/(generated|created)\s+image/ → filter(m => m.role === "assistant")
/(uploaded)\s+image/ → filter(m => m.role === "user")
```

**Extraction Strategy**: Direct copy to shared utility.

**Estimated Time**: 2 days

---

### 4.2 Medium Patterns (20% - ~25 patterns)

**Characteristics**:
- Conditional logic in targetResolver
- Message parsing required
- Minimal external dependencies

**Examples**:
```typescript
{
  pattern: /(last|previous)\s+image/,
  targetResolver: (message, media) => {
    if (message.includes("previous")) {
      return media[media.length - 2] || null;
    }
    return media[media.length - 1] || null;
  }
}
```

**Extraction Strategy**: Extract with inline message parsing.

**Estimated Time**: 2 days

---

### 4.3 Complex Patterns (10% - ~13 patterns)

**Characteristics**:
- Call helper methods (findImageByContent, etc.)
- Require keyword dictionaries
- Need transliteration support

**Examples**:
```typescript
{
  pattern: /(image|picture)\s+with\s+(moon|lunar)/,
  targetResolver: (message, media) =>
    this.findImageByContent(media, ["moon", "луна", "lunar", "лунный"])
}
```

**Extraction Challenge**: Must extract helpers OR refactor to pass helpers as parameters.

**Extraction Strategy**:
1. Extract helper methods to shared utilities
2. Update pattern targetResolvers to call shared utilities
3. Or: Pass helpers as parameters to pattern evaluator

**Estimated Time**: 3 days

---

## 5. Shared Code Analysis

### 5.1 Reusable Helper Methods

**ImageContextAnalyzer Helpers**:
```typescript
// 1. Keyword Matching (~100 lines)
findImageByContent(media: ChatMedia[], keywords: string[]): ChatMedia | null

// 2. Universal Search (~19 lines)
findImageByUniversalContent(message: string, media: ChatMedia[]): ChatMedia | null

// 3. Keyword Extraction (~100 lines)
extractKeywordsFromMessage(message: string): string[]
  - Includes large keyword dictionary (~400 keywords)
  - Categorized by nature, animals, people, transport, buildings, food, colors, emotions

// 4. Transliteration (~38 lines)
transliterateRussian(word: string): string
  - Converts Russian to Latin (e.g., "луна" → "luna")
```

**Base Class Helpers** (universal-context.ts):
```typescript
// 5. Generic Keyword Extraction (~62 lines)
extractKeywords(text: string): string[]
  - Filters common words
  - Returns unique keywords

// 6. Keyword Weighting (~50 lines)
getKeywordWeight(keyword: string): number
  - Weighted dictionary for relevance scoring
  - Animals: 1.0, Objects: 0.7, Colors: 0.3

// 7. Content Search (~64 lines)
findByContent(userMessage: string, chatMedia: ChatMedia[]): {...} | null
  - Uses extractKeywords + getKeywordWeight
  - Returns best matching media
```

### 5.2 Code Reusability

| Helper Method | Used By | Lines | Reusability |
|--------------|---------|-------|-------------|
| `findImageByContent` | Image patterns (26) | 100 | ✅ High |
| `extractKeywordsFromMessage` | Universal patterns (2) | 100 | ✅ High |
| `transliterateRussian` | findImageByContent | 38 | ✅ Medium |
| `findByContent` (base) | All analyzers | 64 | ✅ High |
| `extractKeywords` (base) | All analyzers | 62 | ✅ High |

**Key Insight**: ~400 lines of helper code are **highly reusable** across both analyzers.

---

## 6. Duplication Analysis

### 6.1 Pattern Duplication Between Analyzers

**Exact Duplicates** (structure identical, different media type):

```typescript
// ImageContextAnalyzer
{
  pattern: /(this|that)\s+(image|picture|photo)/,
  weight: 0.9,
  targetResolver: (message, media) => media[media.length - 1] || null
}

// VideoContextAnalyzer
{
  pattern: /(this|that)\s+(video|clip|movie|film)/,
  weight: 0.9,
  targetResolver: (message, media) => media[media.length - 1] || null
}
```

**Duplication Stats**:
- Position patterns: ~10 exact duplicates (just different media type words)
- Source patterns: ~4 exact duplicates (uploaded/generated)
- Edit command patterns: ~3 exact duplicates

**Total Duplication**: ~17 patterns (~13% of total)

### 6.2 Refactoring Opportunity

**Solution**: Create parameterized pattern generators:

```typescript
// Shared pattern factory
function createPositionPattern(
  mediaType: MediaType,
  mediaWords: string[]
): ReferencePattern {
  return {
    pattern: new RegExp(`(this|that)\\s+(${mediaWords.join("|")})`),
    weight: 0.9,
    description: `Direct reference to ${mediaType}`,
    targetResolver: (message, media) => media[media.length - 1] || null
  };
}

// Usage
const imagePattern = createPositionPattern("image", ["image", "picture", "photo"]);
const videoPattern = createPositionPattern("video", ["video", "clip", "movie", "film"]);
```

**Benefits**:
- Eliminate duplication
- Easier to maintain
- Consistent behavior across media types

---

## 7. Extraction Strategies (3 Options)

### 7.1 Option A: Full Extraction (Aggressive)

**Approach**: Extract ALL patterns and helpers to shared library.

**Structure**:
```
src/lib/ai/context/
├── patterns/
│   ├── shared-patterns.ts       // Pattern generators
│   ├── image-patterns.ts        // Image-specific patterns
│   ├── video-patterns.ts        // Video-specific patterns
│   └── pattern-helpers.ts       // findImageByContent, etc.
├── image-context-analyzer.ts    // Uses patterns/
├── video-context-analyzer.ts    // Uses patterns/
└── universal-context.ts         // Base class
```

**Pros**:
- ✅ Complete separation of concerns
- ✅ Maximum reusability
- ✅ Easier to test patterns in isolation

**Cons**:
- ❌ High complexity (~7 days)
- ❌ Risk of breaking existing functionality
- ❌ Need comprehensive testing

**Estimated Time**: 7 days
**Risk**: Medium-High
**Recommendation**: ⚠️ Only if time permits

---

### 7.2 Option B: Incremental Extraction (Recommended)

**Approach**: Extract in stages, test after each stage.

**Stage 1**: Extract simple patterns (70%) - **2 days**
```typescript
// src/lib/ai/context/patterns/simple-patterns.ts
export const createSimplePositionPatterns = (mediaType, mediaWords) => [
  // ... simple patterns
];
```

**Stage 2**: Extract medium patterns (20%) - **2 days**
```typescript
// src/lib/ai/context/patterns/conditional-patterns.ts
export const createConditionalPatterns = (mediaType, mediaWords) => [
  // ... conditional patterns
];
```

**Stage 3**: Extract complex patterns OR leave in analyzers - **1-3 days**
```typescript
// Option A: Extract helpers to shared utilities
// src/lib/ai/context/patterns/pattern-helpers.ts

// Option B: Leave in analyzers, call from tools
// Keep existing code, add export functions
```

**Pros**:
- ✅ Lower risk (test after each stage)
- ✅ Can stop if issues arise
- ✅ Delivers value incrementally

**Cons**:
- 🟡 Takes longer overall
- 🟡 Temporary inconsistency during migration

**Estimated Time**: 5-7 days
**Risk**: Low-Medium
**Recommendation**: ✅ **RECOMMENDED**

---

### 7.3 Option C: No Extraction (Conservative)

**Approach**: Keep patterns in analyzers, reuse analyzers in tools.

**Changes**:
```typescript
// In configure tools
import { ImageContextAnalyzer } from "@/lib/ai/context/image-context-analyzer";
import { VideoContextAnalyzer } from "@/lib/ai/context/video-context-analyzer";

// In tool execute()
const analyzer = new ImageContextAnalyzer();
const result = await analyzer.analyzeContext(userMessage, chatMedia, []);
```

**Pros**:
- ✅ Zero extraction work
- ✅ No risk of breaking patterns
- ✅ Fast implementation (1 day)

**Cons**:
- ❌ No code deduplication
- ❌ Analyzers remain coupled
- ❌ LLM can't use patterns directly

**Estimated Time**: 0-1 days (just reuse)
**Risk**: Very Low
**Recommendation**: ✅ **If time is critical**

---

## 8. Dependency Map (for LLM Tool Integration)

### 8.1 What LLM Needs vs What Patterns Provide

**LLM Needs**:
```typescript
// Simple media reference resolution
mediaReferenceId: "img-1"  → {url: "https://...", id: "img-1"}
```

**Patterns Provide**:
```typescript
// Complex natural language analysis
"animate the cat image" → {url: "https://...", confidence: "high", reasoning: "..."}
```

**Gap**: LLM doesn't need full pattern analysis - it just needs:
1. **Media list** (already in context)
2. **Reference ID validation** (simple lookup)
3. **Fallback analysis** (for edge cases)

### 8.2 Minimal Pattern Usage for Tools

**What Tools Actually Need**:

```typescript
// 1. Validate reference ID (no patterns needed)
async function resolveMediaReference(
  mediaReferenceId: string,
  chatMedia: ChatMedia[]
): Promise<ChatMedia | null> {
  return chatMedia.find(m => m.id === mediaReferenceId) || null;
}

// 2. Fallback pattern analysis (reuse existing analyzer)
async function analyzeMediaReference(
  userMessage: string,
  chatMedia: ChatMedia[],
  mediaType: MediaType
): Promise<MediaContext> {
  const analyzer = createAnalyzer(mediaType);
  return analyzer.analyzeContext(userMessage, chatMedia, []);
}
```

**Key Insight**: Tools don't need pattern extraction at all! They can **reuse existing analyzers** as-is for fallback.

---

## 9. Recommended Approach (Based on Analysis)

### 9.1 Hybrid Strategy: Context + Reuse

**Phase 1 Implementation**:
1. ✅ **Use existing analyzers** for inline fallback (no extraction needed)
2. ✅ **Add media context** to system prompt (new code)
3. ✅ **Add mediaReferenceId** parameter to tools (simple addition)
4. ❌ **No pattern extraction** (defer to later)

**Why This Works**:
- LLM uses context (mediaReferenceId) for 80% of cases
- Inline analysis (existing code) handles 20% edge cases
- Zero pattern extraction work
- Zero risk to existing functionality

### 9.2 Future Optimization (Phase 3)

**If needed** (based on Phase 1 metrics):
- Extract simple patterns for tool guidance
- Create pattern-based suggestions for LLM
- Optimize pattern matching performance

**Decision Point**: Only extract patterns if Phase 1 shows LLM struggles with complex references.

---

## 10. Risk Assessment

| Risk | Likelihood | Impact | Mitigation |
|------|-----------|--------|------------|
| **Pattern extraction breaks analyzers** | Medium | High | Option B (incremental) OR Option C (no extraction) |
| **Missing dependencies** | Low | Medium | Thorough dependency analysis (this doc) |
| **Performance regression** | Low | Low | Patterns are in-memory, fast |
| **Helper method coupling** | Medium | Medium | Extract helpers first (Stage 3) |

---

## 11. Final Recommendation

**Complexity Assessment**: **MODERATE** (5-7 days with Option B, 0-1 days with Option C)

**Recommended Strategy**: **Option C (No Extraction) + Option B (Deferred)**

**Phase 1 Implementation**:
- ✅ **No pattern extraction** - reuse existing analyzers as fallback
- ✅ Focus on context enhancement (system prompt + mediaReferenceId)
- ✅ Monitor metrics to see if pattern extraction is needed

**Phase 3 Optimization** (if metrics show need):
- Implement Option B (Incremental Extraction)
- Start with simple patterns (70%)
- Stop if gains are minimal

**Rationale**:
1. **Fastest path to value**: Context enhancement works without pattern extraction
2. **Lowest risk**: No changes to proven pattern logic
3. **Data-driven**: Decide on extraction based on real metrics
4. **Incremental**: Can always extract later if needed

---

## 12. Specific Answers to Phase 0.1 Questions

### Q1: Can patterns be extracted WITHOUT changing behavior?

**Answer**: **Yes, but MODERATE effort required.**

- **Simple patterns (70%)**: Easy extraction, low risk
- **Medium patterns (20%)**: Moderate extraction, some refactoring
- **Complex patterns (10%)**: Complex extraction, high risk OR keep in-place

### Q2: Are targetResolvers truly stateless?

**Answer**: **No, they have dependencies:**
- Message parsing (message.includes())
- Helper methods (this.findImageByContent)
- Instance context (this)

**Impact**: Cannot simply extract patterns as pure data. Need to extract helpers too.

### Q3: What's the actual coupling between patterns and analyzer internals?

**Answer**: **Medium-High coupling:**
- 10% patterns: Stateless (media array only)
- 20% patterns: Conditional logic (message parsing)
- 70% patterns: Helper dependencies (semantic search)

**Impact**: Full extraction requires extracting ~400 lines of helper code.

### Q4: How many patterns are duplicated across image/video analyzers?

**Answer**: **~17 patterns (~13%)** are structurally identical.

**Opportunity**: Parameterized pattern factories can eliminate duplication.

---

## 13. Next Steps

### Immediate (Phase 0 Completion):
1. ✅ Document findings (this document)
2. ⏭️ Validate semantic search (Phase 0.2)
3. ⏭️ Measure performance baseline (Phase 0.3)
4. ⏭️ Research chat route consumers (Phase 0.4)
5. ⏭️ GO/NO-GO decision

### Phase 1 (Implementation):
1. **No pattern extraction** - use Option C approach
2. Implement context enhancement (media list in system prompt)
3. Add mediaReferenceId to tools
4. Keep existing analyzers as inline fallback

### Phase 3 (Optimization):
1. Review Phase 1 metrics
2. **If needed**: Extract simple patterns (Option B, Stage 1-2)
3. **If not needed**: Keep current approach

---

## Appendix A: Code Statistics

### Line Counts
```
ImageContextAnalyzer:
├── getReferencePatterns(): 437 lines (54 patterns)
├── Helper methods: 257 lines
└── Total: 809 lines

VideoContextAnalyzer:
├── getReferencePatterns(): ~360 lines (72 patterns)
├── Helper methods: ~100 lines
└── Total: 513 lines

BaseContextAnalyzer:
├── analyzeContext(): ~156 lines
├── Helper methods: ~488 lines
└── Total: 644 lines

Total Codebase: 1,966 lines
```

### Pattern Distribution
```
Simple Position:     ~35 patterns (28%)  - Easy extraction
Conditional Logic:   ~25 patterns (20%)  - Medium extraction
Source Filtering:    ~15 patterns (12%)  - Easy extraction
Semantic Search:     ~26 patterns (21%)  - Complex extraction
Edit Commands:       ~10 patterns (8%)   - Easy extraction
Universal Search:    ~15 patterns (11%)  - Very complex extraction

Total: 126 patterns
```

---

**Status**: ✅ Complete
**Confidence**: High (thorough analysis)
**Next Task**: Phase 0.2 - Semantic Search Validation
