# Frontend — AGENTS.md

> Vue 3 + TypeScript + Tailwind CSS SPA. Read this before touching any file here.

## Tech Stack

| Tech | Version | Purpose |
|------|---------|---------|
| Vue | 3.5+ | UI framework (Composition API only) |
| TypeScript | ~6.0 | Type safety (`<script setup lang="ts">`) |
| Pinia | 3.x | State management (setup store syntax) |
| Vue Router | 5.x | Client-side routing (`createWebHistory`) |
| Axios | 1.7+ | HTTP client (shared instance in `useApi.ts`) |
| Tailwind CSS | 4.x | Utility-first styling — **no `<style>` blocks** |
| Vite | 8.x | Dev server and build tool |
| ESLint | 10.x | Linting |
| Prettier | 3.x | Code formatting |

## Project Structure

```
src/
├── assets/main.css        → Tailwind entry point (@import 'tailwindcss')
├── components/            → Reusable components (PascalCase.vue)
├── composables/           → useXxx.ts — API calls, shared logic
│   ├── useApi.ts          → Shared Axios instance
│   └── useRequirements.ts → Requirements CRUD
├── router/index.ts        → Route definitions
├── stores/app.ts          → Pinia store (setup syntax)
├── types/index.ts         → All shared TypeScript interfaces
├── views/                 → Page-level components (XxxView.vue)
├── App.vue                → Root component
└── main.ts                → App bootstrap
```

## Mandatory: Lint & Format

**Run before every commit:**

```bash
cd frontend
npm run format   # Prettier formats src/
npm run lint     # ESLint checks and auto-fixes
```

Both must pass cleanly. CI will reject unformatted or unlinted code.

## Key Conventions

### Components
- Always `<script setup lang="ts">` — never Options API
- Props: `defineProps<{}>()` with TypeScript generics
- Emits: `defineEmits<{}>()` with TypeScript generics
- No `<style>` blocks — Tailwind utility classes only

### Composables (`src/composables/`)
- Named export: `export function useXxx()`
- Return `{ refs, computed, methods }` as an object
- Handle errors internally, expose `error` ref to consumers
- All HTTP calls go through `api` from `useApi.ts`

### Types (`src/types/index.ts`)
- All shared interfaces live here
- Use `import type { ... }` for type-only imports
- Enums as string literal unions: `'PENDING' | 'IN_PROGRESS' | 'DONE'`

### Routing (`src/router/index.ts`)
- Add new pages as routes here
- Views go in `src/views/XxxView.vue`

### Styling
- Tailwind CSS 4 with `@import 'tailwindcss'` in `main.css`
- PostCSS plugin: `@tailwindcss/postcss`
- Never write custom CSS — use utility classes in templates

### Path Aliases
- `@/*` → `src/*` (use when import depth > 2 levels)

## Naming

| Thing | Convention | Example |
|-------|-----------|---------|
| Components | PascalCase `.vue` | `AppHeader.vue` |
| Views | PascalCase + `View` suffix | `HomeView.vue` |
| Composables | camelCase + `use` prefix | `useRequirements.ts` |
| Stores | camelCase file, `use` prefix name | `app.ts` → `useAppStore` |
| Types | PascalCase interfaces | `Requirement`, `HealthStatus` |

## API

- Base URL configured in `useApi.ts` (proxied by Vite in dev)
- All endpoints start with `/api/`
- Type responses: `api.get<Requirement[]>('/api/requirements')`

## Adding a New Page

1. Create `src/views/XxxView.vue`
2. Add route in `src/router/index.ts`
3. Create `src/composables/useXxx.ts` if it needs API data
4. Define types in `src/types/index.ts`

## How to Run

```bash
npm install
npm run dev      # http://localhost:5173 (or next available port)
npm run build    # Production build (type-checks + bundles)
```
