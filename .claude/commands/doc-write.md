Please explore existing implementation and document in `apps/super-chatbot/docs/`:
$ARGUMENTS

1. Find and read ALL the relevant files
2. Find and read the relevant tests (in `src/tests/`)
3. Figure out the big picture
4. What sticks out as surprising, unusual or particularly important in our implementation?
5. What are the likely future changes in this area?
6. What gotchas and challenges will future implementors encounter? Any tips from the code?

**Documentation Style** (like CLAUDE.md):
- Single-line facts, minimal code blocks
- Focus on code pointers to base future research on
- No elaborate examples (AI can read the code)

**Most valuable content:**
- High-level architectural decisions
- Gotchas and how to overcome them
- Common pitfalls (and solutions)
- Code pointers to specific files/functions (e.g., `src/hooks/use-artifact-sse.ts`)
- Brief summary of info that's hard to find
- Facts on how parts of the system interact
- Brief facts that are hard to quickly grasp from code

**File organization:**
- `_ai/` - Agent knowledge base (patterns, gotchas, code pointers by topic)
- `apps/super-chatbot/docs/` - Public documentation:
  - Architecture docs in `architecture/`
  - Development guides in `development/`
  - API integration in `api-integration/`
- Keep it brief and focused

Write docs in appropriate directory based on content type.
