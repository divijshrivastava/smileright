# 🔍 SmileRight — Staff Engineer Code Review

**Date:** 2026-02-19  
**Reviewer:** Staff Engineer  
**Scope:** Full codebase — security, code quality, standardisation  

---

## Executive Summary

The codebase is in **solid shape** for a clinic website with an admin CMS. There's good evidence of security thinking — rate limiting, audit logging, input validation, file magic-number checks, RBAC, and proper security headers. However, there are several **cybersecurity risks** that need immediate attention and a number of **code quality / standardisation** issues that will compound as the project grows.

**Severity Legend:**  
🔴 **CRITICAL** — Fix immediately, exploitable risk  
🟠 **HIGH** — Fix soon, real-world security or reliability issue  
🟡 **MEDIUM** — Should fix, code quality or minor security concern  
🟢 **LOW** — Nice to have, cleanup or standardisation  

---

## 1. 🟡 MEDIUM — Secrets Management (Verified Safe)

**File:** `.env.local`

The `.env.local` file contains **live production secrets** — Supabase service role key, GA4 private key — and is properly gitignored.

✅ **Verified:** `git log --all --full-history -- .env.local` returned empty — it has **never been committed**. Good.

### Still Recommended:
1. **Add a pre-commit hook** (e.g. via Husky + lint-staged) to prevent `.env*` files from ever being staged.
2. **Consider using Vercel environment variables** exclusively rather than keeping secrets in a local file that could be accidentally shared.

---

## 2. 🔴 CRITICAL — Contact API Route Uses Anon Key, Bypassing RLS

**File:** `src/app/api/contact/route.ts` (lines 91-94)

```typescript
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
)
```

This creates a **new client directly** with the anon key using `@supabase/supabase-js` (not the server SSR client). This client has **no cookies attached**, so Supabase treats it as an anonymous user. The insert will only succeed if the `contact_messages` table has an RLS policy allowing anonymous inserts.

### Risks:
- If the anon key + RLS grants INSERT on `contact_messages`, it also means **anyone with the anon key** (which is public!) can insert arbitrary data directly via the Supabase REST API, completely bypassing your server-side validation, rate limiting, and honeypot checks.
- An attacker can call `https://yqkkppvrneackgaxjfzz.supabase.co/rest/v1/contact_messages` directly with the anon key in the header.

### Fix:
Use the **service role key** (via `createAdminClient()`) in this server-side API route, or ensure RLS policies on `contact_messages` are properly locked down such that inserts can only happen through controlled paths. Ideally, switch to the service role key here since this is a server route and you need to insert without an authenticated user session.

---

## 3. 🟠 HIGH — Rate Limiting is In-Memory (Not Distributed)

**File:** `src/lib/security/rate-limit.ts`

```typescript
// In-memory store (use Redis in production for multi-instance deployments)
const rateLimitStore = new Map<string, RateLimitEntry>()
```

The comment acknowledges the issue, but this is deployed on **Vercel** (serverless), where:
- Each serverless function invocation may get a **different instance** (cold start → fresh Map)
- Rate limit state is **never shared** across invocations
- The rate limiter is essentially **non-functional in production**

### Impact:
- Brute-force protection on login is ineffective
- The contact form abuse prevention (burst/hourly limits) won't work
- Admin action rate limits won't work

### Fix Options (in order of effort):
1. **Vercel KV (Redis-compatible)** — Cheapest and easiest. `@vercel/kv` is a drop-in.
2. **Upstash Redis** — Free tier available, works great with serverless.
3. **Supabase edge function or RPC** — Use a DB-backed counter for critical paths (auth, contact).
4. **At minimum:** Add Vercel's built-in rate limiting via `vercel.json` for the contact endpoint.

---

## 4. 🟠 HIGH — CRON_SECRET is Not Set / Validated

**File:** `src/app/api/cron/cleanup-audit-logs/route.ts`

```typescript
if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
  return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
}
```

`CRON_SECRET` is not in `.env.local` and not in `env-validation.ts`. If it's undefined:
- `Bearer undefined` will **never match** any incoming header → the cron job silently fails every week
- If Vercel provides a `CRON_SECRET` automatically, this works, but there's no validation that it's configured

