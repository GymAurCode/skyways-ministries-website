import jwt from "jsonwebtoken";

// ── Fail hard at startup if JWT_SECRET is missing ────────────────────────────
function getSecret() {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error(
      "FATAL: JWT_SECRET environment variable is not set. " +
        "Add it to your .env file before starting the server."
    );
  }
  if (secret.length < 32) {
    throw new Error(
      "FATAL: JWT_SECRET is too short. Use at least 32 random characters."
    );
  }
  return secret;
}

const JWT_EXPIRES = process.env.JWT_EXPIRES || "7d";

export function signToken(payload) {
  return jwt.sign(payload, getSecret(), { expiresIn: JWT_EXPIRES });
}

export function verifyToken(token) {
  return jwt.verify(token, getSecret());
}

export function extractToken(req) {
  const auth =
    (req.headers && (req.headers.authorization || req.headers.Authorization)) || "";
  if (auth.startsWith("Bearer ")) return auth.slice(7);
  return null;
}

/**
 * Validates the JWT on the request and returns the decoded payload.
 * Throws with a descriptive name so callers can map to HTTP status codes.
 */
export function requireAuth(req) {
  const token = extractToken(req);
  if (!token) {
    const err = new Error("No authentication token provided");
    err.name = "UnauthorizedError";
    throw err;
  }
  try {
    return verifyToken(token);
  } catch (jwtErr) {
    // Re-throw with a consistent name so route handlers can detect it
    const err = new Error(
      jwtErr.name === "TokenExpiredError" ? "Token has expired" : "Invalid token"
    );
    err.name = "UnauthorizedError";
    throw err;
  }
}
