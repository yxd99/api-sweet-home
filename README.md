# api-sweet-home

NestJS 12 API (MySQL + TypeORM) for Sweet Home.

## Requirements
- Node 22+
- pnpm 11
- MySQL 8

## Setup
```bash
cp .env.example .env
pnpm install
pnpm start:dev
```

## Tests
```bash
pnpm test
pnpm test:e2e
pnpm test:cov
```

## Auth flow
- `POST /api/auth/send-code` -> sends OTP (6 digits, crypto)
- `POST /api/auth/login` -> returns access/refresh tokens
- `POST /api/auth/refresh-token` (header `refresh-token`)
- `POST /api/auth/disable-tokens` (headers `token`, `refresh-token`)

## Docs
Swagger available when configured via `src/common/config/swagger`.

## Health
`GET /api/health`
