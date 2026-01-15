import jwt from "jsonwebtoken";
import { logger } from "./logger";

const JWT_SECRET = process.env.JWT_SECRET || process.env.NEXTAUTH_SECRET || "fallback-secret-change-in-production";

export interface JWTPayload {
  sub: string; // user id
  email?: string;
  name?: string;
  iat?: number;
  exp?: number;
}

/**
 * Sign a JWT token with user information
 */
export function signToken(payload: JWTPayload): string {
  try {
    return jwt.sign(payload, JWT_SECRET, {
      expiresIn: "7d", // Token expires in 7 days
    });
  } catch (error) {
    logger.error("Error signing JWT token:", error);
    throw new Error("Failed to sign token");
  }
}

/**
 * Verify and decode a JWT token
 */
export function verifyToken(token: string): JWTPayload {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as JWTPayload;
    return decoded;
  } catch (error) {
    logger.error("Error verifying JWT token:", error);
    if (error instanceof jwt.TokenExpiredError) {
      throw new Error("Token expired");
    }
    if (error instanceof jwt.JsonWebTokenError) {
      throw new Error("Invalid token");
    }
    throw new Error("Token verification failed");
  }
}

/**
 * Decode a JWT token without verification (use with caution)
 */
export function decodeToken(token: string): JWTPayload | null {
  try {
    return jwt.decode(token) as JWTPayload;
  } catch (error) {
    logger.error("Error decoding JWT token:", error);
    return null;
  }
}
