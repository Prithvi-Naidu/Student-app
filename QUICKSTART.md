# Quick Start Guide

Follow these steps to run the OneStop Student Ecosystem locally:

## Prerequisites Check

Make sure you have:
- ✅ Node.js >= 18.0.0
- ✅ npm >= 9.0.0  
- ✅ Docker and Docker Compose installed

## Step-by-Step Setup

### 1. Install Dependencies

```bash
npm install
```

This installs all dependencies for the monorepo (frontend, backend, and shared packages).

### 2. Start Database Services

```bash
npm run db:up
```

This starts PostgreSQL and Redis in Docker containers. Wait a few seconds for them to be ready.

### 3. Run Database Migrations

```bash
npm run db:migrate
```

This creates all necessary database tables.

### 4. Create Environment Files

**For the API** (`apps/api/.env`):
```env
DATABASE_URL=postgresql://onestop:onestop_dev_password@localhost:5432/onestop_db
POSTGRES_USER=onestop
POSTGRES_PASSWORD=onestop_dev_password
POSTGRES_DB=onestop_db
POSTGRES_HOST=localhost
POSTGRES_PORT=5432

REDIS_URL=redis://localhost:6379
REDIS_HOST=localhost
REDIS_PORT=6379

API_PORT=4000
API_URL=http://localhost:4000
NODE_ENV=development

STORAGE_PATH=./storage/uploads
STORAGE_MAX_SIZE=10485760
STORAGE_ALLOWED_TYPES=image/jpeg,image/png,image/webp,application/pdf

LOG_LEVEL=debug
```

**For the Frontend** (`apps/web/.env.local`):
```env
NEXT_PUBLIC_API_URL=http://localhost:4000
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 5. Start Development Servers

```bash
npm run dev
```

This starts both the frontend (Next.js) and backend (Express API) concurrently.

## Access the Application

Once everything is running:

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:4000
- **API Health Check**: http://localhost:4000/health

## Troubleshooting

### Database Connection Issues

If you get database connection errors:
1. Check if Docker containers are running: `docker ps`
2. Restart containers: `npm run db:down && npm run db:up`
3. Wait 10-15 seconds for PostgreSQL to fully start

### Port Already in Use

If ports 3000 or 4000 are already in use:
- Change `API_PORT` in `apps/api/.env`
- Change Next.js port: `cd apps/web && PORT=3001 npm run dev`

### Redis Connection Errors

Redis connection errors won't stop the app from running (it's optional for Phase 1), but you can:
1. Check Redis container: `docker ps | grep redis`
2. Restart: `docker restart onestop-redis`

## Useful Commands

- `npm run dev` - Start all services
- `npm run build` - Build all packages
- `npm run lint` - Lint all code
- `npm run test` - Run all tests
- `npm run db:up` - Start databases
- `npm run db:down` - Stop databases
- `npm run db:reset` - Reset databases (⚠️ deletes all data)

## Next Steps

Once running, you can:
1. Visit http://localhost:3000 to see the landing page
2. Test API endpoints at http://localhost:4000/api
3. Check the README.md for API documentation

