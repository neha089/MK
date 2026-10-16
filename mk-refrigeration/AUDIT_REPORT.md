# MK Refrigeration — Full Technical Audit Report

**Date:** 2026-10-16  
**Auditor:** Automated + Manual code review (Claude Code)  
**Branch audited:** `claude/awesome-hamilton-0sfbix`  
**Scope:** Full codebase — public storefront + admin management system

---

## 1. Project Summary

### Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 16.4.0 (App Router, React 19, Server Components, Server Actions) |
| Language | TypeScript 5 |
| Database | PostgreSQL via Supabase (PgBouncer on port 6543, direct on port 5432) |
| ORM | Prisma v5.22.0 |
| Auth | Custom JWT via `jose` v6, bcryptjs password hashing |
| Styling | Tailwind CSS v4, Material Symbols Outlined (Google Fonts) |
| Icons | Material Symbols + Lucide React |
| Animation | Framer Motion v14 |
| Forms | Zod v4 validation + `useActionState` |
| Deployment | Vercel (assumed, no CI config) + Supabase (free tier) |
| Monitoring | None |
| Testing | None |

### Features That Exist and Work

**Public Website:**
- Home page with hero, categories, featured products, offers, brands, trust badges
- Category listing and detail pages with product grid (ISR)
- Product detail page with JSON-LD structured data, OG tags, WhatsApp/call CTAs
- Brand listing and brand detail pages
- Search page (name, model, description, brand, category)
- Offers/deals page
- About page (now with live DB counts)
- Contact page with map link and enquiry form
- Sitemap, robots.txt

**Admin Panel:**
- Login with bcrypt + JWT, rate-limited (5 attempts / 15 min), audit logged
- Dashboard with KPI cards, 6-month sales chart, top sellers
- Product CRUD (create, edit, delete, toggle stock)
- Product filter (category, brand, stock status, search) + pagination (50/page)
- Label/barcode sheet print page (12 per sheet, CSS barcode font)
- Category and Brand CRUD
- Purchase entry (inward goods) with stock increment + inventory log
- Sale/billing with stock decrement + inventory log + invoice
- Printable invoice (browser print)
- Quotation CRUD with status (Pending/Accepted/Rejected) + PDF print
- Customer management (create, view, list, export CSV)
- Supplier management (create, edit, list)
- Inventory log with filters and CSV export
- Enquiry management with status pipeline (NEW/CONTACTED/CONVERTED/CLOSED)
- Staff management (list, create, edit)
- Offers management (create, edit, delete)
- Reports: Sales analytics, Enquiry analytics, Inventory report, Low stock, Stock movement, Audit log
- CSV export: products, sales, purchases, quotations, inventory, customers
- Audit log (login, product changes, sale, purchase, quotation, stock adjustment)
- DB-based rate limiting on login and enquiry submission

### Features Missing or Incomplete

| Feature | Status | Notes |
|---|---|---|
| Barcode scanning (scan-to-view item) | MISSING | `barcode` field exists, no scanner UI |
| QR code generation | MISSING | Label page uses CSS font-based barcode only |
| GST calculation on invoices | MISSING | `gstAmount` hardcoded to 0 in createSale |
| Sale cancel / return flow | MISSING | No undo for sold stock |
| Purchase cancel / correction | MISSING | No undo for purchased stock |
| Product image upload | MISSING | Images stored as URL strings; no upload UI |
| Email notifications | MISSING | Only ntfy.sh push notification stub |
| CAPTCHA on public forms | MISSING | IP rate limiting only |
| CI/CD pipeline | MISSING | No `.github/workflows/` |
| Any automated tests | MISSING | Zero test files |
| Role-based export restriction | PARTIAL | STAFF can export all data |
| Pagination on most admin lists | PARTIAL | Only products paginated; sales/purchases/quotations/customers all unbounded |
| GST-compliant invoicing | PARTIAL | HSN codes, CGST/SGST breakdown absent |

---

## 2. Scorecard

