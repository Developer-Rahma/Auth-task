# Authentication API

All routes use the global `/api` prefix. JSON request bodies are validated with
the global Nest `ValidationPipe` (`whitelist`, `forbidNonWhitelisted`, and
`transform` enabled). Successful authentication tokens are set as cookies;
they are not returned in response JSON.

Browser requests use credentialed CORS for the configured `CORS_ORIGIN` and
the deployed Vercel frontend origin
`https://auth-task-eight-beige.vercel.app`. They must send credentials for the
browser to receive and attach cookies. The global throttler is configured for
100 requests per 60 seconds.
`CsrfMiddleware` exists in the codebase but is not registered, so these routes
do not currently require an XSRF token or header.

## `POST /api/auth/signup`

### Purpose

Create a user, establish an authentication session, and set authentication
cookies.

### Request

- **Method:** `POST`
- **URL:** `/api/auth/signup`
- **Headers:** `Content-Type: application/json`; `X-Request-ID` is optional.
- **Cookies:** None required.
- **Body:**

```json
{
  "name": "Rahma Samy",
  "email": "rahma@example.com",
  "password": "Password@123"
}
```

`name` must be a string of at least 3 characters. `email` must be a valid email
address. `password` must be a string of at least 8 characters and contain at
least one letter, one number, and one special character. Additional properties
are rejected.

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

The access and refresh tokens are set only in HttpOnly cookies; neither token,
the password, nor `passwordHash` is included in this JSON response.

### Cookies

