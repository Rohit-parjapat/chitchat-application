FROM node:18-alpine AS base

# Install system dependencies needed for Prisma + Postgres compatibility
RUN apk update && apk add --no-cache \
    ca-certificates \
    openssl \
    libpq \
    libc6-compat \
  && update-ca-certificates

FROM base AS builder
WORKDIR /app

RUN npm install -g pnpm
COPY . .

RUN pnpm add -w turbo@^2.5.5
RUN pnpm exec turbo prune api --docker

FROM base AS installer
WORKDIR /app

RUN npm install -g pnpm

COPY --from=builder /app/out/json/ .
RUN pnpm install

COPY --from=builder /app/out/full/ .

# Set working directory to your Prisma workspace before generating client
WORKDIR /app/apps/api
RUN pnpm exec prisma generate

WORKDIR /app
RUN pnpm exec turbo build

FROM base AS runner
WORKDIR /app

RUN addgroup --system --gid 1001 expressjs
RUN adduser --system --uid 1001 expressjs
USER expressjs
ENV PORT=5000
ENV FRONTEND_URL="http://localhost:3000"
ENV ACCESS_TOKEN_SECRET="78f82a45-8da4-40de-8d83-0040b7c396f8"
ENV REFRESH_TOKEN_SECRET="a9b3c4d5-7e8f-4gh5-9i0j-1k2l3m4n5o6p"
ENV ACCESS_TOKEN_EXPIRY="1h"
ENV REFRESH_TOKEN_EXPIRY="7d"
ENV REFRESH_TOKEN_EXPIRY="7d"
ENV NODE_ENV=production
ENV DATABASE_URL="postgresql://myuser:mypassword@chitchat-db:5432/chitchat?schema=public"

COPY --from=installer /app .

CMD ["node", "apps/api/.dist/index.js"]
