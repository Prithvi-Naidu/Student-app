# Quick Deploy Guide – Vercel + Railway

Fast setup for dev and prod.

---

## Prerequisites

- GitHub repo pushed
- Accounts: [Vercel](https://vercel.com), [Railway](https://railway.app), [Neon](https://neon.tech), [Upstash](https://upstash.com)

---

## 1. Deploy Frontend (Vercel)

1. Go to [vercel.com/new](https://vercel.com/new)
2. Import your GitHub repo
3. **Root Directory**: leave default (repo root)
4. **Framework**: Next.js (auto-detected)
5. **Build settings** (from `vercel.json`):
   - Build Command: `npx turbo run build --filter=@onestop/web`
   - Output Directory: `apps/web/.next`
   - Install Command: `npm install`

6. **Environment variables** (add in Vercel dashboard):

   | Name | Value | Environment |
   |------|-------|-------------|
   | `NEXT_PUBLIC_API_URL` | `https://your-api-dev.up.railway.app` | Preview |
   | `NEXT_PUBLIC_API_URL` | `https://your-api.up.railway.app` | Production |
   | `NEXTAUTH_URL` | `https://your-app.vercel.app` | Production |
   | `NEXTAUTH_URL` | `https://your-preview-xxx.vercel.app` | Preview |
   | `NEXTAUTH_SECRET` | (generate with `openssl rand -base64 32`) | Both |

7. Deploy.

**Dev vs Prod:**

- **Production**: deploys from `main`
- **Preview**: deploys from other branches and PRs
- Use different `NEXT_PUBLIC_API_URL` for Production vs Preview

---

## 2. Deploy API (Railway)

1. Go to [railway.app](https://railway.app) → New Project
2. Deploy from GitHub → select repo
3. Add service → **Empty Service** or **Deploy from GitHub**
4. Configure:
   - **Root Directory**: `apps/api`
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `npm start`
   - **Watch Paths**: `apps/api/**`

5. Add **PostgreSQL** and **Redis** (or use Neon + Upstash)

6. **Environment variables**:

   | Name | Value |
   |------|-------|
   | `DATABASE_URL` | From Neon or Railway PostgreSQL |
   | `REDIS_URL` | From Upstash or Railway Redis |
   | `RENTCAST_API_KEY` | Your RentCast key |
   | `FRONTEND_URL` | `https://your-app.vercel.app` (for CORS) |
   | `NODE_ENV` | `production` |

7. Deploy and copy the public URL (e.g. `https://xxx.up.railway.app`).

**Two environments:**

- Create two Railway projects: `onestop-api-dev`, `onestop-api-prod`
- Or use one project with different env vars per branch

---

## 3. Database (Neon)

1. [console.neon.tech](https://console.neon.tech) → New project
2. Copy connection string → `DATABASE_URL` in Railway
3. Run migrations: `npm run db:migrate` (from repo, with `DATABASE_URL` set)

---

## 4. Redis (Upstash)

1. [console.upstash.com](https://console.upstash.com) → Create database
2. Copy `REDIS_URL` → add to Railway env vars

---

## 5. CORS

In `apps/api`, CORS uses `FRONTEND_URL`. Set it to your Vercel URL(s), e.g.:

- `https://your-app.vercel.app`
- `https://*.vercel.app` (if your API supports wildcard)

---

## Summary

| Step | Action |
|------|--------|
| 1 | Deploy web to Vercel, set env vars |
| 2 | Deploy API to Railway, set env vars |
| 3 | Create Neon DB, run migrations |
| 4 | Create Upstash Redis |
| 5 | Set `NEXT_PUBLIC_API_URL` in Vercel to Railway API URL |
| 6 | Set `FRONTEND_URL` in Railway to Vercel URL |