| Area | Score | Verdict |
|---|---|---|
| A. Architecture & System Design | 6/10 | Good separation of concerns; pattern-based middleware allowlist is a liability |
| B. Code Quality & Principles | 6/10 | Consistent style; no dead code; critical transactions missing |
| C. Security | 4/10 | Auth is solid; CSP missing; IP spoofing bypasses rate limits; no role check on mutations |
| D. Rate Limiting & Abuse Protection | 4/10 | DB-based rate limiting; not atomic; IP spoofable; no CAPTCHA |
| E. Performance & Scalability | 5/10 | ISR used on catalog; raw `<img>` instead of next/image; unbounded queries on admin |
| F. Business Logic Correctness | 3/10 | Race condition on stock; invoice number not sequential/atomic; GST always 0 |
| G. Frontend & UX | 6/10 | Responsive; good empty states; no loading.tsx files anywhere |
| H. Testing & Quality Gates | 0/10 | Zero tests, zero CI |
| I. DevOps & Production Readiness | 3/10 | README is boilerplate; no monitoring; no health check; no backups plan |

---

## 3. Issues List

### CRITICAL

---

**SEC-001** | Critical | Security (Business Logic) | `src/actions/sales.ts:49–85`  
**Stock decrement is outside a database transaction — race condition allows overselling**  
The sale record is created (line 49) and then stock is decremented in a sequential `for` loop (lines 71–85), with no `$transaction` wrapper. Two concurrent sales of the same product will both read the same stock level, both create sale records, and both decrement. Stock can go negative (no DB-level check constraint). On a busy day with two staff members billing simultaneously this is a real failure mode.  
**Fix:** Wrap the entire `createSale` block — sale create, stock decrements, and inventory log creates — in a single `prisma.$transaction([...])` and add `stockQty: { decrement: qty }` with a `where: { id, stockQty: { gte: qty } }` guard, throwing if the count is 0.  
**Effort:** M

---

**SEC-002** | Critical | Security (Business Logic) | `src/actions/purchases.ts:46–77`  
**Purchase creation also lacks a transaction — stock increment is not atomic**  
Same pattern as SEC-001. If the `inventoryLog.create` call on line 68 fails, the `product.update` on line 64 has already run, leaving stock incremented with no audit trail.  
**Fix:** Same as SEC-001 — wrap in `$transaction`.  
**Effort:** S

---

**BL-001** | Critical | Business Logic | `src/lib/utils.ts:31–37`  
**Invoice/quotation numbers are NOT sequential — they use `Math.random()` and CAN collide**  
`generateInvoiceNo` generates `PREFIX + YY + MM + random(1000–9999)`. Two sales in the same month have a 1-in-9000 chance of colliding. With `invoiceNo @unique` in the schema, the second sale silently fails with a generic Prisma unique constraint error. There is no retry or sequential fallback.  
**Fix:** Replace with a DB sequence. Use `$queryRaw\`SELECT nextval('invoice_seq')\`` (Postgres) or a dedicated counter table wrapped in a transaction.  
**Effort:** M

---

**BL-002** | Critical | Business Logic | `src/actions/sales.ts:58`  
**GST is hardcoded to 0 — invoices are not GST-compliant**  
Line 58: `gstAmount: 0`. Every invoice generated shows ₹0 GST. For an Indian GST-registered dealer this is legally incorrect and means the printed invoice cannot be used as a tax document.  
**Fix:** Add GST rate (e.g. 18%) to the Product model or a config constant. Calculate CGST + SGST from totalAmount. Display the breakdown on invoices. Add HSN code field to products.  
**Effort:** M

---

**SEC-003** | Critical | Security | `src/actions/products.ts:98–101` and `src/actions/products.ts:103–106`  
**`deleteProduct` and `toggleStock` have no session/auth check**  
Both actions call Prisma directly with no `getSession()` call. Middleware protects the page routes, but Server Actions are invoked via a POST to a Next.js internal endpoint — the middleware does not intercept these. Any authenticated user (including STAFF role) can delete products or toggle stock for any product.  
**Fix:** Add `const session = await getSession(); if (!session) return;` (and for sensitive operations `if (session.role !== 'ADMIN') return;`) at the top of each action.  
**Effort:** S

---

