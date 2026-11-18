# NextVisa API deployment

## Production architecture
- Frontend: Netlify (existing site)
- API + Telegram polling bots: Render Web Service
- PostgreSQL: Neon
- Source of truth: GitHub main branch

## Render Blueprint
This repository includes `render.yaml`. In Render, create a Blueprint from this repository and select the `render.yaml` service.

Required environment variables:
- `DATABASE_URL`: Neon pooled PostgreSQL connection string (include `?sslmode=require`)
- `BOT_TOKEN`: existing NextVisa client Telegram bot token
- `MANAGER_BOT_TOKEN`: existing NextVisa manager bot token
- `ADMIN_ID`: Telegram admin chat ID
- `SESSION_SECRET`: generated automatically by Render Blueprint

Render builds with `npm install && npx prisma generate`, starts with `npm start`, and checks `/health`.

## Database setup
After creating the Neon database and setting `DATABASE_URL`, run Prisma migrations from a trusted deployment environment:
`npx prisma migrate deploy`

Do not commit `.env` files, bot tokens, database passwords, or session secrets.

## Important
- The existing Netlify frontend remains in place.
- The API base URL must be configured in the frontend after the Render service is live.
- The existing CRM UI uses session cookies; cross-origin production cookie/CORS configuration must be tested before exposing CRM login.
- Never use test or personal applicant data during deployment checks.
