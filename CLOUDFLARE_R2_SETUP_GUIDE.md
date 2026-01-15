# Cloudflare R2 Setup Guide

## Step-by-Step Instructions

### Step 1: Create an R2 Bucket

1. Log in to your Cloudflare dashboard: https://dash.cloudflare.com/
2. In the left sidebar, click **"R2"** (under "Storage")
3. Click **"Create bucket"** button
4. Enter bucket name: `onestop-documents` (or any name you prefer)
5. Choose a location (select closest to your users, or default)
6. Click **"Create bucket"**
7. ✅ **Bucket created!** Note the bucket name - you'll need it for `R2_BUCKET_NAME`

### Step 2: Create API Token

1. In the R2 section, click **"Manage R2 API Tokens"** (in the right sidebar or at the top)
2. Click **"Create API token"**
3. Configure the token:
   - **Token name**: `onestop-documents-api` (or any descriptive name)
   - **Permissions**: Select **"Object Read & Write"** (or "Object Admin" for full access)
   - **TTL**: Leave empty (no expiration) or set expiration date if preferred
   - **Bucket access**: 
     - Select **"Allow access to one bucket"**
     - Choose your bucket: `onestop-documents`
4. Click **"Create API Token"**
5. ⚠️ **IMPORTANT**: Copy both values immediately:
   - **Access Key ID** (starts with something like `a1b2c3d4e5f6...`)
   - **Secret Access Key** (long string - you can only see it once!)
6. Store these securely - you'll need them for environment variables

### Step 3: Verify Your Information

You should now have:
- ✅ Account ID: `18966676fe6c60af6afec1aebdf6208a` (provided)
- ✅ S3 API Endpoint: `https://18966676fe6c60af6afec1aebdf6208a.r2.cloudflarestorage.com` (provided)
- ✅ Bucket Name: `onestop-documents` (from Step 1)
- ✅ Access Key ID: `xxxxx` (from Step 2 - you need to get this)
- ✅ Secret Access Key: `xxxxx` (from Step 2 - you need to get this)

### Step 4: (Optional) Set up Public Access (if needed)

If you want to generate public URLs for documents (signed URLs are recommended instead):

1. Go to your bucket in R2
2. Click on **"Settings"** tab
3. Under **"Public Access"**, you can configure CORS if needed
4. For security, we recommend using **signed URLs** instead of public access

---

## Environment Variables to Add

Once you have all the information, add these to your `apps/api/.env` file:

```env
# Cloudflare R2
R2_ENDPOINT=https://18966676fe6c60af6afec1aebdf6208a.r2.cloudflarestorage.com
R2_ACCESS_KEY_ID=your-access-key-id-here
R2_SECRET_ACCESS_KEY=your-secret-access-key-here
R2_BUCKET_NAME=onestop-documents
R2_PUBLIC_URL=https://your-public-domain.com
```

**Note**: `R2_PUBLIC_URL` is optional - we'll use signed URLs for security, so this can be left as a placeholder for now.

---

## Quick Checklist

- [ ] Created R2 bucket named `onestop-documents`
- [ ] Created API token with "Object Read & Write" permissions
- [ ] Copied Access Key ID
- [ ] Copied Secret Access Key (saved securely!)
- [ ] Ready to add to environment variables

---

## Security Best Practices

1. ✅ **Never commit API keys to git** - always use `.env` files (already in `.gitignore`)
2. ✅ **Use signed URLs** for document access (time-limited, secure)
3. ✅ **Restrict bucket permissions** - only "Object Read & Write" is needed
4. ✅ **Rotate keys periodically** - create new tokens and update environment variables
5. ✅ **Monitor usage** - Check R2 dashboard for unexpected activity

---

## Need Help?

If you get stuck:
- Cloudflare R2 Docs: https://developers.cloudflare.com/r2/
- API Token Docs: https://developers.cloudflare.com/r2/api/s3/tokens/

Let me know once you've completed these steps and we'll proceed with the implementation! 🚀
