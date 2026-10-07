# Backend API

This document describes the HTTP routes currently implemented by the NestJS
backend. The server applies the global `/api` prefix.
The default development port is `3000`; the base URL is therefore
`http://localhost:3000`.

## General behavior

- JSON request bodies are validated with Nest's global `ValidationPipe`, with
  `whitelist`, `forbidNonWhitelisted`, and `transform` enabled. Unknown body
  properties are rejected.
- The API uses credentialed CORS for the configured `CORS_ORIGIN`.
- A global throttler allows 100 requests per 60 seconds.
- `X-Request-ID` is optional. If supplied, the same value is echoed in the
  response header and included in errors. Otherwise the request middleware
  generates an ID and returns it in the response header.
- `CsrfMiddleware` exists but is not registered; endpoints do not currently
  require an XSRF cookie or header.
- Application and Nest HTTP errors use this JSON format:

```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Error message."
  },
  "requestId": "request-id"
}
```

Unexpected exceptions return `500` with code `INTERNAL_SERVER_ERROR` and
message `"Something went wrong. Please try again later."` Rate limiting returns
`429` with code `RATE_LIMIT_EXCEEDED`.

`AppController` currently defines a greeting handler in source, but it is not
registered in `AppModule`; it is therefore not an exposed endpoint and is not
listed below.

## `POST /api/auth/signup`

### Purpose

Create a user and start an authentication session.

### Request

- **Method:** `POST`
- **URL:** `/api/auth/signup`
- **Headers:** `Content-Type: application/json`; optional `X-Request-ID`.
- **Cookies:** None required.
- **Body:**

```json
{
  "name": "Rahma Samy",
  "email": "rahma@example.com",
  "password": "Password@123"
}
```

`name` must be a string of at least 3 characters. `email` must be a valid email.
`password` must be a string of at least 8 characters and contain at least one
letter, one number, and one special character.

### Successful response

- **Status:** `201 Created`
- **JSON:**

```json
{
  "id": "user-id",
  "name": "Rahma Samy",
  "email": "rahma@example.com"
}
```

The response does not include the password or password hash. Access and refresh
tokens are set only in HttpOnly cookies, never returned in JSON.

### Cookies

