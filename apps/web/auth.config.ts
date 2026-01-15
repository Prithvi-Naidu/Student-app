import type { NextAuthConfig } from "next-auth";
import Google from "next-auth/providers/google";
import GitHub from "next-auth/providers/github";
import Apple from "next-auth/providers/apple";
import AzureAD from "next-auth/providers/azure-ad";

// Build providers array - only include providers that have credentials configured
const providers = [];

// Google provider
if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
  providers.push(
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      allowDangerousEmailAccountLinking: true, // Allow linking OAuth accounts to existing users with same email
    })
  );
}

// GitHub provider
if (process.env.GITHUB_CLIENT_ID && process.env.GITHUB_CLIENT_SECRET) {
  providers.push(
    GitHub({
      clientId: process.env.GITHUB_CLIENT_ID,
      clientSecret: process.env.GITHUB_CLIENT_SECRET,
    })
  );
}

// Apple provider
if (process.env.APPLE_CLIENT_ID && process.env.APPLE_CLIENT_SECRET) {
  providers.push(
    Apple({
      clientId: process.env.APPLE_CLIENT_ID,
      clientSecret: process.env.APPLE_CLIENT_SECRET,
    })
  );
}

// Microsoft provider
if (process.env.MICROSOFT_CLIENT_ID && process.env.MICROSOFT_CLIENT_SECRET) {
  providers.push(
    AzureAD({
      clientId: process.env.MICROSOFT_CLIENT_ID,
      clientSecret: process.env.MICROSOFT_CLIENT_SECRET,
      tenantId: process.env.MICROSOFT_TENANT_ID || "common",
    })
  );
}

export const authConfig = {
  providers,
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user;
      const isOnDashboard = nextUrl.pathname.startsWith("/dashboard");
      if (isOnDashboard) {
        if (isLoggedIn) return true;
        return false; // Redirect unauthenticated users to login page
      } else if (isLoggedIn && nextUrl.pathname.startsWith("/signin")) {
        return Response.redirect(new URL("/", nextUrl));
      }
      return true;
    },
    async signIn({ user, account, profile }) {
      // Ensure user has an ID before adapter tries to create it
      if (user && !user.id) {
        const { nanoid } = await import("nanoid");
        user.id = nanoid();
      }
      // Allow sign in - account linking will be handled by NextAuth
      return true;
    },
    async jwt({ token, user, account }) {
      // Always set token.id when user signs in
      if (user?.id) {
        token.id = user.id;
      }
      if (account) {
        token.accessToken = account.access_token;
      }
      // Ensure token.id is always a string
      if (!token.id && user?.id) {
        token.id = user.id;
      }
      return token;
    },
    async session({ session, token, user }) {
      // Safely access token.id or user.id - token might be undefined in some cases
      // When using database sessions, the user parameter contains the database user record
      if (session?.user) {
        // Try to get ID from: token (JWT), user parameter (database), or session.user.email (fallback lookup)
        session.user.id = (token?.id as string) || user?.id || "";
      }
      return session;
    },
  },
  pages: {
    signIn: "/signin",
  },
} satisfies NextAuthConfig;

