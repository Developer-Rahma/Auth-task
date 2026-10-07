# Aster Frontend

The frontend is the browser application for Aster, a responsive account-access
experience with a marketing landing page, signup and login forms, and a
cookie-authenticated application dashboard.

The implementation lives in [`web/`](./web/). This guide documents its
structure, commands, UI, API integration, authentication behavior, and current
boundaries.

## Contents

- [Technology](#technology)
- [Run locally](#run-locally)
- [Environment configuration](#environment-configuration)
- [Application routes](#application-routes)
- [Source layout](#source-layout)
- [Authentication and API integration](#authentication-and-api-integration)
- [Forms and validation](#forms-and-validation)
- [Design system and motion](#design-system-and-motion)
- [Tests and quality checks](#tests-and-quality-checks)
- [Current boundaries](#current-boundaries)

## Technology

- React 19 and TypeScript
- Vite for development and production bundling
- React Router for browser routes
- TanStack Query for server state and the current-user cache
- Axios for HTTP requests
- React Hook Form and Zod for form state and validation
- Tailwind CSS v4 plus project CSS for layout and visual styles
- Lucide React for interface icons
- Vitest and Testing Library dependencies for frontend tests
- Oxlint for linting

There is no Redux, Zustand, or React context for authentication. TanStack Query
is the source of truth for the current user.

## Run locally

Run commands from the frontend package:

```powershell
cd frontend/web
npm install
npm run dev
```

Vite prints the local URL after startup. The backend's default CORS origin is
`http://localhost:5173`; use that hostname when running the browser app unless
the backend CORS configuration is changed to allow another origin.

Useful commands:

```powershell
npm run build
npm run lint
npm test
npm run preview
```

`build` runs TypeScript project builds before Vite produces the static bundle.
`test` runs the Vitest suite once. `preview` serves the most recent production
build and is not a replacement for the API server.

## Environment configuration

Copy `.env.example` to `.env.local` in `frontend/web` when a local override is
needed:

```dotenv
VITE_API_URL=http://localhost:3000
```

`VITE_API_URL` is the API origin; endpoint paths are defined separately in
[`apiEndpoints.ts`](./web/src/features/auth/config/apiEndpoints.ts). The API
client defaults to `http://localhost:3000` if the variable is omitted.

Vite environment variables prefixed with `VITE_` are bundled into browser
code. They must never contain credentials, signing keys, database connection
strings, or other secrets. The frontend needs only a public API base URL.

## Application routes

| Route | Purpose |
| --- | --- |
| `/` | Marketing landing page |
| `/signup` | Create an account |
| `/login` | Sign in |
| `/signin` | Compatibility alias for `/login` |
| `/application` | Protected dashboard |
| `/app` | Compatibility alias for the protected dashboard |

Unknown routes redirect to `/`. Both protected paths use `AuthGuard`.

### Landing page

The landing page composes independently maintained marketing sections:

- `MarketingNavbar`: sticky desktop navigation and collapsible mobile menu
- `HeroSection`: headline, account links, and security illustration
- `FeaturesSection`: product feature cards
- `SecuritySection`: security principles
- `StepsSection`: the account access flow
- `ContactSection` and `ContactForm`: validated, client-only contact form
- `MarketingFooter`: navigation and copyright

`LandingPage` owns the shared `IntersectionObserver` that adds the
`is-visible` class to `data-reveal` elements as they enter the viewport.

### Authentication and dashboard pages

`SignUpPage` and `SignInPage` wrap `SignupForm` and `LoginForm` in the shared
`AuthShell`. Both forms provide accessible labels, client-side validation,
loading/disabled submit states, safe API error feedback, and password
visibility controls. Signup shows live password requirement indicators.

`ApplicationPage` displays the current user's name when available, falling
back to the email prefix because the backend's `/me` response currently has no
`name` field. Its logout button uses the logout mutation.

## Source layout

```text
web/src/
├── app/
│   ├── providers/
│   │   └── QueryProvider.tsx
│   └── router/
│       └── AppRouter.tsx
├── features/
│   ├── auth/
│   │   ├── api/
│   │   ├── components/
│   │   ├── config/
│   │   ├── hooks/
│   │   ├── pages/
│   │   ├── schemas/
│   │   ├── types/
│   │   └── utils/
│   └── marketing/
│       ├── components/
│       └── pages/
├── shared/
│   ├── components/
│   └── lib/
├── assets/
├── App.tsx
├── App.css
├── index.css
└── main.tsx
```

Responsibilities:

- `main.tsx`: React root setup and top-level query provider.
- `app/providers/QueryProvider.tsx`: the shared `QueryClient`.
- `app/router/AppRouter.tsx`: public routes, aliases, and guarded dashboard
  routes.
- `features/auth/api/`: API service methods and auth contract types.
- `features/auth/hooks/`: React Query mutations and current-user query.
- `features/auth/components/`: reusable auth forms, guard, and shared auth
  page layout.
- `features/auth/config/apiEndpoints.ts`: centralized auth endpoint paths.
- `features/auth/schemas/`: Zod schemas and form value types.
- `features/marketing/`: landing page composition and its independent
  sections/forms.
- `shared/lib/apiClient.ts`: the single configured Axios client.
- `shared/lib/apiError.ts`: safe API error extraction and unauthorized
  detection.
- `App.css` and `index.css`: component styles, responsive behavior, design
  tokens, and motion preferences.

## Authentication and API integration

The browser authenticates with server-set cookies. The frontend does not read,
store, decode, or add JWTs to request headers. Axios is configured with
`withCredentials: true`; the browser sends eligible cookies.

### API calls

The base URL comes from `VITE_API_URL`; paths are centralized in
`features/auth/config/apiEndpoints.ts`. `authService` in
`features/auth/api/auth.service.ts` exposes:

| Method | Endpoint | Use |
| --- | --- | --- |
| `signup` | `POST /api/auth/signup` | Create an account and session |
| `signin` | `POST /api/auth/signin` | Authenticate and start a session |
| `getCurrentUser` | `GET /api/auth/me` | Resolve the browser's current session |
| `refreshSession` | `POST /api/auth/refresh` | Rotate a session using the refresh cookie |
| `logout` | `POST /api/auth/logout` | Revoke sessions and clear auth cookies |

The request flow is `component → React Query hook → authService → apiClient →
API`. UI components do not call Axios directly.

### Current-user query and refresh

The canonical query key is `['auth', 'me']`, defined in
`features/auth/hooks/authQueryKeys.ts`.

When a protected route mounts, `AuthGuard` calls `useCurrentUser`. The query:

1. Requests `GET /api/auth/me`.
2. If `/me` returns `401`, calls `POST /api/auth/refresh` once.
3. After successful refresh, retries `/me` once.
4. If refresh or the second `/me` fails, the query errors and `AuthGuard`
   redirects an unauthorized user to `/login`.

React Query retries are disabled for this query, and refresh is not implemented
as a global Axios interceptor. This avoids an automatic refresh loop. Other
API/server errors are shown as a retryable session-check failure rather than
being treated as a logged-out user.

Signup and signin set `['auth', 'me']` from the API result after success and
navigate to `/application`. Logout calls the server first; after success, it
removes the current-user query and navigates to `/login`.

### Cookies and XSRF

The API client enables Axios XSRF support using the non-HttpOnly
`XSRF-TOKEN` cookie and `X-XSRF-TOKEN` header. It never attempts to read
`access_token` or `refresh_token`, which are HttpOnly cookies.

The backend currently has a `CsrfMiddleware` source file but does not register
it in its module pipeline. Therefore the frontend's XSRF settings are
configured, but the existing server does not currently enforce that
middleware. See the [backend documentation](../backend/README.md#security-and-cookie-session-design).

### Errors

The backend uses the envelope:

```json
{
  "success": false,
  "error": {
    "code": "INVALID_CREDENTIALS",
    "message": "Invalid email or password."
  },
  "requestId": "optional-request-id"
}
```

`getApiErrorMessage` returns a generic retry message when the network/API
response has no valid safe error payload, and maps `INVALID_CREDENTIALS` to the
generic credential message.

## Forms and validation

Schemas are defined in `features/auth/schemas/auth.schema.ts`:

- Signup requires a name of at least 3 characters, valid email, and password
  of at least 8 characters with a letter, number, and special character.
- Signin requires a valid email and non-empty password.
- Contact requires a name, valid email, and message of at least 10 characters.

Signup requirements are also described by `features/auth/utils/passwordRules.ts`
to provide live visual feedback while typing. The server remains authoritative
and validates requests independently.

All user-facing forms connect labels and errors with input IDs and
`aria-describedby`, expose invalid state through `aria-invalid`, and use
`role="alert"` or `role="status"` for feedback.

## Design system and motion

The visual theme is inspired by `src/assets/background.png`: midnight navy,
indigo/violet, aurora cyan, and light neutral surfaces. Global CSS variables
and Tailwind v4 theme values are in `src/index.css`; page/component layouts and
responsive rules are in `src/App.css`.

The landing page uses:

- Responsive mobile navigation and grid changes
- A hero entrance and gently floating illustration
- IntersectionObserver-based content/card reveals
- Small hover elevation on feature cards and controls
- `prefers-reduced-motion` overrides that keep content visible and remove
  prolonged animation

Auth pages and the dashboard use the same brand and color system while keeping
their layouts purpose-built.

## Tests and quality checks

Frontend tests live beside the code they cover:

- `features/auth/api/auth.service.test.ts`: endpoint mapping and API method
  request paths/data.
- `features/auth/hooks/useCurrentUser.test.tsx`: 401 refresh path and
  non-401 error path.
- `features/auth/schemas/auth.schema.test.ts`: signup/signin validation.
- `shared/lib/apiClient.test.ts`: credential and XSRF client configuration.

Run:

```powershell
npm test
npm run lint
npm run build
```

Service tests mock the Axios client. They do not replace an end-to-end test
against a running API or database.

## Current boundaries

- Signup/signin and session APIs are integrated; contact submission is still a
  local simulated success state and does not call a backend endpoint.
- There is no API for profile editing, password reset, account deletion, or
  dashboard resources in this frontend.
- The backend currently omits `name` from `/me`, signin, and refresh responses;
  the frontend type makes `AuthUser.name` optional.
- The application routes are protected client-side by the current-user API
  check. Server-side authorization remains the actual security boundary.
- A valid local deployment needs matching frontend API URL, backend CORS origin,
  cookie settings, and database/JWT configuration.
