# Technical Plan: Chat Context System Improvements for Media

**Date**: 2025-10-27
**Task**: Context Awareness Improvements
**Branch**: `feature/context-awareness-improvements` (to be created from `update-media-generation-api`)
**Complexity**: Medium-High
**Estimated Effort**: 2-3 days

---

## Executive Summary

**Current State**: We have a sophisticated AI-powered context system that uses LLMs to analyze user messages and match them to relevant media artifacts from chat history. The system includes:
- ✅ AI-powered context analysis (LLM-based)
- ✅ Cross-media artifact fetching from database
- ✅ Intent detection (edit/transform/create_new)
- ✅ Cache system for performance
- ✅ **Unused** semantic search capabilities
- ✅ **Unused** user preference learning
- ✅ **Unused** temporal analysis

**User Request**: The user wants the chatbot to better understand context across media types (image→video, video→image) using natural language like "make a video from this image" or "take that cat picture and add a dog."

**Key Finding**: **The context system already does most of what the user wants!** The issue is NOT missing features but:
1. **Semantic search not integrated** - Exists but unused in tools
2. **User preference learning not activated** - Exists but not called
3. **No enriched metadata storage** - Media lacks semantic descriptions
4. **Cross-media intent not fully utilized** - Intent detection exists but not leveraged for video→image

**Strategy**: BUILD ON existing excellent foundation, ACTIVATE unused modules, ENHANCE metadata, NOT replace everything.

---

## Research Phase - Verified Claims

### 1. Existing Context System Analysis

**File: `src/lib/ai/context/universal-context.ts`**
- ✅ `UniversalContextManager` - Main orchestrator
- ✅ `AIContextAnalyzer` - Uses LLM for analysis
- ✅ `getChatMedia()` - Fetches artifacts from DB via `getChatMediaArtifacts()`
- ✅ Cache integration via `contextCache`
- ✅ Supports image/video/audio media types

**File: `src/lib/ai/context/ai-powered-analyzer.ts`**
- ✅ `analyzeMediaWithAI()` - LLM-based context analysis
- ✅ `analyzeMediaReferenceWithLLM()` - Detailed prompt engineering
- ✅ Intent detection: edit/transform/create_new
- ✅ Confidence levels: high/medium/low
- ✅ Supports Russian and English prompts
- ✅ Multi-modal reasoning (text + content-based + time-based)

**File: `src/lib/ai/context/index.ts`**
- ✅ Exports: `analyzeImageContext()`, `analyzeVideoContext()`, `analyzeAudioContext()`
- ✅ Exports semantic search: `semanticAnalyzer`, `SemanticContextAnalyzer`
- ✅ Exports user preferences: `userPreferenceLearner`, `UserPreferenceLearner`
- ✅ Exports temporal analyzer: `temporalAnalyzer`, `TemporalAnalyzer`

**CRITICAL FINDING**: All advanced features exist but are NOT used in tools!

### 2. Tool Integration - Current Usage

**File: `src/lib/ai/tools/nano-banana-chat-image-generation.ts` (lines 326-348)**
```typescript
const contextResult = await analyzeImageContext(
  params.userMessage,
  params.chatId,
  params.currentAttachments,
  params.session?.user?.id,
);
if (contextResult.sourceUrl && contextResult.confidence !== 'low') {
  normalizedSourceUrl = contextResult.sourceUrl;
}
```
- ✅ Uses AI context analysis
- ✅ Falls back on low confidence
- ❌ Does NOT use semantic search
- ❌ Does NOT use user preferences
- ❌ Does NOT record user choices for learning

**File: `src/lib/ai/tools/fal-chat-video-generation.ts` (lines 133-156)**
```typescript
const contextResult = await analyzeVideoContext(
  params.userMessage,
  params.chatId,
  params.currentAttachments,
  params.session?.user?.id,
);
if (contextResult.sourceUrl && contextResult.confidence !== 'low') {
  normalizedSourceUrl = contextResult.sourceUrl;
}
```
- ✅ Same pattern as image tool
- ❌ No semantic search integration
- ❌ No user preference learning

### 3. Database Schema - Media Artifact Storage

**File: `src/lib/db/queries.ts` (lines 885-1050)**
- Function: `getChatMediaArtifacts({ chatId, limit })`
- Fetches from `message.parts` (JSON artifacts in assistant messages)
- Extracts: url, role, timestamp, prompt, mediaType, metadata
- Current metadata: `{ projectId, requestId }`
- ❌ **Missing**: Semantic tags, descriptions, relationships

**Metadata Currently Stored**:
```typescript
metadata: {
  projectId: artifactContent.projectId,
  requestId: artifactContent.requestId,
}
```

**What's Missing**:
- Semantic tags (e.g., ["cat", "outdoor", "sunny"])
- AI-generated description
- Related media IDs (image→video lineage)
- User-provided context
- Generation parameters (for reproducibility)

### 4. Semantic Search Capabilities (UNUSED)

**File: `src/lib/ai/context/semantic-search.ts`**
- ✅ `SemanticContextAnalyzer` class exists
- ✅ `findSimilarMedia()` - Keyword-based similarity
- ✅ `calculateSimilarity()` - Weighted scoring (prompt: 1.0, fileName: 0.8)
- ✅ `addMediaToIndex()` - Index building
- ✅ Integration with `semantic-index.ts` for keyword extraction
- **STATUS**: Exported but NEVER called by tools!

