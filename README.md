# AI Fullstack Lab

Next.js + Express + Nginx 모노레포 풀스택 프로젝트

## Tech Stack

| 구분 | 기술 |
|------|------|
| Frontend | Next.js 15 (App Router) |
| Backend | Express.js |
| Reverse Proxy | Nginx |
| Database | Supabase |
| Auth | Firebase |
| Container | Docker + docker-compose |
| Monorepo | pnpm + Turborepo |

## 프로젝트 구조

```
ai-fullstack-lab/
├── apps/
│   ├── web/          # Next.js Frontend
│   └── api/          # Express Backend
├── packages/
│   ├── shared/       # 공유 타입, 유틸
│   └── eslint-config/# ESLint 설정
├── infra/
│   ├── nginx/        # Nginx 설정
│   └── scripts/      # 배포 스크립트
├── docker-compose.yml      # 개발용
└── docker-compose.prod.yml # 프로덕션용
```

## 시작하기

### 사전 요구사항

- Node.js 20+
- pnpm 9+
- Docker & Docker Compose

### 로컬 개발 (Docker 없이)

```bash
# 의존성 설치
pnpm install

# 개발 서버 실행
pnpm dev
```

- Frontend: http://localhost:3000
- Backend: http://localhost:4000

### Docker 개발 환경

```bash
# 개발 컨테이너 실행
pnpm docker:dev

# 종료
pnpm docker:down
```

- http://localhost (Nginx 통해 라우팅)

### 프로덕션 배포

```bash
# 환경 변수 설정
cp .env.example .env

# 프로덕션 컨테이너 실행
pnpm docker:prod
```

## 환경 변수

`.env.example` 참고하여 `.env.local` (개발) 또는 `.env` (프로덕션) 생성

## 스크립트

```bash
pnpm dev          # 개발 서버
pnpm build        # 빌드
pnpm lint         # 린트
pnpm type-check   # 타입 체크
pnpm docker:dev   # Docker 개발
pnpm docker:prod  # Docker 프로덕션
```
