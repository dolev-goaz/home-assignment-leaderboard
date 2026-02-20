# Leaderboard API

A TypeScript Fastify server with PostgreSQL, Redis, and PGAdmin.

## Prerequisites

- Node.js 22+
- Docker & Docker Compose

## Setup

```bash
npm install
cp .env.example .env
```

## Development

```bash
npm run dev
```

By defaul, server runs at http://localhost:3000

## Docker

```bash
docker-compose up --build
```

Services:

- **API**: http://localhost:3000
- **PGAdmin**: http://localhost:5050
- **PostgreSQL**: localhost:5432
- **Redis**: localhost:6379

## Build

```bash
npm run build
npm run preview
```

## Health Check

```bash
curl http://localhost:3000/api/v1/health
```

## PGAdmin

1. Open http://localhost:5050
2. Login with `PGADMIN_EMAIL` / `PGADMIN_PASSWORD`
3. Database server is pre-configured (host: `postgres`)
