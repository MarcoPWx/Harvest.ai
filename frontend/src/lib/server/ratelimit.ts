type RateInfo = {
  limit: number;
  remaining: number;
  reset: number; // unix seconds when window resets
  allowed: boolean;
};

const buckets = new Map<string, { count: number; resetAt: number }>();

function nowMs() {
  return Date.now();
}

export function checkAndConsume(identifier: string, limit = 60, windowMs = 60_000): RateInfo {
  const now = nowMs();
  const bucket = buckets.get(identifier);
  if (!bucket || bucket.resetAt <= now) {
    buckets.set(identifier, { count: 1, resetAt: now + windowMs });
    return {
      limit,
      remaining: limit - 1,
      reset: Math.ceil((now + windowMs) / 1000),
      allowed: true,
    };
  }
  if (bucket.count >= limit) {
    return { limit, remaining: 0, reset: Math.ceil(bucket.resetAt / 1000), allowed: false };
  }
  bucket.count += 1;
  return {
    limit,
    remaining: Math.max(0, limit - bucket.count),
    reset: Math.ceil(bucket.resetAt / 1000),
    allowed: true,
  };
}

export function buildRateHeaders(info: RateInfo): Record<string, string> {
  return {
    "X-RateLimit-Limit": String(info.limit),
    "X-RateLimit-Remaining": String(info.remaining),
    "X-RateLimit-Reset": String(info.reset),
  };
}

export function getIdentifierFromHeaders(h: Headers): string {
  const fwd = h.get("x-forwarded-for") || "";
  const ip = fwd.split(",")[0].trim() || "local";
  return ip;
}