### Fix:
1. Add `CRON_SECRET` to `env-validation.ts` (as optional, for non-Vercel environments).
2. Log a warning if the cron endpoint is hit without a properly configured secret.

---

## 5. 🟠 HIGH — `setServiceImagePrimary` Has a Non-Atomic Race Condition

**File:** `src/app/admin/actions.ts` (lines 1143-1163)

```typescript
// Step 1: Unmark ALL as non-primary
await supabase.from('service_images').update({ is_primary: false }).eq('service_id', serviceId)

// Step 2: Mark ONE as primary
await supabase.from('service_images').update({ is_primary: true, updated_by: user.id }).eq('id', imageId)

// Step 3: Update the service's main image
await supabase.from('services').update({ image_url: image.image_url, ... }).eq('id', serviceId)
```

These three operations are **not transactional**. If step 2 or 3 fails, the service has **no primary image**. The same pattern exists in `deleteServiceImage` (lines 1070-1093).

### Fix:
Wrap multi-step mutations in a Supabase RPC/database function, or use `.rpc()` to call a PostgreSQL function that performs all steps in a single transaction.

---

## 6. 🟡 MEDIUM — Inconsistent Supabase Client Creation

Multiple files create Supabase clients differently:

| Pattern | Files |
|---------|-------|
| `createClient()` from `@/lib/supabase/server` | Most server components ✅ |
| `createClient()` from `@/lib/supabase/client` | Most client components ✅ |
| `import('@supabase/supabase-js').createClient()` inline | `TreatmentsDropdown.tsx`, `MobileTreatmentsAccordion.tsx`, `treatments-and-services/[slug]/page.tsx` ❌ |
| `createClient()` from `@supabase/supabase-js` directly | `api/contact/route.ts` ❌ |

### Issues:
- Inline `import()` bypasses your centralised client which handles cookies, session refresh, etc.
- Makes it impossible to add global interceptors, logging, or configuration changes in one place.

