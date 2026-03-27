---
description: "Use when creating or modifying Vue components, composables, TypeScript files, views, stores, or router config in the frontend. Covers Vue 3 Composition API patterns, TypeScript conventions, and Tailwind CSS styling."
applyTo: "frontend/src/**"
---

# Frontend Conventions

## Stack

- Vue 3.5+ with `<script setup lang="ts">` (Composition API only)
- TypeScript in strict mode (ES2020 target)
- Pinia for state management (setup store syntax)
- Vue Router 4 with `createWebHistory`
- Axios for HTTP calls, wrapped in composables
- Tailwind CSS 3 for styling (utility-first, no custom CSS unless unavoidable)
- Vite 5 as build tool
- ESLint + Prettier for linting/formatting

## Component Structure

Always use `<script setup lang="ts">` — never Options API:

```vue
<script setup lang="ts">
// 1. Imports
// 2. Props / Emits
// 3. Composables and refs
// 4. Computed / watchers
// 5. Functions
</script>

<template>
  <!-- Single root element preferred -->
</template>
```

- Use `defineProps<{}>()` with TypeScript generics (not runtime props)
- Use `defineEmits<{}>()` with TypeScript generics
- No `<style>` blocks — use Tailwind utility classes in templates

## Composables

- Place in `src/composables/` with `use` prefix: `useRequirements.ts`, `useApi.ts`
- Export a named function (not default): `export function useXxx()`
- Return reactive state (`ref`, `computed`) and methods as an object
- Handle errors inside composables, expose an `error` ref to consumers

## Types

- Define shared interfaces in `src/types/index.ts`
- Use `type` imports: `import type { Requirement } from '../types'`
- Use string literal unions for enums: `'PENDING' | 'IN_PROGRESS' | 'DONE'`

## API Calls

- Use the shared Axios instance from `src/composables/useApi.ts`
- All API paths start with `/api/`
- Type API responses with generics: `api.get<Requirement[]>('/api/requirements')`

## Path Aliases

- Use `@/*` alias for `src/*` imports when path depth exceeds two levels

## Naming

- Components: PascalCase files (`AppHeader.vue`, `RequirementCard.vue`)
- Composables: camelCase with `use` prefix (`useRequirements.ts`)
- Views: PascalCase with `View` suffix (`HomeView.vue`)
- Stores: camelCase files (`app.ts`), `use` prefix for store name (`useAppStore`)
