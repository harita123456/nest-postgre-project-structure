# Project-Structure Serverless Function

Light-weight **AWS Lambda** (Node.js) implementation that returns the correct **public API & Socket URLs** for the different runtime environments (prod / staging / dev) of Project-Structure.

It is designed to be deployed behind API Gateway but can also be executed locally via an embedded Express server for easy debugging.

---

## What it Does

1. Verifies the request with a custom auth header (`Authorization` JWT) via `middleware/auth.ts`.
2. Pulls sensitive configuration (DB credentials, secrets) from AWS Secrets Manager (`utils/secrets.ts`).
3. Retrieves the requested `api` & `socket` URLs from Postgres through `service/get_api_url.service.ts`.
4. Responds with JSON in a uniform structure provided by `utils/commonFuncResponse.ts`.

---

## Tech Stack

| Purpose          | Library                | Version |
|------------------|------------------------|---------|
| Runtime          | AWS Lambda / Node 18   |         |
| Web Framework    | Express (local)        | 5.x     |
| Validation/Auth  | jsonwebtoken           | 9.x     |
| DB access        | Sequelize + pg         | 6.x / 8.x |
| Secrets Manager  | aws-sdk v3 (`aws-lambda`) |
| Lang             | TypeScript             | ^5.9    |

---

## Local Development

```bash
# 1. Install deps
pnpm install

# 2. Copy env template (if present) or set variables manually
#    PORT, DATABASE_URL, JWT_SECRET, AWS credentials etc.

# 3. Build TS ➜ JS
pnpm run build

# 4. Start local Express wrapper
node dist/index.js     # or  pnpm start
# → http://localhost:3000/?environment=prod
```

When `IS_LAMBDA` env var is **not** set to `true`, the Express server boots automatically.

---

## AWS Deployment

Typical CD pipeline:

1. Bundle using `esbuild` or `tsc` (already configured `build` script).
2. Zip `dist/` + `node_modules/` and upload to Lambda or use SAM/Serverless Framework.
3. Set Lambda environment vars:
   - `IS_LAMBDA=true`
   - `JWT_SECRET`, `DB_*`, etc.
4. Attach the policy to allow access to required secrets in Secrets Manager.

Example `serverless.yml` snippet (Serverless Framework):

```yaml
functions:
  getApiUrl:
    handler: dist/index.handler
    runtime: nodejs18.x
    memorySize: 128
    timeout: 5
    environment:
      IS_LAMBDA: "true"
      NODE_OPTIONS: "--enable-source-maps"
    events:
      - httpApi:
          path: /
          method: get
```

---

## Request Parameters

Query-string:

| Name         | Required | Description                |
|--------------|----------|----------------------------|
| `environment`| yes      | `prod`, `staging`, `dev`   |
| `type`       | no       | `api` or `socket` (defaults: returns both) |

Headers:

| Header         | Required | Description           |
|----------------|----------|-----------------------|
| `Authorization`| yes      | Bearer JWT validated by `verifyAuth()` |

---

## Response

```json
{
  "success": true,
  "message": "API URLs retrieved successfully",
  "data": {
    "environment": "prod",
    "api_url": "https://api.project-structure.com",
    "socket_url": "wss://socket.project-structure.com"
  }
}
```

Error responses use the same envelope with `success: false`.

---

## Useful Scripts

| Script   | Purpose                       |
|----------|-------------------------------|
| `build`  | Transpile TS to `dist/`       |
| `start`  | Run compiled code locally     |
| `clean`  | Remove `dist/`                |

---

## License

ISC (replace/change if proprietary).

---

> Serverless function crafted with ♥︎ by Jignesh Karena