### Fix:
- For `generateMetadata` / `generateStaticParams` (which can't use cookies), create a `createStaticClient()` helper in `@/lib/supabase/static.ts`.
- For the contact route, use `createAdminClient()` or a dedicated server-side helper.
- For client components fetching public data, use the existing `createClient()` from `@/lib/supabase/client`.

---

## 7. 🟡 MEDIUM — Duplicate Login Pages

**Files:** `src/app/login/page.tsx` and `src/app/admin/login/page.tsx`

These are **nearly identical** (169 vs 171 lines). The only meaningful difference:
- `/login` uses `router.push('/admin')` + `router.refresh()` (client-side nav)
- `/admin/login` uses `window.location.href = '/admin'` (hard nav)

### Fix:
- Pick one approach (hard nav is more reliable for auth state).
- Extract a shared `LoginForm` component and render it from both routes — or redirect `/login` → `/admin/login`.

---

## 8. 🟡 MEDIUM — `actions.ts` is a 1,655-Line God File

**File:** `src/app/admin/actions.ts`

This single file contains 40+ exported server actions covering testimonials, trust images, services, service images, blogs, auth logging, user management, contact messages, and the approval workflow.

### Issues:
- Hard to navigate and review
- Merge conflicts when multiple features touch it
- No separation of concerns
- Difficult to unit test individual domains

### Recommended Split:
```
src/app/admin/actions/
├── auth.ts           (logLoginEvent, logFailedLoginEvent, logLogoutEvent)
├── testimonials.ts   (createTestimonial, updateTestimonial, deleteTestimonial, togglePublish)
├── services.ts       (createService, updateService, deleteService, toggleServicePublish)
├── service-images.ts (createServiceImage, updateServiceImage, deleteServiceImage, setServiceImagePrimary)
├── trust-images.ts   (createTrustImage, updateTrustImage, deleteTrustImage, toggleTrustImagePublish)
├── blogs.ts          (createBlog, updateBlog, deleteBlog, toggleBlogPublish)
├── users.ts          (inviteUser, getUsers, updateUserRole)
├── approvals.ts      (submitPendingChange, approvePendingChange, rejectPendingChange)
├── contact.ts        (markContactMessageViewed)
└── _helpers.ts       (getAuthenticatedUser, assertAdmin, assertNotViewer, enforceRateLimit, etc.)
```

---

## 9. 🟡 MEDIUM — `containsSQLInjection` is a False Sense of Security

**File:** `src/lib/security/input-validation.ts` (lines 139-148)

```typescript
export function containsSQLInjection(input: string): boolean {
  const sqlPatterns = [
    /(\b(SELECT|INSERT|UPDATE|DELETE|DROP|CREATE|ALTER|EXEC|UNION)\b)/i,
    /(--|;|\/\*|\*\/)/,
    /(\bOR\b.*=.*)/i,
    /(\bAND\b.*=.*)/i,
  ]
  return sqlPatterns.some(pattern => pattern.test(input))
}
```

### Issues:
1. **False positives:** A user named "Andrew Anderson" would be blocked (matches `AND`). A blog title "Creating Your Perfect Smile" would be blocked (matches `CREATE`). A testimonial saying "select the right dentist" would be blocked.
2. **False security:** This can be trivially bypassed. Modern SQL injection bypasses regex-based detection.
3. **Supabase uses parameterised queries** through PostgREST, so SQL injection via the Supabase client is **already prevented at the database layer**.

### Fix:
- **Remove** `containsSQLInjection` entirely. It provides false security and will cause legitimate content rejections.
- Your real protection is Supabase's parameterised queries + the input sanitisation you already do.

---

## 10. 🟡 MEDIUM — `PendingChange` Type is Incomplete

**File:** `src/lib/types.ts` (lines 72-86)

```typescript
export interface PendingChange {
  resource_type: 'testimonial' | 'service' | 'trust_image' | 'blog'
  action: 'create' | 'update' | 'publish' | 'unpublish'
  // ...
}
```

But in `actions.ts`, the actual values used include:
- `resource_type: 'service_image'` — **not in the type union**
- `action: 'set_primary'` — **not in the type union**

### Fix:
Update the type to match actual usage:
```typescript
resource_type: 'testimonial' | 'service' | 'trust_image' | 'blog' | 'service_image'
action: 'create' | 'update' | 'publish' | 'unpublish' | 'set_primary'
```

---

## 11. 🟡 MEDIUM — Loose `any` Types

Several files use `any` without suppression:

| File | Usage |
|------|-------|
| `treatments-and-services/[slug]/page.tsx:96` | `(a: any, b: any)` |
| `treatments-and-services/[slug]/page.tsx:199` | `(img: any)` |
| `admin/services/[id]/edit/page.tsx:48` | `(a: any, b: any)` |
| `CKEditorComponent.tsx:44,76,77,158` | Multiple `any` uses |

### Fix:
- Use `ServiceImage` type from `@/lib/types` for the sort callbacks and map iterations.
- CKEditor's `any` types are understandable (third-party API), but should use the library's own types where available.

---

## 12. 🟡 MEDIUM — `console.log` Statements in Production Client Code

**Files:** `ImageUploader.tsx`, `VideoUploader.tsx`

```typescript
console.log('Uploading to bucket:', bucket, 'File:', fileName, 'Size:', fileSizeMB, 'MB')
console.log('Upload successful:', uploadData)
console.log('Public URL:', publicUrl)
```

These leak upload details (bucket names, file paths, URLs) to any user's browser console.

### Fix:
Remove or guard these logs behind `process.env.NODE_ENV === 'development'`.

---

## 13. 🟢 LOW — Auth Callback Has Hardcoded Allowed Redirect Paths

**File:** `src/app/auth/callback/route.ts` (line 14)

```typescript
const allowedRedirectPaths = ['/admin', '/admin/testimonials', '/admin/services', '/admin/trust-images']
```

This list is incomplete — it doesn't include `/admin/blogs`, `/admin/users`, `/admin/analytics`, `/admin/approvals`, `/admin/contact-messages`. While this is defense-in-depth (any admin path would still work via `/admin`), it should be consistent.

### Fix:
Replace with a prefix check:
```typescript
const isValidRedirect = next.startsWith('/admin')
```

---

## 14. 🟢 LOW — `add_slug_to_services.sql` in Project Root

This ad-hoc migration SQL file should be in `supabase/migrations/` for traceability, or deleted if it's been applied.

---

## 15. 🟢 LOW — Duplicate Security Headers

Security headers are defined in **both** `next.config.ts` and `vercel.json`. On Vercel, these will be merged/duplicated. The CSP header (with `unsafe-inline`, `unsafe-eval`) is only in `vercel.json`, while `HSTS` is only in `vercel.json`.

### Fix:
- Define headers in **one place** only. For Vercel deployments, `vercel.json` takes precedence, so move everything there.
- Or keep everything in `next.config.ts` and remove from `vercel.json` for portability.

---

## 16. 🟢 LOW — Sitemap Has Hardcoded Treatment Slugs

**File:** `src/app/sitemap.ts` (lines 17-24)

```typescript
const treatmentSlugs = [
  'dental-implants',
  'root-canal-treatment',
  // ...
]
```

But elsewhere, treatment data is fetched from the database. This means new treatments won't appear in the sitemap until a developer manually updates this array.

### Fix:
Query published services from Supabase in the sitemap function (you already do this for blogs).

---

## 17. 🟢 LOW — `BASE_URL` Repeated Across Many Files

The string `'https://www.smilerightdental.org'` is hardcoded in multiple files:
- `src/app/layout.tsx`
- `src/app/sitemap.ts`
- `src/app/blog/[slug]/page.tsx`
- `src/app/treatments-and-services/[slug]/page.tsx`
- `src/app/admin/actions.ts` (in `inviteUser`)

### Fix:
Define once in a shared constants file:
```typescript
// src/lib/constants.ts
export const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.smilerightdental.org'
```

---

## 18. 🟢 LOW — Inline `styles` Objects in Every Admin Page

Almost every admin page defines its own `const styles: Record<string, React.CSSProperties> = { ... }` at the bottom. Many share identical patterns (container, title, card, etc.).

### Fix:
Extract common admin styles into a shared module:
```typescript
// src/styles/admin.ts
export const adminStyles = { ... }
```

---

## Summary of Recommended Actions

### Immediate (This Week)
| # | Severity | Action |
|---|----------|--------|
| 2 | 🔴 | Fix contact route to use service role key or tighten RLS |
| 3 | 🟠 | Replace in-memory rate limiter with distributed solution |
| 4 | 🟠 | Validate `CRON_SECRET` is configured |
| 5 | 🟠 | Make multi-step primary image operations transactional |

### Short-Term (This Sprint)
| # | Severity | Action |
|---|----------|--------|
| 1 | 🟡 | Add pre-commit hooks to prevent .env files from being staged |
| 6 | 🟡 | Standardise Supabase client creation |
| 7 | 🟡 | Consolidate duplicate login pages |
| 8 | 🟡 | Split `actions.ts` god file |
| 9 | 🟡 | Remove `containsSQLInjection` |
| 10 | 🟡 | Fix `PendingChange` type |
| 11 | 🟡 | Replace `any` types with proper interfaces |
| 12 | 🟡 | Remove production `console.log` statements |

### Backlog
| # | Severity | Action |
|---|----------|--------|
| 13 | 🟢 | Fix auth callback redirect whitelist |
| 14 | 🟢 | Clean up orphaned SQL file |
| 15 | 🟢 | Deduplicate security headers configuration |
| 16 | 🟢 | Make sitemap treatment slugs dynamic |
| 17 | 🟢 | Centralise `BASE_URL` constant |
| 18 | 🟢 | Extract shared admin styles |

---

## What's Done Well ✅

- **Audit logging** — Comprehensive, non-blocking, covers all admin actions
- **RBAC** — Clean admin/editor/viewer separation with approval workflow
- **Input validation** — Thorough with `sanitize-html`, length limits, type validation
- **File upload validation** — Magic number checks, size limits, type restrictions
- **Security headers** — CSP, HSTS, X-Frame-Options all configured
- **Open redirect prevention** — Auth callback validates redirect paths
- **HTML sanitisation** — Blog content is sanitised on both write AND read
- **Structured data / SEO** — Rich structured data for search engines
- **Error boundaries** — Proper error and loading states
