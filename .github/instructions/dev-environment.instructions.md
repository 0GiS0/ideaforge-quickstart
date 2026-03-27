---
description: "Use when the user needs to set up the development environment, run the project locally, or lacks Java/Node.js installed. Covers Docker-based development workflow with source code mounting."
---

# Development Environment Setup

## Prerequisites

This project requires **Java 21** (backend) and **Node.js 20** (frontend). If either is not installed in your environment, use Docker containers to develop without installing them locally.

## Docker-Based Development (No Java/Node Required)

When Java or Node.js are not available, use the development Dockerfiles (`Dockerfile.dev`) and `docker-compose.dev.yml` to run everything inside containers with your source code mounted as volumes. You edit code on your host/IDE and changes are reflected instantly via hot-reload.

### Both Services (Recommended)

```bash
docker compose -f docker-compose.dev.yml up --build
```

This starts:
- **Backend** at `http://localhost:8080` — Maven + JDK 21, hot-restart via Spring DevTools
- **Frontend** at `http://localhost:5173` — Node 20, Vite HMR

Source code is mounted from the host, so any edit you make is picked up automatically.

### Individual Services

Backend only:

```bash
docker compose -f docker-compose.dev.yml up backend --build
```

Frontend only:

```bash
docker compose -f docker-compose.dev.yml up frontend --build
```

### Production Build

For a production-like build (multi-stage, no volume mounts):

```bash
docker compose up --build
```

### Key Files

- `backend/Dockerfile.dev` — Development image (Maven + JDK 21, runs `mvn spring-boot:run`)
- `frontend/Dockerfile.dev` — Development image (Node 20, runs `npm run dev`)
- `docker-compose.dev.yml` — Orchestrates both with volume mounts for source code
- `docker-compose.yml` — Production multi-stage builds (no source mounting)

## Local Development (Java & Node Installed)

```bash
# Backend
cd backend && mvn spring-boot:run

# Frontend (separate terminal)
cd frontend && npm install && npm run dev
```