**SEC-004** | Critical | Security | `src/app/(public)/products/[slug]/page.tsx:77`  
**Potential XSS via JSON-LD `dangerouslySetInnerHTML` with unsanitized product data**  
`<script dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}` — if a product's name or description contains `</script><script>alert(1)</script>`, the browser will close the script tag early and execute the injected script. Prisma data is not sanitized before embedding.  
**Fix:** Use a JSON serializer that escapes `<`, `>`, and `&` inside strings: replace `JSON.stringify(jsonLd)` with `JSON.stringify(jsonLd).replace(/</g, '\\u003c').replace(/>/g, '\\u003e').replace(/&/g, '\\u0026')`. Same issue exists in `src/app/layout.tsx:78`.  
**Effort:** S

---

### HIGH

---

**SEC-005** | High | Security | `src/next.config.ts` + `src/middleware.ts`  
**No Content-Security-Policy (CSP) header**  
The security headers in `next.config.ts` cover HSTS, X-Frame-Options, X-Content-Type-Options, and Referrer-Policy, but there is no `Content-Security-Policy`. Without CSP, any XSS vulnerability has full browser impact. The label page and layout.tsx both use `dangerouslySetInnerHTML`, making CSP especially important.  
**Fix:** Add a CSP header to `next.config.ts` restricting `script-src` to `'self'` plus trusted CDNs, `style-src` to `'self' 'unsafe-inline' fonts.googleapis.com`, etc.  
**Effort:** M

---

**SEC-006** | High | Security | `src/lib/ratelimit.ts:24–38` + `src/lib/audit.ts:62–64`  
**Rate limiting is not atomic — bypassable under concurrent load**  
The enquiry rate limiter counts `AuditLog` entries with `action: 'ENQUIRY_SUBMIT'`, but the log entry is written AFTER the rate check, using `void logAudit(...)` (fire-and-forget async). Under concurrent requests, many requests can all pass the check before any log is written, allowing a burst far exceeding the limit.  
**Fix:** Write the audit log BEFORE returning success, or use a dedicated `RateLimit` table with an atomic upsert + count, or switch to Redis/Upstash for counters.  
**Effort:** M

---

**SEC-007** | High | Security | `src/lib/audit.ts:26–35`  
**`x-forwarded-for` IP is trusted blindly — rate limiting is trivially bypassed**  
`getClientIp()` reads the first value of `X-Forwarded-For` without validating it against a trusted proxy list. Any client can set `X-Forwarded-For: 1.2.3.4` to impersonate any IP and circumvent IP-based rate limits on both login and enquiry submission.  
**Fix:** On Vercel, use `request.ip` from the middleware (it uses the real client IP). In API routes, validate the header against known proxy IPs, or use a signed IP from the load balancer.  
**Effort:** S

---

**SEC-008** | High | Security | `src/app/(admin)/admin/login/page.tsx` (no account lockout on user object)  
**Session tokens are never revoked — deleted/suspended staff remain active for 7 days**  
The JWT has a 7-day expiry and is never refreshed or validated against the DB. If a staff member is deleted or their role is changed to STAFF, their existing JWT still grants admin-level access until expiry.  
**Fix:** Store a `sessionVersion` integer on the User model, include it in the JWT, and verify it against the DB on sensitive operations (or on every request in middleware with a short-lived DB cache).  
**Effort:** M

---

**PERF-001** | High | Performance | `src/app/(admin)/admin/sales/page.tsx`, `purchases/page.tsx`, `quotations/page.tsx`, `customers/page.tsx`, `suppliers/page.tsx`  
**Unbounded `findMany()` queries on admin list pages — will cause timeouts at scale**  
Multiple admin pages fetch ALL records from the database with no `take` limit (sales, purchases, quotations, customers, suppliers). At 1000+ records, these queries will be slow. At 10,000+, pages may time out on Vercel's 10-second function limit.  
**Fix:** Add pagination (50 per page) to all list pages, mirroring what was done for products. Vercel function timeout is 10s on the Hobby plan.  
**Effort:** M

---

