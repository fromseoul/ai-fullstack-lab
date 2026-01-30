# ============================================
# Express Production Dockerfile
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
COPY apps/api/package.json ./apps/api/
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
COPY --from=deps /app/apps/api/node_modules ./apps/api/node_modules
COPY --from=deps /app/packages/shared/node_modules ./packages/shared/node_modules

# 소스 복사
COPY . .

# 빌드
RUN pnpm turbo run build --filter=@repo/api

# ============================================
# Stage 4: Production Dependencies
# ============================================
FROM base AS prod-deps
WORKDIR /app

COPY apps/api/package.json ./

# 프로덕션 의존성만 설치 (devDependencies 제외)
RUN pnpm install --prod --ignore-scripts --no-frozen-lockfile

# ============================================
# Stage 5: Runner (Production)
# ============================================
FROM node:18-alpine AS runner
WORKDIR /app

# 보안: 최소 패키지만 설치
RUN apk update && apk upgrade --no-cache \
    && apk add --no-cache dumb-init \
    && rm -rf /var/cache/apk/*

# 환경 설정
ENV NODE_ENV=production
ENV PORT=4000

# 보안: non-root 사용자 생성
RUN addgroup --system --gid 1001 nodejs \
    && adduser --system --uid 1001 expressjs

# 빌드 결과물 복사 (소유권 설정)
COPY --from=builder --chown=expressjs:nodejs /app/apps/api/dist ./dist
COPY --from=prod-deps --chown=expressjs:nodejs /app/node_modules ./node_modules
COPY --from=builder --chown=expressjs:nodejs /app/apps/api/package.json ./

# 보안: non-root 사용자로 전환
USER expressjs

# 포트 노출
EXPOSE 4000

# 헬스체크
HEALTHCHECK --interval=30s --timeout=10s --start-period=20s --retries=3 \
    CMD wget --no-verbose --tries=1 --spider http://localhost:4000/api/v1/health || exit 1

# dumb-init으로 PID 1 시그널 처리
ENTRYPOINT ["dumb-init", "--"]
CMD ["node", "dist/index.js"]
