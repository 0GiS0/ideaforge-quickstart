# Backend — AGENTS.md

> Spring Boot 4 REST API with JPA + H2. Read this before touching any file here.

## Tech Stack

| Tech | Version | Purpose |
|------|---------|---------|
| Java | 21 | Language |
| Spring Boot | 4.0.5 | Application framework |
| Spring Web | 7.x | REST controllers |
| Spring Data JPA | 7.x | Database access |
| Spring Validation | 7.x | Bean validation (`@NotBlank`, `@Size`) |
| Jackson | 3.x (`tools.jackson.*`) | JSON serialization — **not** `com.fasterxml` |
| Hibernate | 7.x | ORM |
| H2 | 2.x | In-memory database (dev) |
| Spotless | 3.4.0 | Code formatter (Google Java Format 1.35.0 AOSP) |

## Project Structure

```
src/main/java/com/ideaforge/quickstart/
├── Application.java             → Entry point
├── config/
│   ├── DataLoader.java          → Seeds DB from PRD.json on startup
│   └── WebConfig.java           → CORS configuration
├── controller/
│   ├── HealthController.java    → GET /api/health
│   └── RequirementController.java → CRUD /api/requirements
├── model/
│   ├── BaseEntity.java          → id, createdAt, updatedAt (all entities extend this)
│   └── Requirement.java         → Main domain entity
├── repository/
│   └── RequirementRepository.java → JpaRepository<Requirement, Long>
└── service/
    ├── RequirementService.java  → Business logic
    └── ResourceNotFoundException.java → 404 exception

src/main/resources/
├── application.properties       → H2 config, port 8080
└── PRD.json                     → Seed data
```

## Mandatory: Lint & Format

**Run before every commit:**

```bash
cd backend
mvn spotless:apply
```

This applies Google Java Format (AOSP style) and removes unused imports. CI will reject unformatted code.

To check without modifying files:

```bash
mvn spotless:check
```

## Key Conventions

### Architecture: Controller → Service → Repository → Entity

- **Controllers** are thin — no business logic, just delegate to services
- **Services** contain all logic, annotated with `@Service` + `@Transactional`
- **Repositories** are interfaces extending `JpaRepository<Entity, Long>`
- **Entities** extend `BaseEntity` and use Jakarta Validation annotations

### Dependency Injection
- Constructor injection only — **never** `@Autowired` on fields
- Single-constructor classes don't need `@Autowired` at all

### Entities
- Always extend `BaseEntity` (provides `id`, `createdAt`, `updatedAt`)
- `@Entity` + `@Table(name = "plural_snake_case")`
- Enums: `@Enumerated(EnumType.STRING)`
- Provide no-arg constructor + convenience constructor

### Controllers
- `@RestController` + `@RequestMapping("/api/<resource>")`
- All paths under `/api/` prefix
- Return entities directly (no DTOs in this quickstart)

### Services
- Class-level `@Transactional`
- Read-only methods: `@Transactional(readOnly = true)`
- Missing entity → throw `ResourceNotFoundException` (auto 404)

### Jackson 3 (Spring Boot 4)
- Imports use `tools.jackson.*` — **not** `com.fasterxml.jackson.*`
- `spring-boot-starter-json` is required (not bundled with `starter-web`)

### Error Handling
- `ResourceNotFoundException` with `@ResponseStatus(HttpStatus.NOT_FOUND)`
- Same pattern for new exception types

### Configuration
- CORS in `WebConfig.java` for frontend origin
- Properties in `application.properties` (not YAML)
- Seed data via `CommandLineRunner` in `DataLoader.java`

## API Endpoints

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/health` | Health check + version |
| GET | `/api/requirements` | List all requirements |
| GET | `/api/requirements/{id}` | Get one by ID |
| PATCH | `/api/requirements/{id}/status` | Update status (`PENDING`, `IN_PROGRESS`, `DONE`) |

## Adding a New Entity

1. Create entity class in `model/` extending `BaseEntity`
2. Create `JpaRepository` interface in `repository/`
3. Create `@Service` in `service/` with `@Transactional`
4. Create `@RestController` in `controller/` under `/api/<resource>`
5. Run `mvn spotless:apply`

## How to Run

```bash
cd backend
mvn spring-boot:run    # http://localhost:8080
```

## How to Test

```bash
mvn test
```
