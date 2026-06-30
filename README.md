# MyApp — Next.js 15 + Elysia + better-auth

A production-ready full-stack starter with:

- **Next.js 15** (App Router, React 19, TypeScript)
- **Elysia.js** mounted in-process inside Next.js — type-safe API, no separate server needed
- **better-auth** — email/password, Google OAuth, Apple OAuth, passkeys
- **Drizzle ORM** + PostgreSQL (Neon-compatible)
- **shadcn/ui** — Tailwind CSS v4 components
- **Zod** + react-hook-form for validation
- **t3-env** — type-safe, validated environment variables (fails fast on misconfiguration)
- **Vitest** + React Testing Library + Playwright — full TDD setup

## Architecture: Elysia inside Next.js

Elysia is mounted directly inside the Next.js App Router via a catch-all
route handler, rather than running as a separate API process:

```
apps/web/src/app/api/[[...slugs]]/route.ts   ← mounts the shared Elysia app
packages/elysia/src/app.ts                   ← Elysia app definition (no .listen())
packages/elysia/src/routes/user.ts           ← route handlers
```

This means:
- **One process, one port** in normal dev — `bun dev` only starts Next.js.
- **Same-origin requests** — no CORS configuration needed between the UI and API.
- **Fully typed end-to-end** via Eden Treaty (`apps/web/src/lib/api.ts`), since
  the Next.js app directly imports the Elysia `App` type.
- better-auth, the database client, and all `/api/*` routes run as part of the
  Next.js server's request lifecycle.

The same `@myapp/elysia` package can optionally be deployed standalone via
`apps/api` (see below) if you need to scale the API independently of the
Next.js app — for example behind its own load balancer, or to serve
non-browser clients directly. This is opt-in and not required for normal use.

## Architecture: validated environment variables (t3-env)

All `process.env` reads go through `@myapp/env` (`packages/env`), built on
[t3-env](https://env.t3.gg) + Zod. A missing or malformed variable throws a
clear, specific error immediately at startup instead of failing confusingly
deep inside better-auth, Drizzle, or the Elysia app at request time.

```
packages/env/src/core.ts     ← framework-agnostic schema (Bun-run packages)
packages/env/src/nextjs.ts   ← Next.js schema, client/server split
```

Two entry points, because Next.js and plain Bun processes have different
rules for env variables:

- **`@myapp/env/core`** — used by `packages/db`, `packages/auth`,
  `packages/elysia`, and the optional standalone `apps/api` server. These all
  run directly under Bun, so `process.env` is read as-is.
- **`@myapp/env/nextjs`** — used by `apps/web`. Next.js only bundles
  `NEXT_PUBLIC_*` variables into client code that are *explicitly
  destructured* in the schema (`experimental__runtimeEnv`); reading
  `process.env.NEXT_PUBLIC_X` dynamically elsewhere in client code will not
  work. The `client`/`server` split also throws a runtime error if
  server-only variables are accidentally accessed from client components.

`apps/web/next.config.ts` loads the monorepo-root `.env` via `dotenv`, then
validates it via `@myapp/env/nextjs` at config-load time — so `next dev` and
`next build` both fail immediately on a bad `.env`, before any code runs.

To skip validation (e.g. partial CI steps that don't need the full variable
set, like `drizzle-kit generate`), set `SKIP_ENV_VALIDATION=1`.

## Project structure

```
myapp/
├── apps/
│   ├── web/              # Next.js 15 frontend — Elysia mounted at /api/[[...slugs]]
│   └── api/               # OPTIONAL standalone Elysia server (same app, separate deploy)
└── packages/
    ├── db/                # Drizzle schema + client
    ├── auth/               # better-auth config (shared)
    ├── elysia/             # Shared Elysia app + routes, used by both apps/web and apps/api
    └── env/                # Validated env vars (t3-env), core + nextjs entry points
```

## Quick start

### 1. Install dependencies

```bash
bun install
```

### 2. Set up environment

```bash
cp .env.example .env
# Fill in DATABASE_URL, BETTER_AUTH_SECRET, OAuth credentials
```

> **Note:** the `.env` file lives at the **monorepo root**, not inside
> `apps/web`. Since Next.js only auto-loads `.env*` files from its own app
> directory, `apps/web/next.config.ts` explicitly loads the root `.env` via
> `dotenv` so the in-process Elysia app can read `DATABASE_URL`,
> `BETTER_AUTH_SECRET`, etc.

### 3. Run database migrations

```bash
bun db:generate   # generate migration files
bun db:migrate    # apply migrations
```

### 4. Start the dev server

```bash
bun dev           # starts Next.js (with Elysia mounted in-process) on :3000
```

That's it — both the UI and the API are served from `http://localhost:3000`.
Try `curl http://localhost:3000/api/health`.

### Optional: run the standalone API server too

Only needed if you want to scale the API independently of Next.js:

```bash
bun dev:api        # starts the standalone Elysia server on :3001
bun dev:all         # starts both Next.js and the standalone API together
```

When using the standalone API from a separately-hosted frontend, set
`NEXT_PUBLIC_API_URL` to point the web app's auth client and Eden Treaty
client at it instead of same-origin relative paths.

## Auth providers setup

### Google
1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Create OAuth 2.0 credentials
3. Add `http://localhost:3000/api/auth/callback/google` as redirect URI

### Apple
1. Go to [Apple Developer](https://developer.apple.com/account/resources/identifiers/list)
2. Register an App ID with Sign In with Apple
3. Create a Services ID and configure the return URL: `http://localhost:3000/api/auth/callback/apple`

### Passkeys
No external setup needed — works out of the box on localhost.
For production, set `WEBAUTHN_RP_ID` to your domain (e.g. `example.com`).
The passkey plugin is provided by the separate `@better-auth/passkey` package
(not bundled in `better-auth` core).

## Testing

```bash
bun test               # unit tests + E2E tests
bun test:unit           # Vitest only (apps/web + packages/elysia)
bun test:e2e             # Playwright only
bun test:e2e:ui           # Playwright with UI mode
bun test:coverage          # coverage reports for unit tests
```

Playwright's `webServer` config starts the Next.js dev server automatically
(Elysia included, same process) before running E2E tests — no separate API
process needs to be started manually.

## Useful commands

| Command | Description |
|---|---|
| `bun dev` | Run Next.js (Elysia mounted in-process) |
| `bun dev:api` | Run the optional standalone Elysia server only |
| `bun dev:all` | Run both Next.js and the standalone API together |
| `bun build` | Build the Next.js app |
| `bun build:api` | Build the optional standalone API server |
| `bun db:generate` | Generate Drizzle migrations |
| `bun db:migrate` | Apply migrations |
| `bun db:studio` | Open Drizzle Studio |
| `bun test:unit:web` | Run only the web app's Vitest suite |
| `bun test:unit:elysia` | Run only the Elysia package's Vitest suite |
