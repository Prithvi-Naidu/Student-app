# How to Start the App

## The Problem
Node 23.11.0 has compatibility issues with Next.js 14, causing extremely slow compilation and hangs.

## Quick Fix - Use Node 20 LTS

```bash
# 1. Install Node 20 (recommended LTS version)
brew install node@20

# 2. Switch to Node 20
brew unlink node
brew link --overwrite node@20

# 3. Verify
node -v  # Should show v20.x.x

# 4. Clean and restart
cd /Users/prithvisnaidu/Documents/GitHub/Student_App
rm -rf apps/web/.next
npm run dev
```

## Current Status (as of Feb 5, 2026 9:37 PM)

✅ **Backend API**: Running on http://localhost:4000 (verified working)
❌ **Frontend**: Hanging during Next.js compilation due to Node 23 issues

## What I Built for You

### RentCast Housing Integration
- ✅ Backend route: `/api/housing/search` with Redis caching
- ✅ Frontend page: `/housing` with live search
- ✅ API key configured in `apps/api/.env`
- ✅ Database port fixed (5432 → 5433)

### Files Created/Modified
1. `apps/api/src/routes/housing.ts` - RentCast API proxy with caching
2. `apps/web/app/housing/page.tsx` - Client search interface
3. `apps/api/.env` - Environment configuration
4. `apps/api/src/config/redis.ts` - Fixed Redis double-connection
5. `apps/api/src/index.ts` - Added housing router

## Once Node 20 is installed and app starts:

- Frontend: http://localhost:3000
- Backend: http://localhost:4000/health
- Housing search: http://localhost:3000/housing

