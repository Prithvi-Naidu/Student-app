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
