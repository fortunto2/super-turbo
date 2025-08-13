# Super Chatbot — App-level AGENTS.md

Last updated: 2025-08-08 (Europe/Istanbul)

Scope: App-specific guidance for AI assistants and contributors working on the Super Chatbot application. Language: English only.

Canonical root guide: [AGENTS.md](../../AGENTS.md)

Contents
- 1. Purpose and scope
- 2. Technology stack
- 3. Directory map
- 4. Architecture overview
- 5. API boundaries (internal)
- 6. Real-time events
- 7. Security and configuration
- 8. Development workflow
- 9. Coding standards (app-specific)
- 10. Testing strategy
- 11. PR checklist (app-specific)
- 12. Quick commands
- 13. Reference links

## 1. Purpose and scope
This document provides app-specific practices for Super Chatbot, a Next.js 15 App Router application offering AI-powered text, image, and video generation with real-time progress tracking, typed internal APIs, and server-only integrations.

Use the universal guidance in the root: [AGENTS.md](../../AGENTS.md)

## 2. Technology stack
- Framework: Next.js 15 App Router with Server Actions
- Language: TypeScript (strict mode)
- UI: shadcn/ui + Radix UI primitives
- Styling: Tailwind CSS (if present in this app), component-scoped styles
- AI: Typed proxy to external providers (e.g., SuperDuperAI) via internal routes
- Real-time: Server-Sent Events (SSE); WebSocket where applicable
- Data:
  - File-centric artifacts: text, image, video, sheet (stored/rendered via artifacts system)
  - Database: users, balances, usage/history (see db layer)
- Payments: Stripe (webhooks under API)
- Observability: Sentry (server/client), structured logs
- Build/Tooling: pnpm, ESLint, Prettier, Jest/Vitest, Playwright/Cypress

## 3. Directory map
Key areas (click to open):
- App Router
  - (Auth): [apps/super-chatbot/src/app/(auth)/](./src/app/%28auth%29/)
  - (Chat): [apps/super-chatbot/src/app/(chat)/](./src/app/%28chat%29/)
  - API routes: [apps/super-chatbot/src/app/api/](./src/app/api/)
  - Tools UI: [apps/super-chatbot/src/app/tools/](./src/app/tools/)
- Internal APIs and clients
  - API routes root: [apps/super-chatbot/src/app/api/](./src/app/api/)
  - Typed client: [apps/super-chatbot/src/lib/api/client/](./src/lib/api/client/)
  - Service models: [apps/super-chatbot/src/lib/api/models/](./src/lib/api/models/)
  - Services/core: [apps/super-chatbot/src/lib/api/services/](./src/lib/api/services/)
- AI layer
  - Core AI: [apps/super-chatbot/src/lib/ai/](./src/lib/ai/)
  - Tools: [apps/super-chatbot/src/lib/ai/tools/](./src/lib/ai/tools/)
  - Chat: [apps/super-chatbot/src/lib/ai/chat/](./src/lib/ai/chat/)
  - Types: [apps/super-chatbot/src/lib/ai/types/](./src/lib/ai/types/)
- Artifacts (rendering/logic)
  - Root: [apps/super-chatbot/src/artifacts/](./src/artifacts/)
  - Image: [apps/super-chatbot/src/artifacts/image/](./src/artifacts/image/)
  - Text: [apps/super-chatbot/src/artifacts/text/](./src/artifacts/text/)
  - Video: [apps/super-chatbot/src/artifacts/video/](./src/artifacts/video/)
  - Sheet: [apps/super-chatbot/src/artifacts/sheet/](./src/artifacts/sheet/)
- Components
  - UI: [apps/super-chatbot/src/components/ui/](./src/components/ui/)
  - Artifacts: [apps/super-chatbot/src/components/artifacts/](./src/components/artifacts/)
  - Markdown editor: [apps/super-chatbot/src/components/markdown-editor/](./src/components/markdown-editor/)
