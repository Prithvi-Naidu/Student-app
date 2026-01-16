import { Request, Response, NextFunction } from "express";
import { verifyToken } from "../utils/jwt";
import { logger } from "../utils/logger";

export interface AuthRequest extends Request {
  user?: {
    id: string;
    email?: string;
    name?: string;
  };
}

const getHeaderValue = (value: string | string[] | undefined): string | undefined => {
  if (!value) return undefined;
  return Array.isArray(value) ? value[0] : value;
};

/**
 * Attach user context from Authorization header or dev-only header overrides.
 * This does not block requests; it only enriches req.user when possible.
 */
export function attachUserContext(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const authHeader = getHeaderValue(req.headers.authorization);
    const token = authHeader?.startsWith("Bearer ") ? authHeader.split(" ")[1] : undefined;

    if (token) {
      try {
        const payload = verifyToken(token);
        req.user = {
          id: payload.sub,
          email: payload.email,
          name: payload.name,
        };
      } catch (error) {
        logger.warn("Attach user context: token verification failed", error);
      }
    }

    if (!req.user && process.env.NODE_ENV !== "production") {
      const headerUserId = getHeaderValue(req.headers["x-user-id"] as string | string[] | undefined);
      const headerEmail = getHeaderValue(req.headers["x-user-email"] as string | string[] | undefined);
      const headerName = getHeaderValue(req.headers["x-user-name"] as string | string[] | undefined);

      if (headerUserId) {
        req.user = {
          id: headerUserId,
          email: headerEmail,
          name: headerName,
        };
      }
    }

    next();
  } catch (error) {
    logger.error("Attach user context error:", error);
    next();
  }
}

/**
 * Middleware to verify JWT token from Authorization header
 * Expects: Authorization: Bearer <token>
 */
export function authenticateToken(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(" ")[1]; // Bearer TOKEN

    if (!token) {
      return res.status(401).json({
        status: "error",
        message: "Authentication required. Please provide a valid token.",
      });
    }

    try {
      const payload = verifyToken(token);
      req.user = {
        id: payload.sub,
        email: payload.email,
        name: payload.name,
      };
      next();
    } catch (error) {
      logger.warn("Token verification failed:", error);
      return res.status(403).json({
        status: "error",
        message: "Invalid or expired token. Please sign in again.",
      });
    }
  } catch (error) {
    logger.error("Authentication middleware error:", error);
    return res.status(500).json({
      status: "error",
      message: "Authentication error",
    });
  }
}

/**
 * Optional authentication middleware - doesn't fail if no token
 * Sets req.user if token is valid, but continues even if not
 */
export function optionalAuth(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(" ")[1];

    if (token) {
      try {
        const payload = verifyToken(token);
        req.user = {
          id: payload.sub,
          email: payload.email,
          name: payload.name,
        };
      } catch (error) {
        // Token invalid, but continue without user
        logger.debug("Optional auth: token invalid, continuing without user");
      }
    }
    next();
  } catch (error) {
    logger.error("Optional authentication middleware error:", error);
    next();
  }
}
