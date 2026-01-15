# OneStop Student Ecosystem

A comprehensive platform empowering international students to smoothly transition, integrate, and thrive in the U.S.

## Tech Stack

- **Frontend**: Next.js 14+ (React 18) with TypeScript, Tailwind CSS, shadcn/ui
- **Backend**: Node.js with Express + TypeScript
- **Database**: PostgreSQL 15+
- **Cache**: Redis
- **Storage**: Local filesystem (Phase 1), S3 (future)
- **Infrastructure**: Docker Compose (local), AWS/GCP (production)
- **Monorepo**: Turborepo with npm workspaces

## Project Structure

```
Student_App/
├── apps/
│   ├── web/                    # Next.js frontend
│   │   ├── app/               # App router pages
│   │   ├── components/        # React components
│   │   └── lib/               # Utilities, API clients
│   └── api/                   # Node.js backend API
│       ├── src/
│       │   ├── routes/        # API routes
│       │   ├── middleware/    # Error handling, multer
│       │   ├── config/        # Database, Redis config
│       │   └── utils/         # Logger, storage
│       └── __tests__/         # API tests
├── packages/
│   ├── shared/                # Shared types and utilities
│   └── database/              # Database migrations and schemas
├── infrastructure/
│   └── docker/                # Docker configs (future)
├── .github/
│   └── workflows/             # CI/CD pipelines
└── docker-compose.yml         # Local development services
```

## Getting Started

### Prerequisites

- Node.js >= 18.0.0 (use `.nvmrc` file)
- npm >= 9.0.0
- Docker and Docker Compose

### Installation

1. **Clone and install dependencies:**
```bash
npm install
```

2. **Start database services:**
```bash
npm run db:up
```

This starts PostgreSQL and Redis in Docker containers.

3. **Run database migrations:**
```bash
npm run db:migrate
```

This creates all necessary database tables.

4. **Set up environment variables:**

Create `.env` files in `apps/web` and `apps/api` with:
```env
# Database
DATABASE_URL=postgresql://onestop:onestop_dev_password@localhost:5433/onestop_db
POSTGRES_USER=onestop
POSTGRES_PASSWORD=onestop_dev_password
POSTGRES_DB=onestop_db

# Redis
POSTGRES_HOST=localhost
POSTGRES_PORT=5433

REDIS_URL=redis://localhost:6379

# API
API_PORT=4000
NODE_ENV=development

# Frontend (apps/web/.env.local)
NEXT_PUBLIC_API_URL=http://localhost:4000
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Authentication (NextAuth.js)
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=<generate-secret-32-chars-minimum>
DATABASE_URL=postgresql://onestop:onestop_dev_password@localhost:5433/onestop_db

# OAuth Providers (see docs/oauth-setup-guide.md for setup instructions)
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
GITHUB_CLIENT_ID=
GITHUB_CLIENT_SECRET=
APPLE_CLIENT_ID=
APPLE_CLIENT_SECRET=
APPLE_TEAM_ID=
APPLE_KEY_ID=
MICROSOFT_CLIENT_ID=
MICROSOFT_CLIENT_SECRET=
MICROSOFT_TENANT_ID=common
```

5. **Start development servers:**
```bash
npm run dev
```

This starts both frontend and backend concurrently.

The application will be available at:
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:4000
- **API Health Check**: http://localhost:4000/health

## Available Features (Phase 1)

### ✅ Completed Modules

1. **Housing Finder** (`/housing`)
   - Listings CRUD operations
   - Search and filter by location, price
   - API endpoints: `/api/listings`

2. **Community Forum** (`/forum`)
   - Post creation and discussion
   - Comments and upvoting
   - Category filtering
   - API endpoints: `/api/forum`

3. **Banking Guidance** (`/banking`)
   - Resource articles and guides
   - Video content support
   - Partner bank listings
   - API endpoints: `/api/banking`

4. **Document Vault** (`/vault`)
   - Secure document upload
   - Document expiration tracking
   - Local file storage
   - API endpoints: `/api/documents`

5. **Survey Rewards** (`/surveys`)
   - Survey listings
   - Points system
   - API endpoints: `/api/surveys`

## Development Commands

### Root Level
- `npm run dev` - Start all services in development mode
- `npm run build` - Build all packages
- `npm run lint` - Lint all packages
- `npm run test` - Run all tests
- `npm run clean` - Clean build artifacts

### Database
- `npm run db:up` - Start PostgreSQL and Redis
- `npm run db:down` - Stop database services
- `npm run db:reset` - Reset database (WARNING: deletes all data)
- `npm run db:migrate` - Run database migrations

### Individual Packages
- `cd apps/web && npm run dev` - Start only frontend
- `cd apps/api && npm run dev` - Start only backend
- `cd apps/web && npm run test` - Test frontend
- `cd apps/api && npm run test` - Test backend

## API Endpoints

### Health
- `GET /health` - Health check

### Listings
- `GET /api/listings` - Get all listings (with filters)
- `GET /api/listings/:id` - Get single listing
- `POST /api/listings` - Create listing
- `PUT /api/listings/:id` - Update listing
- `DELETE /api/listings/:id` - Delete listing

### Forum
- `GET /api/forum/posts` - Get all posts
- `GET /api/forum/posts/:id` - Get single post with comments
- `POST /api/forum/posts` - Create post
- `POST /api/forum/posts/:id/comments` - Add comment
- `POST /api/forum/posts/:id/upvote` - Upvote post

### Banking
- `GET /api/banking/resources` - Get all resources
- `GET /api/banking/resources/:slug` - Get single resource
- `GET /api/banking/categories` - Get categories
- `POST /api/banking/resources` - Create resource (admin)

### Documents
- `GET /api/documents` - Get all documents
- `GET /api/documents/:id` - Get single document
- `POST /api/documents` - Upload document (multipart/form-data)
- `GET /api/documents/:id/download` - Download document
- `DELETE /api/documents/:id` - Delete document
- `GET /api/documents/expiring/soon` - Get expiring documents

### Surveys
- `GET /api/surveys` - Get all surveys
- `GET /api/surveys/:id` - Get single survey
- `POST /api/surveys` - Create survey (admin)

## Phase 1 Status

✅ **Completed**
- [x] Project Setup & Infrastructure
- [x] Housing Finder Module
- [x] Community Forum
- [x] Banking Guidance
- [x] Digital Vault
- [x] Survey Rewards
- [x] Modern UI/UX Design System
- [x] Testing Infrastructure

⏳ **Deferred to Later Phase**
- [ ] Authentication System (moved to Phase 2)

## Next Steps

1. **Connect Frontend to Backend**: Update API client calls in frontend components
2. **Add Authentication**: Implement user registration/login (Phase 2)
3. **Add File Upload**: Complete document upload functionality
4. **Add More Tests**: Expand test coverage
5. **Deploy to Staging**: Set up cloud deployment

## Testing

Run tests for all packages:
```bash
npm run test
```

Run tests for specific package:
```bash
cd apps/api && npm test
cd apps/web && npm test
```

## Contributing

1. Create a feature branch
2. Make your changes
3. Run tests and linting
4. Submit a pull request

## License

Private - All rights reserved

