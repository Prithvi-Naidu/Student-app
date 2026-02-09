# OneStop Student Ecosystem - Product Requirements Document

## Original Problem Statement
Review, test, and ensure the Student App (https://github.com/Prithvi-Naidu/Student-app/tree/Test-branch) follows industry-grade standards with focus on:
- Full functionality testing
- Security and authentication
- Performance optimization
- Code quality and best practices

## Project Overview
OneStop Student Ecosystem is a comprehensive platform empowering international students to smoothly transition, integrate, and thrive in the U.S.

## Tech Stack
- **Frontend**: Next.js 14 (React 18) with TypeScript, Tailwind CSS, shadcn/ui
- **Backend**: Node.js with Express + TypeScript
- **Database**: PostgreSQL 15
- **Cache**: Redis
- **Authentication**: NextAuth.js with Google OAuth
- **Cloud Storage**: Cloudflare R2
- **External APIs**: RentCast for real housing listings
- **Security**: Rate limiting, Helmet.js, CORS
- **Monorepo**: Turborepo with npm workspaces

## What's Been Implemented

### Session 1: Initial Review & Setup (2026-02-09)
- [x] Cloned repository and set up environment
- [x] Installed PostgreSQL and Redis
- [x] Ran all 14 database migrations successfully
- [x] Enabled all API routes (were previously commented out)
- [x] Fixed auth configuration to work without OAuth providers
- [x] Set up Next.js API proxy for browser-to-API communication
- [x] Seeded test data (4 listings, 3 surveys, 12 forum posts, 3 banking articles)

### Session 2: Integrations (2026-02-09)
- [x] **Google OAuth** - Fully working, redirects to Google login
- [x] **RentCast API** - Returns 50 real Boston listings with prices, beds, baths, sqft
- [x] **Cloudflare R2** - Document upload working, tested with PDF

### Session 3: Production Features (2026-02-09)
- [x] **Rate Limiting** - Implemented for all API endpoints:
  - General: 100 requests/minute
  - Search (RentCast): 30 requests/minute
  - Upload: 20 requests/minute
  - Auth: 10 requests/minute
- [x] **Save Search Feature** - Users can save housing search criteria with:
  - Custom name for each saved search
  - Location, price range filters
  - Email notifications toggle
  - In-app notifications toggle
  - Active/Paused state management
  - Quick apply to re-run saved searches
- [x] **UI Components** - Added Switch and Dialog components for Save Search modal
- [x] **Data-testid Attributes** - Added to all key interactive elements

## Test Results (100% Pass Rate)
| Category | Status | Details |
|----------|--------|---------|
| Backend APIs | ✅ 17/17 | All endpoints working |
| Frontend | ✅ 100% | All pages functional |
| Google OAuth | ✅ Working | Redirects to accounts.google.com |
| RentCast | ✅ Working | 50 listings from Boston search |
| Cloudflare R2 | ✅ Working | PDF upload tested |
| Rate Limiting | ✅ Active | Headers: RateLimit-*, X-RateLimit-* |
| Save Search | ✅ Working | CRUD operations tested |

## API Endpoints
| Endpoint | Method | Rate Limit | Description |
|----------|--------|------------|-------------|
| /health | GET | 100/min | Health check |
| /api/listings | GET/POST | 100/min | Local housing listings |
| /api/housing/search | GET | 30/min | RentCast API proxy |
| /api/forum/posts | GET/POST | 100/min | Forum posts |
| /api/banking/resources | GET | 100/min | Banking articles |
| /api/documents | GET/POST | 20/min | Document management (R2) |
| /api/surveys | GET | 100/min | Survey listings |
| /api/roommates/* | ALL | 100/min | Roommate matching |
| /api/saved-searches | GET/POST/PUT/DELETE | 100/min | Saved search management |

## Configured Credentials
| Service | Status | Notes |
|---------|--------|-------|
| Google OAuth | ✅ | Client ID: 985569...apps.googleusercontent.com |
| RentCast API | ✅ | 44a9581... |
| Cloudflare R2 | ✅ | Bucket: onestop-documents |
| PostgreSQL | ✅ | Local instance |
| Redis | ✅ | Local cache |

## Architecture
```
/app/student-app-repo/
├── apps/
│   ├── web/                 # Next.js 14 frontend (port 3001)
│   │   ├── app/             # App router pages
│   │   ├── components/      # React components
│   │   │   ├── housing/     # Save Search components
│   │   │   └── ui/          # shadcn/ui + Dialog, Switch
│   │   └── lib/             # Utilities, API client
│   └── api/                 # Express backend (port 4000)
│       ├── src/routes/      # API routes + saved-searches
│       ├── src/middleware/  # Auth, rate-limit, error handling
│       └── src/config/      # DB, Redis, R2 config
├── packages/
│   ├── shared/              # Shared types
│   └── database/            # 15 migrations
└── docker-compose.yml       # Local services
```

## Security Features
- ✅ Helmet.js for HTTP security headers
- ✅ CORS configured for frontend origin
- ✅ Rate limiting on all API endpoints
- ✅ Parameterized SQL queries (no injection)
- ✅ OAuth 2.0 with PKCE for authentication
- ✅ File type validation for uploads
- ✅ Request size limits (10MB max)

## Remaining Backlog

### P1 (High Priority)
- [ ] Add GitHub, Apple, Microsoft OAuth providers
- [ ] Email notification service for saved searches (SendGrid/Resend)
- [ ] Background job for checking new listings against saved searches

### P2 (Medium Priority)
- [ ] Add housing listing creation UI for landlords
- [ ] Implement survey completion and points redemption
- [ ] Real-time notifications via WebSockets

### P3 (Future)
- [ ] Mobile app (React Native)
- [ ] Chat between roommate matches
- [ ] Payment processing for premium features
- [ ] Multi-language support
