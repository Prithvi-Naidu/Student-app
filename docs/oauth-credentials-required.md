# OAuth Credentials Required

After implementing the authentication system, you need to obtain OAuth credentials from each provider. Here's a quick summary of what you need:

## Quick Checklist

- [ ] **Google OAuth** - Client ID and Client Secret
- [ ] **GitHub OAuth** - Client ID and Client Secret  
- [ ] **Apple OAuth** - Client ID, Team ID, Key ID, and Private Key (.p8 file) - *Optional (requires $99/year developer account)*
- [ ] **Microsoft OAuth** - Client ID and Client Secret
- [ ] **NEXTAUTH_SECRET** - Generate a random 32+ character string

## What You Need to Do

### 1. Generate NEXTAUTH_SECRET
Run this command to generate a secure secret:
```bash
openssl rand -base64 32
```

Example output: `1pIAIiwMVMypGHExyawfFPhCo+HQ+hQ7yF1NX49qHJU=`

### 2. Set Up Each OAuth Provider

Follow the detailed instructions in [docs/oauth-setup-guide.md](./oauth-setup-guide.md) for step-by-step setup of each provider.

**Quick Links:**
- **Google**: https://console.cloud.google.com/apis/credentials
- **GitHub**: https://github.com/settings/developers
- **Apple**: https://developer.apple.com/account/ (requires $99/year developer account)
- **Microsoft**: https://portal.azure.com/ → Azure Active Directory → App registrations

### 3. Add Credentials to Environment Variables

Once you have the credentials, add them to `apps/web/.env.local`:

```env
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=<your-generated-secret>

DATABASE_URL=postgresql://onestop:onestop_dev_password@127.0.0.1:5433/onestop_db

# Google (Start with this - easiest to set up)
GOOGLE_CLIENT_ID=your-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-client-secret

# GitHub (Easy to set up, free)
GITHUB_CLIENT_ID=your-client-id
GITHUB_CLIENT_SECRET=your-client-secret

# Apple (Optional - requires paid developer account)
APPLE_CLIENT_ID=com.onestop.student.web
APPLE_TEAM_ID=your-team-id
APPLE_KEY_ID=your-key-id
APPLE_CLIENT_SECRET=-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----

# Microsoft (Free, easy to set up)
MICROSOFT_CLIENT_ID=your-client-id
MICROSOFT_CLIENT_SECRET=your-client-secret
MICROSOFT_TENANT_ID=common
```

### 4. Important Notes

- **You can start with just Google and GitHub** - These are the easiest to set up and don't require paid accounts
- **Apple requires a paid developer account** ($99/year) - You can skip this for now
- **Microsoft is free** - Easy to set up with a Microsoft account
- **All redirect URIs should be**: `http://localhost:3000/api/auth/callback/[provider]`
- **For production**, you'll need to add your production URLs to each provider's console

### 5. Testing Without All Providers

The authentication system will work with just one provider configured. You can:
1. Start with Google (easiest)
2. Add GitHub next
3. Add Microsoft
4. Add Apple last (if you have a developer account)

The sign-in page will only show buttons for providers that are properly configured.

## Next Steps

1. Read [docs/oauth-setup-guide.md](./oauth-setup-guide.md) for detailed instructions
2. Set up at least one OAuth provider (Google recommended)
3. Test the authentication flow
4. Add more providers as needed
