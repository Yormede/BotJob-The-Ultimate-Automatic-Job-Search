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

## Current MVP status

- PostgreSQL migrations available for the core MVP tables and generated documents.
- Backend implemented for auth, sessions, dashboard, applications, application events, job axes, AI profile and local document generation.
- Private data access is scoped by `user_id` in repositories.
- Dashboard frontend includes a local assistant demo and CV HTML/CSS preview.
- Latest validation: `bun test` = 11 pass / 0 fail, Vite production build OK.

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
Les migrations deja appliquees sont suivies dans `schema_migrations`.

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
- `GET /api/dashboard`
- `GET /api/applications`
- `POST /api/applications`
- `GET /api/applications/:id`
- `PATCH /api/applications/:id`
- `DELETE /api/applications/:id`
- `GET /api/applications/:id/events`
- `POST /api/applications/:id/events`
- `GET /api/applications/:id/documents`
- `POST /api/applications/:id/generate`
- `GET /api/job-axes`
- `POST /api/job-axes`
- `PATCH /api/job-axes/:id`
- `DELETE /api/job-axes/:id`
- `GET /api/ai-profile`
- `PUT /api/ai-profile`

Skipped for now: email verification, persistent rate limiting, external AI provider and file/PDF storage.
