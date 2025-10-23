import { Redis } from "https://esm.sh/@upstash/redis@1.28.0";

/**
 * Rate limiting utility using Upstash Redis
 * Implements sliding window rate limiting
 */

interface RateLimitResult {
  success: boolean;
  limit: number;
  remaining: number;
  reset: number;
}

/**
 * Check if a user has exceeded their rate limit
 * @param userId - User ID to check
 * @param limit - Maximum requests per minute (default: 100)
 * @returns RateLimitResult with success status and metadata
 */
export async function checkRateLimit(
  userId: string,
  limit: number = 100
): Promise<RateLimitResult> {
  try {
    const redisUrl = Deno.env.get("UPSTASH_REDIS_URL");
    const redisToken = Deno.env.get("UPSTASH_REDIS_TOKEN");

    if (!redisUrl || !redisToken) {
      console.warn("Redis credentials not configured, skipping rate limit");
      return {
        success: true,
        limit,
        remaining: limit,
        reset: Date.now() + 60000,
      };
    }

    const redis = new Redis({
      url: redisUrl,
      token: redisToken,
    });

    // Use current minute as the time window
    const now = Date.now();
    const currentWindow = Math.floor(now / 60000);
    const key = `rate_limit:${userId}:${currentWindow}`;

    // Increment the counter
    const count = await redis.incr(key);

    // Set expiration on first request in this window
    if (count === 1) {
      await redis.expire(key, 60); // Expire after 60 seconds
    }

    const remaining = Math.max(0, limit - count);
    const reset = (currentWindow + 1) * 60000;

    return {
      success: count <= limit,
      limit,
      remaining,
      reset,
    };
  } catch (error) {
    console.error("Rate limit check failed:", error);
    // On error, allow the request to proceed
    return {
      success: true,
      limit,
      remaining: limit,
      reset: Date.now() + 60000,
    };
  }
}

/**
 * Middleware to apply rate limiting to Edge Functions
 * Returns a 429 response if rate limit is exceeded
 */
export async function withRateLimit(
  userId: string,
  limit: number = 100
): Promise<Response | null> {
  const result = await checkRateLimit(userId, limit);

  if (!result.success) {
    return new Response(
      JSON.stringify({
        error: "Too many requests. Please try again later.",
        code: "RATE_LIMIT_EXCEEDED",
        details: {
          limit: result.limit,
          reset: new Date(result.reset).toISOString(),
        },
      }),
      {
        status: 429,
        headers: {
          "Content-Type": "application/json",
          "X-RateLimit-Limit": result.limit.toString(),
          "X-RateLimit-Remaining": result.remaining.toString(),
          "X-RateLimit-Reset": result.reset.toString(),
          "Retry-After": "60",
        },
      }
    );
  }

  return null;
}