**PERF-002** | High | Performance | Multiple files  
**Raw `<img>` tags used instead of `next/image` throughout the codebase**  
Product images, search results, and category pages use `<img src={...}>` directly. This bypasses Next.js image optimization (WebP/AVIF conversion, responsive sizes, lazy loading, blur placeholder, CDN caching). Evidence: `src/app/(public)/products/[slug]/page.tsx:100`, `src/app/(public)/search/page.tsx:113`, multiple product card components.  
**Fix:** Replace `<img>` with `<Image>` from `next/image`. Set `domains` or `remotePatterns` in `next.config.ts` to allow the image hosts. Add `width` and `height` props to prevent CLS.  
**Effort:** M

---

**SEC-009** | High | Security | `src/app/api/admin/export/` (all 6 routes)  
**Export endpoints have no role check — STAFF can export all business data**  
All export routes check only that a session exists (`if (!session) return 401`), not whether the user is ADMIN. Any STAFF member can call `/api/admin/export/sales`, `/customers`, etc. to download the full database as CSV including customer PII, pricing, and supplier information.  
**Fix:** Add `if (session.role !== 'ADMIN') return NextResponse.json({ error: 'Forbidden' }, { status: 403 })` after the session check.  
**Effort:** S

---

**INFRA-001** | High | DevOps | Project root  
**No tests of any kind — zero coverage**  
No `*.test.ts`, `*.spec.ts`, `__tests__/`, `jest.config`, `vitest.config`, or `cypress.json` files exist. Critical flows (login, create sale, purchase, stock change) have never been automatically verified. Any refactor can silently break billing.  
**Fix:** Add Vitest for unit tests (start with `generateInvoiceNo`, `formatPrice`, Zod schemas). Add Playwright for E2E tests (login, create sale, verify stock decrements). Target >60% coverage on business logic files.  
**Effort:** L

---

**INFRA-002** | High | DevOps | Project root  
**No CI/CD pipeline — no automated quality gate before deploy**  
No `.github/workflows/` or equivalent. Code is pushed directly to branch and deployed to Vercel without running `npm run lint`, `npx tsc --noEmit`, or any tests. A broken build could go to production.  
**Fix:** Add a GitHub Actions workflow: `on: [push, pull_request]` running `npm ci`, `npx tsc --noEmit`, `npm run lint`, and (once added) `npx vitest run`.  
**Effort:** S

---

### MEDIUM

---

**BL-003** | Medium | Business Logic | `src/middleware.ts:5–13`  
**Middleware uses an explicit allowlist of protected paths — new routes are unprotected by default**  
Every new admin page must be manually added to `ADMIN_PATHS`. A developer who adds `/admin/settings` or `/admin/pricing` without updating the list creates an unprotected admin route. The fail-safe default should be "deny unless explicitly allowed" (protect `/admin/*` broadly) rather than "allow unless listed."  
**Fix:** Change the middleware logic to protect ALL paths starting with `/admin/` except `/admin/login`. Remove the `ADMIN_PATHS` array entirely: `const isAdminProtected = pathname.startsWith('/admin/') && !pathname.startsWith('/admin/login')`.  
**Effort:** S

---

**BL-004** | Medium | Business Logic | Schema + `src/actions/sales.ts`  
**No sale cancellation or return flow — stock is never corrected after a bad sale**  
Once a sale is created, there is no way to cancel it or process a return. The stock decremented by the sale is lost. This is a critical gap for any real retail operation.  
**Fix:** Add a `status` field (COMPLETED/CANCELLED/RETURNED) to Sale. Add a `cancelSale` server action that sets status and increments stock back, wrapped in a transaction. Add a return flow that creates a negative InventoryLog entry.  
**Effort:** L

---

**BL-005** | Medium | Business Logic | `src/actions/products.ts:98–101`  
**`deleteProduct` does not check for related sales or purchase items — fails with a cryptic error**  
Attempting to delete a product that has been sold or purchased will throw a Prisma foreign key error. The error is caught and returned as a generic "Failed" message with no useful explanation for the user.  
**Fix:** Before deleting, check if any `SaleItem` or `PurchaseItem` references the product. If yes, return a friendly error: "Cannot delete — this product appears in X sales. Archive it instead." Add an `archived` boolean to Product for soft delete.  
**Effort:** S