- Config and utils
  - Config: [apps/super-chatbot/src/lib/config/](./src/lib/config/)
  - Utils: [apps/super-chatbot/src/lib/utils/](./src/lib/utils/)
  - Types (shared app types): [apps/super-chatbot/src/lib/types/](./src/lib/types/)
- DB and migrations
  - DB root: [apps/super-chatbot/src/lib/db/](./src/lib/db/)
  - Helpers: [apps/super-chatbot/src/lib/db/helpers/](./src/lib/db/helpers/)
  - Migrations: [apps/super-chatbot/src/lib/db/migrations/](./src/lib/db/migrations/)
- Real-time
  - Websocket: [apps/super-chatbot/src/lib/websocket/](./src/lib/websocket/)
  - Events route: [apps/super-chatbot/src/app/api/events/](./src/app/api/events/)
- Documentation
  - Hub: [apps/super-chatbot/docs/](./docs/)
  - Development methodology: [apps/super-chatbot/docs/development/ai-development-methodology.md](./docs/development/ai-development-methodology.md)
  - Implementation plans: [apps/super-chatbot/docs/development/implementation-plans/](./docs/development/implementation-plans/)
  - Architecture: [apps/super-chatbot/docs/architecture/README.md](./docs/architecture/README.md)
  - API integration: [apps/super-chatbot/docs/api-integration/README.md](./docs/api-integration/README.md)

## 4. Architecture overview
- Typed Proxy Architecture
  - Frontend calls internal Next.js API routes only (never external APIs directly)
  - Internal routes enforce input validation, auth, rate limits, and return normalized error shapes
  - Server-only configuration for tokens and provider credentials
- Server-first philosophy
  - Prefer server actions and API routes for data operations
  - Client components are presentation-focused; avoid secrets and heavy logic
- Artifacts-first UX
  - All outputs are represented as typed artifacts (text/image/video/sheet)
  - Artifact lifecycle is consistent across tools and UIs
- Extensibility
  - Add new AI tools under [apps/super-chatbot/src/lib/ai/tools/](./src/lib/ai/tools/)
  - Expose through internal routes under [apps/super-chatbot/src/app/api/](./src/app/api/) and/or server actions

## 5. API boundaries (internal)
Primary route groups (non-exhaustive, click to inspect):
- Generate
  - Image: [apps/super-chatbot/src/app/api/generate/image/](./src/app/api/generate/image/)
  - Script: [apps/super-chatbot/src/app/api/generate/script/](./src/app/api/generate/script/)
  - Video: [apps/super-chatbot/src/app/api/generate/video/](./src/app/api/generate/video/)
- Config
  - Generation: [apps/super-chatbot/src/app/api/config/generation/](./src/app/api/config/generation/)
  - Models: [apps/super-chatbot/src/app/api/config/models/](./src/app/api/config/models/)
  - SuperDuperAI: [apps/super-chatbot/src/app/api/config/superduperai/](./src/app/api/config/superduperai/)
- Files and artifacts
  - Files: [apps/super-chatbot/src/app/api/files/](./src/app/api/files/)
  - File by id: [apps/super-chatbot/src/app/api/file/](./src/app/api/file/)
  - Artifact pages: [apps/super-chatbot/src/app/artifact/](./src/app/artifact/)
- Events (SSE)
  - Events root: [apps/super-chatbot/src/app/api/events/](./src/app/api/events/)
- Users and admin
  - User: [apps/super-chatbot/src/app/api/user/](./src/app/api/user/)
  - Admin: [apps/super-chatbot/src/app/api/admin/](./src/app/api/admin/)
- Payments and webhooks
  - Stripe checkout: [apps/super-chatbot/src/app/api/create-checkout/](./src/app/api/create-checkout/)
  - Stripe webhook: [apps/super-chatbot/src/app/api/webhooks/stripe/](./src/app/api/webhooks/stripe/)

Guidelines
- Validate with zod/valibot (or project standard) at the API surface
- Normalize errors; avoid leaking provider internals
- Stream where feasible for long-running AI operations