Sets both cookies described in [Authentication cookies](#authentication-cookies).

### Errors

- `400 Bad Request`, code `VALIDATION_ERROR`: invalid or missing fields, or an
  additional property. The message is the validation messages joined together.
- `409 Conflict`, code `CONFLICT`: `"An account with this email already exists."`
- `500 Internal Server Error`, code `INTERNAL_SERVER_ERROR`: generic server
  error response.

## `POST /api/auth/signin`

### Purpose

Authenticate an existing user and issue a new authentication session.

### Request

- **Method:** `POST`
- **URL:** `/api/auth/signin`
- **Headers:** `Content-Type: application/json`; `X-Request-ID` is optional.
- **Cookies:** None required.
- **Body:**

```json
{
  "email": "rahma@example.com",
  "password": "Password@123"
}
```

`email` must be a valid email address. `password` must be a non-empty string.
Additional properties are rejected.

### Successful response

- **Status:** `200 OK`
- **JSON:**

```json
{
  "id": "user-id",
  "email": "rahma@example.com"
}
```

Authentication tokens are set only in HttpOnly cookies and are not returned in
JSON.

### Cookies

Sets both cookies described in [Authentication cookies](#authentication-cookies).

### Errors

- `400 Bad Request`, code `VALIDATION_ERROR`: invalid or missing fields, or an
  additional property.
- `401 Unauthorized`, code `INVALID_CREDENTIALS`: both an unknown email and an
  incorrect password return `"Invalid email or password."`
- `500 Internal Server Error`, code `INTERNAL_SERVER_ERROR`: generic server
  error response.

## `GET /api/auth/me`

### Purpose

Return the safe information for the user identified by the access token.

### Request

- **Method:** `GET`
- **URL:** `/api/auth/me`
- **Headers:** `X-Request-ID` is optional.
- **Cookies:** Requires the `access_token` cookie. An `Authorization` bearer
  header is not used by this guard.
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

The current response does not include the user's name, password, or
`passwordHash`.

### Cookies

No cookies are issued or changed by this endpoint. The request must include the
`access_token` cookie, whose attributes are described in
[Authentication cookies](#authentication-cookies).

### Errors

- `401 Unauthorized`, code `UNAUTHORIZED`: missing, invalid, or expired access
  token.
- `404 Not Found`, code `NOT_FOUND`: the user ID in a valid access token no
  longer identifies a user.

## `POST /api/auth/refresh`

### Purpose

Validate the refresh cookie, revoke its active refresh session, and create a
replacement session.

### Request

- **Method:** `POST`
- **URL:** `/api/auth/refresh`
- **Headers:** `X-Request-ID` is optional.
- **Cookies:** Requires the `refresh_token` cookie.
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

New access and refresh tokens are set only in HttpOnly cookies and are not
returned in JSON.

### Cookies

Sets both authentication cookies described in
[Authentication cookies](#authentication-cookies). The previous refresh
session is revoked before the new session is created.

### Errors

- `401 Unauthorized`, code `UNAUTHORIZED`: missing cookie returns
  `"Authentication is required."`; an invalid, expired, revoked, or mismatched
  refresh session returns `"Invalid or expired refresh session."`

## `POST /api/auth/logout`

### Purpose

Revoke all active refresh sessions for the authenticated user and clear the
authentication cookies.

### Request

- **Method:** `POST`
- **URL:** `/api/auth/logout`
- **Headers:** `X-Request-ID` is optional.
- **Cookies:** Requires a valid `access_token` cookie.
- **Body:** None.

### Successful response

- **Status:** `204 No Content`
- **JSON:** No response body.

### Cookies

The response expires `access_token` at `Path=/` and `refresh_token` at
`Path=/api/auth`. Both clearing cookies are marked HttpOnly. The current
`clearAuthCookies` implementation does not set `Secure` or `SameSite` on these
expiration headers.

### Errors

- `401 Unauthorized`, code `UNAUTHORIZED`: missing, invalid, or expired access
  token.
- `500 Internal Server Error`, code `INTERNAL_SERVER_ERROR`: generic server
  error response.

Logout revokes refresh sessions and clears the browser cookies. Access tokens
are stateless JWTs and are not checked against refresh-session state; a copied
access token can therefore remain valid until its JWT expiration. The browser
normally stops sending its token after processing the cleared cookie.

## Authentication cookies

| Cookie | HttpOnly | Secure | SameSite | Path | Max-Age | Purpose |
|---|---|---|---|---|---|---|
| `access_token` | Yes | `COOKIE_SECURE` | `COOKIE_SAME_SITE` | `/` | 15 minutes | Authenticates guarded endpoints |
| `refresh_token` | Yes | `COOKIE_SECURE` | `COOKIE_SAME_SITE` | `/api/auth` | 7 days | Refreshes the authentication session |

The cookie max ages are currently fixed in `AuthCookieService`. The JWT
expirations are configurable via `JWT_ACCESS_EXPIRES_IN` (default `15m`) and
`JWT_REFRESH_EXPIRES_IN` (default `7d`); changing those variables does not
change the cookie max ages.

`COOKIE_SECURE` defaults to `false` unless configured. `COOKIE_SAME_SITE` is
configured as `strict`, `lax`, or `none` and defaults to `lax`. `CORS_ORIGIN`
is required and CORS credentials are enabled for that origin.

## Error response format

Application and Nest HTTP errors are returned in the global format below. The
request ID is supplied in `X-Request-ID` when provided, otherwise the request
middleware generates one; it is also returned in the response header.

```json
{
  "success": false,
  "error": {
    "code": "INVALID_CREDENTIALS",
    "message": "Invalid email or password."
  },
  "requestId": "request-id"
}
```

Unexpected exceptions return status `500`, code `INTERNAL_SERVER_ERROR`, and
message `"Something went wrong. Please try again later."` Rate limiting uses
status `429`, code `RATE_LIMIT_EXCEEDED`, and message
`"Too many requests. Please try again later."`

## Authentication flow

### Signup and signin session creation

```text
Signup
  ↓
Check for duplicate email
  ↓
Hash password
  ↓
Create user
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

Signin validates the credentials and then uses the same session-creation
service. Passwords are hashed with bcrypt before user persistence. Refresh
sessions store the token hash, JTI, user ID, expiry, and revocation timestamp;
the raw refresh token is not stored.

### Refresh

```text
Refresh
  ↓
Read refresh cookie
  ↓
Verify JWT
  ↓
Find active session by JTI
  ↓
Compare token hash
  ↓
Revoke old session
  ↓
Create new session
  ↓
Issue new cookies
```

### Logout

```text
Logout
  ↓
Revoke refresh sessions for the user
  ↓
Clear authentication cookies
```

## Test execution

The e2e suite requires a MongoDB instance and an explicit `MONGODB_TEST_URI`.
The URI must use a database name containing `test`; the test setup fails closed
if the variable is absent or the name does not meet this requirement. If
`MONGODB_URI` is already set in the environment, its database name must differ.
The test process assigns the test URI to the application and uses test-only
JWT secrets before loading the application module, so the application's
connection URI and JWT secrets from `.env` are not used. Test user and
refresh-session collections are cleared before each test and after the suite.

Example using an isolated local MongoDB container:

```powershell
docker run --rm -d --name auth-api-test-mongo -p 127.0.0.1:27029:27017 mongo:7
$env:MONGODB_TEST_URI = "mongodb://127.0.0.1:27029/auth_api_test"
npm run test:e2e -- --runInBand
```

Stop and remove that disposable container after testing with:

```powershell
docker stop auth-api-test-mongo
```

The e2e tests can also verify the configured cookie flags with:

```powershell
$env:AUTH_TEST_COOKIE_SECURE = "true"
$env:AUTH_TEST_COOKIE_SAME_SITE = "strict"
npm run test:e2e -- --runInBand
```

The regular unit tests and production build commands are:

```powershell
npm test -- --runInBand
npm run build
```

## Test summary

Results below reflect executed runs against the isolated `auth_api_test`
database. The e2e suite passed once with `Secure=false`, `SameSite=lax`, and
again with `Secure=true`, `SameSite=strict`.

| Endpoint / area | Scenario | Expected status | Result |
|---|---|---:|---|
| `POST /api/auth/signup` | Valid signup, safe response, cookies, bcrypt password hash, hashed refresh token | 201 | PASS |
| `POST /api/auth/signup` | Invalid email, short name, invalid password rules, or missing fields | 400 | PASS |
| `POST /api/auth/signup` | Duplicate email and global error format | 409 | PASS |
| `POST /api/auth/signin` | Valid credentials, safe response, auth cookies | 200 | PASS |
| `POST /api/auth/signin` | Wrong password and unknown email use the same generic error | 401 | PASS |
| `POST /api/auth/signin` | Invalid request body | 400 | PASS |
| `GET /api/auth/me` | Missing, invalid, and expired access tokens | 401 | PASS |
| `GET /api/auth/me` | Valid access cookie returns safe user information | 200 | PASS |
| `POST /api/auth/refresh` | Valid refresh rotates the session and issues cookies | 200 | PASS |
| `POST /api/auth/refresh` | Missing, invalid, expired, and revoked refresh tokens | 401 | PASS |
| `POST /api/auth/logout` | Authenticated logout clears cookies and revokes sessions | 204 | PASS |
| `POST /api/auth/logout` | Logout without authentication | 401 | PASS |
| Security | Cookie flags match both tested Secure/SameSite configurations | — | PASS |
| Security | Passwords, hashes, and tokens are absent from captured request logs | — | PASS |
| Error handling | Unexpected exception returns generic 500 with request ID | 500 | PASS |
| Jest unit suite | Existing controller, auth-service, and app tests | — | PASS |

Executed totals: **25 e2e tests passed in each of two configuration runs; 3
unit tests passed. No test failures remained.**
