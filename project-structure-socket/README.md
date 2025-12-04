# Project-Structure Socket Server

Dedicated **real-time gateway** built with NestJS `@nestjs/websockets` + **Socket.IO** that delivers live features (chat, notifications, presence, calls, etc.) for Project-Structure mobile & web apps.

It shares Drizzle entities via `project-structure-database` and mirrors auth/business logic with the App & Admin APIs but isolates WebSocket traffic to reduce coupling and simplify horizontal scaling.

---

## Key Capabilities

- Namespaced Socket.IO endpoints under `/v1/*` modules.  
- JWT authentication guard at handshake (`common/guards/ws-jwt.guard.ts`).  
- Room management, presence, and message broadcasting.  
- Reconnect-safe throttling via `@nestjs/throttler`.  
- Scalable adapter ready (e.g., Redis) – currently using in-memory.

---

## Tech Stack

| Layer            | Library / Tool           | Version |
|------------------|--------------------------|---------|
| Framework        | NestJS                   | 11.x    |
| Transport        | Socket.IO                | 4.8.x   |
| DB / ORM         | PostgreSQL + Drizzle ORM | ^0.44   |
| Auth             | JWT (`jsonwebtoken`)     | 9.x     |
| Packaging        | pnpm                     | ^8.x    |
| Monitoring       | Sentry (`@sentry/nestjs`) | 10.x   |
| Testing          | Jest                     | ^30.x   |

---

## Getting Started

```bash
# 1. Install deps (links shared DB package)
pnpm install

# 2. Copy env config
copy .env.example .env   # on Windows
# adjust DATABASE_URL, JWT_SECRET, etc.

# 3. Run migrations (if needed)
pnpm run db:gen-and-migrate

# 4. Start socket server in watch mode
pnpm run dev
# → ws://localhost:3002/socket.io
```

Swagger is **not** exposed; use client tools like `socket.io-client` to connect.

---

## NPM Scripts

| Script                 | Description                                |
|------------------------|--------------------------------------------|
| `dev`                  | NestJS watch mode                          |
| `build`                | Compile TS to `dist/`                      |
| `start` / `start:prod` | Run compiled server                        |
| `format`               | Prettier write                             |
| `lint`                 | ESLint fix                                 |
| `db:generate`          | Generate migration SQL                     |
| `db:migrate`           | Apply migrations                           |
| `test` / `test:watch`  | Jest unit tests                            |

---

## Folder Overview

```
project-structure-socket/
├── src/
│   ├── app.module.ts         # Root Nest module
│   ├── common/               # Guards, interceptors, filters, DTOs
│   ├── config/               # ConfigService + validation
│   ├── database/             # Drizzle setup
│   ├── modules/              # Feature socket gateways
│   │   └── chat/
│   │   └── notification/
│   │   └── presence/
│   ├── notification/         # Email / push utils (optional fallbacks)
│   └── utils/                # Shared helpers
└── drizzle/                  # SQL migrations & meta
```

---

## Environment Variables

See `.env.example`. Common keys:

* `PORT` – default **3002**
* `DATABASE_URL` – Postgres DSN
* `JWT_SECRET` – Token verification
* `SENTRY_DSN` – Error tracking (optional)
* `AWS_ACCESS_KEY_ID` / `AWS_SECRET_ACCESS_KEY` – S3 uploads (if gateway sends files)

---

## Deployment Notes

Stateless; can run behind a load balancer with sticky sessions or a shared Socket.IO adapter (Redis, NATS). Provide env vars + database.

Example Dockerfile:

```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY . .
RUN pnpm install --prod && pnpm run build
CMD ["node", "dist/main.js"]
```

For Kubernetes, expose via ingress with WebSocket upgrade support.

---

## Client Connection Example

```ts
import { io } from 'socket.io-client';

const socket = io('ws://localhost:3002', {
  auth: { token: localStorage.getItem('jwt') }
});

socket.on('connect', () => console.log('connected', socket.id));
```

---

## License

UNLICENSED – proprietary code. All rights reserved.

---

> Powered by NestJS WebSockets • crafted with ♥︎ by Jignesh Karena
