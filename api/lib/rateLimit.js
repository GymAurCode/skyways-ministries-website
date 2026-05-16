/**
 * In-memory rate limiter for Vercel serverless functions.
 *
 * NOTE: Because each Vercel function instance is isolated, this is a
 * best-effort limiter — it prevents abuse within a single instance.
 * For stricter enforcement across instances, use Upstash Redis or
 * Vercel's Edge Middleware.
 */

const store = new Map(); // key → { count, resetAt }

/**
 * @param {string} key        - Unique key (e.g. IP + route)
 * @param {number} limit      - Max requests allowed in the window
 * @param {number} windowMs   - Window duration in milliseconds
 * @returns {{ allowed: boolean, remaining: number, resetAt: number }}
 */
export function checkRateLimit(key, limit = 10, windowMs = 60_000) {
  const now = Date.now();
  const entry = store.get(key);

  if (!entry || now > entry.resetAt) {
    store.set(key, { count: 1, resetAt: now + windowMs });
    return { allowed: true, remaining: limit - 1, resetAt: now + windowMs };
  }

  if (entry.count >= limit) {
    return { allowed: false, remaining: 0, resetAt: entry.resetAt };
  }

  entry.count += 1;
  return { allowed: true, remaining: limit - entry.count, resetAt: entry.resetAt };
}

/**
 * Get the client IP from a Vercel/Node request object.
 */
export function getClientIp(req) {
  return (
    req.headers["x-forwarded-for"]?.split(",")[0]?.trim() ||
    req.headers["x-real-ip"] ||
    req.socket?.remoteAddress ||
    "unknown"
  );
}