**File: `src/lib/ai/context/semantic-index.ts`**
- ✅ `SemanticIndex` - Universal keyword extraction
- ✅ `searchMedia()` - Search by query
- ✅ `extractKeywords()` - Multilingual support
- ✅ Stop words filtering
- **STATUS**: Exported but NEVER called by tools!

### 5. User Preference Learning (UNUSED)

**File: `src/lib/ai/context/user-preferences.ts`**
- ✅ `UserPreferenceLearner` class exists
- ✅ `recordUserChoice()` - Logs user selections
- ✅ `applyUserPreferences()` - Adjusts context based on history
- ✅ Pattern learning from repeated choices
- ✅ Accuracy tracking and time decay
- **STATUS**: Exported but NEVER called by tools!

### 6. AI SDK 5 Patterns (Context7 Research)

**Key Patterns Found**:
1. **Multi-modal messages**: Supports text + image in same message
2. **Tool result metadata**: Can attach context to tool results
3. **Message-level metadata**: `messageMetadata` callback for enrichment
4. **Tool call streaming**: Real-time updates during tool execution
5. **Context management**: `prepareStep` for pruning message history
6. **Attachments**: Native support in `UIMessage` format

**Best Practice**: Use `messageMetadata` to enrich tool results with semantic info:
```typescript
return result.toUIMessageStreamResponse({
  messageMetadata: ({ part }) => {
    if (part.type === 'finish') {
      return {
        semanticTags: ["cat", "outdoor"],
        description: "AI-generated description",
        relatedMediaIds: ["image-123"],
      };
    }
  },
});
```

### 7. Recent Changes (Git Analysis)

From `git log --oneline -20`:
- Recent work on Vertex AI VEO 3.1 video generation
- Message validation improvements
- Image/video generation components enhanced
- Database integration for media storage (task 2025-10-23)

**Key Insight**: Media storage migrated to DB, perfect foundation for richer metadata!

---

## Problem Analysis

### Current Limitations

1. **Semantic Search Disconnect**:
   - Modules exist: `semantic-search.ts`, `semantic-index.ts`
   - Never called by tools
   - LLM analysis could be AUGMENTED with semantic search, not replaced

2. **No User Learning**:
   - `UserPreferenceLearner` fully implemented
   - Never records user choices
   - Misses opportunity to improve over time

3. **Thin Metadata**:
   - Only stores `projectId` and `requestId`
   - No semantic descriptions or tags
   - No cross-media relationships (image→video lineage)

4. **Cross-Media Intent Underutilized**:
   - Video tool analyzes video context only
   - Doesn't check for related images that could be animated
   - Intent detection exists but not fully leveraged

5. **No Feedback Loop**:
   - User confirms media selection implicitly (by continuing)
   - System never learns from these confirmations
   - Wastes valuable training signal

### Why Current System is Good But Not Great

**Good**:
- LLM-based analysis is intelligent and flexible
- Handles Russian/English naturally
- Intent detection is sophisticated
- Cache system prevents redundant analysis

**Not Great**:
- Pure LLM approach is expensive and slow
- No optimization from repeated patterns
- Semantic search could pre-filter candidates
- User preferences could boost confidence
- Metadata lacks context for future analysis

---

## Solution Architecture

### Core Principle: **Hybrid Approach**

```
User Query
    ↓
[Semantic Search] ← Fast keyword filtering
    ↓
[User Preferences] ← Apply learned patterns
    ↓
[LLM Analysis] ← Deep reasoning on top candidates
    ↓
[Result] + Record for Learning
```

**Why This Works**:
1. Semantic search REDUCES candidate pool (fast)
2. User preferences BOOST relevant candidates (personalized)
3. LLM analysis DECIDES final match (intelligent)
4. Recording IMPROVES future accuracy (learning)

### Architecture Layers

```
┌─────────────────────────────────────────┐
│  Tools (nano-banana, fal-video)         │
│  - Call enhanced context analysis       │
│  - Record user choices for learning     │
└─────────────────────────────────────────┘
              ↓
┌─────────────────────────────────────────┐
│  Enhanced Context Analyzer               │
│  1. Semantic pre-filtering               │
│  2. User preference boost                │
│  3. LLM analysis (existing)              │
│  4. Return enriched result               │
└─────────────────────────────────────────┘
              ↓
┌─────────────────────────────────────────┐
│  Media Artifacts (DB)                    │
│  - Enhanced metadata storage             │
│  - Semantic tags                         │
│  - Descriptions                          │
│  - Cross-media relationships             │
└─────────────────────────────────────────┘
```

### Key Improvements

#### 1. Enhanced Metadata Storage

**Current Artifact Structure** (in message.parts):
```typescript
{
  kind: 'image' | 'video',
  status: 'completed',
  imageUrl: string,
  prompt: string,
  settings: { ... },
  metadata: {
    projectId: string,
    requestId: string,
  }
}
```

**Enhanced Structure**:
```typescript
{
  kind: 'image' | 'video',
  status: 'completed',
  imageUrl: string,
  prompt: string,
  settings: { ... },
  metadata: {
    projectId: string,
    requestId: string,
    // NEW FIELDS:
    semanticTags: string[],           // ["cat", "outdoor", "sunny"]
    aiDescription: string,             // LLM-generated summary
    sourceMediaId?: string,            // For image→video: original image ID
    relatedMediaIds?: string[],        // Bidirectional relationships
    userContext?: string,              // User's description if provided
    generationIntent: 'create_new' | 'edit' | 'transform',
  }
}
```

**Storage Location**: JSON fields in existing `message.parts` (no schema change needed!)

