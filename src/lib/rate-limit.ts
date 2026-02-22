import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

let redis: Redis | null = null;

function getRedis(url: string, token: string): Redis {
  if (!redis) {
    redis = new Redis({ url, token });
  }
  return redis;
}

export type RateLimitConfig = {
  /** Requests allowed in the window */
  limit: number;
  /** Window duration string, e.g. "15 m", "1 h" */
  window: `${number} ${"s" | "m" | "h" | "d"}`;
};

const LIMITS = {
  magicLink: { limit: 3, window: "15 m" } as RateLimitConfig,
  quizCreation: { limit: 5, window: "1 h" } as RateLimitConfig,
  friendResponse: { limit: 10, window: "1 h" } as RateLimitConfig,
} as const;

export function getRateLimiter(
  type: keyof typeof LIMITS,
  redisUrl: string,
  redisToken: string
): Ratelimit {
  const config = LIMITS[type];
  const r = getRedis(redisUrl, redisToken);

  return new Ratelimit({
    redis: r,
    limiter: Ratelimit.slidingWindow(config.limit, config.window),
    prefix: `pq:${type}`,
  });
}

export async function checkRateLimit(
  type: keyof typeof LIMITS,
  identifier: string,
  redisUrl: string,
  redisToken: string
): Promise<{ success: boolean; remaining: number; reset: number }> {
  try {
    const limiter = getRateLimiter(type, redisUrl, redisToken);
    const result = await limiter.limit(identifier);
    return {
      success: result.success,
      remaining: result.remaining,
      reset: result.reset,
    };
  } catch (err) {
    console.error(`Rate limiter error for ${type}:`, err);
    // Fail-secure: deny requests when rate limiter is unavailable
    return { success: false, remaining: 0, reset: Date.now() + 60_000 };
  }
}

/**
 * Check if rate limiting is configured. When not configured in production,
 * callers should deny the request rather than allowing unlimited access.
 */
export function isRateLimitConfigured(env: {
  UPSTASH_REDIS_REST_URL?: string;
  UPSTASH_REDIS_REST_TOKEN?: string;
}): boolean {
  return !!(env.UPSTASH_REDIS_REST_URL && env.UPSTASH_REDIS_REST_TOKEN);
}