## 6. Real-time events
- Prefer Server-Sent Events for progress updates and lightweight streaming
- Events route: [apps/super-chatbot/src/app/api/events/](./src/app/api/events/)
- Use file-based channels when possible; add proxying only when necessary
- WebSocket utilities live at: [apps/super-chatbot/src/lib/websocket/](./src/lib/websocket/)

## 7. Security and configuration
- Secrets are server-only; never expose tokens in client components
- Centralized config under: [apps/super-chatbot/src/lib/config/](./src/lib/config/)
- Enforce authentication and rate limiting at internal API boundaries
- Input validation on all user-supplied payloads
- Logging
  - Use structured logs with context
  - Avoid sensitive data in logs and error messages
- Environment variables
  - Keep .env files server-side
  - Document required variables in README/docs; use safe defaults

## 8. Development workflow
Follow the AI-First methodology:
1) Planning
- Author an implementation plan: [apps/super-chatbot/docs/development/implementation-plans/](./docs/development/implementation-plans/)
- Validate against architecture and security sections
- Seek human approval before coding

2) Implementation
- Implement to the plan
- Maintain AICODE comments:
  - AICODE-NOTE: persist important contextual knowledge
  - AICODE-TODO: actionable, localized follow-ups
  - AICODE-ASK: unresolved decisions (convert to NOTE when resolved)
- Update documentation and tests alongside code

3) PR
- Reference the approved plan in the PR description
- Ensure all checks pass (lint, type, tests)
- Complete the PR checklist

Tip: Before edits, search for contextual comments:
- Run grep locally for patterns like "AICODE-"

## 9. Coding standards (app-specific)
TypeScript
- Strict types; avoid any unless justified with an AICODE-NOTE
- Exported/public functions should have explicit return types
- Reuse app-level types in [apps/super-chatbot/src/lib/types/](./src/lib/types/)

React/Next.js
- Prefer Server Components; elevate logic to server actions/API routes
- Use Suspense/streaming where beneficial to UX
- Keep client components free of secrets; minimize heavy logic

API and errors
- Validate inputs; sanitize/normalize outputs
- Do not leak provider-specific errors to clients
- Consistent success/error envelopes for frontend ergonomics

Performance
- Cache stable responses (server-side) where safe
- Paginate heavy queries and lists
- Stream long-running tasks for responsive UX

## 10. Testing strategy
- Unit tests (pure logic): collocated or under a tests directory
- Integration tests (API routes and server actions)
- E2E tests for critical flows (generation, payments, artifact rendering)
- Test directories:
  - Root: [apps/super-chatbot/src/tests/](./src/tests/)
  - E2E: [apps/super-chatbot/src/tests/e2e/](./src/tests/e2e/)
  - Routes: [apps/super-chatbot/src/tests/routes/](./src/tests/routes/)
  - Prompts: [apps/super-chatbot/src/tests/prompts/](./src/tests/prompts/)
- Run tests in CI and locally before PR

## 11. PR checklist (app-specific)
- Referenced the approved implementation plan in description
- Updated docs (architecture, API, or guides as applicable)
- Lint/type checks pass; tests added/updated and green
- Real-time behaviors verified (SSE/WS)
- AICODE review performed (close TODOs, convert ASK → NOTE)
- Security review completed (secrets, auth, rate limits, error shapes)

## 12. Quick commands
- Install: pnpm install
- Dev: pnpm dev
- Lint: pnpm lint
- Type check: pnpm typecheck (or tsc --noEmit if configured)
- Test: pnpm test
- Build: pnpm build
- Start (prod): pnpm start

Note: Commands may be defined at monorepo root; run from the appropriate workspace.

## 13. Reference links
- Root guide: [AGENTS.md](../../AGENTS.md)
- Dev methodology: [apps/super-chatbot/docs/development/ai-development-methodology.md](./docs/development/ai-development-methodology.md)
- Architecture: [apps/super-chatbot/docs/architecture/README.md](./docs/architecture/README.md)
- API integration: [apps/super-chatbot/docs/api-integration/README.md](./docs/api-integration/README.md)
- Implementation plans: [apps/super-chatbot/docs/development/implementation-plans/](./docs/development/implementation-plans/)