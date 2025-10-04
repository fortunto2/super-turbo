# Agent Knowledge Base (_ai/)

This directory contains the internal knowledge base for AI agents. It's a collection of patterns, gotchas, and code pointers organized by functional area.

## Purpose

- **Code pointers** - Starting points for research, not elaborate examples
- **Gotchas** - Non-obvious pitfalls and how to overcome them
- **Patterns** - Architectural decisions and best practices
- **Brief facts** - Hard-to-grasp information that saves debugging time

## File Organization

One file per functional area:
- `testing.md` - Test patterns, Vitest/Playwright setup, mocking strategies
- `sse-patterns.md` - Server-Sent Events implementation patterns
- `integrations.md` - External API integration patterns
- `performance.md` - Performance optimization patterns
- etc.

## Writing Style

Follow CLAUDE.md format:
- One-line facts, minimal code blocks
- Code pointers like `src/hooks/use-artifact-sse.ts:useArtifactSSE`
- Focus on WHY and WATCH OUT FOR, not WHAT
- High bar for inclusion - only non-obvious information

## Maintenance

- Managed by @ward agent after completing tasks
- Regularly prune outdated information
- Cross-reference with actual code locations
- If something becomes obvious from codebase, remove it

## Three-Tier Documentation System

1. **`_ai/`** (this directory) - Internal agent knowledge base
2. **`_tasks/`** - Agent work directories with numbered reports (audit trail)
3. **`apps/super-chatbot/docs/`** - Public documentation for humans

