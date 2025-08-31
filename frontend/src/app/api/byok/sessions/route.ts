/**
 * BYOK Session Management API Routes
 * POST /api/byok/sessions - Create a new BYOK session
 * GET /api/byok/sessions - List user's sessions
 */

import { NextRequest, NextResponse } from "next/server";
import { v4 as uuidv4 } from "uuid";
import {
  CreateBYOKSessionRequest,
  CreateBYOKSessionResponse,
  BYOKSession,
  ApiResponse,
  ApiErrorCode,
  PaginatedResponse,
} from "@/types/api";
import { validateApiKey } from "@/lib/byok/validators";
import { createSessionToken, verifySessionToken } from "@/lib/auth/tokens";
import { getRateLimiter } from "@/lib/rate-limit";
import { sanitizeLogs } from "@/lib/security/log-sanitizer";

// In-memory storage for development (replace with database in production)
const sessions = new Map<string, BYOKSession>();
const sessionTokens = new Map<string, string>(); // token -> sessionId

export async function POST(request: NextRequest) {
  const limiter = getRateLimiter();
  const clientId = request.headers.get("x-forwarded-for") || "unknown";

  // Check rate limit
  const rateLimitResult = await limiter.check(clientId, "byok_create");
  if (!rateLimitResult.allowed) {
    return NextResponse.json<ApiResponse>(
      {
        success: false,
        error: {
          code: ApiErrorCode.RATE_LIMIT_EXCEEDED,
          message: "Too many session creation attempts",
          timestamp: new Date().toISOString(),
        },
        metadata: {
          requestId: uuidv4(),
          timestamp: new Date().toISOString(),
          version: "1.0.0",
          rateLimit: {
            limit: rateLimitResult.limit,
            remaining: rateLimitResult.remaining,
            reset: rateLimitResult.reset,
            retryAfter: rateLimitResult.retryAfter,
          },
        },
      },
      {
        status: 429,
        headers: {
          "Retry-After": String(rateLimitResult.retryAfter || 60),
          "X-RateLimit-Limit": String(rateLimitResult.limit),
          "X-RateLimit-Remaining": String(rateLimitResult.remaining),
          "X-RateLimit-Reset": String(rateLimitResult.reset),
        },
      },
    );
  }

  try {
    const body = (await request.json()) as CreateBYOKSessionRequest;

    // Validate required fields
    if (!body.apiKey || !body.provider) {
      return NextResponse.json<ApiResponse>(
        {
          success: false,
          error: {
            code: ApiErrorCode.MISSING_PARAMETER,
            message: "API key and provider are required",
            timestamp: new Date().toISOString(),
          },
        },
        { status: 400 },
      );
    }

    // Validate the API key with the provider
    const validation = await validateApiKey(body.apiKey, body.provider);

    if (!validation.valid) {
      // Log the attempt (with sanitized data)
      console.warn(
        sanitizeLogs({
          event: "byok_validation_failed",
          provider: body.provider,
          error: validation.error,
          clientId,
        }),
      );

      return NextResponse.json<ApiResponse>(
        {
          success: false,
          error: {
            code: ApiErrorCode.INVALID_PROVIDER_KEY,
            message: validation.error || "Invalid API key for provider",
            timestamp: new Date().toISOString(),
          },
        },
        { status: 401 },
      );
    }

    // Create the session
    const sessionId = uuidv4();
    const now = new Date();
    const sessionDuration = body.sessionDuration || 60; // Default 60 minutes
    const expiresAt = new Date(now.getTime() + sessionDuration * 60 * 1000);

    const session: BYOKSession = {
      id: sessionId,
      userId: request.headers.get("x-user-id") || undefined,
      provider: body.provider,
      modelId: body.modelId || validation.defaultModel || "default",
      createdAt: now.toISOString(),
      expiresAt: expiresAt.toISOString(),
      usageCount: 0,
      metadata: {
        userAgent: request.headers.get("user-agent") || undefined,
        ipAddress: clientId,
        capabilities: validation.capabilities,
        rateLimit: validation.rateLimit,
        ...body.metadata,
      },
    };

    // Generate session token
    const token = await createSessionToken({
      sessionId,
      provider: body.provider,
      expiresAt: expiresAt.toISOString(),
    });

    // Store session (in production, use database)
    sessions.set(sessionId, session);
    sessionTokens.set(token, sessionId);

    // Set up auto-cleanup
    setTimeout(
      () => {
        sessions.delete(sessionId);
        sessionTokens.delete(token);
      },
      sessionDuration * 60 * 1000,
    );

    const response: CreateBYOKSessionResponse = {
      session,
      token,
      warnings: validation.warnings,
    };

    return NextResponse.json<ApiResponse<CreateBYOKSessionResponse>>(
      {
        success: true,
        data: response,
        metadata: {
          requestId: uuidv4(),
          timestamp: new Date().toISOString(),
          version: "1.0.0",
          rateLimit: {
            limit: rateLimitResult.limit,
            remaining: rateLimitResult.remaining,
            reset: rateLimitResult.reset,
          },
        },
      },
      {
        status: 201,
        headers: {
          "X-RateLimit-Limit": String(rateLimitResult.limit),
          "X-RateLimit-Remaining": String(rateLimitResult.remaining),
          "X-RateLimit-Reset": String(rateLimitResult.reset),
          "Cache-Control": "no-store, no-cache, must-revalidate",
          "Pragma": "no-cache",
        },
      },
    );
  } catch (error) {
    console.error("BYOK session creation error:", sanitizeLogs({ error }));

    return NextResponse.json<ApiResponse>(
      {
        success: false,
        error: {
          code: ApiErrorCode.INTERNAL_ERROR,
          message: "Failed to create BYOK session",
          timestamp: new Date().toISOString(),
        },
      },
      { status: 500 },
    );
  }
}

