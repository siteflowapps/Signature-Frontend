# ──────────────────────────────────────────────────────────────────────────
# Dockerfile — Siteflow CDO Frontend (Vite + React)
#
# Multi-stage build:
#   1. node:20-alpine compiles the Vite bundle (dist/).
#   2. nginx:alpine serves the static bundle and reverse-proxies /api/v1/*
#      to the backend container.
#
# The backend URL is NOT baked into the bundle — the React app uses a
# relative path (`BASE_URL = '/api/v1/'` in network/apiClient.ts), and
# nginx proxies that prefix to whichever backend is configured at runtime
# via the BACKEND_URL env var. One image → QA / UAT / prod.
#
# nginx:alpine auto-runs envsubst on /etc/nginx/templates/*.template at
# container start, writing the result to /etc/nginx/conf.d/ before the
# server boots. See docker-hub "nginx" image docs.
# ──────────────────────────────────────────────────────────────────────────

# Stage 1: build
FROM node:20-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

# Stage 2: serve
FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf.template /etc/nginx/templates/default.conf.template
EXPOSE 80