Sets `access_token` and `refresh_token` as described in
[Authentication cookies](#authentication-cookies).

### Errors

- `400 Bad Request`, code `VALIDATION_ERROR`: a required value is missing or
  invalid, or an unknown property was provided. Validation messages are joined
  into the error message.
- `409 Conflict`, code `CONFLICT`: an account with that email already exists.
- `500 Internal Server Error`, code `INTERNAL_SERVER_ERROR`: generic server
  error.

## `POST /api/auth/signin`

### Purpose

Authenticate an existing user and start an authentication session.

### Request

- **Method:** `POST`
- **URL:** `/api/auth/signin`
- **Headers:** `Content-Type: application/json`; optional `X-Request-ID`.
- **Cookies:** None required.
- **Body:**

```json
{
  "email": "rahma@example.com",
  "password": "Password@123"
}
```

`email` must be a valid email. `password` must be a non-empty string.

### Successful response

- **Status:** `200 OK`
- **JSON:**

```json
{
  "id": "user-id",
  "email": "rahma@example.com"
}
```

The response does not include a password, password hash, or tokens. Tokens are
set only in HttpOnly cookies.

### Cookies

Sets `access_token` and `refresh_token` as described in
[Authentication cookies](#authentication-cookies).

### Errors

- `400 Bad Request`, code `VALIDATION_ERROR`: the email or password is invalid
  or missing, or an unknown property was provided.
- `401 Unauthorized`, code `INVALID_CREDENTIALS`: unknown email and incorrect
  password both return `"Invalid email or password."`
- `500 Internal Server Error`, code `INTERNAL_SERVER_ERROR`: generic server
  error.

## `GET /api/auth/me`

### Purpose

Return safe information for the user identified by the access token.

### Request

- **Method:** `GET`
- **URL:** `/api/auth/me`
- **Headers:** Optional `X-Request-ID`.
- **Cookies:** Requires `access_token`.
- **Body:** None.

The guard reads the access token from the cookie; it does not read a bearer
`Authorization` header.

### Successful response

- **Status:** `200 OK`
- **JSON:**

```json
{
  "id": "user-id",
  "email": "rahma@example.com"
}
```

The current response does not include the user's name, password, or
`passwordHash`.

### Cookies

No cookies are set or cleared by this route.

### Errors

- `401 Unauthorized`, code `UNAUTHORIZED`: access cookie is missing, invalid,
  or expired.
- `404 Not Found`, code `NOT_FOUND`: the token's user ID does not identify a
  stored user.

## `POST /api/auth/refresh`

### Purpose

Validate the refresh cookie, revoke its active refresh session, and create a
replacement session.

### Request

- **Method:** `POST`
- **URL:** `/api/auth/refresh`
- **Headers:** Optional `X-Request-ID`.
- **Cookies:** Requires `refresh_token`.
- **Body:** None.

### Successful response

- **Status:** `200 OK`
- **JSON:**

```json
{
  "id": "user-id",
  "email": "rahma@example.com"
}
```

The response contains no tokens. New tokens are set only in HttpOnly cookies.

### Cookies

Replaces both `access_token` and `refresh_token` as described in
[Authentication cookies](#authentication-cookies).

### Errors

- `401 Unauthorized`, code `UNAUTHORIZED`: missing refresh cookie returns
  `"Authentication is required."`; invalid, expired, revoked, or mismatched
  refresh session returns `"Invalid or expired refresh session."`

The refresh use case currently catches errors from its token/session validation
flow and reports them as the latter `401` error.

## `POST /api/auth/logout`

### Purpose

Revoke all refresh sessions for the authenticated user and clear the
authentication cookies.

### Request

- **Method:** `POST`
- **URL:** `/api/auth/logout`
- **Headers:** Optional `X-Request-ID`.
- **Cookies:** Requires a valid `access_token`.
- **Body:** None.

### Successful response

- **Status:** `204 No Content`
- **Body:** Empty.

### Cookies

Expires `access_token` at `Path=/` and `refresh_token` at `Path=/api/auth`.
Both clearing cookies are HttpOnly. The current clearing implementation does
not set `Secure` or `SameSite` on the expiration headers.

### Errors

- `401 Unauthorized`, code `UNAUTHORIZED`: access cookie is missing, invalid,
  or expired.

Logout revokes refresh sessions and clears the browser cookies. Access tokens
are stateless JWTs and are not checked against refresh-session state, so a
copied access token can remain valid until it expires. The browser normally
stops sending its token after processing the cleared cookie.

## Authentication cookies

| Cookie | HttpOnly | Secure | SameSite | Path | Max-Age | Purpose |
|---|---|---|---|---|---|---|
| `access_token` | Yes | `COOKIE_SECURE` | `COOKIE_SAME_SITE` | `/` | 15 minutes | Authenticates guarded endpoints |
| `refresh_token` | Yes | `COOKIE_SECURE` | `COOKIE_SAME_SITE` | `/api/auth` | 7 days | Refreshes the authentication session |

`COOKIE_SECURE` defaults to `false` unless configured. `COOKIE_SAME_SITE` can
be `strict`, `lax`, or `none` and defaults to `lax`. Cookie max ages are fixed
by the cookie service. JWT expiration can be configured separately using
`JWT_ACCESS_EXPIRES_IN` (default `15m`) and `JWT_REFRESH_EXPIRES_IN` (default
`7d`).

## Authentication flow

Signup and signin create sessions through the same session service:

```text
Signup / Signin
  ↓
Validate request / credentials
  ↓
Hash password (signup)
  ↓
Create or find user
  ↓
Create access token
  ↓
Create refresh token
  ↓
Hash refresh token
  ↓
Store refresh session
  ↓
Set HttpOnly cookies
```

Refresh validates the supplied cookie and rotates the session:

```text
Refresh
  ↓
Read refresh cookie
  ↓
Verify JWT
  ↓
Find active session by JTI
  ↓
Compare stored token hash
  ↓
Revoke old session
  ↓
Create replacement session
  ↓
Issue new cookies
```

Logout revokes the user's refresh sessions and expires the cookies:

```text
Logout
  ↓
Revoke refresh sessions
  ↓
Clear authentication cookies
```
