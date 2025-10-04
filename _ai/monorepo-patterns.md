# Monorepo Patterns (Turborepo + pnpm)

## Package Structure

### Workspace Protocol
```json
{
  "dependencies": {
    "@turbo-super/ui": "workspace:*",
    "@turbo-super/shared": "workspace:*"
  }
}
```
- Use `workspace:*` for internal packages
- Enables version-independent linking
- Auto-resolves to local workspace packages

### Package Dependencies
```
Build order (dependencies):
shared (base) → ui → core → api → features → payment
              ↓
            apps (super-chatbot, super-landing)
```

## Shared Package Usage

### UI Components (`@turbo-super/ui`)
```typescript
// ❌ WRONG - Local duplication
import { Button } from '@/components/ui/button';

// ✅ RIGHT - Shared package
import { Button, Card, Input, Badge } from '@turbo-super/ui';

// Available components
<Button variant="default | accent | outline | ghost" size="sm | default | lg | icon" />
<Card><CardHeader><CardTitle /></CardHeader><CardContent /></Card>
<Input type="text | email | password" />
<Badge variant="default | secondary | destructive | outline" />
```

### Utilities (`@turbo-super/shared`)
```typescript
import { 
  // Formatting
  formatDate, 
  formatFileSize, 
  truncateText,
  
  // Validation
  isValidEmail, 
  isValidPassword,
  
  // Hooks
  useLocalStorage, 
  useMediaQuery, 
  useClickOutside 
} from '@turbo-super/shared';

// Usage
const formattedDate = formatDate(new Date(), 'PPP'); // "January 1, 2024"
const size = formatFileSize(1024000); // "1 MB"
const [value, setValue] = useLocalStorage('key', defaultValue);
const isMobile = useMediaQuery('(max-width: 768px)');
```

### Types (`@turbo-super/data`)
```typescript
import { Artifact, User, Message, AI_MODELS, STATUS } from '@turbo-super/data';

type MyArtifact = Artifact & { customField: string };
const model = AI_MODELS.GPT4; // Type-safe constants
```

## Turborepo Configuration

### Build Caching
```typescript
// turbo.json
{
  "pipeline": {
    "build": {
      "dependsOn": ["^build"], // Build dependencies first
      "outputs": ["dist/**", ".next/**"],
      "cache": true // Enable caching
    },
    "test": {
      "dependsOn": ["build"],
      "cache": true
    }
  }
}
```

### Cache Optimization
- **6/11 tasks typically cached** in warm builds
- Cache key includes: inputs, dependencies, env vars
- Invalidates when source changes

### Commands
```bash
# Build all packages
pnpm build

# Build specific package
pnpm --filter @turbo-super/ui build

# Build with dependencies
pnpm --filter super-chatbot... build

# Clean and rebuild
pnpm clean && pnpm build
```

## TypeScript Configuration

### Strict Mode (Required)
```json
{
  "compilerOptions": {
    "strict": true,
    "noUncheckedIndexedAccess": true,
    "declaration": true,
    "declarationMap": true
  }
}
```

### Shared tsconfig
- Base config in `packages/shared/tsconfig/`
- Apps extend base config
- Enable `declaration` for library packages

## Package Build (tsup)

### Standard Config
```typescript
// tsup.config.ts
import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['src/index.ts'],
  format: ['cjs', 'esm'],
  dts: true, // Generate .d.ts files
  splitting: false,
  sourcemap: true,
  clean: true,
  external: ['react', 'react-dom'], // Peer dependencies
});
```

### Shared Base Config
```typescript
import { createBaseConfig } from '@turbo-super/shared/tsup.config.base';

export default createBaseConfig({
  entry: 'src/index.ts',
  external: ['react', 'react-dom']
});
```

## Version Management

### Sync Versions
```bash
# Run version sync script
node scripts/sync-versions.js

# Check version consistency
node scripts/check-versions.js
```

### Semantic Versioning
- Major: Breaking changes
- Minor: New features (backward compatible)
- Patch: Bug fixes
- All packages should align on major dependencies

## Common Gotchas

### Circular Dependencies
```typescript
// ❌ WRONG - Creates circular dependency
// Package A imports from B, B imports from A

// ✅ RIGHT - Extract shared code to separate package
// A → shared ← B
```

### Peer Dependencies
```json
{
  "peerDependencies": {
    "react": "^18.0.0 || ^19.0.0",
    "react-dom": "^18.0.0 || ^19.0.0"
  }
}
```
- Use for packages that should share React instance
- Prevents multiple React versions

### Build Order Issues
```bash
# If build fails due to missing types
pnpm --filter @turbo-super/shared build
pnpm --filter @turbo-super/ui build
pnpm build # Now builds everything
```

## Package Scripts

### Standard Scripts
```json
{
  "scripts": {
    "build": "tsup",
    "dev": "tsup --watch",
    "lint": "eslint .",
    "typecheck": "tsc --noEmit",
    "clean": "rm -rf dist .turbo node_modules"
  }
}
```

### Monorepo Root Scripts
```json
{
  "scripts": {
    "build": "turbo run build",
    "dev": "turbo run dev --parallel",
    "lint": "turbo run lint",
    "test": "turbo run test",
    "clean": "turbo run clean && rm -rf node_modules"
  }
}
```

## Performance Tips

### Parallel Execution
```bash
# Run dev servers in parallel
pnpm dev --parallel

# Run tests in parallel
pnpm test --concurrency 4
```

### Selective Building
```bash
# Build only changed packages
pnpm build --filter=[HEAD^]

# Build specific app with dependencies
pnpm --filter super-chatbot... build
```

### Cache Management
```bash
# Clear Turbo cache
rm -rf .turbo

# Clear all caches
pnpm clean && rm -rf node_modules/.cache
```

## Code Pointers
- Turbo config: `turbo.json`
- Package configs: `packages/*/package.json`
- Shared tsconfig: `packages/shared/tsconfig/`
- Version scripts: `scripts/sync-versions.js`, `scripts/check-versions.js`
- Build scripts: `scripts/rebuild-packages.js`

