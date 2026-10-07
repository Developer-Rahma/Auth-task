# Aster Backend

The backend is a NestJS API for account creation, cookie-based authentication,
session refresh, and logout. It uses MongoDB through Mongoose and organizes
authentication into presentation, application, domain, and infrastructure
layers.

The runnable API package is [`api/`](./api/). This document covers local setup,
configuration, architecture, endpoints, validation, cookie/session security,
errors, logging, and tests. The complete active endpoint reference is in
[`docs/api.md`](./docs/api.md), with additional authentication examples in
[`api/docs/api/authentication.md`](./api/docs/api/authentication.md).

## Contents

- [Technology](#technology)
- [Run locally](#run-locally)
- [Configuration](#configuration)
- [Architecture](#architecture)
- [Authentication API](#authentication-api)
- [Data model](#data-model)
- [Security and cookie session design](#security-and-cookie-session-design)
- [Errors, request IDs, and logging](#errors-request-ids-and-logging)
- [Tests and checks](#tests-and-checks)
- [GitHub Actions CI/CD](#github-actions-cicd)
- [Operational notes and current boundaries](#operational-notes-and-current-boundaries)

## Technology

- NestJS 11 with TypeScript
- MongoDB through Mongoose
- `@nestjs/config` with Joi environment validation
- `@nestjs/jwt` for access and refresh JWT signing/verification
- `bcrypt` for user password hashes
- SHA-256 hashing for refresh-token session records
- `cookie-parser` and Express response cookies
- Helmet security headers
- Nest throttling, configured for 100 requests per 60 seconds
- Jest for unit and end-to-end tests

## Run locally

Run commands from the API package:

```powershell
cd backend/api
npm install
Copy-Item .env.example .env
```

Edit `.env` with a valid MongoDB URI and unique secrets before starting the
server. Never commit real environment values.

```powershell
npm run start:dev
```

By default the API listens on port `3000` and applies the `/api` global prefix.
There is currently no health endpoint: `AppController` has a greeting handler
in source, but the controller is not registered in `AppModule`.

Useful commands:

```powershell
npm run build
npm run start
npm run start:dev
npm run start:prod
npm run test
npm run test:e2e
npm run test:cov
npm run lint
npm run format
```

`start:dev` watches TypeScript changes. `start:prod` runs the compiled
`dist/main` entrypoint and therefore expects a preceding build. The lint script
uses ESLint with `--fix`, so review the working tree after running it.

## Configuration

`.env.example` lists the supported environment variables. The active values
must satisfy `src/config/env.validation.ts`; configuration is loaded by
`src/config/configuration.ts`.

| Variable | Required/default | Meaning |
| --- | --- | --- |
| `NODE_ENV` | `development` | Must be `development`, `test`, or `production`. |
| `PORT` | `3000` | HTTP listen port. |
| `MONGODB_URI` | Required | MongoDB connection URI. |
| `JWT_ACCESS_SECRET` | Required, minimum 32 chars | Access-token signing/verification secret. |
| `JWT_REFRESH_SECRET` | Required, minimum 32 chars | Refresh-token signing/verification secret. |
| `JWT_ACCESS_EXPIRES_IN` | `15m` | Access JWT expiry accepted by Nest JWT. |
| `JWT_REFRESH_EXPIRES_IN` | `7d` | Refresh JWT expiry; expiration-date service accepts integer `s`, `m`, `h`, or `d` units. |
| `COOKIE_SECURE` | `false` | Adds the Secure cookie attribute when true. |
| `COOKIE_SAME_SITE` | `lax` | `strict`, `lax`, or `none`; production `none` requires Secure cookies. |
| `CORS_ORIGIN` | Required | Allowed browser origin; credentials are enabled. |
| `THROTTLE_TTL` | `60000` | Throttler window in milliseconds (validated configuration). |
| `THROTTLE_LIMIT` | `100` | Maximum requests in the throttler window (validated configuration). |

Development defaults use `http://localhost:5173` for `CORS_ORIGIN` and
`http://localhost:3000` for the API. Configure the frontend's
`VITE_API_URL` to the backend origin. The origin must match exactly for
credentialed browser CORS.

For the Fly.io deployment, `backend/api/fly.toml` sets the non-secret
production values, including the required `CORS_ORIGIN`. Set `MONGODB_URI`,
`JWT_ACCESS_SECRET`, and `JWT_REFRESH_SECRET` as Fly secrets for the app named
in that file; do not put those values in `fly.toml`. Confirm the secrets are
present with `fly secrets list --app rahma-auth-api-2026`, then deploy from
`backend/api` with `fly deploy`.

Although `THROTTLE_TTL` and `THROTTLE_LIMIT` are validated and loaded into
configuration, the current global throttler registration in `AppModule` uses
hard-coded values of 60,000 ms and 100 requests. Changing those environment
variables alone does not currently change the active throttler settings.

## Architecture

The Nest application is assembled by `src/app.module.ts`. It globally
registers configuration, MongoDB, the auth module, throttling, request-ID
middleware, a request logger interceptor, and the global exception filter.
`src/main.ts` sets up the HTTP app, validation, `/api`, Helmet, credentialed
CORS, cookie parsing, and exception handling.

Authentication is organized by responsibility:

```text
src/modules/auth/
├── presentation/
│   ├── controllers/auth/   HTTP routes and cookie/request wiring
│   ├── dto/                Request validation
│   └── guards/             Access-cookie verification
├── application/
│   ├── use-cases/          Signup, signin, me, refresh, logout
│   └── services/           Session creation orchestration
├── domain/
│   ├── entities/           User domain entity
│   └── repositories/       User repository contract/token
└── infrastructure/
    ├── repositories/       Mongo user/session persistence
    ├── schemas/            Mongoose document schemas
    └── security/           Password/JWT/cookie/session helpers
```

The intended request flow is:

```text
Controller + DTO
      ↓
Application use case
      ↓
Domain repository contract
      ↓
Mongo repository / security services
      ↓
MongoDB and HttpOnly cookies
```

`USER_REPOSITORY` is a domain token bound to `MongoUserRepository` by
`AuthModule`. Auth application services depend on the abstraction rather than
MongoDB models. Refresh-session persistence has its own repository.

Common infrastructure is in `src/common/`:

- `errors/`: application error classes and error-code constants.
- `filters/`: stable JSON mapping for application, Nest HTTP, and unexpected
  errors.
- `guards/`: global request throttling.
- `interceptors/`: completion logging with elapsed time.
- `logging/`: JSON-context wrapper around Nest's logger.
- `middlewares/`: request IDs and a CSRF middleware implementation.
- `types/`: authenticated Express request shape.

## Authentication API

All auth paths are beneath `/api/auth`. Request bodies are JSON and pass
through a global Nest `ValidationPipe` with `whitelist`, `forbidNonWhitelisted`,
and `transform` enabled. Unknown body properties are rejected.

| Method and path | Authentication | Success |
| --- | --- | --- |
| `POST /api/auth/signup` | Public | `201`, `{ id, name, email }`; sets access and refresh cookies. |
| `POST /api/auth/signin` | Public | `200`, `{ id, email }`; sets access and refresh cookies. |
| `GET /api/auth/me` | Access cookie | `200`, `{ id, email }`. |
| `POST /api/auth/refresh` | Refresh cookie | `200`, `{ id, email }`; rotates both cookies/session. |
| `POST /api/auth/logout` | Access cookie | `204`; revokes sessions and clears auth cookies. |

### Signup request rules

```json
{
  "name": "Avery Morgan",
  "email": "avery@example.com",
  "password": "SecurePass1!"
}
```

- `name`: string, at least 3 characters.
- `email`: valid email.
- `password`: at least 8 characters, with one letter, one digit, and one
  non-alphanumeric character.

Email is normalized to lowercase and trimmed before persistence. Passwords are
never returned by the API.

### Signin request rules

```json
{
  "email": "avery@example.com",
  "password": "SecurePass1!"
}
```

Email and a non-empty password are required. Unknown email and wrong password
share the same `401 INVALID_CREDENTIALS` message to avoid disclosing account
existence.

### Error response contract

Errors are returned in this shape:

```json
{
  "success": false,
  "error": {
    "code": "UNAUTHORIZED",
    "message": "Authentication is required."
  },
  "requestId": "request-id"
}
```

The exception filter maps known application errors and Nest HTTP errors to
stable codes. Unexpected failures are logged and return a generic
`INTERNAL_SERVER_ERROR` message. Validation messages may be joined into a
comma-separated safe message. The request ID is also returned in the
`X-Request-ID` response header.

For complete endpoint payloads, cookie attributes, and route-specific errors,
see the [Backend API reference](./docs/api.md) and
[Authentication API details](./api/docs/api/authentication.md).

## Data model

### Users

Mongoose `UserModel` uses the `users` collection and timestamps:

- `name`: required, trimmed string.
- `email`: required, unique, lowercase, trimmed and indexed.
- `passwordHash`: required; raw passwords are not persisted.
- Mongoose adds `createdAt` and `updatedAt`.

The domain `User` entity carries ID, name, email, hash, and timestamps. The
repository maps documents into that entity. API responses explicitly select
safe fields.

### Refresh sessions

Mongoose `RefreshSessionModel` uses the `refresh_sessions` collection and
timestamps:

- `userId`: indexed owner ID.
- `jti`: unique indexed refresh JWT identifier.
- `tokenHash`: SHA-256 hash of the refresh token, never the token itself.
- `expiresAt`: indexed expiry date.
- `revokedAt`: null while active; set to a date on revocation.

Refresh lookup requires matching `jti`, `revokedAt: null`, and a future
`expiresAt`.

## Security and cookie session design

### Cookies and tokens

JWTs exist only on the server and in browser-managed cookies. The API does not
include access or refresh token values in JSON responses.

- Access cookie: `access_token`, HttpOnly, root path `/`, currently a 15-minute
  cookie lifetime.
- Refresh cookie: `refresh_token`, HttpOnly, path `/api/auth`, currently a
  7-day cookie lifetime.
- `Secure` and `SameSite` are configured through `COOKIE_SECURE` and
  `COOKIE_SAME_SITE`.
- The access and refresh JWTs use separate signing secrets and payload types.
- The access guard reads only the access cookie, verifies the JWT, and attaches
  `{ id, email }` to the request.
- Refresh validates the refresh cookie against the signed JWT and the active
  stored session, revokes the old `jti`, then creates a new session/cookie pair.
- Logout revokes all active refresh sessions for the user and clears both
  cookies using the matching cookie paths.

The backend's JWT expiry is supplied by environment variables. The cookie
max-age values in `AuthCookieService` are currently fixed in code (15 minutes
and 7 days), so changing token expiry configuration should be coordinated with
cookie lifetimes.

### Passwords and sessions

User passwords use bcrypt with 12 salt rounds. Refresh tokens are hashed with
SHA-256 before session persistence. The raw refresh token is never saved in the
session collection.

### Browser integration and CSRF status

Credentialed CORS is enabled for the single configured `CORS_ORIGIN`; the
frontend must send `withCredentials`. A double-submit implementation exists in
`src/common/middlewares/csrf.middleware.ts`; it issues a readable `XSRF-TOKEN`
cookie and checks `X-XSRF-TOKEN` on state-changing methods.

**Important current limitation:** `AppModule.configure` registers
`RequestIdMiddleware` only. `CsrfMiddleware` is not registered, so the current
runtime does not enforce CSRF checks despite the middleware source being
present. The frontend Axios client is configured for the cookie/header
convention. Before enabling the middleware, verify CORS/preflight behavior and
all browser clients.

### Other controls

- Helmet adds common HTTP security headers.
- Nest throttling is applied globally, currently using IP as the tracker and
  100 requests per 60 seconds by default.
- Global DTO validation rejects unknown body fields.
- `INVALID_CREDENTIALS` does not distinguish unknown users from wrong
  passwords.
- Request logging includes request ID, method, path, status, and duration.
  Auth tests check that passwords, password hashes, and tokens are not written
  to application logs.

## Errors, request IDs, and logging

`RequestIdMiddleware` accepts a non-empty incoming `X-Request-ID` or generates
a UUID. It attaches the value to the request and echoes it in the response.

`RequestLoggingInterceptor` records completed HTTP requests with the request
ID, HTTP method, original path, response status, and elapsed milliseconds.
Application error handling is centralized by `GlobalExceptionFilter`:

- `AppError`: uses its declared status, code, and safe message.
- Nest `HttpException`: maps common statuses to project error codes.
- Unexpected exception: logs the failure and returns a generic internal
  server-error envelope.

Error codes are defined in `src/common/errors/error-codes.ts`, including
`VALIDATION_ERROR`, `UNAUTHORIZED`, `FORBIDDEN`, `NOT_FOUND`, `CONFLICT`,
`RATE_LIMIT_EXCEEDED`, `INVALID_CREDENTIALS`, `EMAIL_ALREADY_EXISTS`, and
`INTERNAL_SERVER_ERROR`.

## Tests and checks

Unit tests are colocated with source as `*.spec.ts`. Authentication
end-to-end tests are in `api/test/auth.e2e-spec.ts`; they cover signup rules,
safe response bodies, password hashing, cookie flags, signin behavior, `/me`,
refresh rotation/revocation, logout, and error/logging behavior.

The e2e Jest config is `api/test/jest-e2e.json`; `setup-e2e-env.ts` supplies
test environment configuration. E2E tests need a reachable test MongoDB
instance configured for the API test environment. Do not run destructive
integration tests against a production database.

Commands (run from `backend/api`):

```powershell
npm run test
npm run test:e2e
npm run test:cov
npm run build
npm run lint
```

## GitHub Actions CI/CD

The repository workflow at
[`.github/workflows/backend.yml`](../.github/workflows/backend.yml) runs when
files under `backend/` change in a pull request or a push to `main`. It installs
dependencies from the API lockfile, runs the unit and authentication e2e
Jest suites, and builds the production application. E2E tests use the
workflow's isolated MongoDB 7 service and the `auth_api_test` database.

After CI passes on a push to `main`, a separate job triggers deployment to
Render. Configure the Render Web Service with:

- **Root Directory:** `backend/api`
- **Build Command:** `npm ci && npm run build`
- **Start Command:** `npm run start:prod`

Set required runtime variables (MongoDB URI, independent JWT secrets,
`CORS_ORIGIN`, and production cookie settings) in the Render service's
environment configuration. Use the deployment's MongoDB database, never the
CI test database.

Create a Render deploy hook for the service and add its URL to the GitHub
repository's Actions secrets as `RENDER_DEPLOY_HOOK_URL`. Pull requests run CI
only; the deploy job runs only for pushes to `main`. If the secret is missing,
the deploy job fails with an explicit setup error.

## Operational notes and current boundaries

- MongoDB availability is required at startup; the API does not provide an
  in-memory persistence mode.
- The current user response from `/api/auth/me`, signin, and refresh omits the
  display name. Signup includes the name.
- The current API exposes auth routes. `AppController` is not registered, so
  its greeting route is not exposed; there is no health endpoint, contact
  submission endpoint, or general application dashboard API.
- Refresh is explicitly called by the frontend after `/me` returns 401; the
  backend does not automatically refresh a request whose access cookie is
  expired.
- The refresh controller reads the refresh cookie; the access guard protects
  `/me` and logout. There is no bearer-token authorization contract.
- Production deployment requires strong independent JWT secrets, TLS and
  Secure cookies, correct CORS origin, safe MongoDB credentials/network access,
  and operational monitoring. Never use the example development secret
  placeholders in production.
- `src/main.ts` sets Node DNS servers to `8.8.8.8` and `1.1.1.1` at process
  startup; review this deployment-specific behavior if the runtime network
  requires managed DNS.
