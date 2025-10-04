# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

### Testing
- `pnpm test` - Run Vitest tests (unit + integration)
- `pnpm test:unit` - Run unit tests only
- `pnpm test:unit:coverage` - Run tests with coverage report
- `pnpm test:e2e` - Run Playwright E2E tests

### Linting and Formatting
- `pnpm lint` - Run linting checks (Next.js ESLint + Biome)
- `pnpm lint:fix` - Fix linting issues automatically
- `pnpm format` - Format code with Biome
- `pnpm typecheck` - Run TypeScript type checking

### Running Applications
- `pnpm dev` - Start development server (Next.js)
- `pnpm build` - Build for production
- `pnpm start` - Start production server

### Database Migrations
- `pnpm db:migrate` - Run database migrations
- `pnpm db:generate` - Generate migration files
- `pnpm db:studio` - Open Drizzle Studio

### Important Notes
- Use pnpm for dependency management in monorepo
- Integration tests may require environment setup
- Run tests selectively for specific functionality only
- After completing tasks: Run `pnpm lint`, fix issues, test specific functionality if needed

## Development Workflow

This project follows a structured agent-based development workflow to ensure quality, consistency, and maintainability. Each task follows a standardized process with specific agent roles.

### Workflow Stages

**Stage 1: Task Initiation & Planning**
1. **User Request**: Task requirements captured in `_tasks/YYYY-MM-DD-task-slug/01-user-request.md`
2. **Create Feature Branch**: Branch from `dev` or `main` for the new task
3. **Research Phase**: 
   - Search `apps/super-chatbot/docs/` for relevant patterns, gotchas, and code pointers
   - Search `_tasks/` for similar completed tasks and solutions
   - Study similar implementations in codebase for patterns
4. **Initial Planning** (Don): 
   - Comprehensive codebase research with execution tracing
   - Technical plan with verified claims (no assumptions)
   - Edge cases and testing strategy
   - Output: `02-plan.md`

**Stage 2: Architecture Review (for complex tasks)**
5. **Architecture Review** (Linus):
   - High-level evaluation of proposed approach
   - Strategic decision validation
   - Identify potential issues early
   - Output: `03-architecture-review.md` (if issues found)
6. **Plan Refinement** (Don):
   - Address architectural concerns
   - Update plan based on feedback
   - Output: `04-updated-plan.md` (if needed)

**Stage 3: Test-Driven Development**
7. **Schema Research & Test Creation** (Kent):
   - **MANDATORY**: Search for Zod schemas and TypeScript types first
   - Create failing tests following TDD principles
   - Self-documenting tests without comments
   - Output: Test files in `src/tests/` + `XX-test-report.md` in task directory
8. **Commit Tests**: Commit failing tests with message describing expected behavior

**Stage 4: Implementation**
9. **Implementation** (Rob):
   - **MANDATORY**: Verify Zod schemas and TypeScript types before coding
   - Follow Next.js patterns: types → hooks → components → API routes
   - Write self-documenting code (no redundant comments)
   - Make tests pass
   - Output: Implementation code + `XX-engineer-report.md` in task directory
10. **Commit Implementation**: Commit working implementation

**Stage 5: Code Review**
11. **Code Review** (Kevlin):
   - Check for code duplication (top priority)
   - Verify helper/fixture usage
   - Ensure proper file organization
   - Readability without comments
   - Output: `XX-review.md` in task directory
12. **Fix Issues**: Address review findings if needed
13. **Commit Fixes**: Commit review fixes

**Stage 6: Final Architecture Review**
14. **Final Architecture Review** (Linus):
   - High-level architectural decisions validation
   - Implementation completeness check
   - Strategic mistakes identification
   - Output: `XX-architecture-review.md` in task directory
15. **Final Adjustments**: Make any critical architectural fixes
16. **Commit Final Changes**: Commit architectural improvements

**Stage 7: Documentation & Wrap-up**
17. **Documentation** (Raymond):
   - Update architecture documentation if relevant
   - Update developer docs as needed
   - Create implementation guides if solving important issues
   - Output: Updated files in `apps/super-chatbot/docs/`
18. **Knowledge Base Update** (Ward):
   - Extract reusable patterns and learnings
   - Document gotchas and best practices
   - Output: `XX-librarian-report.md` in task directory
