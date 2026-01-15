# User Data Management in OneStop Student Ecosystem

## Overview

OneStop uses **NextAuth.js v5** with **PostgreSQL adapter** for authentication and user management. User information is stored in the database and managed through NextAuth.js sessions.

## Database Schema

### Users Table (`users`)
Stores basic user profile information:
- `id` (TEXT, PRIMARY KEY) - Unique user identifier
- `email` (VARCHAR, UNIQUE) - User's email address (from OAuth provider)
- `name` (VARCHAR) - User's display name (from OAuth provider)
- `image` (TEXT) - Profile picture URL (from OAuth provider)
- `emailVerified` (TIMESTAMP) - When email was verified
- `created_at` (TIMESTAMP) - Account creation date
- `updated_at` (TIMESTAMP) - Last update date

### Accounts Table (`accounts`)
Links users to OAuth providers:
- `id` (TEXT, PRIMARY KEY) - Unique account identifier
- `userId` (TEXT, FOREIGN KEY) - References `users.id`
- `provider` (VARCHAR) - OAuth provider name (e.g., 'google', 'github')
- `providerAccountId` (VARCHAR) - User's ID from OAuth provider
- `access_token` (TEXT) - OAuth access token
- `refresh_token` (TEXT) - OAuth refresh token
- `expires_at` (BIGINT) - Token expiration timestamp

### Sessions Table (`sessions`)
Stores active user sessions:
- `id` (TEXT, PRIMARY KEY) - Unique session identifier
- `sessionToken` (TEXT, UNIQUE) - Session token for cookies
- `userId` (TEXT, FOREIGN KEY) - References `users.id`
- `expires` (TIMESTAMP) - Session expiration date

## How It Works

### 1. User Sign-In Flow

1. **User clicks "Sign In with Google"** → NextAuth redirects to Google OAuth
2. **User authorizes on Google** → Google redirects back with authorization code
3. **NextAuth exchanges code for tokens** → Gets user profile (email, name, image)
4. **NextAuth checks database**:
   - If user exists (by email) → Links OAuth account to existing user
   - If user doesn't exist → Creates new user record
5. **NextAuth creates session** → Stores session in database
6. **Session cookie set** → Browser stores session token cookie

### 2. Accessing User Data

**Frontend (React Components):**
```typescript
import { useSession } from "next-auth/react";

function MyComponent() {
  const { data: session, status } = useSession();
  
  if (status === "loading") return <div>Loading...</div>;
  if (!session) return <div>Not signed in</div>;
  
  // Access user data
  const userId = session.user.id;
  const email = session.user.email;
  const name = session.user.name;
  const image = session.user.image;
}
```

**Backend API (Protected Routes):**
```typescript
import { auth } from "@/lib/auth";

export async function GET(request: Request) {
  const session = await auth();
  
  if (!session?.user) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }
  
  const userId = session.user.id;
  // Use userId to fetch user-specific data from database
}
```

**Backend API (Express Routes):**
```typescript
import { verifyJWT } from "@/middleware/auth";

router.get("/documents", verifyJWT, async (req, res) => {
  const userId = req.userId; // Set by verifyJWT middleware
  // Fetch documents for this user
});
```

### 3. Extending User Data

To add more user information (e.g., phone number, address, preferences):

#### Option 1: Extend Users Table
```sql
ALTER TABLE users ADD COLUMN phone VARCHAR(20);
ALTER TABLE users ADD COLUMN country_code VARCHAR(5);
ALTER TABLE users ADD COLUMN preferences JSONB;
```

#### Option 2: Create User Profile Table (Recommended)
```sql
CREATE TABLE user_profiles (
  user_id TEXT PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  phone VARCHAR(20),
  date_of_birth DATE,
  country_code VARCHAR(5),
  university VARCHAR(255),
  major VARCHAR(255),
  graduation_year INTEGER,
  preferences JSONB,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

Then create API routes to manage profiles:
```typescript
// GET /api/profile - Get user profile
// PUT /api/profile - Update user profile
```

### 4. User Data Flow

```
┌─────────────────┐
│  OAuth Provider │ (Google, GitHub, etc.)
│  - Email        │
│  - Name         │
│  - Image        │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  NextAuth.js    │
│  - Authenticate │
│  - Create User  │
│  - Create Session│
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  PostgreSQL DB  │
│  - users        │
│  - accounts     │
│  - sessions     │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Frontend       │
│  - useSession() │
│  - session.user │
└─────────────────┘
```

## Current User Information Available

After sign-in, the following user data is available:

```typescript
session.user = {
  id: string;        // Unique user ID from database
  email: string;     // Email from OAuth provider
  name: string;      // Display name from OAuth provider
  image: string;     // Profile picture URL from OAuth provider
}
```

## Next Steps

1. **Create User Profile API** - Allow users to update their profile information
2. **Add User Preferences** - Store user preferences (notifications, language, etc.)
3. **Link User to Documents** - Update `documents` table to link to `users.id`
4. **User Dashboard** - Create a dashboard showing user-specific data

## Security Considerations

- ✅ User passwords are **never stored** (OAuth handles authentication)
- ✅ Session tokens are stored in HTTP-only cookies
- ✅ Database uses foreign key constraints for data integrity
- ✅ OAuth tokens are encrypted in the database
- ⚠️ Always verify `session?.user?.id` before accessing user data
- ⚠️ Use `verifyJWT` middleware on protected API routes
