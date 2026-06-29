# syntax=docker/dockerfile:1
# Multi-stage build producing a slim Next.js standalone runtime image.

# --- Dependencies -----------------------------------------------------------
FROM node:22-alpine AS deps
WORKDIR /app
RUN apk add --no-cache libc6-compat
COPY package.json package-lock.json ./
COPY prisma ./prisma
COPY prisma.config.ts ./
# npm ci runs `postinstall` (prisma generate), which needs the schema above.
RUN npm ci

# --- Builder ----------------------------------------------------------------
FROM node:22-alpine AS builder
WORKDIR /app
RUN apk add --no-cache libc6-compat
COPY --from=deps /app/node_modules ./node_modules
COPY . .
ENV NEXT_TELEMETRY_DISABLED=1
# Placeholder secrets so env validation passes during `next build`. The build
# never connects to the database; real values are injected at runtime.
ENV SESSION_SECRET="build-time-placeholder-session-secret-0000"
ENV ENCRYPTION_KEY="0000000000000000000000000000000000000000000000000000000000000000"
ENV CRON_SECRET="build-time-placeholder-cron"
# No credentials — the build never connects, this only satisfies URL validation.
ENV DATABASE_URL="postgresql://localhost:5432/build?schema=public"
RUN npx prisma generate
RUN npm run build

# --- Runner -----------------------------------------------------------------
FROM node:22-alpine AS runner
WORKDIR /app
RUN apk add --no-cache libc6-compat
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3000
ENV HOSTNAME=0.0.0.0
RUN addgroup -S nodejs && adduser -S nextjs -G nodejs

COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs
EXPOSE 3000
CMD ["node", "server.js"]
