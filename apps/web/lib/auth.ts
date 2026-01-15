import NextAuth from "next-auth";
import { authConfig } from "@/auth.config";
import { Pool } from "pg";
import PostgresAdapter from "@auth/pg-adapter";
import { nanoid } from "nanoid";

// Create a single connection pool for the adapter
// Use the same connection format as the API backend
const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 
    `postgresql://${process.env.POSTGRES_USER || 'onestop'}:${process.env.POSTGRES_PASSWORD || 'onestop_dev_password'}@${process.env.POSTGRES_HOST || '127.0.0.1'}:${process.env.POSTGRES_PORT || '5433'}/${process.env.POSTGRES_DB || 'onestop_db'}`,
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 5000,
});

// Ensure we have at least one provider configured
if (!authConfig.providers || authConfig.providers.length === 0) {
  throw new Error("At least one authentication provider must be configured. Please add OAuth credentials to your .env.local file.");
}

// Ensure NEXTAUTH_SECRET is set
if (!process.env.NEXTAUTH_SECRET) {
  throw new Error("NEXTAUTH_SECRET environment variable is required. Please set it in your .env.local file.");
}

// Test database connection
pool.query('SELECT NOW()').catch((error) => {
  console.error('Database connection test failed:', error);
});

// Create adapter with explicit ID generation
const adapter = PostgresAdapter(pool);

// Wrap the adapter to ensure IDs are generated and included in INSERT
// The adapter's methods don't include id in INSERT queries, so we implement our own
const adapterWithIdGeneration = new Proxy(adapter, {
  get(target, prop) {
    const originalMethod = (target as any)[prop];
    
    // Intercept createUser to manually insert with ID included
    if (prop === 'createUser' && typeof originalMethod === 'function') {
      return async function(data: any) {
        // Ensure ID is generated if not provided
        const userId = data?.id || nanoid();
        
        // Manually insert the user with ID included (bypassing adapter's broken implementation)
        const result = await pool.query(
          `INSERT INTO users ("id", "name", "email", "emailVerified", "image") 
           VALUES ($1, $2, $3, $4, $5) 
           RETURNING *`,
          [
            userId,
            data?.name || null,
            data?.email || null,
            data?.emailVerified || null,
            data?.image || null
          ]
        );
        
        if (result.rows.length === 0) {
          throw new Error('Failed to create user');
        }
        
        return result.rows[0];
      };
    }
    
    // Intercept linkAccount to manually insert with ID included
    if (prop === 'linkAccount' && typeof originalMethod === 'function') {
      return async function(account: any) {
        // Ensure ID is generated if not provided
        const accountId = account?.id || nanoid();
        
        // Manually insert the account with ID included
        const result = await pool.query(
          `INSERT INTO accounts ("id", "userId", "type", "provider", "providerAccountId", "refresh_token", "access_token", "expires_at", "token_type", "scope", "id_token", "session_state") 
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12) 
           RETURNING *`,
          [
            accountId,
            account?.userId || null,
            account?.type || 'oauth',
            account?.provider || null,
            account?.providerAccountId || null,
            account?.refresh_token || null,
            account?.access_token || null,
            account?.expires_at || null,
            account?.token_type || null,
            account?.scope || null,
            account?.id_token || null,
            account?.session_state || null
          ]
        );
        
        if (result.rows.length === 0) {
          throw new Error('Failed to link account');
        }
        
        return result.rows[0];
      };
    }
    
    // Intercept createSession to manually insert with ID included
    if (prop === 'createSession' && typeof originalMethod === 'function') {
      return async function(session: any) {
        // Ensure ID is generated if not provided
        const sessionId = session?.id || nanoid();
        const sessionToken = session?.sessionToken || nanoid();
        
        // Manually insert the session with ID included
        const result = await pool.query(
          `INSERT INTO sessions ("id", "sessionToken", "userId", "expires") 
           VALUES ($1, $2, $3, $4) 
           RETURNING *`,
          [
            sessionId,
            sessionToken,
            session?.userId || null,
            session?.expires || null
          ]
        );
        
        if (result.rows.length === 0) {
          throw new Error('Failed to create session');
        }
        
        return result.rows[0];
      };
    }
    
    // For all other methods, return as-is
    if (typeof originalMethod === 'function') {
      return originalMethod.bind(target);
    }
    
    return originalMethod;
  },
});

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  secret: process.env.NEXTAUTH_SECRET,
  adapter: adapterWithIdGeneration,
  trustHost: true, // Required for NextAuth.js v5 in development
});

