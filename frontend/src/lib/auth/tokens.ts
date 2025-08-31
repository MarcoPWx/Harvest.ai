/**
 * Authentication Token Utilities
 * Handle session tokens and JWT operations
 */

import { SignJWT, jwtVerify } from "jose";
import { v4 as uuidv4 } from "uuid";

// Get secret from environment or generate for development
const getSecret = () => {
  const secret = process.env.JWT_SECRET || "dev-secret-change-in-production";
  return new TextEncoder().encode(secret);
};

export interface SessionTokenPayload {
  sessionId: string;
  provider: string;
  expiresAt: string;
  userId?: string;
}

/**
 * Create a signed session token
 */
export async function createSessionToken(payload: SessionTokenPayload): Promise<string> {
  const secret = getSecret();

  const token = await new SignJWT({
    ...payload,
    iat: Math.floor(Date.now() / 1000),
    jti: uuidv4(),
  })
    .setProtectedHeader({ alg: "HS256" })
    .setExpirationTime(payload.expiresAt)
    .setIssuedAt()
    .sign(secret);

  return token;
}

/**
 * Verify and decode a session token
 */
export async function verifySessionToken(token: string): Promise<SessionTokenPayload | null> {
  try {
    const secret = getSecret();
    const { payload } = await jwtVerify(token, secret);

    return {
      sessionId: payload.sessionId as string,
      provider: payload.provider as string,
      expiresAt: payload.expiresAt as string,
      userId: payload.userId as string | undefined,
    };
  } catch (error) {
    console.error("Token verification failed:", error);
    return null;
  }
}

/**
 * Create an API key for long-term access
 * Returns both the key and its hash
 */
export function createApiKey(): { key: string; hash: string; prefix: string } {
  const prefix = "hrai";
  const random = Array.from(crypto.getRandomValues(new Uint8Array(32)), (byte) =>
    byte.toString(16).padStart(2, "0"),
  ).join("");

  const key = `${prefix}_${random}`;

  // In production, use proper hashing (bcrypt, argon2, etc.)
  // For now, using a simple hash
  const hash = btoa(key); // This is NOT secure, replace in production!

  return {
    key,
    hash,
    prefix: key.substring(0, 8),
  };
}

/**
 * Verify an API key against its hash
 */
export function verifyApiKey(key: string, hash: string): boolean {
  // In production, use proper hash verification
  return btoa(key) === hash;
}

/**
 * Extract bearer token from Authorization header
 */
export function extractBearerToken(authHeader: string | null): string | null {
  if (!authHeader) return null;

  const parts = authHeader.split(" ");
  if (parts.length !== 2 || parts[0] !== "Bearer") {
    return null;
  }

  return parts[1];
}

/**
 * Generate a secure random token
 */
export function generateSecureToken(length: number = 32): string {
  const array = new Uint8Array(length);
  crypto.getRandomValues(array);
  return Array.from(array, (byte) => byte.toString(16).padStart(2, "0")).join("");
}

/**
 * Create a refresh token
 */
export async function createRefreshToken(userId: string): Promise<string> {
  const secret = getSecret();

  const token = await new SignJWT({
    userId,
    type: "refresh",
    jti: uuidv4(),
  })
    .setProtectedHeader({ alg: "HS256" })
    .setExpirationTime("30d")
    .setIssuedAt()
    .sign(secret);

  return token;
}

/**
 * Verify a refresh token
 */
export async function verifyRefreshToken(token: string): Promise<string | null> {
  try {
    const secret = getSecret();
    const { payload } = await jwtVerify(token, secret);

    if (payload.type !== "refresh") {
      return null;
    }

    return payload.userId as string;
  } catch (error) {
    console.error("Refresh token verification failed:", error);
    return null;
  }
}

/**
 * Create a CSRF token
 */
export function createCSRFToken(): string {
  return generateSecureToken(32);
}

/**
 * Verify CSRF token
 */
export function verifyCSRFToken(token: string, storedToken: string): boolean {
  if (!token || !storedToken) return false;

  // Constant-time comparison to prevent timing attacks
  if (token.length !== storedToken.length) return false;

  let result = 0;
  for (let i = 0; i < token.length; i++) {
    result |= token.charCodeAt(i) ^ storedToken.charCodeAt(i);
  }

  return result === 0;
}
