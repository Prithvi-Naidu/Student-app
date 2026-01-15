# OAuth Provider Setup Guide

This guide walks you through setting up OAuth providers for the OneStop Student Ecosystem authentication system.

## Prerequisites

- NextAuth.js v5 (Auth.js) is configured
- Database migrations have been run
- Environment variables file is ready (`apps/web/.env.local`)

## Required Environment Variables

Add these to your `apps/web/.env.local` file:

```env
# NextAuth Configuration
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=<generate-a-random-secret-32-chars-minimum>

# Database (for NextAuth adapter)
DATABASE_URL=postgresql://onestop:onestop_dev_password@localhost:5433/onestop_db

# OAuth Provider Credentials (see sections below)
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

## Generating NEXTAUTH_SECRET

Run this command to generate a secure secret:

```bash
openssl rand -base64 32
```

Or use an online generator: https://generate-secret.vercel.app/32

---

## 1. Google OAuth Setup

### Step 1: Create a Project
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Click "Select a project" → "New Project"
3. Enter project name: "OneStop Student Ecosystem"
4. Click "Create"

### Step 2: Configure OAuth Consent Screen
1. In the left sidebar, go to **APIs & Services** → **OAuth consent screen**
2. Select **External** (unless you have a Google Workspace account)
3. Fill in the required information:
   - App name: `OneStop Student Ecosystem`
   - User support email: Your email
   - Developer contact information: Your email
4. Click "Save and Continue"
5. On "Scopes" page, click "Save and Continue" (default scopes are fine)
6. On "Test users" page, add test emails if needed, then "Save and Continue"
7. On "Summary" page, click "Back to Dashboard"

### Step 3: Create OAuth Credentials
1. Go to **APIs & Services** → **Credentials**
2. Click **+ Create Credentials** → **OAuth client ID**
3. Application type: **Web application**
4. Name: `OneStop Web Client`
5. Authorized JavaScript origins:
   - `http://localhost:3000`
   - (Add production URL later)
6. Authorized redirect URIs:
   - `http://localhost:3000/api/auth/callback/google`
   - (Add production URL later)
7. Click "Create"
8. **Copy the Client ID and Client Secret**

### Step 4: Add to Environment Variables
```env
GOOGLE_CLIENT_ID=your-client-id-here.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-client-secret-here
```

---

## 2. GitHub OAuth Setup

