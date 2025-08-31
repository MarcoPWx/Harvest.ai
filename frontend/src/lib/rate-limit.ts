/**
 * Rate Limiting Utilities
 * Implement token bucket algorithm for API rate limiting
 */

export interface RateLimitResult {
  allowed: boolean;
  limit: number;
  remaining: number;
  reset: number;
  retryAfter?: number;
}

export interface RateLimitConfig {
  windowMs: number; // Time window in milliseconds
  maxRequests: number; // Max requests per window
  keyPrefix?: string; // Prefix for storage keys
}

/**
 * Token Bucket implementation for rate limiting
 */
class TokenBucket {
  private tokens: number;
  private lastRefill: number;
  private readonly capacity: number;
  private readonly refillRate: number; // tokens per millisecond

  constructor(capacity: number, refillRatePerSecond: number) {
    this.capacity = capacity;
    this.tokens = capacity;
    this.lastRefill = Date.now();
    this.refillRate = refillRatePerSecond / 1000;
  }

  /**
   * Try to consume tokens from the bucket
   */
  consume(tokens: number = 1): boolean {
    this.refill();

    if (this.tokens >= tokens) {
      this.tokens -= tokens;
      return true;
    }

    return false;
  }

  /**
   * Get current token count
   */
  getTokens(): number {
    this.refill();
    return Math.floor(this.tokens);
  }

  /**
   * Refill tokens based on elapsed time
   */
  private refill(): void {
    const now = Date.now();
    const elapsed = now - this.lastRefill;
    const tokensToAdd = elapsed * this.refillRate;

    this.tokens = Math.min(this.capacity, this.tokens + tokensToAdd);
    this.lastRefill = now;
  }

  /**
   * Calculate time until next token is available
   */
  timeUntilNextToken(): number {
    if (this.tokens >= 1) return 0;

    const tokensNeeded = 1 - this.tokens;
    return Math.ceil(tokensNeeded / this.refillRate);
  }
}

/**
 * Rate Limiter with multiple buckets for different endpoints
 */
export class RateLimiter {
  private buckets: Map<string, TokenBucket> = new Map();
  private configs: Map<string, RateLimitConfig> = new Map();

  constructor() {
    // Define rate limits for different endpoints
    this.configs.set("byok_create", {
      windowMs: 60 * 1000, // 1 minute
      maxRequests: 10,
    });

    this.configs.set("byok_list", {
      windowMs: 60 * 1000,
      maxRequests: 60,
    });

    this.configs.set("config_read", {
      windowMs: 60 * 1000,
      maxRequests: 100,
    });

    this.configs.set("config_write", {
      windowMs: 60 * 1000,
      maxRequests: 20,
    });

    this.configs.set("default", {
      windowMs: 60 * 1000,
      maxRequests: 60,
    });
  }

  /**
   * Check if a request is allowed
   */
  async check(identifier: string, endpoint: string = "default"): Promise<RateLimitResult> {
    const config = this.configs.get(endpoint) || this.configs.get("default")!;
    const key = `${endpoint}:${identifier}`;

    let bucket = this.buckets.get(key);
    if (!bucket) {
      const refillRate = config.maxRequests / (config.windowMs / 1000);
      bucket = new TokenBucket(config.maxRequests, refillRate);
      this.buckets.set(key, bucket);
    }

    const allowed = bucket.consume();
    const remaining = bucket.getTokens();
    const reset = Date.now() + config.windowMs;

    const result: RateLimitResult = {
      allowed,
      limit: config.maxRequests,
      remaining: Math.floor(remaining),
      reset: Math.floor(reset / 1000),
    };

    if (!allowed) {
      result.retryAfter = Math.ceil(bucket.timeUntilNextToken() / 1000);
    }

    return result;
  }