#### 2. Hybrid Context Analysis Flow

**New Function**: `analyzeContextEnhanced()`

```typescript
async function analyzeContextEnhanced(
  mediaType: MediaType,
  userMessage: string,
  chatId: string,
  currentAttachments?: any[],
  userId?: string,
): Promise<MediaContext> {
  // 1. Fetch all media artifacts
  const allMedia = await contextManager.getChatMedia(chatId);

  // 2. SEMANTIC PRE-FILTERING (NEW!)
  const semanticMatches = await semanticAnalyzer.findSimilarMedia(
    userMessage,
    allMedia,
    0.6 // threshold
  );

  // 3. Apply top N candidates (e.g., 5) to reduce LLM analysis cost
  const topCandidates = semanticMatches.slice(0, 5).map(m => m.media);

  // 4. USER PREFERENCE BOOST (NEW!)
  let candidates = topCandidates;
  if (userId) {
    // Apply learned preferences to re-rank candidates
    const baseContext = { mediaType, confidence: 'medium' as const };
    const preferenceResult = await userPreferenceLearner.applyUserPreferences(
      userId,
      userMessage,
      candidates,
      baseContext,
    );
    if (preferenceResult.sourceUrl) {
      // Preferences found a strong match, boost it
      candidates = [
        candidates.find(c => c.url === preferenceResult.sourceUrl)!,
        ...candidates.filter(c => c.url !== preferenceResult.sourceUrl),
      ];
    }
  }

  // 5. LLM ANALYSIS on top candidates (EXISTING, but on filtered set)
  const result = await contextManager.analyzeContext(
    mediaType,
    userMessage,
    candidates, // NOT all media, just top candidates!
    currentAttachments,
    chatId,
    userId,
  );

  // 6. RECORD USER CHOICE for learning (NEW!)
  if (result.sourceUrl && result.confidence !== 'low' && userId) {
    const selectedMedia = candidates.find(c => c.url === result.sourceUrl);
    if (selectedMedia) {
      await userPreferenceLearner.recordUserChoice(
        chatId,
        userId,
        userMessage,
        selectedMedia,
        candidates,
        result.confidence === 'high' ? 1.0 : 0.7,
        result.reasoning,
      );
    }
  }

  return result;
}
```

#### 3. Cross-Media Context Support

**Use Case**: "Make a video from that cat image"

**Current Behavior**:
- Video tool calls `analyzeVideoContext()` → looks for videos only
- Misses that user wants to animate an IMAGE

**Enhanced Behavior**:
```typescript
// In video tool: Check intent first
const contextResult = await analyzeContextEnhanced(
  'video', // Target type
  params.userMessage,
  params.chatId,
  params.currentAttachments,
  params.session?.user?.id,
);

// Check if intent is "transform" and source is image
if (contextResult.intent === 'transform' &&
    contextResult.metadata?.sourceMediaType === 'image') {
  // Use image as sourceImageUrl for video generation!
  normalizedSourceImageUrl = contextResult.sourceUrl;

  // Record relationship in metadata
  metadata.sourceMediaId = contextResult.sourceId;
  metadata.transformationType = 'image-to-video';
}
```

**Similar Pattern for Images**:
"Extract a frame from that video" → Image tool uses video URL

#### 4. Semantic Enrichment During Generation

**When**: After successful generation, before returning artifact

**Process**:
1. Generate media (existing)
2. Call LLM to analyze generated media
3. Extract semantic tags and description
4. Enrich metadata
5. Return enhanced artifact

**Implementation**:
```typescript
// In tool's execute function, after generation succeeds:
async function enrichMediaMetadata(
  imageUrl: string,
  prompt: string,
  intent: UserIntent,
  sourceMediaId?: string,
): Promise<EnrichedMetadata> {
  // Use vision model to analyze generated image
  const { text } = await generateText({
    model: myProvider.languageModel('vision-model'),
    messages: [
      {
        role: 'user',
        content: [
          { type: 'text', text: 'Analyze this image and provide: 1) Semantic tags (5-10 keywords), 2) Brief description (1-2 sentences). Respond in JSON format.' },
          { type: 'image', image: imageUrl },
        ],
      },
    ],
  });

  const analysis = JSON.parse(text);

  return {
    semanticTags: analysis.tags,
    aiDescription: analysis.description,
    sourceMediaId,
    relatedMediaIds: sourceMediaId ? [sourceMediaId] : [],
    generationIntent: intent,
    userContext: prompt,
  };
}
```