### Step 1: Create OAuth App
1. Go to [GitHub Settings](https://github.com/settings/developers)
2. Click **OAuth Apps** → **New OAuth App**
3. Fill in the form:
   - Application name: `OneStop Student Ecosystem`
   - Homepage URL: `http://localhost:3000`
   - Authorization callback URL: `http://localhost:3000/api/auth/callback/github`
4. Click "Register application"

### Step 2: Generate Client Secret
1. On the app page, click **Generate a new client secret**
2. Copy the **Client ID** and **Client secret**

### Step 3: Add to Environment Variables
```env
GITHUB_CLIENT_ID=your-github-client-id
GITHUB_CLIENT_SECRET=your-github-client-secret
```

---

## 3. Apple OAuth Setup (Sign in with Apple)

**Note:** Apple OAuth requires an Apple Developer account ($99/year). You can skip this for development.

### Step 1: Register App
1. Go to [Apple Developer Portal](https://developer.apple.com/account/)
2. Navigate to **Certificates, Identifiers & Profiles**
3. Click **Identifiers** → **+** button
4. Select **App IDs** → **Continue**
5. Select **App** → **Continue**
6. Fill in:
   - Description: `OneStop Student Ecosystem`
   - Bundle ID: `com.onestop.student` (use reverse domain notation)
7. Enable **Sign in with Apple** capability
8. Click **Continue** → **Register**

### Step 2: Create Service ID
1. In **Identifiers**, click **+** → **Services IDs** → **Continue**
2. Description: `OneStop Student Ecosystem Web`
3. Identifier: `com.onestop.student.web`
4. Enable **Sign in with Apple** → **Configure**
5. Primary App ID: Select the App ID you created
6. Website URLs:
   - Domains: `localhost:3000` (and your production domain)
   - Return URLs: `http://localhost:3000/api/auth/callback/apple`
7. Click **Save** → **Continue** → **Register**

### Step 3: Create Key for Sign in with Apple
1. Go to **Keys** → **+** button
2. Key Name: `OneStop Sign in with Apple Key`
3. Enable **Sign in with Apple**
4. Click **Configure** → Select your Primary App ID → **Save**
5. Click **Continue** → **Register**
6. **Download the key file (.p8)** - You can only download it once!
7. Note the **Key ID**

### Step 4: Get Team ID
1. In the top right of Apple Developer portal, click your name
2. Your **Team ID** is shown (e.g., `ABC123DEF4`)

### Step 5: Add to Environment Variables
```env
APPLE_CLIENT_ID=com.onestop.student.web
APPLE_TEAM_ID=your-team-id
APPLE_KEY_ID=your-key-id
APPLE_CLIENT_SECRET=-----BEGIN PRIVATE KEY-----
... (contents of the .p8 file)
-----END PRIVATE KEY-----
```

**Important:** The `APPLE_CLIENT_SECRET` should be the entire contents of the `.p8` file, including the BEGIN/END lines, with newlines preserved. In some environments, you may need to use `\n` for newlines.

---

## 4. Microsoft (Azure AD) OAuth Setup

### Step 1: Register Application
1. Go to [Azure Portal](https://portal.azure.com/)
2. Navigate to **Azure Active Directory** → **App registrations**
3. Click **+ New registration**
4. Fill in:
   - Name: `OneStop Student Ecosystem`
   - Supported account types: **Accounts in any organizational directory and personal Microsoft accounts**
   - Redirect URI:
     - Platform: **Web**
     - URI: `http://localhost:3000/api/auth/callback/azure-ad`
5. Click **Register**

### Step 2: Get Credentials
1. On the app overview page, copy the **Application (client) ID**
2. Go to **Certificates & secrets** → **+ New client secret**
3. Description: `OneStop Web Secret`
4. Expires: Choose an expiration (24 months recommended)
5. Click **Add**
6. **Copy the Value** (you can only see it once!)

### Step 3: Configure API Permissions (Optional)
1. Go to **API permissions**
2. Click **+ Add a permission** → **Microsoft Graph** → **Delegated permissions**
3. Add: `openid`, `profile`, `email`
4. Click **Add permissions**

### Step 4: Add to Environment Variables
```env
MICROSOFT_CLIENT_ID=your-azure-client-id
MICROSOFT_CLIENT_SECRET=your-azure-client-secret
MICROSOFT_TENANT_ID=common
```

**Note:** `MICROSOFT_TENANT_ID=common` allows both personal Microsoft accounts and organizational accounts. You can restrict this to your organization's tenant ID if needed.

---

## Testing OAuth Setup

1. **Run database migrations:**
   ```bash
   npm run db:migrate
   ```

2. **Start the development server:**
   ```bash
   npm run dev
   ```

3. **Test each provider:**
   - Navigate to `http://localhost:3000/signin`
   - Click each OAuth provider button
   - Complete the OAuth flow
   - Verify you're signed in and redirected

4. **Check the database:**
   ```sql
   SELECT * FROM users;
   SELECT * FROM accounts;
   ```

## Troubleshooting

### Common Issues

1. **"Redirect URI mismatch"**
   - Verify the redirect URI in your provider's console matches exactly: `http://localhost:3000/api/auth/callback/[provider]`
   - Check for trailing slashes or HTTP vs HTTPS

2. **"Invalid client secret"**
   - Verify environment variables are set correctly
   - Check for extra spaces or quotes
   - Restart your development server after changing `.env.local`

3. **Database connection errors**
   - Verify `DATABASE_URL` is correct
   - Ensure PostgreSQL is running: `npm run db:up`
   - Check that migrations have run: `npm run db:migrate`

4. **Apple OAuth not working**
   - Verify the `.p8` key content is correctly formatted in `APPLE_CLIENT_SECRET`
   - Check that Team ID and Key ID are correct
   - Ensure the Service ID is configured with the correct callback URL

5. **NextAuth secret warning**
   - Generate a secure secret: `openssl rand -base64 32`
   - Ensure `NEXTAUTH_SECRET` is at least 32 characters

## Production Considerations

Before deploying to production:

1. **Update redirect URIs** in each OAuth provider console with your production URL
2. **Use environment-specific secrets** - never commit secrets to git
3. **Enable HTTPS** - OAuth requires HTTPS in production
4. **Review OAuth consent screen** - complete the verification process for Google
5. **Set up proper error monitoring** for authentication failures
6. **Consider rate limiting** on authentication endpoints