  /**
   * Reset rate limit for a specific identifier
   */
  reset(identifier: string, endpoint?: string): void {
    if (endpoint) {
      this.buckets.delete(`${endpoint}:${identifier}`);
    } else {
      // Reset all endpoints for this identifier
      for (const key of this.buckets.keys()) {
        if (key.endsWith(`:${identifier}`)) {
          this.buckets.delete(key);
        }
      }
    }
  }

  /**
   * Clean up old buckets to prevent memory leaks
   */
  cleanup(): void {
    const now = Date.now();
    const maxAge = 60 * 60 * 1000; // 1 hour

    // In a real implementation, we'd track last access time
    // For now, clear all buckets periodically
    if (this.buckets.size > 1000) {
      this.buckets.clear();
    }
  }
}

/**
 * Sliding Window Rate Limiter (alternative implementation)
 */
export class SlidingWindowRateLimiter {
  private requests: Map<string, number[]> = new Map();

  constructor(
    private windowMs: number,
    private maxRequests: number,
  ) {}

  /**
   * Check if request is allowed using sliding window
   */
  async check(identifier: string): Promise<RateLimitResult> {
    const now = Date.now();
    const windowStart = now - this.windowMs;

    // Get existing requests for this identifier
    let timestamps = this.requests.get(identifier) || [];

    // Remove expired timestamps
    timestamps = timestamps.filter((t) => t > windowStart);

    const allowed = timestamps.length < this.maxRequests;

    if (allowed) {
      timestamps.push(now);
      this.requests.set(identifier, timestamps);
    }

    return {
      allowed,
      limit: this.maxRequests,
      remaining: Math.max(0, this.maxRequests - timestamps.length),
      reset: Math.floor((windowStart + this.windowMs) / 1000),
      retryAfter: allowed ? undefined : Math.ceil((timestamps[0] + this.windowMs - now) / 1000),
    };
  }

  /**
   * Clean up old request records
   */
  cleanup(): void {
    const now = Date.now();
    const windowStart = now - this.windowMs;

    for (const [key, timestamps] of this.requests.entries()) {
      const filtered = timestamps.filter((t) => t > windowStart);
      if (filtered.length === 0) {
        this.requests.delete(key);
      } else {
        this.requests.set(key, filtered);
      }
    }
  }
}

/**
 * Distributed Rate Limiter (stub for Redis-based implementation)
 */
export class DistributedRateLimiter {
  constructor(
    private redisUrl?: string,
    private fallback: RateLimiter = new RateLimiter(),
  ) {}

  async check(identifier: string, endpoint: string = "default"): Promise<RateLimitResult> {
    // In production, this would use Redis or similar
    // For now, fall back to in-memory implementation
    return this.fallback.check(identifier, endpoint);
  }
}

// Singleton instance
let rateLimiter: RateLimiter | null = null;

export function getRateLimiter(): RateLimiter {
  if (!rateLimiter) {
    rateLimiter = new RateLimiter();

    // Set up periodic cleanup
    if (typeof window === "undefined") {
      // Server-side: clean up every 5 minutes
      setInterval(() => rateLimiter?.cleanup(), 5 * 60 * 1000);
    }
  }

  return rateLimiter;
}

/**
 * Express/Next.js middleware for rate limiting
 */
export function rateLimitMiddleware(endpoint: string = "default") {
  const limiter = getRateLimiter();

  return async (req: any, res: any, next: any) => {
    const identifier = req.ip || req.headers["x-forwarded-for"] || "unknown";
    const result = await limiter.check(identifier, endpoint);

    // Set rate limit headers
    res.setHeader("X-RateLimit-Limit", result.limit);
    res.setHeader("X-RateLimit-Remaining", result.remaining);
    res.setHeader("X-RateLimit-Reset", result.reset);

    if (!result.allowed) {
      res.setHeader("Retry-After", result.retryAfter || 60);
      return res.status(429).json({
        error: "Too many requests",
        retryAfter: result.retryAfter,
      });
    }

    next();
  };
}
