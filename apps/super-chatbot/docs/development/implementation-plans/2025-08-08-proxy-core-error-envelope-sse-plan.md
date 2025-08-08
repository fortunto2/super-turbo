# Implementation Plan: Proxy Core + Error Envelope + SSE Heartbeat

Status: Proposed
Owner: fortunto2
Apps: super-chatbot
Last updated: 2025-08-08

## Summary
Build a minimal, typed “proxy core” layer for external AI providers, standardize error envelopes across internal APIs, and harden real-time progress via SSE heartbeat and resumability. This reduces coupling to vendors, improves debuggability, and stabilizes long-running operations.

## Goals
- Typed provider abstraction (Adapter pattern) with retry/jitter and basic circuit-breaker hooks.
- Unified `ErrorEnvelope` for all `app/api/**` routes.
- SSE reliability: heartbeat, Last-Event-ID resume, consistent event schema.
- Environment validation via zod and centralized config.
- Rate limiting presets (per-user, per-IP) for internal proxy routes.

## Non-goals
- Full billing/quotas engine (tracked as separate initiative).
- Queue/worker offloading for heavy jobs (future phase).
- Full multi-provider failover policy (first: single primary, adapter-ready).

## Scope
- packages/types: domain types (`Artifact`, `Job`, `ErrorEnvelope`, `ProviderError`).
- packages/config: env load + zod validation, shared rate limit presets.
- packages/proxy-core: provider interfaces, adapters (SuperDuperAI v1), error mapping, idempotency helpers.
- apps/super-chatbot/app/api/**: route handlers adopt `ErrorEnvelope`, use proxy-core, and add rate limiting.
- apps/super-chatbot/src/server/realtime: SSE helpers for heartbeat/resume.

## Architecture
1) Adapter Interface
   - `ProviderAdapter` with methods: `createImageJob`, `createVideoJob`, `getJobStatus`, `getJobResult`.
   - Inputs/outputs typed with `packages/types` and narrowed per provider.

2) Error Normalization
   - Map provider errors to `{ code, message, details?, retryable, correlationId }`.
   - Internal routes always return `{ ok: false, error } | { ok: true, data }`.

3) Resilience
   - Retries: exponential backoff + jitter for retryable classes (429/5xx/timeouts).
   - Circuit breaker: simple half-open counter with cool-down (configurable hooks; can be no-op initially).
   - Idempotency: accept client `x-idempotency-key` or generate server-side key per logical job.

4) SSE Hardening
   - Heartbeat event every N seconds; client timeout > 2N.
   - Support `Last-Event-ID` in request; resume from stored cursor.
   - Event schema: `{ type, jobId, step, progress?, artifactId?, ts }`.

5) Config and Limits
   - `packages/config` exposes `env()` and `rateLimit()` helpers.
   - Rate limit on API routes: per-user + per-IP token bucket; provider-specific burst caps.

## Deliverables
- New packages: `packages/types`, `packages/config`, `packages/proxy-core` (skeleton + SuperDuperAI adapter).
- Shared `ErrorEnvelope` and wrappers for API responses.
- SSE utilities: `sendEvent`, `sendHeartbeat`, `resumeFrom`.
- Route refactor (MVP): image and video generation endpoints switched to proxy-core + error envelope.
- Docs: this plan, quick start for adding providers, API error spec.

## Milestones
1) Day 1–2: scaffold packages, env validation, ErrorEnvelope; add SSE helpers.
2) Day 3–4: implement SuperDuperAI adapter (create job/status/result) + retries/jitter; unit tests.
3) Day 5: refactor 1–2 API routes to use proxy-core + rate limit + error envelope; e2e happy path.
4) Day 6: SSE heartbeat/resume integration on selected progress endpoint; reconnection tests.
5) Day 7: docs + examples, PR with references to this plan.

## Testing
- Unit: error mapping, retry policy, idempotency key handling.
- Contract: adapter request/response via MSW stubs (timeout/429/5xx cases).
- Integration: API routes return typed envelopes; SSE emits heartbeat and resumes with `Last-Event-ID`.
- E2E: create generation job → observe progress stream → receive artifact.

## Observability
- CorrelationId generation at ingress; propagated to provider calls and logs.
- Structured logs: route, userId, provider, cost, duration, retryCount.
- Sentry breadcrumbs for retries/circuit transitions.

## Risks & Mitigations
- Provider latency/instability → retries + breaker + idempotency.
- Edge runtime limits for WS → prefer SSE; keep server runtime for progress endpoints.
- Backward compatibility → wrap legacy responses into new envelope during transition.

## Rollback
- Feature-flag new proxy-core on routes; toggle to legacy path on incident.
- Keep both envelopes for a deprecation window; log usage of legacy.

## Documentation Updates
- apps/super-chatbot/docs/architecture/README.md: add proxy-core and envelope sections.
- apps/super-chatbot/docs/api-integration/README.md: provider adapter guide, error codes.

## Acceptance Criteria
- At least one image and one video route use proxy-core.
- All touched routes return `ErrorEnvelope` on failure and `ok: true` on success.
- SSE endpoint shows heartbeat and successful resume with `Last-Event-ID`.
