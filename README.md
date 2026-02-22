# OneStop Student Ecosystem

A comprehensive platform empowering international students to smoothly transition, integrate, and thrive in the U.S.

## Tech Stack

- **Frontend**: Next.js 14+ (React 18) with TypeScript, Tailwind CSS, shadcn/ui
- **Backend**: Node.js with Express + TypeScript
- **Database**: PostgreSQL 15+
- **Cache**: Redis
- **Storage**: Local filesystem, Cloudflare R2 (S3-compatible) for document vault
- **Infrastructure**: Docker Compose (local), Vercel + Railway (production)
- **Monorepo**: Turborepo with npm workspaces

## Project Structure

```
Student-app/
├── apps/
│   ├── web/                    # Next.js frontend
│   │   ├── app/               # App router pages
│   │   ├── components/        # React components
│   │   └── lib/               # Utilities, API clients, auth
│   └── api/                   # Node.js backend API
│       ├── src/
│       │   ├── routes/        # API routes
│       │   ├── middleware/   # Error handling, multer, auth
│       │   ├── config/        # Database, Redis, R2 config
│       │   └── utils/         # Logger, storage, encryption
│       └── __tests__/         # API tests
├── packages/
│   ├── shared/                # Shared types and utilities
│   └── database/              # Database migrations and schemas
├── docs/                      # Documentation
├── docker-compose.yml         # Local development (PostgreSQL, Redis)
└── vercel.json                # Vercel deployment config
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

Create `.env` files in `apps/web` (as `.env.local`) and `apps/api` with:
```env
# Database
DATABASE_URL=postgresql://onestop:onestop_dev_password@localhost:5433/onestop_db
POSTGRES_USER=onestop
POSTGRES_PASSWORD=onestop_dev_password
POSTGRES_DB=onestop_db
POSTGRES_HOST=localhost
POSTGRES_PORT=5433

# Redis
REDIS_URL=redis://localhost:6379

# API
API_PORT=4000
NODE_ENV=development

# RentCast (Housing search - get key at https://app.rentcast.io/app/api)
RENTCAST_API_KEY=

# Frontend (apps/web/.env.local)
NEXT_PUBLIC_API_URL=http://localhost:4000
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Authentication (NextAuth.js)
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=<generate-secret-32-chars-minimum>

# OAuth Providers (see docs/oauth-setup-guide.md for setup instructions)
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
GITHUB_CLIENT_ID=
GITHUB_CLIENT_SECRET=
APPLE_CLIENT_ID=
APPLE_CLIENT_SECRET=
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

For a condensed setup guide, see [QUICKSTART.md](QUICKSTART.md).

## Available Features

### Completed Modules

1. **Housing Finder** (`/housing`)
   - Listings CRUD operations
   - RentCast API integration for rental search
   - Search and filter by location, price, bedrooms
   - API endpoints: `/api/listings`, `/api/housing`

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
   - Cloud storage (Cloudflare R2)
   - Server-side encryption (AES-256-GCM)
   - Document expiration tracking
   - DigiLocker integration (planned)
   - API endpoints: `/api/documents`

5. **Survey Rewards** (`/surveys`)
   - Survey listings
   - Points system
   - API endpoints: `/api/surveys`

6. **Authentication**
   - NextAuth.js with PostgreSQL adapter
   - OAuth providers: Google, GitHub, Apple, Microsoft
   - Session management
   - Protected routes (e.g. `/dashboard`)
   - Sign-in page at `/signin`

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
- `cd apps/web && npm test` - Test frontend
- `cd apps/api && npm test` - Test backend

## API Endpoints

### Health
- `GET /health` - Health check
- `GET /api` - API info

### Listings
- `GET /api/listings` - Get all listings (with filters)
- `GET /api/listings/:id` - Get single listing
- `POST /api/listings` - Create listing
- `PUT /api/listings/:id` - Update listing
- `DELETE /api/listings/:id` - Delete listing

### Housing (RentCast)
- `GET /api/housing/rentals` - Search rental listings (query: city, state, zipCode, bedrooms, minPrice, maxPrice, limit, offset)
- `GET /api/housing/rentals/:id` - Get single rental listing

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
- `POST /api/documents` - Upload document (multipart/form-data; supports `use_cloud_storage`, `encrypt`)
- `GET /api/documents/:id/download` - Download document
- `DELETE /api/documents/:id` - Delete document
- `GET /api/documents/expiring/soon` - Get expiring documents

### Surveys
- `GET /api/surveys` - Get all surveys
- `GET /api/surveys/:id` - Get single survey
- `POST /api/surveys` - Create survey (admin)

## Deployment

Deploy the frontend to Vercel and the API to Railway. See [docs/DEPLOY.md](docs/DEPLOY.md) for a step-by-step guide.

## Testing

Run tests for all packages:
```bash
npm run test
```

Run tests for a specific package:
```bash
cd apps/api && npm test
cd apps/web && npm test
```

## Documentation

- [QUICKSTART.md](QUICKSTART.md) - Condensed setup guide
- [docs/DEPLOY.md](docs/DEPLOY.md) - Deployment (Vercel + Railway)
- [docs/oauth-setup-guide.md](docs/oauth-setup-guide.md) - OAuth provider setup
- [IMPLEMENTATION_STATUS.md](IMPLEMENTATION_STATUS.md) - Document vault implementation details

## Contributing

1. Create a feature branch
2. Make your changes
3. Run tests and linting
4. Submit a pull request

## License

Private - All rights reserved
