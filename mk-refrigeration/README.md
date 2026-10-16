# MK Refrigeration — Store & ERP

Full-stack Next.js application for MK Refrigeration, Bharuch. Public storefront + admin ERP panel for sales, purchases, inventory, quotations, and enquiries.

## Tech stack

- **Next.js 15** App Router (Server Components, Server Actions)
- **Prisma 5** + PostgreSQL (Supabase)
- **Tailwind CSS** (Material Design 3 tokens)
- **Custom JWT auth** (`jose` — no NextAuth dependency)

## Prerequisites

- Node.js 20+
- A PostgreSQL database (Supabase recommended)

## Local setup

```bash
# 1. Install dependencies
npm install

# 2. Copy and fill in environment variables
cp .env.example .env.local

# 3. Push schema to database and seed initial admin
npx prisma db push
npx prisma db seed   # creates default admin user (see prisma/seed.ts)

# 4. Start dev server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) for the storefront.  
Admin panel: [http://localhost:3000/admin/login](http://localhost:3000/admin/login)

## Environment variables

See `.env.example` for all variables. Required:

| Variable | Description |
|---|---|
| `DATABASE_URL` | Supabase pooler URL (with `?pgbouncer=true`) |
| `DIRECT_URL` | Supabase direct URL (for migrations) |
| `SESSION_SECRET` | Random 32-byte base64 string — `openssl rand -base64 32` |

Optional:

| Variable | Description |
|---|---|
| `NTFY_TOPIC` | [ntfy.sh](https://ntfy.sh) topic for new enquiry push notifications |
| `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME` | Cloudinary cloud name (product image uploads) |
| `CLOUDINARY_API_KEY` / `CLOUDINARY_API_SECRET` | Cloudinary credentials |

## Schema migrations

This project uses `prisma db push` (no migration history). After schema changes:

```bash
npx prisma db push
npx prisma generate
```

## Deployment (Vercel)

1. Set all environment variables in the Vercel dashboard
2. Add a build command override if needed: `npx prisma generate && next build`
3. Push to `main` — Vercel auto-deploys

## Project structure

```
src/
  app/
    (public)/          # Public storefront (/, /products, /categories, /brands, /contact…)
    (admin)/admin/     # Protected admin ERP panel
    api/admin/         # API routes (CSV exports)
  actions/             # Server Actions (sales, purchases, products, enquiries…)
  lib/                 # Shared utilities (db, session, audit, rate-limit, utils)
prisma/
  schema.prisma        # Database schema
```
