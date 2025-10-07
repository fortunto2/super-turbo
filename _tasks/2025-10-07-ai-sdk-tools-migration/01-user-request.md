# User Request: AI SDK Tools Migration for Media Context Analyzers

## Original Request (Russian)

Проанализировать текущую реализацию контекст-анализаторов для изображений и видео в `d:\projects\frontend\work\turbo-super\apps\super-chatbot\src\lib\ai\context\` и создать план по переделке их в AI SDK tools.

## English Translation

Analyze the current implementation of context analyzers for images and videos in `d:\projects\frontend\work\turbo-super\apps\super-chatbot\src\lib\ai\context\` and create a plan to convert them into AI SDK tools.

## Current Situation

1. There are `VideoContextAnalyzer` and `ImageContextAnalyzer` classes that:
   - Analyze user messages for media links
   - Use patterns (regex) to recognize intentions
   - Extract metadata from attachments
   - Link media with messages through targetResolver

2. The project uses AI SDK (Vercel AI SDK) - found many files with imports from `@ai-sdk/*` and `ai`

3. Need to refactor this functionality into AI SDK tools format

## Requirements

1. Study existing code in:
   - `video-context-analyzer.ts`
   - `image-context-analyzer.ts`
   - `universal-context.ts` (base class)

2. Study how AI SDK tools are used in the project (find examples in):
   - `src/lib/ai/tools/`
   - `src/lib/ai/providers.ts`
   - `src/app/api/` routes

3. Understand the current media context architecture

4. Create detailed plan for converting analyzers into AI SDK tools

## Expected Result

Create `_tasks/YYYY-MM-DD-ai-sdk-tools-migration/02-plan.md` with:
- Analysis of current implementation
- Architecture of future tools
- List of files to create/modify
- Migration strategy without breaking existing functionality
- Testing plan

## Date

2025-10-07