export async function GET(request: NextRequest) {
  const limiter = getRateLimiter();
  const clientId = request.headers.get("x-forwarded-for") || "unknown";

  // Check rate limit
  const rateLimitResult = await limiter.check(clientId, "byok_list");
  if (!rateLimitResult.allowed) {
    return NextResponse.json<ApiResponse>(
      {
        success: false,
        error: {
          code: ApiErrorCode.RATE_LIMIT_EXCEEDED,
          message: "Too many requests",
          timestamp: new Date().toISOString(),
        },
      },
      { status: 429 },
    );
  }

  try {
    // Get user ID from auth header or session
    const userId = request.headers.get("x-user-id");

    // Filter sessions by user
    const userSessions = Array.from(sessions.values()).filter(
      (s) => !userId || s.userId === userId,
    );

    // Clean up expired sessions
    const now = new Date();
    const activeSessions = userSessions.filter((s) => {
      const expiresAt = new Date(s.expiresAt);
      if (expiresAt < now) {
        sessions.delete(s.id);
        return false;
      }
      return true;
    });

    // Pagination
    const searchParams = request.nextUrl.searchParams;
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const start = (page - 1) * limit;
    const end = start + limit;

    const paginatedSessions = activeSessions.slice(start, end);

    const response: PaginatedResponse<BYOKSession> = {
      items: paginatedSessions,
      total: activeSessions.length,
      page,
      pageSize: limit,
      totalPages: Math.ceil(activeSessions.length / limit),
      hasMore: end < activeSessions.length,
    };

    return NextResponse.json<ApiResponse<PaginatedResponse<BYOKSession>>>(
      {
        success: true,
        data: response,
        metadata: {
          requestId: uuidv4(),
          timestamp: new Date().toISOString(),
          version: "1.0.0",
          rateLimit: {
            limit: rateLimitResult.limit,
            remaining: rateLimitResult.remaining,
            reset: rateLimitResult.reset,
          },
        },
      },
      {
        headers: {
          "X-RateLimit-Limit": String(rateLimitResult.limit),
          "X-RateLimit-Remaining": String(rateLimitResult.remaining),
          "X-RateLimit-Reset": String(rateLimitResult.reset),
        },
      },
    );
  } catch (error) {
    console.error("BYOK session list error:", error);

    return NextResponse.json<ApiResponse>(
      {
        success: false,
        error: {
          code: ApiErrorCode.INTERNAL_ERROR,
          message: "Failed to list sessions",
          timestamp: new Date().toISOString(),
        },
      },
      { status: 500 },
    );
  }
}

// Export for testing
export { sessions, sessionTokens };