19. **Final Plan Summary** (Don):
   - Document what was accomplished
   - List next steps if any
   - Record decisions and trade-offs
   - Output: `XX-final-plan.md` in task directory
20. **Commit Documentation**: Commit all documentation updates
21. **Quality Checks**:
   - Run `pnpm lint` and fix issues
   - Run relevant tests with `pnpm test`
   - Build project with `pnpm build` if needed

**Stage 8: Integration**
22. **Create Merge Request**: 
   - Target branch: `dev` (not `main`)
   - Include task summary and key changes
   - Reference task directory for full context
23. **Review & Merge**: Team review and merge to `dev`

### Agent Roles Summary

- **Don** (don): Tech lead, planning, process enforcement, task directory management
- **Linus** (linus): Architectural review, strategic decisions, high-level quality
- **Kent** (kent): TDD test engineer, Zod schema-first testing, self-documenting tests
- **Rob** (rob): Implementation engineer, React/Next.js patterns, TypeScript
- **Kevlin** (kevlin): Code reviewer, simplicity advocate, duplication elimination
- **Raymond** (raymond): Documentation specialist, architecture docs, development guides
- **Ward** (ward): Knowledge librarian, pattern extraction, learning documentation
- **Joel** (joel): Technical analyst, detailed spec expansion (when needed)
- **Knuth** (knuth): Problem solver consultant, unblocking stuck development
- **Andy** (andy): Agent configuration manager, workflow optimization

### Key Workflow Principles

1. **Research First**: Always check existing code and documentation before designing solutions
2. **Schema-First**: Zod schemas and TypeScript types are the foundation - verify/create them before tests/implementation
3. **No Assumptions**: Verify code behavior with grep/search, don't assume from names
4. **Git Hygiene**: Commit frequently during development with descriptive messages
5. **Branch Strategy**: New branch per task, merge to `dev`, `dev` to `main` for releases
6. **Documentation First**: Document solutions BEFORE committing (especially important fixes)
7. **Quality Gates**: Lint, test, and build must pass before merge request
8. **Task Directory**: All agent outputs saved in `_tasks/YYYY-MM-DD-task-slug/` with sequential numbering

### When to Skip Stages

- **Skip Stage 2** (Architecture Review): For simple, straightforward tasks
- **Skip Joel/Knuth**: Only invoke when needed (stuck, unclear requirements, complex analysis needed)
- **Minimal tasks**: May combine stages (e.g., Don creates plan + simple implementation without full TDD cycle)

### For Small Tasks and Quick Fixes

**IMPORTANT**: The full workflow above is for **significant development tasks** initiated with the `@do` command or when explicitly requested.

For small tasks, quick fixes, or routine work:
- **No need for full workflow**: Skip planning, reviews, and formal task directories
- **Direct implementation**: Make changes directly without agent invocations
- **Simple commits**: Just commit the changes with clear messages
- **When in doubt**: If it takes less than 30 minutes and touches only 1-2 files, it's probably a small task

**Examples of small tasks**:
- Fixing typos in documentation
- Updating configuration values
- Small bug fixes with obvious solutions
- Adding simple utility functions
- Minor refactoring of existing code

**Use full workflow when**:
- User explicitly requests it with `@do` command
- Task involves multiple components or files
- Task requires architectural decisions
- Task introduces new features or significant changes
- Task has unclear requirements needing planning

### Task Directory Structure

Each task creates a directory `_tasks/YYYY-MM-DD-task-slug/` **in the MONOREPO ROOT** with sequentially numbered files:

**CRITICAL RULES:**
- ✅ **ALWAYS use MONOREPO ROOT**: `_tasks/YYYY-MM-DD-task-slug/` (relative from project root)
- ❌ **NEVER use app-level**: `apps/super-chatbot/_tasks/` or `apps/super-landing/_tasks/`
- 📝 **ALWAYS save reports**: Each agent MUST create their numbered report file
- 🔢 **Sequential numbering**: Check existing files with `ls _tasks/YYYY-MM-DD-*/`, use next number
- 🔗 **Symlinks exist**: `apps/super-chatbot/_ai` and `apps/super-chatbot/_tasks` are symlinks to root directories
- 🔗 **Symlinks exist**: `apps/super-landing/_ai` and `apps/super-landing/_tasks` are symlinks to root directories
- ⚠️ **Always use root paths**: Even though symlinks exist, always reference `_ai/` and `_tasks/` from monorepo root