---

**DB-001** | Medium | Database | `prisma/schema.prisma`  
**Missing database indexes on frequently queried/filtered fields**  
The following fields are used in `WHERE`, `ORDER BY`, or `findMany` filters with no index:
- `Product.brandId`, `Product.categoryId`, `Product.inStock`, `Product.featured`
- `Sale.createdAt`, `Sale.customerId`, `Sale.saleDate`
- `Purchase.purchaseDate`, `Purchase.supplierId`
- `Quotation.status`, `Quotation.createdAt`
- `Enquiry.status`, `Enquiry.createdAt`
- `SaleItem.productId`, `PurchaseItem.productId`

Without indexes, every filter scans the full table. On 10,000 products or 5,000 sales, query times will degrade severely.  
**Fix:** Add `@@index([brandId])`, `@@index([categoryId, inStock])`, `@@index([createdAt])`, etc. to the Prisma schema.  
**Effort:** S

---

**DB-002** | Medium | Database | `prisma/schema.prisma:235`  
**`Enquiry.status` is a plain `String` — not type-safe, not validated**  
`status String @default("NEW")` means any string can be written. It should be a Prisma `enum EnquiryStatus { NEW CONTACTED CONVERTED CLOSED }` for consistency with QuotationStatus and to prevent invalid values.  
**Fix:** Change to enum in schema, run migration.  
**Effort:** S

---

**SEC-010** | Medium | Security | `src/app/(admin)/admin/products/[id]/label/page.tsx:178`  
**Label page uses `dangerouslySetInnerHTML` for inline script**  
Line 178 injects `<script dangerouslySetInnerHTML={{ __html: \`document.querySelector('.btn-primary').addEventListener(...)\` }}>`. While the content is static here, this pattern opens the door to future XSS bugs and bypasses React's XSS protections.  
**Fix:** Use a `<script>` tag with a proper client component (`'use client'`), or add an `onClick` handler to the button directly in a Client Component.  
**Effort:** S

---

**PERF-003** | Medium | Performance | `src/app/(public)/search/page.tsx:17`  
**No rate limiting on public search endpoint**  
The search page (`/search?q=...`) runs a full-text Prisma `OR` query with five conditions on every request. There is no rate limiting, caching, or minimum query length check at the network layer. A bot could trigger hundreds of expensive queries per second.  
**Fix:** Add rate limiting to the search route, cache common search results with `unstable_cache`, and ensure `q` length >= 2 (currently enforced in JS but not at the edge).  
**Effort:** M

---

**SEO-001** | Medium | SEO | `src/app/layout.tsx:56`  
**Canonical URL points to the wrong domain**  
`alternates: { canonical: 'https://mkrefrigeration.vercel.app' }` — this is the development/preview URL. It should be `https://mkrefrigeration.com`. This tells Google that the definitive URL is the staging site, which can split link equity and cause the real domain to rank lower.  
**Fix:** Change the canonical to `https://mkrefrigeration.com` and read it from `NEXT_PUBLIC_APP_URL` env var.  
**Effort:** S

---

**PERF-004** | Medium | Performance | `package.json`  
**`framer-motion` adds ~50kb gzip to the bundle for minimal use**  
Framer Motion is in the core dependencies. If it is only used for a few page transitions, it adds significant JS bundle weight. NOT VERIFIED exactly how many components use it.  
**Fix:** Audit usage. If it is used on only 1–2 components, replace with CSS transitions. If needed only on a single page, lazy-load it: `const MotionDiv = dynamic(() => import('framer-motion').then(m => m.motion.div))`.  
**Effort:** S

---

**UX-001** | Medium | UX | All route segments  
**No `loading.tsx` or `error.tsx` files anywhere in the app**  
Next.js App Router supports per-segment `loading.tsx` (shows a skeleton while the server component fetches data) and `error.tsx` (catches thrown errors and shows a fallback). Neither exists for any admin or public segment. DB errors cause blank pages or full crashes.  
**Fix:** Add `src/app/(admin)/loading.tsx` and `src/app/(admin)/error.tsx` at minimum. Add public segment versions too.  
**Effort:** S

