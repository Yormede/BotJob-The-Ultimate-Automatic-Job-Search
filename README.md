# BotJob MVP

BotJob is a SaaS MVP for AI-assisted job applications: tailored documents,
application tracking, and a private candidate workspace.

## License

Source available under the PolyForm Noncommercial License 1.0.0.
Commercial use is not allowed without explicit written permission.

Stack MVP:

- Front: React TypeScript SPA, CSS classique
- Back: Bun TypeScript, REST JSON
- BDD: PostgreSQL via `Bun.SQL`
- Auth: session serveur + cookie `HttpOnly`
- Tests: `bun test`

## Installation

```powershell
bun install
Copy-Item .env.example .env
```

Renseigner `DATABASE_URL` dans `.env` si PostgreSQL est disponible.

## Base de donnees

```powershell
bun run db:migrate
```

La commande applique `database/migrations/001_botjob_core.sql`.

## Developpement

Terminal API:

```powershell
bun run api:dev
```

Terminal web:

```powershell
bun run web:dev
```

URLs:

- Web: http://127.0.0.1:5173/login
- API health: http://127.0.0.1:3000/api/health

## Tests

```powershell
bun test
```

## Endpoints MVP

- `GET /api/health`
- `POST /api/auth/register`
- `POST /api/auth/login`
- `GET /api/auth/session`
- `POST /api/auth/logout`

Skipped: verification email, rate limit persistant, candidatures CRUD. Add when the auth slice is validated against a real PostgreSQL instance.