**Standard file sequence:**
- `01-user-request.md` - Original user request
- `02-plan.md` - @don's initial plan
- `03-architecture-review.md` - @linus review (if needed)
- `04-updated-plan.md` - Refined plan (if needed)
- `XX-test-report.md` - @kent's test implementation notes
- `XX-engineer-report.md` - @rob's implementation notes
- `XX-review.md` - @kevlin's code review
- `XX-architecture-review.md` - @linus's final review
- `XX-librarian-report.md` - @ward's knowledge extraction
- `XX-final-plan.md` - @don's final summary

**CRITICAL**: Never overwrite files - each agent invocation creates a NEW numbered file to preserve complete audit trail.

## Project Architecture

### High-Level Structure
```
apps/super-chatbot/
├── src/
│   ├── app/                    # Next.js 15 App Router
│   │   ├── (auth)/            # Auth routes
│   │   ├── (chat)/            # Chat routes
│   │   └── api/               # API routes
│   ├── components/            # React components
│   ├── hooks/                 # Custom React hooks
│   ├── lib/                   # Utilities, types, config
│   │   ├── types/            # TypeScript types
│   │   ├── security/         # Zod schemas, validation
│   │   └── utils/            # Helper functions
│   └── tests/                # Vitest tests
│       ├── unit/             # Unit tests
│       ├── integration/      # Integration tests
│       └── e2e/              # Playwright E2E tests
├── docs/                     # Public documentation (managed by @raymond)
│   ├── architecture/
│   ├── development/
│   └── api-integration/
├── _ai -> ../../_ai          # Symlink to root _ai/ (agent knowledge base)
└── _tasks -> ../../_tasks    # Symlink to root _tasks/ (audit trail)

Monorepo Root:
├── _ai/                      # Agent Knowledge Base (@ward)
│   ├── testing.md
│   ├── nextjs-patterns.md
│   └── common-fixes.md
├── _tasks/                   # Task audit trails
│   └── YYYY-MM-DD-task-slug/
└── apps/                     # Applications
```

### Important Patterns

**AI-First Development Methodology**
- **Phase 1 Planning**: Write implementation plan, validate against architecture, get approval
- **Phase 2 Implementation**: Code to plan, write tests, update docs, reference plan in PR
- Follow structured workflow with agent roles (see Workflow Stages above)

**AICODE Comment System**
- **AICODE-NOTE**: Persist critical knowledge (complex logic, integrations, performance, security)
- **AICODE-TODO**: Actionable follow-ups scoped to code location
- **AICODE-ASK**: Questions needing human decisions; convert to NOTE once resolved
- Before edits: grep for AICODE in target files
- Convert ASK → NOTE when resolved
- Keep notes concise, colocated with the code

**Async/Await Usage**
- Use async/await for API calls, database operations, file I/O
- React hooks handle async state with proper cleanup
- Server Actions and API routes are async by default

**Error Handling**
- Implement comprehensive error handling with try/catch
- Use structured logging with Sentry integration
- Return user-friendly error messages from API routes
- Plan for graceful degradation of external services
- Validate inputs and normalize external error shapes

**Configuration**
- Use Zod schemas for environment variable validation
- Environment variables in `.env.local` (server-only)
- Different configurations for dev/prod environments
- Never expose secrets to client components

**Security Posture**
- Never expose secrets client-side; all tokens live server-side
- Enforce auth and rate limiting on internal APIs
- Validate inputs and normalize external error shapes
- Server-only configuration for external tokens

### Development Guidelines

**Before Starting a Task**
- Search `_ai/` directory for relevant patterns, gotchas, and code pointers (symlinked in each app for convenience)
- Search `_tasks/` for similar completed tasks and their solutions (symlinked in each app for convenience)
- Search public docs for architecture and API documentation:
  - `docs/` - monorepo-level docs
  - `apps/super-chatbot/docs/` - chatbot-specific docs
  - `apps/super-landing/docs/` - landing-specific docs
- Study similar/neighboring files in the codebase to understand patterns
- Copy proven approaches and architectural patterns from existing code
- This ensures consistency and leverages existing solutions
- **Note**: While `_ai/` and `_tasks/` are symlinked in app directories, always use root-level paths for consistency

