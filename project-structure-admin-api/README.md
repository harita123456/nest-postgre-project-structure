# Project-Structure Admin API

RESTful/NestJS service that powers admin operations for the Project-Structure platform. It uses PostgreSQL, Drizzle ORM, and follows a **modular monorepo-friendly folder layout** to keep features isolated and maintainable.

---

## Tech-Stack

| Layer             | Library / Tool | Version |
|-------------------|----------------|---------|
| Runtime           | Node.js        | >= 18   |
| Framework        | NestJS         | 11.x    |
| Database          | PostgreSQL     | 14+     |
| ORM / Migrations  | Drizzle ORM / Drizzle-Kit | ^0.44 |
| Package manager   | pnpm           | ^8.x    |
| Linting & Format  | ESLint, Prettier |       |
| Testing           | Jest           | ^30.x   |

---

## Requirements

* Node.js **18+** and **pnpm** ( `npm i -g pnpm` )
* PostgreSQL instance accessible via connection string.

---

## Getting Started

```bash
# 1. Clone the repo (if not already in monorepo)
# 2. Install dependencies
pnpm install

# 3. Copy environment and adjust values
cp .env.example .env
# OR on Windows
copy .env.example .env

# 4. Generate SQL & run migrations (creates drizzle/meta/_journal.json automatically)
pnpm run db:gen-and-migrate

# 5. Start the API in watch-mode
pnpm run dev
```

The service will be available at `http://localhost:3000` (default) and Swagger UI at `/docs`.

---

## NPM Scripts Cheatsheet

| Script                 | Purpose                                   |
|------------------------|-------------------------------------------|
| `dev`                  | Start server in **watch** mode            |
| `build`                | Transpile TypeScript to `dist/`           |
| `start` / `start:prod` | Run compiled app                          |
| `db:generate`          | Parse entities -> generate SQL            |
| `db:migrate`           | Apply pending migrations                  |
| `db:gen-and-migrate`   | Convenient generate + migrate step        |
| `db:studio`            | Visual DB explorer                        |
| `lint`                 | ESLint fix-on-save                        |
| `format`               | Prettier format all `src/**/*.ts`         |
| `test`                 | Run unit tests once                       |
| `test:watch`           | Run Jest in watch mode                    |

---

## Project Structure (key folders)

```
project-structure-admin-api/
├── src/
│   ├── app.module.ts         # Root Nest module
│   ├── common/               # DTOs, filters, guards, interceptors
│   ├── config/               # Config service + validation schema
│   ├── database/             # Drizzle connection & repos
│   ├── modules/              # **Feature modules** (v1/admin/*)
│   │   └── v1/admin/
│   │       ├── auth/         # Authentication / JWT
│   │       ├── users/        # User management
│   │       ├── app_content/  # CMS-like content endpoints
│   │       ├── bucket/       # S3 uploads helpers
│   │       └── faq/          # FAQ CRUD
│   ├── cronjobs/             # Scheduled tasks via `@nestjs/schedule`
│   ├── i18n/                 # Internationalisation resources
│   ├── notification/         # Email / push utilities
│   └── utils/                # Re-usable helpers
├── drizzle/                  # Migrations + journal
└── test/                     # Jest E2E / unit test specs
```

---

## Environment Variables

See `.env.example` for the full list. Important keys:

* `DATABASE_URL` – PostgreSQL connection string
* `JWT_SECRET` – Signing secret
* `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY` – S3 bucket uploads
* `SENTRY_DSN` – (optional) error tracking

---

## API Docs

`@nestjs/swagger` auto-generates OpenAPI docs at `/docs` once the application boots.

---

## Deployment

The service is stateless. Provide env vars and connect to the same Postgres. Typical Dockerfile snippet:

```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY . .
RUN pnpm install --prod && pnpm run build
CMD ["node", "dist/main.js"]
```

Apply migrations separately or during boot (e.g. `pnpm run db:gen-and-migrate`).

---

## Contributing

1. Fork / checkout branch
2. `pnpm install`
3. Create feature branch `git checkout -b feat/awesome`.
4. Ensure `pnpm run lint && pnpm run test` pass.
5. Open pull request.

---

## License

UNLICENSED – proprietary code. All rights reserved.

---

> Made with ♥︎ & NestJS by Jignesh Karena
