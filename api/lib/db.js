import mongoose from "mongoose";

// ── Validate env at module load time ─────────────────────────────────────────
if (!process.env.MONGODB_URI) {
  throw new Error(
    "FATAL: MONGODB_URI environment variable is not set. " +
      "Add it to your .env file before starting the server."
  );
}

// ── Connection cache (Vercel serverless-safe) ─────────────────────────────────
let cached = global._mongooseCache;
if (!cached) {
  cached = global._mongooseCache = { conn: null, promise: null };
}

export async function connectDB() {
  if (cached.conn) return cached.conn;

  if (!cached.promise) {
    cached.promise = mongoose
      .connect(process.env.MONGODB_URI, {
        bufferCommands: false,
        serverSelectionTimeoutMS: 10000,
        socketTimeoutMS: 45000,
      })
      .then((m) => m);
  }

  try {
    cached.conn = await cached.promise;
  } catch (err) {
    cached.promise = null; // allow retry on next request
    throw err;
  }

  return cached.conn;
}