---

**SEC-011** | Medium | Security | `src/lib/constants.ts` / `.env.example`  
**`NEXTAUTH_URL` env var name is misleading — creates false assumption of NextAuth features**  
The app uses `jose` directly, not NextAuth. The `.env.example` lists `NEXTAUTH_URL` which could lead a future developer to assume NextAuth's CSRF protection, JWT rotation, and provider features are in place when they are not.  
**Fix:** Rename the env var to `NEXT_PUBLIC_SITE_URL` in the example and config. Document that auth is custom.  
**Effort:** S

---

### LOW

---

**SEC-012** | Low | Security | `src/lib/session.ts:40`  
**Cookie `sameSite` is `lax` — does not prevent all CSRF vectors on `GET` requests**  
`sameSite: 'lax'` protects against most CSRF, but allows cookies to be sent on top-level GET navigations from other origins. For a fully hardened setup, `sameSite: 'strict'` is preferable for admin sessions.  
**Fix:** Change `sameSite: 'strict'` for the admin session cookie (may impact redirect flows — test login flow after change).  
**Effort:** S

---

**BL-006** | Low | Business Logic | `prisma/schema.prisma:82–91`  
**`Supplier` has no unique constraint on name — duplicate suppliers can be created**  
No `@unique` on `Supplier.name`. The supplier list will accumulate duplicates over time.  
**Fix:** Add `name String @unique` or at minimum add a unique compound index on `(name, phone)`.  
**Effort:** S

---

**BL-007** | Low | Business Logic | `prisma/schema.prisma`  
**No `onDelete` cascade rules on child records**  
None of the `@relation` fields specify `onDelete`. Attempting to delete a Customer who has Sales, or a Brand that has Products, will throw a Prisma "foreign key constraint" error. The app has no graceful handling of this.  
**Fix:** Add `onDelete: Restrict` explicitly (to document the intent) and add user-facing error messages when a referenced delete is attempted.  
**Effort:** S

---

**PERF-005** | Low | Performance | `src/app/(admin)/admin/products/[id]/label/page.tsx:24`  
**Barcode font loaded from Google Fonts at print time — unreliable in offline/slow environments**  
`@import url('https://fonts.googleapis.com/css2?family=Libre+Barcode+128+Text...')` is inside a `<style>` tag. If Google Fonts is slow or unavailable, barcodes render as plain text. Staff in a shop with poor connectivity can't print labels.  
**Fix:** Self-host the Libre Barcode 128 font via `next/font/local`. The font file is small (<50kb).  
**Effort:** S

---

**INFRA-003** | Low | DevOps | `README.md`  
**README is `create-next-app` boilerplate — no project documentation**  
The README has zero project-specific content: no setup instructions, no env var list, no architecture diagram, no deployment steps, no seeding guide.  
**Fix:** Document: prerequisites, `.env.local` setup, `prisma db push` + seeding, admin user creation, deployment to Vercel + Supabase, key architecture decisions.  
**Effort:** S

---

**DEP-001** | Low | Dependencies | `package.json`  
**5 high-severity vulnerabilities in `eslint-config-next` dependency chain (`braces` package)**  
`npm audit` reports 5 high-severity issues in `braces → micromatch → fast-glob → @next/eslint-plugin-next → eslint-config-next`. These are in the dev dependency chain (linting only) and do not affect the production bundle. However they should be tracked.  
**Fix:** These are in a dev-only path. Monitor for an updated `eslint-config-next` that pulls in a fixed `braces`. Running `npm audit fix --force` would downgrade `eslint-config-next` to 14.x, which is not recommended.  
**Effort:** S

---

## 4. Top 10 Things to Fix First

