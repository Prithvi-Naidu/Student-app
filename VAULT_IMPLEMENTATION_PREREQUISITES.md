# Document Vault Implementation - Prerequisites & Setup Guide

## Immediate Implementation (No Credentials Required)

These can be implemented right away:

1. ✅ **Database Schema Updates** - Already have PostgreSQL set up
2. ✅ **Encryption Utilities** - Uses Node.js built-in `crypto` module (no external service)
3. ✅ **Local Storage** - Already implemented (can enhance with encryption)
4. ✅ **Frontend UI Updates** - Can build UI structure without backend credentials

## Credentials & Manual Setup Required

### 1. Cloudflare R2 (Optional - Can Defer)

**What you need:**
- Cloudflare account (free tier available)
- R2 bucket created
- Access Key ID and Secret Access Key

**Setup Steps:**
1. Sign up at https://dash.cloudflare.com/
2. Go to R2 → Create bucket (name it `onestop-documents`)
3. Go to Manage R2 API Tokens → Create API Token
4. Copy the Access Key ID and Secret Access Key

**Cost:** Free tier includes 10GB storage, 1M Class A operations/month

**Can we start without this?** ✅ **YES** - We can implement the structure and use local storage first, then add R2 later.

---

### 2. DigiLocker API (Optional - Can Defer)

**What you need:**
- Register as Requester organization on DigiLocker Partners Portal
- Get approved (may take time for government approval)
- Client ID and Client Secret after approval
- Configure redirect URI

**Setup Steps:**
1. Visit: https://www.digilocker.gov.in/web/partners/requesters
2. Register your organization (OneStop Student Ecosystem)
3. Submit required documentation
4. Wait for approval (government process - may take days/weeks)
5. Get Client ID and Client Secret after approval
6. Configure redirect URI: `https://your-domain.com/api/documents/digilocker/callback`

**Can we start without this?** ✅ **YES** - We can build the integration structure and UI, then add credentials when available.

---

## Recommended Implementation Order

### Phase 1: Foundation (Start Now - No Credentials)
1. Database schema updates
2. Encryption utilities (server-side & client-side)
3. Enhanced document routes (with encryption support)
4. Frontend UI improvements

### Phase 2: Cloud Storage (When R2 Credentials Ready)
5. R2 configuration and utilities
6. Update document routes to use R2
7. Migration from local to cloud

### Phase 3: DigiLocker Integration (When Credentials Ready)
8. DigiLocker API service
9. OAuth flow implementation
10. DigiLocker UI components

---

## Environment Variables Needed

### For Phase 1 (Encryption Only)
```env
# Encryption (generate a random salt)
ENCRYPTION_ALGORITHM=aes-256-gcm
ENCRYPTION_KEY_SALT=your-random-salt-here-32-chars-minimum
```

### For Phase 2 (Add R2)
```env
# Cloudflare R2
R2_ENDPOINT=https://<account-id>.r2.cloudflarestorage.com
R2_ACCESS_KEY_ID=your-access-key-id
R2_SECRET_ACCESS_KEY=your-secret-access-key
R2_BUCKET_NAME=onestop-documents
R2_PUBLIC_URL=https://your-public-domain.com
```

### For Phase 3 (Add DigiLocker)
```env
# DigiLocker (Requester API)
DIGILOCKER_CLIENT_ID=your-digilocker-client-id
DIGILOCKER_CLIENT_SECRET=your-digilocker-client-secret
DIGILOCKER_REDIRECT_URI=https://your-domain.com/api/documents/digilocker/callback
DIGILOCKER_API_URL=https://digilocker.meripehchaan.gov.in/public
```

---

## Quick Start Recommendation

**Let's start with Phase 1** - Database schema, encryption utilities, and enhanced UI. This gives you:
- ✅ Encrypted document storage (local)
- ✅ Better user experience
- ✅ Foundation for cloud storage
- ✅ No external dependencies

Then we can add R2 and DigiLocker when credentials are ready!