**Cost Optimization**:
- Cache enrichment results
- Use faster vision model (gpt-4o-mini)
- Make enrichment async (don't block artifact return)

---

## Implementation Plan

### Phase 1: Foundation - Activate Semantic Search

**Goal**: Integrate existing semantic search into context analysis

**Files to Modify**:
1. `src/lib/ai/context/enhanced-analyzer.ts` (NEW)
   - Create `EnhancedContextAnalyzer` class
   - Wraps existing `AIContextAnalyzer`
   - Adds semantic pre-filtering layer
   - Exports `analyzeContextEnhanced()` helper

**Steps**:
1. Create `enhanced-analyzer.ts`:
   ```typescript
   import { AIContextAnalyzer, semanticAnalyzer, type MediaContext, type ChatMedia } from './index';

   export class EnhancedContextAnalyzer {
     private baseAnalyzer = new AIContextAnalyzer();

     async analyzeContext(
       mediaType: MediaType,
       userMessage: string,
       chatMedia: ChatMedia[],
       currentAttachments?: any[],
       chatId?: string,
       userId?: string,
     ): Promise<MediaContext> {
       // Semantic pre-filtering
       const semanticMatches = await semanticAnalyzer.findSimilarMedia(
         userMessage,
         chatMedia,
         0.6,
       );

       // Take top 5 candidates
       const topCandidates = semanticMatches.length > 0
         ? semanticMatches.slice(0, 5).map(m => m.media)
         : chatMedia.slice(-5); // Fallback: recent 5

       // Use base analyzer on filtered set
       return this.baseAnalyzer.analyzeContext(
         mediaType,
         userMessage,
         topCandidates,
         currentAttachments,
         chatId,
       );
     }
   }

   export const enhancedAnalyzer = new EnhancedContextAnalyzer();
   ```

2. Export from `src/lib/ai/context/index.ts`:
   ```typescript
   export { EnhancedContextAnalyzer, enhancedAnalyzer } from './enhanced-analyzer';
   export async function analyzeImageContextEnhanced(...) { ... }
   export async function analyzeVideoContextEnhanced(...) { ... }
   ```

3. Update tools to use enhanced version (optional flag):
   - `nano-banana-chat-image-generation.ts`
   - `fal-chat-video-generation.ts`
   - Add feature flag: `ENABLE_ENHANCED_CONTEXT=true`

**Testing**:
- Unit test: Verify semantic filtering reduces candidate set
- Integration test: Compare LLM calls (should be fewer)
- Performance test: Measure latency improvement

**Success Criteria**:
- ✅ Semantic search called on every context analysis
- ✅ Candidate pool reduced from N to max 5
- ✅ No regression in accuracy
- ✅ Latency improvement of 10-30%

### Phase 2: User Preference Learning Integration

**Goal**: Record user choices and apply learned preferences

**Files to Modify**:
1. `src/lib/ai/context/enhanced-analyzer.ts` (update)
   - Add user preference application
   - Record choices after successful match

**Steps**:
1. Update `EnhancedContextAnalyzer.analyzeContext()`:
   ```typescript
   async analyzeContext(..., userId?: string): Promise<MediaContext> {
     // ... semantic filtering ...

     let candidates = topCandidates;

     // Apply user preferences
     if (userId) {
       const baseContext = { mediaType, confidence: 'medium' as const };
       const preferenceResult = await userPreferenceLearner.applyUserPreferences(
         userId,
         userMessage,
         candidates,
         baseContext,
       );

       if (preferenceResult.sourceUrl) {
         // Re-rank candidates based on preferences
         candidates = reRankByPreference(candidates, preferenceResult.sourceUrl);
       }
     }

     const result = await this.baseAnalyzer.analyzeContext(..., candidates, ...);

     // Record choice for learning
     if (result.sourceUrl && result.confidence !== 'low' && userId) {
       this.recordUserChoice(chatId, userId, userMessage, result, candidates);
     }

     return result;
   }

   private async recordUserChoice(...) {
     const selectedMedia = candidates.find(c => c.url === result.sourceUrl);
     if (selectedMedia) {
       await userPreferenceLearner.recordUserChoice(
         chatId,
         userId,
         userMessage,
         selectedMedia,
         candidates,
         result.confidence === 'high' ? 1.0 : 0.7,
         result.reasoning,
       );
     }
   }
   ```

**Testing**:
- Test user preference recording
- Test preference application (mock learned patterns)
- Test without userId (guest users)

**Success Criteria**:
- ✅ User choices recorded in preference learner
- ✅ Preferences applied to re-rank candidates
- ✅ Works for both authenticated and guest users
- ✅ Accuracy improves over multiple interactions

### Phase 3: Enhanced Metadata Storage

**Goal**: Store semantic tags and descriptions with media artifacts

**Files to Modify**:
1. `src/lib/ai/tools/nano-banana-chat-image-generation.ts`
2. `src/lib/ai/tools/fal-chat-video-generation.ts`
3. `src/lib/ai/context/metadata-enrichment.ts` (NEW)

**Steps**:
1. Create `metadata-enrichment.ts`:
   ```typescript
   import { generateText } from 'ai';
   import { myProvider } from '@/lib/ai/providers';

   export interface EnrichedMetadata {
     semanticTags: string[];
     aiDescription: string;
     sourceMediaId?: string;
     relatedMediaIds?: string[];
     generationIntent: 'create_new' | 'edit' | 'transform';
     userContext?: string;
   }

   export async function enrichImageMetadata(
     imageUrl: string,
     prompt: string,
     intent: string,
     sourceMediaId?: string,
   ): Promise<EnrichedMetadata> {
     try {
       const { text } = await generateText({
         model: myProvider.languageModel('vision-model'),
         messages: [
           {
             role: 'user',
             content: [
               {
                 type: 'text',
                 text: `Analyze this image and provide:
1. Semantic tags: 5-10 keywords describing content, style, mood
2. Description: 1-2 sentence summary
3. Primary subjects: Main objects/people

Respond ONLY with JSON: { "tags": [...], "description": "...", "subjects": [...] }`,
               },
               { type: 'image', image: imageUrl },
             ],
           },
         ],
         maxOutputTokens: 150,
       });

       const analysis = JSON.parse(text);

       return {
         semanticTags: [...analysis.tags, ...analysis.subjects],
         aiDescription: analysis.description,
         sourceMediaId,
         relatedMediaIds: sourceMediaId ? [sourceMediaId] : [],
         generationIntent: intent as any,
         userContext: prompt,
       };
     } catch (error) {
       console.error('Metadata enrichment failed:', error);
       // Fallback: Extract from prompt
       return {
         semanticTags: extractKeywordsFromPrompt(prompt),
         aiDescription: prompt.substring(0, 100),
         sourceMediaId,
         relatedMediaIds: sourceMediaId ? [sourceMediaId] : [],
         generationIntent: intent as any,
         userContext: prompt,
       };
     }
   }

   function extractKeywordsFromPrompt(prompt: string): string[] {
     // Simple keyword extraction as fallback
     return prompt
       .toLowerCase()
       .split(/\s+/)
       .filter(w => w.length > 3)
       .slice(0, 10);
   }
   ```

2. Update image tool to enrich metadata:
   ```typescript
   // After successful generation, before return:
   const enrichedMetadata = await enrichImageMetadata(
     result.url,
     result.prompt,
     contextResult.intent || 'create_new',
     contextResult.sourceId,
   );

   const contentData = {
     ...existingContent,
     metadata: {
       ...existingContent.metadata,
       ...enrichedMetadata,
     },
   };
   ```

3. Make enrichment async to avoid blocking:
   ```typescript
   // Option 1: Fire and forget (enrichment happens in background)
   enrichImageMetadata(...).catch(err => console.error('Enrichment failed:', err));

   // Option 2: Return artifact immediately, send enrichment update via SSE
   return artifact; // User sees it immediately
   // Background: enrich + update DB + send SSE update
   ```

**Testing**:
- Test vision model integration
- Test fallback when vision model fails
- Test async enrichment doesn't block
- Verify metadata stored in message.parts

**Success Criteria**:
- ✅ Semantic tags extracted for each generated media
- ✅ AI descriptions stored
- ✅ Cross-media relationships tracked
- ✅ No blocking of artifact return

### Phase 4: Cross-Media Context Support

**Goal**: Support image→video and video→image transformations

**Files to Modify**:
1. `src/lib/ai/context/enhanced-analyzer.ts` (update)
2. `src/lib/ai/tools/fal-chat-video-generation.ts`
3. `src/lib/ai/tools/nano-banana-chat-image-generation.ts`

**Steps**:
1. Update enhanced analyzer to detect cross-media intent:
   ```typescript
   async analyzeContext(
     targetMediaType: MediaType, // 'video'
     userMessage: string,
     chatMedia: ChatMedia[],
     ...
   ): Promise<MediaContext> {
     // Check all media types if intent suggests transformation
     const allMedia = chatMedia;
     const targetMedia = chatMedia.filter(m => m.mediaType === targetMediaType);

     // Semantic search on ALL media first
     const semanticMatches = await semanticAnalyzer.findSimilarMedia(
       userMessage,
       allMedia, // Not filtered by type yet!
       0.6,
     );

     // Let LLM decide if cross-media transformation
     const result = await this.baseAnalyzer.analyzeContext(
       targetMediaType,
       userMessage,
       semanticMatches.slice(0, 5).map(m => m.media),
       currentAttachments,
       chatId,
     );

     // Enrich with source media type
     if (result.sourceUrl) {
       const sourceMedia = allMedia.find(m => m.url === result.sourceUrl);
       if (sourceMedia && sourceMedia.mediaType !== targetMediaType) {
         result.metadata = {
           ...result.metadata,
           sourceMediaType: sourceMedia.mediaType,
           crossMediaTransformation: true,
         };
       }
     }

     return result;
   }
   ```

2. Update video tool to handle image sources:
   ```typescript
   // In fal-chat-video-generation.ts execute():
   const contextResult = await analyzeVideoContextEnhanced(...);

   let sourceVideoUrl: string | undefined;
   let sourceImageUrl: string | undefined;

   if (contextResult.sourceUrl && contextResult.confidence !== 'low') {
     if (contextResult.metadata?.sourceMediaType === 'image') {
       // User wants to animate an image!
       sourceImageUrl = contextResult.sourceUrl;
       console.log('🔄 Cross-media: Using image as video source:', sourceImageUrl);
     } else {
       // Standard video-to-video
       sourceVideoUrl = contextResult.sourceUrl;
     }
   }

   // Pass to Vertex AI (supports image-to-video)
   const vertexRequest = {
     prompt,
     ...(sourceImageUrl && { sourceImageUrl }),
     ...(sourceVideoUrl && { sourceVideoUrl }),
     ...
   };
   ```

3. Update image tool similarly for video→image (frame extraction):
   ```typescript
   // Pseudo-code: Extract frame from video
   if (contextResult.metadata?.sourceMediaType === 'video') {
     // Extract first frame or middle frame
     const frameUrl = await extractVideoFrame(contextResult.sourceUrl);
     sourceImageUrl = frameUrl;
   }
   ```

**Testing**:
- Test "make video from this image" scenario
- Test "extract frame from that video" scenario
- Test normal same-type transformations still work
- Verify metadata relationships stored

**Success Criteria**:
- ✅ Video tool accepts image sources
- ✅ Image tool accepts video sources
- ✅ Cross-media relationships tracked in metadata
- ✅ Intent detection works correctly

### Phase 5: Integration & Polish

**Goal**: Integrate all enhancements, add feature flags, optimize performance

**Files to Modify**:
1. Environment variables (feature flags)
2. Configuration for enabling/disabling features
3. Performance monitoring
4. Error handling

**Steps**:
1. Add feature flags:
   ```typescript
   // .env.local
   ENABLE_SEMANTIC_SEARCH=true
   ENABLE_USER_PREFERENCES=true
   ENABLE_METADATA_ENRICHMENT=true
   ENABLE_CROSS_MEDIA_CONTEXT=true
   ```

2. Add configuration:
   ```typescript
   // src/lib/ai/context/config.ts
   export const contextConfig = {
     enableSemanticSearch: process.env.ENABLE_SEMANTIC_SEARCH === 'true',
     enableUserPreferences: process.env.ENABLE_USER_PREFERENCES === 'true',
     enableMetadataEnrichment: process.env.ENABLE_METADATA_ENRICHMENT === 'true',
     enableCrossMediaContext: process.env.ENABLE_CROSS_MEDIA_CONTEXT === 'true',
     semanticSearchThreshold: 0.6,
     maxCandidates: 5,
     enrichmentTimeout: 10000, // 10s
   };
   ```

3. Update enhanced analyzer to respect flags:
   ```typescript
   async analyzeContext(...): Promise<MediaContext> {
     let candidates = chatMedia;

     // Semantic search (if enabled)
     if (contextConfig.enableSemanticSearch) {
       const matches = await semanticAnalyzer.findSimilarMedia(...);
       candidates = matches.slice(0, contextConfig.maxCandidates).map(m => m.media);
     }

     // User preferences (if enabled)
     if (contextConfig.enableUserPreferences && userId) {
       // ... apply preferences ...
     }

     // ... rest of analysis ...
   }
   ```

4. Add performance monitoring:
   ```typescript
   import { contextPerformanceMonitor } from './performance-monitor';

   async analyzeContext(...): Promise<MediaContext> {
     const startTime = Date.now();

     // ... analysis ...

     contextPerformanceMonitor.recordAnalysis({
       duration: Date.now() - startTime,
       candidateCount: candidates.length,
       confidence: result.confidence,
       useSemanticSearch: contextConfig.enableSemanticSearch,
       useUserPreferences: contextConfig.enableUserPreferences,
     });

     return result;
   }
   ```

5. Error handling and fallbacks:
   ```typescript
   try {
     // Try enhanced analysis
     return await enhancedAnalyzer.analyzeContext(...);
   } catch (error) {
     console.error('Enhanced analysis failed, falling back to base:', error);
     // Fallback to base analyzer
     return await contextManager.analyzeContext(...);
   }
   ```

**Testing**:
- Integration tests with all features enabled
- Test feature flags work correctly
- Test fallback behavior
- Performance benchmarks
- Error scenarios

**Success Criteria**:
- ✅ All features configurable via flags
- ✅ Performance monitoring in place
- ✅ Graceful fallbacks on errors
- ✅ No breaking changes to existing behavior

---

## Testing Strategy

### Unit Tests

**File**: `src/tests/unit/context/enhanced-analyzer.test.ts`

```typescript
describe('EnhancedContextAnalyzer', () => {
  it('should filter candidates using semantic search', async () => {
    // Test semantic pre-filtering reduces candidate set
  });

  it('should apply user preferences when userId provided', async () => {
    // Mock learned preferences, verify re-ranking
  });

  it('should record user choices after successful match', async () => {
    // Verify recordUserChoice called with correct params
  });

  it('should fallback to base analyzer on error', async () => {
    // Simulate semantic search failure, verify fallback
  });

  it('should detect cross-media transformations', async () => {
    // Test image→video intent detection
  });
});
```

### Integration Tests

**File**: `src/tests/integration/context/context-flow.test.ts`

```typescript
describe('Context Analysis Flow', () => {
  it('should complete full analysis with all enhancements', async () => {
    // End-to-end test: semantic → preferences → LLM → record
  });

  it('should work without userId (guest users)', async () => {
    // Test that analysis works without preference learning
  });

  it('should enrich metadata after generation', async () => {
    // Test metadata enrichment integration
  });

  it('should handle cross-media context requests', async () => {
    // Test "make video from image" scenario
  });
});
```

### Performance Tests

**Goals**:
- Latency improvement of 10-30% vs baseline
- No increase in error rate
- Cache hit rate >50% for repeated queries

**Metrics to Track**:
- Analysis duration (ms)
- Candidate pool size (before/after filtering)
- LLM call count (should decrease)
- Accuracy (confidence level distribution)
- User preference learning rate

---

## Edge Cases & Error Handling

### Edge Cases

1. **No media in chat history**
   - Semantic search returns empty
   - LLM analysis on empty set
   - **Solution**: Return low confidence, proceed with generation

2. **Ambiguous user intent**
   - "Use that one" with multiple matches
   - **Solution**: LLM analyzes temporal context (most recent)

3. **User preference conflicts**
   - Preferences suggest different media than semantic search
   - **Solution**: Weight LLM analysis highest, preferences boost confidence

4. **Cross-language prompts**
   - Russian prompt, English metadata
   - **Solution**: Semantic search handles multilingual keywords

5. **Very long chat history**
   - 100+ media artifacts
   - **Solution**: Semantic search pre-filters, only top 5 to LLM

### Error Handling

1. **Semantic search fails**
   - Network error, timeout
   - **Fallback**: Skip semantic filtering, use recent N artifacts

2. **User preference learner fails**
   - Storage error
   - **Fallback**: Skip preference application, log warning

3. **Metadata enrichment fails**
   - Vision model error, timeout
   - **Fallback**: Use prompt-based extraction, continue generation

4. **LLM analysis fails**
   - API error, rate limit
   - **Fallback**: Use most recent media of target type

**Retry Strategy**:
- Semantic search: 1 retry with 2s timeout
- Metadata enrichment: No retry (non-critical)
- LLM analysis: 1 retry with exponential backoff

---

## Performance Considerations

### Optimization Strategies

1. **Candidate Pool Reduction**
   - Before: LLM analyzes all N artifacts
   - After: LLM analyzes top 5 from semantic search
   - **Savings**: 50-90% reduction in prompt tokens

2. **Parallel Processing**
   ```typescript
   const [semanticMatches, preferenceResult] = await Promise.all([
     semanticAnalyzer.findSimilarMedia(...),
     userPreferenceLearner.applyUserPreferences(...),
   ]);
   ```

3. **Cache Strategy**
   - Cache semantic search results per message hash
   - Cache enriched metadata per media URL
   - TTL: 1 hour for semantic, 24 hours for metadata

4. **Async Metadata Enrichment**
   - Don't block artifact return
   - Enrich in background
   - Update via SSE or on next fetch

5. **Lazy Loading**
   - User preferences loaded only when userId present
   - Semantic index built incrementally
   - Temporal analysis on-demand

### Cost Analysis

**Current Cost per Analysis** (estimated):
- LLM analysis: 500-1000 tokens input × N artifacts
- N=10 artifacts: ~5000 tokens = $0.015 (GPT-4)

**Enhanced Cost per Analysis**:
- Semantic search: ~50ms CPU (negligible)
- User preferences: ~10ms CPU (negligible)
- LLM analysis: 500-1000 tokens input × 5 artifacts
- N=5 artifacts: ~2500 tokens = $0.0075 (GPT-4)
- Metadata enrichment: ~500 tokens (vision) = $0.005

**Total Savings**: ~50% reduction in LLM costs + better accuracy

---

## Migration Path

### Phase 0: Preparation (No Breaking Changes)

1. Add enhanced analyzer alongside existing
2. Add feature flags (all disabled by default)
3. Ensure backward compatibility

### Phase 1: Gradual Rollout

1. Enable semantic search only (feature flag)
2. Monitor performance and accuracy
3. Gather user feedback

### Phase 2: User Preferences

1. Enable user preference learning
2. Let system learn for 1-2 weeks
3. Evaluate accuracy improvements

### Phase 3: Metadata Enrichment

1. Enable for new generations only
2. Backfill existing media gradually
3. Monitor storage and API costs

### Phase 4: Cross-Media Context

1. Enable cross-media detection
2. Test with real user scenarios
3. Refine intent detection

### Phase 5: Full Deployment

1. Enable all features by default
2. Remove feature flags
3. Monitor production metrics

---

## Success Metrics

### Quantitative Metrics

1. **Accuracy**
   - Target: >90% confidence = 'high' or 'medium'
   - Baseline: Current system accuracy
   - Measure: Confidence distribution over 100 analyses

2. **Performance**
   - Target: <2s average analysis time
   - Baseline: Current analysis time
   - Measure: P50, P95, P99 latencies

3. **Cost**
   - Target: 30-50% reduction in LLM token usage
   - Baseline: Current token consumption
   - Measure: Tokens per analysis

4. **User Satisfaction**
   - Target: >80% correct media selection
   - Measure: User continues with selected media (implicit confirmation)

### Qualitative Metrics

1. **Natural Language Understanding**
   - "Make a video from this" → Correctly identifies image
   - "That cat picture" → Finds cat-related media
   - "The one I uploaded" → Distinguishes user vs assistant media

2. **Learning Over Time**
   - User preference accuracy improves after 5-10 interactions
   - Repeated patterns recognized faster

3. **Cross-Media Fluency**
   - Image→video transformations work seamlessly
   - Video→image frame extraction works

---

## Documentation Updates

### 1. Agent Knowledge Base (`_ai/`)

**New File**: `_ai/context-system.md`
```markdown
# Context System

## Architecture
- Hybrid: Semantic → Preferences → LLM → Learning
- Three layers: Fast filtering, personalization, deep reasoning

## Code Pointers
- `src/lib/ai/context/enhanced-analyzer.ts:EnhancedContextAnalyzer`
- `src/lib/ai/context/semantic-search.ts:SemanticContextAnalyzer`
- `src/lib/ai/context/user-preferences.ts:UserPreferenceLearner`

## Gotchas
- Always filter candidates before LLM (cost optimization)
- Record user choices for learning (even implicit confirmations)
- Metadata enrichment is async (don't block artifacts)

## Patterns
- Cross-media: Check sourceMediaType in metadata
- Feature flags: Respect contextConfig settings
- Fallbacks: Base analyzer always available
```

### 2. Public Documentation (`apps/super-chatbot/docs/`)

**Update**: `apps/super-chatbot/docs/ai-capabilities/context-awareness.md`
```markdown
# Context-Aware Media Generation

## Overview
The chatbot understands context across images and videos, allowing natural requests like:
- "Make a video from this image"
- "Take that cat picture and add a dog"
- "Animate the landscape I generated"

## How It Works
1. **Semantic Search**: Finds relevant media by content
2. **User Preferences**: Learns your patterns over time
3. **AI Analysis**: Deep understanding with LLMs
4. **Cross-Media**: Image↔Video transformations

## Features
- Natural language references ("this", "that", "the one")
- Multilingual support (English, Russian)
- Learning from your choices
- Automatic metadata tagging

## Technical Details
- Hybrid analysis pipeline
- Semantic pre-filtering
- Intent detection (edit/transform/create_new)
- Enriched metadata storage
```

### 3. Developer Guide

**Update**: `apps/super-chatbot/docs/development/context-system.md`
```markdown
# Context System Development Guide

## Adding New Media Types
1. Extend MediaType enum
2. Add analyze{Type}ContextEnhanced() helper
3. Update tools to use enhanced analyzer
4. Test cross-media transformations

## Feature Flags
- ENABLE_SEMANTIC_SEARCH
- ENABLE_USER_PREFERENCES
- ENABLE_METADATA_ENRICHMENT
- ENABLE_CROSS_MEDIA_CONTEXT

## Performance Tuning
- Adjust semanticSearchThreshold
- Change maxCandidates count
- Configure enrichmentTimeout
- Monitor contextPerformanceMonitor

## Debugging
- Check console logs: "🔍 [Enhanced Analyzer]"
- Performance monitor: contextPerformanceMonitor.getStats()
- Cache stats: contextCache.getStats()
```

---

## Risks & Mitigation

### Risk 1: Increased Complexity

**Risk**: System becomes harder to maintain
**Probability**: Medium
**Impact**: Medium
**Mitigation**:
- Feature flags for gradual rollout
- Comprehensive tests
- Clear fallback paths
- Documentation

### Risk 2: Performance Regression

**Risk**: More processing steps = slower
**Probability**: Low
**Impact**: High
**Mitigation**:
- Semantic search is fast (keyword-based)
- Candidate pool reduction speeds up LLM
- Parallel processing where possible
- Performance monitoring from day 1

### Risk 3: Accuracy Degradation

**Risk**: Multi-step process introduces errors
**Probability**: Low
**Impact**: High
**Mitigation**:
- LLM has final say (most accurate)
- Extensive testing before deployment
- Fallback to base analyzer on errors
- Monitor confidence distribution

### Risk 4: Cost Increase

**Risk**: Vision model for enrichment adds cost
**Probability**: Medium
**Impact**: Low
**Mitigation**:
- Enrichment is optional (feature flag)
- Use fast vision model (gpt-4o-mini)
- Cache enriched metadata
- Async execution (don't block generation)

### Risk 5: Storage Growth

**Risk**: Enhanced metadata increases DB size
**Probability**: High
**Impact**: Low
**Mitigation**:
- Metadata stored in existing JSON fields
- Periodic cleanup of old metadata
- Compression for semantic tags
- Monitor storage usage

---

## Next Steps After Implementation

### Short Term (1-2 weeks)

1. **Monitor Metrics**
   - Track accuracy, performance, cost
   - Gather user feedback
   - Identify edge cases

2. **Iterate on Prompts**
   - Refine LLM analysis prompt
   - Improve metadata enrichment prompt
   - Add more examples

3. **Optimize Performance**
   - Tune semantic search threshold
   - Adjust candidate pool size
   - Optimize cache TTLs

### Medium Term (1-3 months)

1. **Advanced Features**
   - Multi-step reasoning (chain of thought)
   - Embedding-based semantic search (vs keyword)
   - Graph-based media relationships

2. **UI Enhancements**
   - Show confidence level to user
   - Allow manual media selection override
   - Display semantic tags in UI

3. **Analytics**
   - Context analysis success rate dashboard
   - User preference learning insights
   - Cost optimization reports

### Long Term (3-6 months)

1. **AI-Powered Suggestions**
   - "You might want to animate this image"
   - "This would make a good video thumbnail"

2. **Collaborative Context**
   - Share media context between users
   - Team preferences learning

3. **Advanced Transformations**
   - Style transfer (apply style from one image to another)
   - Object replacement across media
   - Consistent character generation

---

## Conclusion

This plan builds on the **excellent existing foundation** rather than replacing it. The key insights:

1. ✅ **Current system is sophisticated** - LLM-based, intent-aware, cached
2. ⚠️ **Unused modules exist** - Semantic search, user preferences, temporal analysis
3. 🎯 **Strategy: Hybrid approach** - Combine fast filtering with deep reasoning
4. 📊 **Expected improvements**: 30-50% faster, 50% cost reduction, better accuracy
5. 🔒 **Risk mitigation**: Feature flags, fallbacks, gradual rollout

**The user's request is achievable by ACTIVATING and INTEGRATING existing capabilities, not building from scratch.**

---

## References

### Existing Code Patterns

1. **Context Analysis**: `src/lib/ai/context/ai-powered-analyzer.ts:analyzeMediaWithAI`
2. **Semantic Search**: `src/lib/ai/context/semantic-search.ts:SemanticContextAnalyzer`
3. **User Preferences**: `src/lib/ai/context/user-preferences.ts:UserPreferenceLearner`
4. **Media Fetching**: `src/lib/db/queries.ts:getChatMediaArtifacts`
5. **Tool Integration**: `src/lib/ai/tools/nano-banana-chat-image-generation.ts:326-348`

### AI SDK 5 Patterns (from Context7)

1. Multi-modal messages with attachments
2. Tool result metadata enrichment
3. Message-level metadata callbacks
4. Context management in long conversations
5. Streaming tool calls

### Similar Completed Tasks

1. `_tasks/2025-10-23-media-storage-db-migration` - Media storage foundation
2. Recent commits on Vertex AI integration
3. Message validation improvements

---

**Plan Version**: 1.0
**Author**: Guillermo (Don)
**Status**: Ready for Review
**Next Agent**: @linus (Architecture Review) OR @kent (TDD Implementation)