| Priority | Issue | Why |
|---|---|---|
| 1 | **SEC-001** – Sales not in `$transaction` | Concurrent sales will oversell stock right now |
| 2 | **BL-001** – `Math.random()` invoice numbers | Collisions cause silent sale failures |
| 3 | **BL-002** – GST always 0 | Every printed invoice is legally non-compliant |
| 4 | **SEC-003** – `deleteProduct`/`toggleStock` have no auth check | Any staff can delete the entire catalog |
| 5 | **SEC-004** – XSS via JSON-LD `dangerouslySetInnerHTML` | Product with `</script>` in name = full XSS |
| 6 | **BL-003** – Middleware allowlist instead of deny-by-default | New admin routes are silently unprotected |
| 7 | **SEC-007** – IP spoof bypasses rate limits | Login brute-force protection is ineffective |
| 8 | **SEO-001** – Canonical URL points to wrong domain | Real domain split from staging, hurts SEO |
| 9 | **PERF-001** – Unbounded admin list queries | Will cause timeouts as data grows |
| 10 | **SEC-009** – STAFF can export all data via CSV | GDPR/PII leakage risk |

---

## 5. Missing Features vs. Typical Electronics Wholesale / ERP

| Category | What's Missing |
|---|---|
| **Invoicing** | GST breakdown (CGST/SGST/IGST), HSN codes, TCS on high-value sales, invoice amendment/credit note |
| **Inventory** | Barcode/QR scanner (browser camera or USB), minimum reorder level alerts, batch/serial tracking, warehouse/location management |
| **Purchasing** | Purchase return / debit note, supplier payment tracking, outstanding payables |
| **Sales** | Sale cancel/return/exchange with stock correction, credit note, EMI tracking, due payment reminders |
| **Customers** | Customer portal to view past orders, loyalty points, outstanding credit, payment history |
| **Quotations** | Expiry auto-mark via cron, email quotation PDF to customer |
| **Reporting** | Profit/margin reports, GST filing reports (GSTR-1 format), daily/weekly cash flow, category-wise P&L |
| **Staff** | Fine-grained permissions (e.g. STAFF can view but not delete), time-based access, activity log per staff |
| **Catalogue** | Product variants (different tonnage/capacity as one product), comparison feature, customer reviews |
| **Communication** | Email enquiry/invoice delivery (no email integration), WhatsApp Business API (currently just `wa.me` links) |
| **Security** | 2FA for admin accounts, IP allowlist for admin login, session management dashboard |
| **Operations** | Delivery tracking, installation job management, service/warranty management |

---

## 6. Free-Tier Risks

| Platform | Free Limit | Current Usage Pattern | Risk Level | When You Hit It |
|---|---|---|---|---|
| **Vercel Hobby** | 100GB bandwidth/mo, 100h function time/mo | ~50 page function invocations per visit | Low initially | Hit bandwidth at ~10k unique visitors/month with images served via Vercel |
| **Vercel Hobby** | 10s function timeout | Admin pages with unbounded queries | **HIGH** | Any admin list page with >500 records |
| **Vercel Hobby** | No background jobs / cron | Used for heavy reports | Medium | Report pages time out with large datasets |
| **Supabase Free** | 500MB storage, 2 CPU shared | Growing inventory + audit logs | Medium | Hit at ~200k audit log rows + product data |
| **Supabase Free** | 5GB bandwidth/mo | Public product page loads | Low | 5k product page views/day uses ~1GB |
| **Supabase Free** | Pauses after 7 days inactivity | Dev/staging databases | Low | Dev DB goes to sleep if not visited |
| **PgBouncer connection pooling** | 60 connections max (free) | Next.js serverless = new connection per request | **HIGH** | Vercel cold starts spike connections; add `connection_limit=1` to DATABASE_URL |
| **Image hosting** | None — images are external URLs | Images served from 3rd-party URLs | **HIGH** | External images may go offline; no CDN for product images |

**Immediate action required on:**
1. Add `?connection_limit=1&pool_timeout=20` to `DATABASE_URL` (PgBouncer) in Supabase. Serverless functions must use transaction mode pooling. Already using port 6543 but connection limit is not set.
2. Move product images to Cloudinary free tier (25GB storage, 25GB bandwidth) or Vercel Blob.
3. Add `maxDuration = 30` to heavy report pages to stay within Vercel's Pro limit (or upgrade from Hobby for long-running reports).

