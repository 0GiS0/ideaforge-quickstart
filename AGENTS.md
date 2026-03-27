# AGENTS.md — Quick Context for AI Agents

> Read this first. It gives you everything you need to work in this repo without exploring every file.

## What Is This Project?

**IdeaForge Quickstart** — a ready-to-run starter template used by IdeaForge to bootstrap any new project. Instead of creating a project from scratch, IdeaForge clones this quickstart, which already compiles, runs, and includes the full stack wired together: Spring Boot backend (REST API + H2 database) and Vue 3 frontend (SPA with Tailwind CSS), Docker setup, linting, formatting, seed data, and routing. The agent's job is to extend or customize it for the specific product requested, not to build the scaffolding.

## Repo Layout

```
backend/                 → Java 21 / Spring Boot 3.3 REST API
  src/main/java/com/ideaforge/quickstart/
    config/              → WebConfig (CORS), DataLoader (seed data)
    controller/          → REST controllers (thin, delegate to services)
    model/               → JPA entities (extend BaseEntity)
    repository/          → Spring Data JPA interfaces
    service/             → Business logic (@Service + @Transactional)
  src/main/resources/
    application.properties → H2 config, port 8080
    PRD.json               → Seed data loaded on startup
  pom.xml                → Maven build, Spotless plugin for formatting

frontend/                → Vue 3.5 / TypeScript / Vite 5 SPA
  src/
    components/          → Reusable Vue components (PascalCase .vue)
    composables/         → Composables (useXxx.ts pattern)
    router/index.ts      → Vue Router config
    stores/app.ts        → Pinia store (setup syntax)
    types/index.ts       → Shared TypeScript interfaces
    views/               → Page-level components (XxxView.vue)
  package.json           → Scripts: dev, build, lint, format

docker-compose.dev.yml   → Dev environment with hot-reload (no local Java/Node needed)
docker-compose.yml       → Production multi-stage build
.github/instructions/    → Detailed convention files (read if you need specifics)
```

## Tech Stack Summary

| Layer    | Tech                                           |
|----------|-------------------------------------------------|
| Backend  | Java 21, Spring Boot 3.3, Spring Data JPA, H2  |
| Frontend | Vue 3.5, TypeScript, Pinia, Vue Router 4, Axios |
| Styling  | Tailwind CSS 3 (utility-first, no `<style>` blocks) |
| Build    | Maven (backend), Vite 5 (frontend)             |
| Lint     | Spotless/Google Java Format (backend), ESLint + Prettier (frontend) |
| Dev Env  | Docker Compose with volume-mounted source code  |

## How to Run

```bash
# Full stack (recommended — no Java or Node needed on host)
docker compose -f docker-compose.dev.yml up --build

# Or locally if Java 21 + Node 20 are installed:
cd backend && mvn spring-boot:run          # http://localhost:8080
cd frontend && npm install && npm run dev  # http://localhost:5173
```

## API Endpoints

All under `/api/`:

| Method | Path                              | Description          |
|--------|-----------------------------------|----------------------|
| GET    | `/api/requirements`               | List all requirements |
| GET    | `/api/requirements/{id}`          | Get one by ID        |
| PATCH  | `/api/requirements/{id}/status`   | Update status        |
| GET    | `/health`                         | Health check         |

**Request body for PATCH** (status update):
```json
{ "status": "PENDING" | "IN_PROGRESS" | "DONE" }
```

## Domain Model

One entity: **Requirement**

| Field       | Type                              | Notes                        |
|-------------|-----------------------------------|------------------------------|
| id          | Long (auto)                       | From `BaseEntity`            |
| title       | String (max 200)                  | `@NotBlank`                  |
| description | String (max 1000)                 | Optional                     |
| priority    | String (max 50)                   | e.g., "High", "Medium"      |
| status      | Enum: PENDING, IN_PROGRESS, DONE  | Default: PENDING             |
| createdAt   | LocalDateTime                     | Auto-set (`BaseEntity`)      |
| updatedAt   | LocalDateTime                     | Auto-updated (`BaseEntity`)  |

All entities extend `BaseEntity` (provides `id`, `createdAt`, `updatedAt` with JPA lifecycle hooks).

## Architecture Rules

### Backend
- **Layered**: Controller → Service → Repository → Entity
- Controllers are thin — no business logic, just delegation
- Services use `@Transactional` (class-level), `readOnly = true` for reads
- Constructor injection only (no `@Autowired` on fields)
- Missing entities throw `ResourceNotFoundException` → auto 404
- CORS configured in `WebConfig.java` for frontend origin

### Frontend
- `<script setup lang="ts">` only — never Options API
- Composables in `src/composables/` with `useXxx` naming
- Types in `src/types/index.ts` — use `import type { ... }`
- API calls via shared Axios instance from `useApi.ts`
- No `<style>` blocks — Tailwind utility classes only
- `@/*` alias for `src/*` imports (when depth > 2 levels)

## Adding a New Feature (Cheat Sheet)

### New entity
1. Create entity class in `model/` extending `BaseEntity`
2. Create `JpaRepository` interface in `repository/`
3. Create `@Service` in `service/`
4. Create `@RestController` in `controller/` under `/api/<resource>`
5. Add TypeScript interface in `frontend/src/types/index.ts`
6. Create composable in `frontend/src/composables/useXxx.ts`
7. Create/update Vue components and views

### New frontend page
1. Create `XxxView.vue` in `views/`
2. Add route in `router/index.ts`
3. Create composable if it needs API data

## Lint & Format (MUST run before commits)

```bash
# Frontend
cd frontend && npm run format && npm run lint

# Backend
cd backend && mvn spotless:apply
```

## Commit Messages

Semantic format required: `<type>(<scope>): <description>`

Types: `feat`, `fix`, `docs`, `style`, `refactor`, `perf`, `test`, `build`, `ci`, `chore`, `revert`, `hotfix`, `init`, `wip`

Example: `feat(api): add comment endpoint`

## Key Files to Read When Lost

| Need                    | File                                              |
|-------------------------|---------------------------------------------------|
| Backend conventions     | `.github/instructions/backend.instructions.md`    |
| Frontend conventions    | `.github/instructions/frontend.instructions.md`   |
| Commit rules            | `.github/instructions/commit-conventions.instructions.md` |
| Dev environment setup   | `.github/instructions/dev-environment.instructions.md`    |
| Entity base class       | `backend/src/.../model/BaseEntity.java`           |
| API routes              | `backend/src/.../controller/RequirementController.java`   |
| TypeScript types        | `frontend/src/types/index.ts`                     |
| Frontend routing        | `frontend/src/router/index.ts`                    |
| Shared API client       | `frontend/src/composables/useApi.ts`              |
