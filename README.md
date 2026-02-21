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

By default, server runs at http://localhost:3000

## Testing

Run all tests:

```bash
npm test
```

Run benchmark (1M users):

```bash
npm run benchmark
```

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

## API Endpoints

### Add a new user

```bash
POST /api/v1/leaderboards/user
Content-Type: application/json

{
  "name": "Alice",
  "score": 100
}
```

Response:

```json
{
    "id": "uuid-here",
    "name": "Alice",
    "score": 100
}
```

### Update a user's score

```bash
PUT /api/v1/leaderboards/user/:userId/score
Content-Type: application/json

{
  "score": 250
}
```

Response:

```json
{
    "id": "uuid-here",
    "name": "Alice",
    "score": 250
}
```

### Get top N users

```bash
GET /api/v1/leaderboards/top-users?limit=10
```

Response:

```json
[
  { "id": "uuid-1", "name": "Alice", "score": 500 },
  { "id": "uuid-2", "name": "Bob", "score": 400 },
  ...
]
```

### Get user rank with neighbors

```bash
GET /api/v1/leaderboards/user/:userId/position
```

Response:

```json
{
    "id": "uuid-here",
    "name": "Alice",
    "score": 300,
    "rank": 5,
    "above": [
        { "id": "uuid-a", "name": "User1", "score": 500 },
        { "id": "uuid-b", "name": "User2", "score": 400 }
    ],
    "below": [
        { "id": "uuid-c", "name": "User3", "score": 200 },
        { "id": "uuid-d", "name": "User4", "score": 100 }
    ]
}
```

### Health Check

```bash
GET /api/v1/health
```

## PGAdmin

1. Open http://localhost:5050
2. Login with `PGADMIN_EMAIL` / `PGADMIN_PASSWORD`
3. Database server is pre-configured (host: `postgres`)

## Documentation

- [Design Choices](./DESIGN_CHOICES.md) - Data structure and schema decisions
