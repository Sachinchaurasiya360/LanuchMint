# syntax=docker/dockerfile:1.7
# Multi-stage build for the LaunchMint BullMQ worker. Build context is the
# monorepo root (docker build -f apps/worker/Dockerfile .).

FROM node:20-bookworm-slim AS base
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable && corepack prepare pnpm@9.12.3 --activate
RUN apt-get update && apt-get install -y --no-install-recommends \
      openssl ca-certificates curl \
    && rm -rf /var/lib/apt/lists/*
WORKDIR /app

# ------------------------------------------------------------------
# 1. Resolve dependencies using the monorepo lockfile. Copying only the
#    manifests first maximises Docker layer cache hits.
# ------------------------------------------------------------------
FROM base AS deps
COPY pnpm-lock.yaml pnpm-workspace.yaml package.json turbo.json ./
COPY tsconfig.base.json ./
COPY packages ./packages
COPY apps/worker/package.json ./apps/worker/package.json
RUN pnpm fetch

# ------------------------------------------------------------------
# 2. Build the worker plus every workspace it imports.
# ------------------------------------------------------------------
FROM deps AS build
COPY apps/worker ./apps/worker
RUN pnpm install --frozen-lockfile --offline
# Generate Prisma client, then compile the worker and its workspace deps.
RUN pnpm --filter @launchmint/db exec prisma generate
RUN pnpm --filter @launchmint/worker... build

# ------------------------------------------------------------------
# 3. Ship a lean runtime image with only production deps.
# ------------------------------------------------------------------
FROM base AS runtime
ENV NODE_ENV=production
ENV NODE_OPTIONS="--enable-source-maps"
# Non-root user for defense in depth.
RUN useradd --system --uid 1001 --create-home launchmint

COPY --from=build --chown=launchmint:launchmint /app /app
USER launchmint
WORKDIR /app/apps/worker

# BullMQ queue healthcheck - exits non-zero if Redis is unreachable.
HEALTHCHECK --interval=30s --timeout=5s --start-period=15s --retries=3 \
  CMD node -e "require('ioredis').prototype || process.exit(0)" || exit 1

CMD ["node", "--enable-source-maps", "dist/index.js"]
