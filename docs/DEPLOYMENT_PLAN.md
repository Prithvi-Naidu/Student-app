# OneStop Student Ecosystem – Vercel Deployment Plan

Deployment strategy for **dev** and **prod** environments on Vercel and supporting services.

---

## Architecture Overview

| Component | Local | Dev (Preview) | Prod |
|-----------|-------|---------------|------|
| **Frontend** (Next.js) | localhost:3000 | Vercel Preview | Vercel Production |
| **API** (Express) | localhost:4000 | Railway / Render | Railway / Render |
| **PostgreSQL** | Docker | Neon / Supabase / Railway | Neon / Supabase / Railway |
| **Redis** | Docker | Upstash | Upstash |

**Why split frontend and API?**  
Vercel is built for Next.js and serverless. The Express API uses long-lived connections (PostgreSQL, Redis) and is better hosted on a platform like Railway or Render.

---

## Option A: Recommended Setup

### 1. Frontend → Vercel (Dev + Prod)

- **Production**: Deploy from `main` branch
- **Dev/Preview**: Deploy from other branches and PRs

**Vercel configuration:**

- Root directory: `apps/web` (or monorepo root with `vercel.json`)
- Build command: `cd ../.. && npm run build --filter=@onestop/web`
- Output directory: `apps/web/.next`

### 2. API → Railway (or Render)

- **Production**: `api.onestop.example.com` (or `onestop-api.up.railway.app`)
- **Dev**: `api-dev.onestop.example.com` or separate Railway project

### 3. Database → Neon or Supabase

- **Prod**: One PostgreSQL instance
- **Dev**: Separate database or branch (Neon supports branching)

### 4. Redis → Upstash

- Serverless Redis, works well with Vercel and Railway
- Create separate dev and prod databases

---

## Step-by-Step Implementation

### Phase 1: Vercel (Frontend)

1. **Connect repo to Vercel**
   - Import the GitHub repo
   - Choose the monorepo root

2. **Configure project**
   - Framework: Next.js
   - Root directory: `apps/web`
   - Build command: `npm run build` (run from `apps/web`)
   - Install command: `npm install` (from repo root for workspaces)

3. **Environment variables (Vercel)**
   - `NEXT_PUBLIC_API_URL` → API base URL (dev vs prod)
   - `NEXTAUTH_URL` → Vercel deployment URL
   - `NEXTAUTH_SECRET`
   - OAuth provider credentials

4. **Dev vs Prod**
   - Production: `main` branch
   - Preview: other branches and PRs
   - Use different `NEXT_PUBLIC_API_URL` per environment

### Phase 2: API Hosting (Railway or Render)

**Railway:**

1. Create project → Deploy from GitHub
2. Root: `apps/api`
3. Build: `npm install && npm run build`
4. Start: `npm start` (or `node dist/index.js`)
5. Add PostgreSQL and Redis plugins, or use external services

**Render:**

1. New Web Service → Connect repo
2. Root directory: `apps/api`
3. Build: `npm install && npm run build`
4. Start: `npm start`
5. Add PostgreSQL and Redis from Render dashboard

**Dev vs Prod:**

- **Option 1**: Two separate Railway/Render projects (dev + prod)
- **Option 2**: One project with two services (e.g. `onestop-api-dev`, `onestop-api-prod`)

### Phase 3: Database (Neon or Supabase)

**Neon (PostgreSQL):**

1. Create project at [neon.tech](https://neon.tech)
2. Create branches: `main` (prod), `dev` (dev)
3. Copy connection strings into API env vars

**Supabase:**

1. Create project at [supabase.com](https://supabase.com)
2. Use project URL and anon key for API
3. Create a second project for dev if needed

### Phase 4: Redis (Upstash)

1. Create account at [upstash.com](https://upstash.com)
2. Create two Redis databases: `onestop-dev`, `onestop-prod`
3. Set `REDIS_URL` in API env vars

---

## Environment Variables Summary

### Vercel (apps/web)

| Variable | Dev | Prod |
|----------|-----|------|
| `NEXT_PUBLIC_API_URL` | `https://onestop-api-dev.up.railway.app` | `https://onestop-api.up.railway.app` |
| `NEXTAUTH_URL` | `https://onestop-dev.vercel.app` | `https://onestop.vercel.app` |
| `NEXTAUTH_SECRET` | (same or different) | (same or different) |
| OAuth credentials | Dev app credentials | Prod app credentials |

### API (Railway/Render)

| Variable | Dev | Prod |
|----------|-----|------|
| `DATABASE_URL` | Neon dev branch URL | Neon prod URL |
| `REDIS_URL` | Upstash dev | Upstash prod |
| `RENTCAST_API_KEY` | (shared) | (shared) |
| `API_PORT` | `4000` | `4000` |
| `FRONTEND_URL` | `https://onestop-dev.vercel.app` | `https://onestop.vercel.app` |

---

## Files to Add/Update

### 1. `vercel.json` (repo root) ✅

Already created at project root:

```json
{
  "buildCommand": "npx turbo run build --filter=@onestop/web",
  "outputDirectory": "apps/web/.next",
  "installCommand": "npm install",
  "framework": "nextjs"
}
```

### 2. Monorepo build

Vercel needs to install from root for workspaces. Set in Vercel:

- **Root Directory**: (leave empty for repo root)
- **Build Command**: `npm run build --workspace=@onestop/web` or `cd apps/web && npm run build`
- **Output Directory**: `apps/web/.next`
- **Install Command**: `npm install`

### 3. API for production

- Ensure `apps/api` has a `start` script
- Set `NODE_ENV=production` in Railway/Render
- Run migrations before first deploy (or as a release command)

---

## Dev vs Prod: Two Deployment Strategies

### Strategy 1: Vercel Branches (Simpler)

- **Production**: `main` → `onestop.vercel.app`
- **Preview/Dev**: `develop` or PRs → `onestop-git-develop-xxx.vercel.app`
- Use Vercel’s environment variables: Production vs Preview
- API: One Railway project with two env groups (prod vs preview)

### Strategy 2: Two Vercel Projects (Isolated)

- **Project 1**: `onestop-prod` → `main`, `onestop.vercel.app`
- **Project 2**: `onestop-dev` → `develop`, `onestop-dev.vercel.app`
- **API**: Two Railway projects: `onestop-api-prod`, `onestop-api-dev`
- Clear separation between dev and prod

---

## Checklist

- [ ] Create Vercel account, connect repo
- [ ] Configure Vercel project (root, build, output)
- [ ] Add Vercel env vars (dev + prod)
- [ ] Create Railway/Render account, deploy API
- [ ] Create Neon/Supabase project(s)
- [ ] Create Upstash Redis database(s)
- [ ] Add API env vars (DB, Redis, RentCast, etc.)
- [ ] Run database migrations on prod
- [ ] Configure CORS on API for Vercel domains
- [ ] Test dev deployment
- [ ] Test prod deployment
- [ ] Set up custom domains (optional)

---

## Cost Estimate (Approximate)

| Service | Free Tier | Paid |
|---------|-----------|------|
| Vercel | 100GB bandwidth, unlimited previews | Pro $20/mo |
| Railway | $5 credit/mo | ~$5–20/mo for API + DB |
| Neon | 0.5 GB storage | ~$19/mo |
| Upstash | 10K commands/day | Pay per use |
| **Total** | **~$0–5/mo** | **~$50–60/mo** |

---

## Next Steps

1. Add `vercel.json` for correct monorepo build
2. Ensure API `start` script works for production
3. Document exact Vercel project settings
4. Add a `DEPLOY.md` with copy-paste commands and URLs
