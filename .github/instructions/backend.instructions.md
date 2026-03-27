---
description: "Use when creating or modifying Java classes, REST controllers, services, repositories, entities, or Spring Boot configuration in the backend. Covers layered architecture, JPA patterns, and Spring conventions."
applyTo: "backend/src/**"
---

# Backend Conventions

## Stack

- Java 21, Spring Boot 3.3+
- Spring Web, Spring Data JPA, Spring Validation
- H2 in-memory database (dev), Hibernate ORM
- Google Java Format (AOSP style) via Spotless — run `mvn spotless:apply` before commits
- Constructor injection (no `@Autowired` on fields)

## Layered Architecture

```
Controller → Service → Repository → Entity
```

- **Controllers** (`controller/`): Thin — delegate to services, no business logic
- **Services** (`service/`): All business logic, `@Service` + `@Transactional`
- **Repositories** (`repository/`): Interfaces extending `JpaRepository<Entity, Long>`
- **Models** (`model/`): JPA entities with Jakarta Validation annotations

## Entity Conventions

- All entities extend `BaseEntity` (provides `id`, `createdAt`, `updatedAt` with auto-timestamps)
- Use `@Entity` and `@Table(name = "plural_snake_case")`
- Use Jakarta Validation: `@NotBlank`, `@Size`, `@NotNull` on fields
- Enum fields use `@Enumerated(EnumType.STRING)`
- Provide a no-arg constructor and a convenience constructor

## Controller Conventions

- `@RestController` + `@RequestMapping("/api/<resource>")`
- All API paths under `/api/` prefix
- Use `@PathVariable` for resource IDs, `@RequestBody` for payloads
- Return entities directly (no DTOs needed until the project grows)
- Use `@GetMapping`, `@PostMapping`, `@PatchMapping`, `@DeleteMapping`

## Service Conventions

- Class-level `@Transactional`, read-only methods get `@Transactional(readOnly = true)`
- Throw `ResourceNotFoundException` for missing entities (auto-maps to 404)
- Use `orElseThrow()` with repository `findById()`

## Error Handling

- `ResourceNotFoundException` extends `RuntimeException` with `@ResponseStatus(HttpStatus.NOT_FOUND)`
- Follow this pattern for new exceptions: `@ResponseStatus` annotation + descriptive message

## Configuration

- CORS configured in `WebConfig.java` — allow frontend origin for all `/api/**`
- Properties in `application.properties` (not YAML)
- Seed data loaded via `CommandLineRunner` in `DataLoader.java`

## Naming

- Classes: PascalCase (`RequirementService`, `HealthController`)
- Packages: lowercase (`controller`, `service`, `model`, `repository`, `config`)
- Database tables: plural snake_case (`requirements`)
