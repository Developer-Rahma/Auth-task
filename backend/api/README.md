# Backend API package

The project documentation for the backend, including setup, environment
configuration, architecture, API contracts, cookie sessions, security,
logging, and tests, is in the [backend guide](../README.md).

This directory (`api/`) contains the NestJS API.

## Quick start

```powershell
npm install
Copy-Item .env.example .env
npm run start:dev
```

Configure a development MongoDB URI and strong local JWT secrets in `.env`
before starting the server. Run `npm run build`, `npm run test`, and
`npm run test:e2e` for backend checks.
