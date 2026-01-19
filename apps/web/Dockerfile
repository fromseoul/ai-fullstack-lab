# ============================================
# Next.js Production Dockerfile
# - Multi-stage build
# - Node 18 Alpine (minimal image)
# - Security hardened
# ============================================

# ============================================
# Stage 1: Base
# ============================================
FROM node:18-alpine AS base

# 보안: 불필요한 패키지 업데이트 및 캐시 정리
RUN apk update && apk upgrade --no-cache \
    && apk add --no-cache libc6-compat \
    && rm -rf /var/cache/apk/*

# pnpm 설치
RUN corepack enable && corepack prepare pnpm@9.15.0 --activate

# ============================================
# Stage 2: Dependencies
# ============================================
FROM base AS deps
WORKDIR /app

# 의존성 파일만 먼저 복사 (캐시 최적화)
COPY package.json pnpm-workspace.yaml pnpm-lock.yaml ./
COPY turbo.json ./
COPY apps/web/package.json ./apps/web/
COPY packages/shared/package.json ./packages/shared/

# 의존성 설치 (frozen lockfile 강제)
RUN pnpm install --frozen-lockfile --ignore-scripts

# ============================================
# Stage 3: Builder
# ============================================
FROM base AS builder
WORKDIR /app

# 의존성 복사
COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/apps/web/node_modules ./apps/web/node_modules
COPY --from=deps /app/packages/shared/node_modules ./packages/shared/node_modules

# 소스 복사
COPY . .

# 빌드 시 환경변수 (빌드 타임 전용)
ARG NEXT_PUBLIC_API_URL
ARG NEXT_PUBLIC_FIREBASE_API_KEY
ARG NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN
ARG NEXT_PUBLIC_FIREBASE_PROJECT_ID
ARG NEXT_PUBLIC_SUPABASE_URL
ARG NEXT_PUBLIC_SUPABASE_ANON_KEY

# 빌드
ENV NEXT_TELEMETRY_DISABLED=1
RUN pnpm turbo run build --filter=@repo/web

# ============================================
# Stage 4: Runner (Production)
# ============================================
FROM node:18-alpine AS runner
WORKDIR /app

# 보안: 최소 패키지만 설치
RUN apk update && apk upgrade --no-cache \
    && apk add --no-cache dumb-init \
    && rm -rf /var/cache/apk/*

# 환경 설정
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

# 보안: non-root 사용자 생성
RUN addgroup --system --gid 1001 nodejs \
    && adduser --system --uid 1001 nextjs

# standalone 출력물 복사 (소유권 설정)
COPY --from=builder --chown=nextjs:nodejs /app/apps/web/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/apps/web/.next/static ./apps/web/.next/static
COPY --from=builder --chown=nextjs:nodejs /app/apps/web/public ./apps/web/public

# 보안: non-root 사용자로 전환
USER nextjs

# 포트 노출
EXPOSE 3000

# 헬스체크
HEALTHCHECK --interval=30s --timeout=10s --start-period=30s --retries=3 \
    CMD wget --no-verbose --tries=1 --spider http://localhost:3000/ || exit 1

# dumb-init으로 PID 1 시그널 처리
ENTRYPOINT ["dumb-init", "--"]
CMD ["node", "apps/web/server.js"]