**Code Style**
- All comments, code and documentation should be written in English
- Biome for linting and formatting
- TypeScript strict mode enabled
- Use `const` by default, `let` when needed, avoid `var`
- Prefer named exports over default exports
- Type all function parameters and returns

**Testing Strategy**
- Follow TDD (Test-Driven Development) principles
- Zod schemas first, then tests, then implementation
- Run tests selectively for the specific functionality you're working on
- Unit tests with Vitest for utilities, hooks, components
- Integration tests for API routes and database interactions
- E2E tests with Playwright for critical user flows
- Use `vi.mock()` for mocking dependencies
- Full test suite runs in CI/CD pipeline

**Documentation**
- Use English for code comments and technical documentation
- `_ai/` - Agent knowledge base (patterns, gotchas, code pointers) - managed by @ward
- `_tasks/` - Agent work directories with numbered reports (audit trail)
- Public docs (managed by @raymond):
  - `docs/` - Monorepo-level (architecture, development, shared packages)
  - `apps/super-chatbot/docs/` - Chatbot app (AI capabilities, API integration)
  - `apps/super-landing/docs/` - Landing site (SEO, architecture, features)
- Update appropriate docs when adding significant features or patterns
- TSDoc comments for complex functions when needed

## Repository Rules and Workflow

### Git Workflow
- Main branch: `main` for production deployments
- Development branch: `dev` for integration
- Create separate branches for features when working from dev/main
- Don't commit or push until explicitly requested
- **IMPORTANT**: DO NOT add "Co-Authored-By: Claude <noreply@anthropic.com>" or Claude Code attribution to commit messages
- Use `--no-verify` flag when committing to skip pre-commit hooks if needed

### Git Tagging for Deployments
- When bumping deployment versions, create git tags to track releases
- Define your tag format (e.g., `v{version}` or `deploy-{component}-v{version}`)
- This allows easy rollback and tracking of what code ran in production

### MCP Servers Available
Define any MCP servers available in your project here.

### Documentation Structure

**Three-tier documentation system:**

1. **`_ai/` - Agent Knowledge Base** (internal, managed by @ward)
   - Code pointers, gotchas, patterns
   - One file per functional area (e.g., `testing.md`, `integrations.md`, `sse-patterns.md`)
   - Brief facts that are hard to grasp from code
   - Starting points for future research
   - Updated by @ward agent after completing tasks

2. **`_tasks/` - Agent Work Directories** (internal audit trail)
   - Format: `_tasks/YYYY-MM-DD-task-slug/`
   - Contains numbered agent reports:
     * `01-user-request.md` - Original request
     * `02-plan.md` - @don's plan
     * `03-architecture-review.md` - @linus review
     * `XX-test-report.md` - @kent tests
     * `XX-engineer-report.md` - @rob implementation
     * `XX-review.md` - @kevlin code review
     * `XX-final-plan.md` - @don summary
   - Complete audit trail of task execution
   - **Never overwrite** - each agent invocation creates NEW numbered file
   - Useful for finding similar past solutions

3. **Public Documentation** (for humans, managed by @raymond)
   - **`docs/`** - Monorepo-level documentation (architecture, development, shared packages)
   - **`apps/super-chatbot/docs/`** - Chatbot app documentation (AI capabilities, API integration)
   - **`apps/super-landing/docs/`** - Landing site documentation (SEO, architecture, features)
   - Each app has its own docs with relevant content
   - Updated when significant features are added

## Technology Stack

**Core Technologies**
- **Framework**: Next.js 15 (App Router) with React 19
- **Language**: TypeScript (strict mode)
- **Package Manager**: pnpm (monorepo)
- **Validation**: Zod schemas
- **UI**: shadcn/ui + Radix UI + Tailwind CSS
- **Database**: PostgreSQL with Drizzle ORM
- **Real-time**: Server-Sent Events (SSE) + WebSocket

**Testing**
- **Unit/Integration**: Vitest + React Testing Library
- **E2E**: Playwright
- **Coverage**: v8 provider

**Development Tools**
- **Linting**: ESLint (Next.js config) + Biome
- **Formatting**: Biome
- **Type Checking**: TypeScript compiler
- **Git Hooks**: Can be configured if needed

**Infrastructure**
- **Deployment**: Vercel (recommended for Next.js)
- **Monitoring**: Sentry (client + server)
- **CI/CD**: GitHub Actions
- **Authentication**: NextAuth v5