# File-receiver sidecar.
#
# Tiny Node service that lets the IdeaForge runner drop generated files
# into the shared frontend/backend volumes via HTTP, so the dev servers
# (Vite + Spring Boot) hot-reload from their sibling containers.
#
# Built once and reused by every preview project; deps are pinned in
# package.json + npm install at build time.

FROM node:22-alpine
WORKDIR /app

COPY package.json package-lock.json* ./
RUN npm install --omit=dev

COPY index.js ./

EXPOSE 3001

CMD ["node", "index.js"]