---

## 7. Phase-Wise Fix Plan

### Phase 1 — Critical Bugs and Security (1–2 weeks)

These can cause data corruption, legal non-compliance, or unauthorized access RIGHT NOW.

1. **Wrap sale and purchase creation in `$transaction`** — prevents overselling (SEC-001, SEC-002)
2. **Replace `Math.random()` invoice numbers with DB sequential counter** (BL-001)
3. **Implement GST calculation on sale creation** — add GST rate to Product, calculate CGST/SGST, update invoice template (BL-002)
4. **Add `getSession()` auth check to `deleteProduct`, `toggleStock`, and all admin Server Actions** (SEC-003)
5. **Fix XSS in JSON-LD output** — escape `<`, `>` in JSON.stringify result (SEC-004)
6. **Change middleware to deny-all `/admin/*` except `/admin/login`** — remove allowlist (BL-003)
7. **Fix rate limit IP spoofing** — use `request.ip` on Vercel edge (SEC-007)
8. **Add role check to all export CSV routes** (SEC-009)
9. **Fix canonical URL** in layout.tsx (SEO-001)
10. **Add database indexes** for filtered/sorted fields (DB-001)
11. **Add `connection_limit=1` to DATABASE_URL** for Supabase PgBouncer

### Phase 2 — Performance and Scalability (2–4 weeks)

12. **Paginate all admin list pages** (sales, purchases, quotations, customers, suppliers) at 50/page (PERF-001)
13. **Replace all `<img>` tags with `next/image`** — add remote patterns to config (PERF-002)
14. **Add `loading.tsx` and `error.tsx` to admin and public route groups** (UX-001)
15. **Add Content-Security-Policy header** (SEC-005)
16. **Implement session version / revocation** for staff role/deletion (SEC-008)
17. **Add sale cancel/return flow** with stock correction (BL-004)
18. **Soft-delete for products** instead of hard delete (BL-005)
19. **Self-host barcode font** on label page (PERF-005)
20. **Audit and reduce framer-motion bundle** (PERF-004)

### Phase 3 — Missing Features (4–8 weeks)

21. **Barcode / QR scanner** — use `@zxing/browser` or `html5-qrcode` for camera scan-to-view
22. **Product image upload** — integrate Cloudinary free tier
23. **GST-compliant invoicing** — HSN codes, GSTR-1 compatible CSV export
24. **Purchase return / debit note** flow
25. **Email delivery** — integrate Resend (free: 3000 emails/month) for invoices and quotations
26. **CAPTCHA on enquiry form** — Cloudflare Turnstile (free)
27. **Quotation auto-expiry** — Vercel cron job to mark expired quotations daily
28. **Stock reorder alerts** — minimum stock level per product, dashboard alert
29. **Fine-grained staff permissions** — expand beyond ADMIN/STAFF binary
30. **GST reports** — GSTR-1 monthly export

### Phase 4 — Polish, Monitoring, and DX (ongoing)

31. **Add CI/CD pipeline** — GitHub Actions: type-check + lint + test on every push (INFRA-002)
32. **Add Vitest unit tests** for business logic: `generateInvoiceNo`, GST calc, stock math (INFRA-001)
33. **Add Playwright E2E** for critical flows: login, create sale, verify stock decrement
34. **Set up Sentry free tier** — runtime error tracking in both admin and public app
35. **Add health check endpoint** — `/api/health` returning DB ping and version
36. **Set up Supabase automatic backups** — enable PITR or pg_dump cron (free tier has 1-day PITR)
37. **Rewrite README** with real setup, env var guide, architecture, deployment steps (INFRA-003)
38. **Add NEXTAUTH_URL env var rename** to avoid future confusion (SEC-011)
39. **Enum migration for `Enquiry.status`** (DB-002)
40. **Audit trailing `void logAudit(...)` calls** — ensure critical actions log synchronously

---

*This report was generated by static code analysis and manual review of all source files. Performance numbers (query times, Vercel usage) are projections based on code patterns, not from live load testing. A load test (k6 or autocannon) against a staging environment is recommended before go-live.*
