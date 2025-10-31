# User Request: AI SDK v5 Test Chat Implementation

**Date**: 2025-10-10
**Requested by**: User
**Priority**: High

## Problem Statement

The main chat system is experiencing issues after attempting to migrate to AI SDK v5:
- When sending messages, the chat either doesn't respond or throws errors
- The migration was incomplete due to package installation issues (pnpm hanging)
- The current codebase is in a mixed state: package.json specifies v5 but v4 is actually installed
- API routes were reverted to v4 code but provider packages require v5

## User's Request

Create a comprehensive plan for implementing a new test chat page to validate AI SDK v5 functionality.

### Context
We've been migrating to AI SDK v5, but the main chat keeps breaking when sending messages or not responding. We need to:
1. Create a NEW test chat page (separate from main chat)
2. Implement it with AI SDK v5 properly
3. Validate it works correctly
4. Use it as a reference to fix the main chat

### Requirements
- Create a new route for the test chat (e.g., `/test-chat` or `/chat-v5-test`)
- Implement a minimal but functional chat using AI SDK v5
- Use the correct v5 APIs (stream, write() instead of writeData())
- Ensure it can send messages and receive streaming responses
- Keep it simple to isolate AI SDK v5 functionality

### Research Tasks
1. Read the session summary at `_tasks/2025-10-10-ai-sdk-stream-parsing-fix/12-session-summary-ai-sdk-v5-migration.md` to understand what we tried
2. Search for current chat implementation files:
   - Main chat page
   - Chat API route
   - Chat components
3. Check `_ai/` for any AI SDK v5 migration notes or patterns
4. Look at the current broken implementation to understand what went wrong
5. Find the correct AI SDK v5 documentation or examples

### Plan Requirements
- Create task directory structure following CLAUDE.md workflow
- Provide specific file paths for all changes
- Include complete technical approach for AI SDK v5 usage
- Define testing strategy to validate it works
- Plan how to use this as reference for main chat fix

## Success Criteria

1. A working test chat page at a new route
2. Successful message sending and streaming response receiving
3. Clean implementation using AI SDK v5 APIs
4. Documentation of what works and how it differs from the broken main chat
5. Clear path forward for fixing the main chat based on learnings
