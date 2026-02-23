# Deploy to Vercel (Single Service - Free)

Deploy the entire app (frontend + API) to Vercel with Neon for the database. All free tier.

## Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    VERCEL (single deploy)                │
│  ┌─────────────────────┐  ┌─────────────────────────┐   │
│  │   Next.js frontend   │  │  Express API via        │   │
│  │   (pages, UI, auth)  │  │  /api/* serverless     │   │
│  └─────────────────────┘  └─────────────────────────┘   │
└─────────────────────────────────────────────────────────┘
                              │
                              ▼
                    ┌─────────────────┐
                    │  Neon (Postgres) │  ← free tier
                    └─────────────────┘
```

## Prerequisites

- GitHub repo
- [Vercel](https://vercel.com) account
- [Neon](https://neon.tech) account (free PostgreSQL)

## Steps

### 1. Create Neon Database

1. Go to [console.neon.tech](https://console.neon.tech) → New project
2. Copy the connection string → you'll add it as `DATABASE_URL` in Vercel

### 2. Run Migrations

From your local machine (with `DATABASE_URL` set to your Neon URL):

```bash
DATABASE_URL="postgresql://..." npm run db:migrate
```

### 3. Deploy to Vercel

1. Go to [vercel.com/new](https://vercel.com/new)
2. Import your GitHub repo
3. **Root Directory**: leave default (repo root)
4. **Framework**: Next.js (auto-detected from `vercel.json`)
5. **Build Command**: `npx turbo run build --filter=@onestop/web` (or use default from vercel.json)
6. **Output Directory**: `apps/web/.next`
7. **Install Command**: `npm install`

### 4. Environment Variables (Vercel Dashboard)

Add these in Project Settings → Environment Variables:

| Name | Value | Environment |
|------|-------|-------------|
| `DATABASE_URL` | Your Neon connection string | Production, Preview |
| `NEXTAUTH_URL` | `https://your-app.vercel.app` | Production |
| `NEXTAUTH_URL` | `https://your-preview-xxx.vercel.app` | Preview |
| `NEXTAUTH_SECRET` | Generate with `openssl rand -base64 32` | Both |
| `NEXT_PUBLIC_API_URL` | Leave **empty** (same-origin) | Both |
| `RENTCAST_API_KEY` | Your RentCast key (optional) | Both |

**OAuth (optional)** - add if using Google/GitHub sign-in:
- `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`
- `GITHUB_CLIENT_ID`, `GITHUB_CLIENT_SECRET`
- etc. (see docs/oauth-setup-guide.md)

### 5. Deploy

Click Deploy. The build will:
1. Install dependencies
2. Build the API package
3. Build the Next.js app (including the Express API as serverless at `/api/*`)

### 6. OAuth Callback URLs

If using OAuth, add to your provider's allowed redirect URIs:
- `https://your-app.vercel.app/api/auth/callback/google`
- `https://your-app.vercel.app/api/auth/callback/github`
- etc.

## Notes

- **Same-origin API**: With `NEXT_PUBLIC_API_URL` empty, API calls go to the same domain (no CORS)
- **Redis**: Not used in current routes; can be skipped
- **Cold starts**: API routes may have ~1–2s cold start on first request
- **File uploads**: Vercel has a 4.5 MB body limit for serverless; large uploads may need R2 presigned URLs
