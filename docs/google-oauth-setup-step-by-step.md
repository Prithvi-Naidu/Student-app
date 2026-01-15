# Google OAuth Setup - Step-by-Step Guide

This guide will walk you through setting up Google OAuth for OneStop Student Ecosystem.

## What You'll Need

- A Google account (Gmail account works)
- Access to Google Cloud Console
- About 10-15 minutes

## What Information You'll Get

After completing this setup, you'll have:
1. **Google Client ID** - Looks like: `123456789-abcdefghijklmnop.apps.googleusercontent.com`
2. **Google Client Secret** - Looks like: `GOCSPX-abcdefghijklmnopqrstuvwxyz`

## Step-by-Step Instructions

### Step 1: Go to Google Cloud Console

1. Open your browser and go to: **https://console.cloud.google.com/**
2. Sign in with your Google account if prompted

### Step 2: Create a New Project

1. Click on the project dropdown at the top (it might say "Select a project" or show an existing project name)
2. Click **"New Project"** button
3. Fill in the project details:
   - **Project name**: `OneStop Student Ecosystem` (or any name you prefer)
   - **Organization**: Leave as default (or select if you have one)
   - **Location**: Leave as default
4. Click **"Create"** button
5. Wait a few seconds for the project to be created
6. Make sure the new project is selected in the project dropdown

### Step 3: Configure OAuth Consent Screen

1. In the left sidebar, click **"APIs & Services"** → **"OAuth consent screen"**
2. You'll see a form. Fill it out:

   **User Type:**
   - Select **"External"** (unless you have a Google Workspace account)
   - Click **"Create"**

   **App Information:**
   - **App name**: `OneStop Student Ecosystem`
   - **User support email**: Select your email from the dropdown
   - **App logo**: (Optional - you can skip this for now)
   - **App domain**: Leave blank for now
   - **Application home page**: `https://example.com` (placeholder - won't affect local development)
   - **Authorized domains**: Leave blank for now
   - **Developer contact information**: Enter your email address
   - Click **"Save and Continue"**

   **Scopes:**
   - You'll see default scopes (email, profile, openid)
   - These are fine, just click **"Save and Continue"**

   **Test users:**
   - For development, you can add test users (optional)
   - Or just click **"Save and Continue"**

   **Summary:**
   - Review the information
   - Click **"Back to Dashboard"**

### Step 4: Create OAuth 2.0 Credentials

1. In the left sidebar, go to **"APIs & Services"** → **"Credentials"**
2. Click the **"+ CREATE CREDENTIALS"** button at the top
3. Select **"OAuth client ID"** from the dropdown

   **Application type:**
   - Select **"Web application"**

   **Name:**
   - Enter: `OneStop Web Client`

   **Authorized JavaScript origins:**
   - Click **"+ ADD URI"**
   - Enter: `http://localhost:3000`
   - (For production later, you'll add your production URL here)

   **Authorized redirect URIs:**
   - Click **"+ ADD URI"**
   - Enter: `http://localhost:3000/api/auth/callback/google`
   - ⚠️ **IMPORTANT**: Make sure this is EXACTLY: `http://localhost:3000/api/auth/callback/google`
   - (For production later, you'll add: `https://yourdomain.com/api/auth/callback/google`)

4. Click **"CREATE"** button

### Step 5: Copy Your Credentials

After clicking "CREATE", a popup will appear with your credentials:

1. **Your Client ID** - Copy this entire string (it looks like: `123456789-abcdefghijklmnop.apps.googleusercontent.com`)
2. **Your Client secret** - Click "Show" or copy the secret (it looks like: `GOCSPX-abcdefghijklmnopqrstuvwxyz`)

⚠️ **IMPORTANT**: 
- Copy these NOW - you can view them again later, but it's easier to copy them now
- Keep these secure - don't share them publicly

### Step 6: Add Credentials to Your App

1. Open the file: `apps/web/.env.local` (create it if it doesn't exist)

2. Add these lines (replace with YOUR actual values):

```env
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=1pIAIiwMVMypGHExyawfFPhCo+HQ+hQ7yF1NX49qHJU=
DATABASE_URL=postgresql://onestop:onestop_dev_password@127.0.0.1:5433/onestop_db

# Google OAuth
GOOGLE_CLIENT_ID=your-client-id-here.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-client-secret-here
```

3. Replace:
   - `your-client-id-here.apps.googleusercontent.com` with your actual Client ID
   - `your-client-secret-here` with your actual Client Secret

4. Save the file

### Step 7: Restart Your Development Server

1. Stop your current development server (if running) - Press `Ctrl+C` in the terminal
2. Start it again:
   ```bash
   npm run dev
   ```

### Step 8: Test Google Login

1. Open your browser and go to: `http://localhost:3000/signin`
2. You should see a **"Continue with Google"** button
3. Click it
4. You should be redirected to Google's sign-in page
5. Sign in with your Google account
6. You should be redirected back to your app and be signed in!

## Troubleshooting

### Issue: "Redirect URI mismatch" error

**Solution:**
- Go back to Google Cloud Console → Credentials
- Click on your OAuth client
- Make sure the redirect URI is EXACTLY: `http://localhost:3000/api/auth/callback/google`
- No trailing slashes, no typos
- Click "Save"
- Wait a minute for changes to propagate

### Issue: "Access blocked: This app's request is invalid"

**Solution:**
- Make sure you've completed the OAuth consent screen setup
- If you selected "External" user type, you may need to add test users in the OAuth consent screen
- Go to: APIs & Services → OAuth consent screen → Test users → Add your email

### Issue: Button doesn't appear or shows error

**Solution:**
- Check that your `.env.local` file has the correct variable names:
  - `GOOGLE_CLIENT_ID` (not `GOOGLE_CLIENT_ID_GOOGLE` or similar)
  - `GOOGLE_CLIENT_SECRET` (not `GOOGLE_SECRET` or similar)
- Make sure there are no extra spaces or quotes around the values
- Restart your development server after changing `.env.local`

### Issue: "Invalid client" error

**Solution:**
- Double-check that you copied the Client ID and Client Secret correctly
- Make sure there are no extra spaces or line breaks
- Verify the credentials in Google Cloud Console

## What Information to Share

After completing the setup, you don't need to share your credentials with me - they should stay in your `.env.local` file (which is gitignored for security).

However, if you run into issues, you can share:
- Screenshots of error messages (but NOT your Client Secret)
- The error text you see
- Which step you're stuck on

## Next Steps

Once Google OAuth is working:
- You can add more providers (GitHub, Microsoft) following similar steps
- For production, you'll need to:
  - Add your production domain to authorized JavaScript origins
  - Add your production callback URL to authorized redirect URIs
  - Complete OAuth consent screen verification (if you want to go public)

## Security Notes

- ✅ Your `.env.local` file is already in `.gitignore` - your credentials won't be committed to git
- ✅ Never commit your Client Secret to version control
- ✅ For production, use environment variables on your hosting platform
- ✅ Keep your Client Secret secure - treat it like a password

