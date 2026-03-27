---
description: "Use when committing code, creating commits, writing commit messages, staging changes, or preparing pull requests. Enforces semantic commit format and mandatory lint/format checks."
applyTo: "**"
---

# Commit Conventions

## Semantic Commit Messages

Every commit message MUST match this regex:

```
^(init|hotfix|build|chore|ci|docs|feat|fix|perf|refactor|revert|style|test|wip){1}(\([\w\-\.]+\))?(!)?: ([\w ])+([\s\S]*)
```

### Format

```
<type>(<optional scope>): <description>
```

### Allowed types

| Type       | Purpose                                      |
|------------|----------------------------------------------|
| `feat`     | New feature                                  |
| `fix`      | Bug fix                                      |
| `docs`     | Documentation only                           |
| `style`    | Formatting, missing semicolons (no logic)    |
| `refactor` | Code change that neither fixes nor adds      |
| `perf`     | Performance improvement                      |
| `test`     | Adding or updating tests                     |
| `build`    | Build system or external dependencies        |
| `ci`       | CI configuration and scripts                 |
| `chore`    | Maintenance tasks                            |
| `revert`   | Reverts a previous commit                    |
| `hotfix`   | Urgent production fix                        |
| `init`     | Initial setup                                |
| `wip`      | Work in progress                             |

### Examples

```
feat(auth): add login with OAuth2
fix(api): handle null response from service
docs: update README with setup instructions
refactor(controller): simplify validation logic
chore(deps): bump spring-boot to 3.3.1
ci: add lint check to GitHub Actions workflow
```

## Mandatory Lint & Format Before Commit

Before every commit, run the appropriate lint and format tools so the code is clean and CI won't fail.

### Frontend (`frontend/`)

```bash
cd frontend && npm run format && npm run lint
```

- `npm run format` — Prettier formats `src/`
- `npm run lint` — ESLint checks and auto-fixes

### Backend (`backend/`)

```bash
cd backend && mvn spotless:apply
```

- Spotless applies Google Java Format (AOSP style) and removes unused imports

### Workflow

1. Make code changes
2. Run lint/format commands for every project affected
3. Stage all files (including formatting changes)
4. Write a semantic commit message matching the regex
5. Commit
