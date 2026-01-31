# AGENTS.md

This file provides guidance to WARP (warp.dev) when working with code in this repository.

## What this repo is
A Next.js (App Router) + TypeScript site for a dental clinic with:
- Public marketing homepage at `/`.
- Authenticated admin panel under `/admin` to manage database-backed content (services, service images, testimonials, trust images).
- Supabase used for Auth + Postgres + Storage.

Note: `README.md` appears to describe an older static-site version; the more accurate product/feature overview is in `USER_GUIDE.md`.

## Common commands
### Install
- `npm install`

### Run locally
- `npm run dev`
  - Next dev server (default: `http://localhost:3000`).

### Production build/run
- `npm run build`
- `npm start`

### Lint
- `npm run lint`
- Lint a single file:
  - `npm run lint -- --file src/app/page.tsx`

### Typecheck
There is no dedicated script; run TypeScript directly:
- `npx tsc -p tsconfig.json --noEmit`

### Tests
There is currently no `test` script / test runner configured in `package.json`.

### Run SQL (migrations/maintenance)
This repo includes a SQL runner that executes a `.sql` file against Postgres.
- `npm run sql supabase/migrations/001_initial_schema.sql`
- `npm run sql supabase/seed.sql`

The SQL runner in `scripts/run-sql-pg.ts` expects one of these env vars:
- `DATABASE_URL` (preferred)
- `SUPABASE_DB_URL`

## Architecture (big picture)
### Next.js routing & rendering
- App Router lives under `src/app/`.
- Public homepage: `src/app/page.tsx`.
  - Uses ISR (`export const revalidate = 3600`).
  - Server-fetches published content from Supabase (e.g., services with `service_images`) and passes it to client components.
- Global layout/SEO: `src/app/layout.tsx`.
- Admin routes: `src/app/admin/*`.
  - List pages are server components that fetch from Supabase.
  - Mutations are implemented as server actions.

### Supabase integration
The project uses `@supabase/ssr` for Next.js-friendly auth cookies.
- Server client: `src/lib/supabase/server.ts` (uses Next cookies)
- Browser client: `src/lib/supabase/client.ts`
- Middleware client: `src/lib/supabase/middleware.ts`

### Auth & route protection
- Next middleware entrypoint: `src/middleware.ts`.
- Core auth logic: `src/lib/supabase/middleware.ts`.
  - Protects `/admin/*` (except `/admin/login`).
  - Redirects unauthenticated users to `/login`.
  - Redirects authenticated users away from `/login` and `/admin/login` to `/admin`.
- OAuth callback handler: `src/app/auth/callback/route.ts`.
  - Exchanges `code` for a session.
  - Validates `next` against a small allowlist to prevent open redirects.

### Admin panel data flow (read/write)
- Server actions live in `src/app/admin/actions.ts`.
  - Writes to Supabase tables and then calls `revalidatePath()` for the homepage and affected admin routes.
  - Also writes audit entries via `src/lib/security/audit-log.ts`.
- Admin UI components live in `src/components/admin/*`.
  - Service image management is centralized in `src/components/admin/UnifiedServiceImageManager.tsx`.

### Database schema & migrations
- SQL migrations live in `supabase/migrations/` (numbered `.sql` files).
- Seed data: `supabase/seed.sql`.
- The authoritative schema details for development are the SQL files in `supabase/migrations/`.

### Content model
Shared TS types are in `src/lib/types.ts` and mirror the Supabase tables:
- `services` and `service_images`
- `testimonials`
- `trust_images`
- `profiles` (role-based access: `admin` vs `editor`)

### Cache revalidation
There are two main revalidation paths:
- Server action: `revalidateHomePage()` in `src/app/admin/actions.ts`.
- Route handler: `POST /api/revalidate` in `src/app/api/revalidate/route.ts`.
  - Requires an authenticated Supabase user (no shared secret).

### Media & images
- `next.config.ts` configures `next/image` to allow loading from Supabase Storage public URLs (`https://*.supabase.co/storage/v1/object/public/**`).

### Security-related code
Security utilities live in `src/lib/security/` (validation, rate limiting, CSRF, audit logging, env validation).
Deployment security headers are configured in:
- `next.config.ts`
- `vercel.json`

## Docs worth reading first
- `USER_GUIDE.md` (product/admin workflows and feature overview)
- `SECURITY.md` and `SECURITY_IMPLEMENTATION_GUIDE.md` (what security layers exist and how migrations/env are expected to be applied)
