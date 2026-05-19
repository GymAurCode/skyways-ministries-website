import dns from "node:dns";
import mongoose from "mongoose";
import dotenv from "dotenv";

// ── Force DNS nameservers to bypass local ISP SRV resolution issues ─────────
try {
  dns.setServers(["8.8.8.8", "1.1.1.1"]);
} catch (e) {
  console.warn("⚠️ Custom DNS nameservers setup failed. Defaulting to system DNS:", e.message);
}

// ── Load env using dotenv ───────────────────────────────────────────────────
dotenv.config();

/**
 * Format and repair MongoDB connection URI if it contains unencoded special characters in password.
 */
export function formatMongoDBURI(uri) {
  if (!uri) return uri;

  let prefix = "";
  if (uri.startsWith("mongodb+srv://")) {
    prefix = "mongodb+srv://";
  } else if (uri.startsWith("mongodb://")) {
    prefix = "mongodb://";
  } else {
    return uri; // Unknown format
  }

  const remaining = uri.slice(prefix.length);
  const lastAtIndex = remaining.lastIndexOf("@");
  if (lastAtIndex === -1) {
    return uri; // No credentials in URI
  }

  const credentialsPart = remaining.slice(0, lastAtIndex);
  const hostPart = remaining.slice(lastAtIndex + 1);

  const firstColonIndex = credentialsPart.indexOf(":");
  if (firstColonIndex === -1) {
    return uri; // No password found
  }

  const username = credentialsPart.slice(0, firstColonIndex);
  const password = credentialsPart.slice(firstColonIndex + 1);

  const decodedPassword = decodeURIComponent(password);
  const encodedPassword = encodeURIComponent(decodedPassword);

  return `${prefix}${username}:${encodedPassword}@${hostPart}`;
}

/**
 * Mask the password inside a MongoDB connection string to safely log details without exposing credentials.
 */
export function getMaskedURI(uri) {
  if (!uri) return "NOT_SET";

  let prefix = "";
  if (uri.startsWith("mongodb+srv://")) {
    prefix = "mongodb+srv://";
  } else if (uri.startsWith("mongodb://")) {
    prefix = "mongodb://";
  } else {
    return "UNKNOWN_FORMAT";
  }

  const remaining = uri.slice(prefix.length);
  const lastAtIndex = remaining.lastIndexOf("@");
  if (lastAtIndex === -1) {
    return `${prefix}${remaining}`; // No credentials
  }

  const credentialsPart = remaining.slice(0, lastAtIndex);
  const hostPart = remaining.slice(lastAtIndex + 1);

  const firstColonIndex = credentialsPart.indexOf(":");
  if (firstColonIndex === -1) {
    return `${prefix}${credentialsPart}:[MASKED]@${hostPart}`;
  }

  const username = credentialsPart.slice(0, firstColonIndex);
  return `${prefix}${username}:[MASKED]@${hostPart}`;
}

/**
 * Diagnostic helper that inspects database errors and prints clear, actionable steps for correction.
 */
export function diagnoseConnectionError(err) {
  const msg = err.message || String(err);
  console.error("\n❌ --- DATABASE CONNECTION DIAGNOSTIC PANEL ---");
  console.error(`Original Error: ${msg}`);

  if (msg.includes("bad auth") || msg.includes("Authentication failed") || err.code === 8000) {
    console.error("🔍 DIAGNOSIS: Database Authentication Failed!");
    console.error("💡 Action Steps:");
    console.error("   1. Verify your database username and password in '.env'.");
    console.error("   2. Check the 'Database Access' tab in the MongoDB Atlas dashboard.");
    console.error("   3. Ensure a database user exists matching your .env credentials with Read/Write permissions.");
  } else if (msg.includes("querySrv ECONNREFUSED") || msg.includes("ENOTFOUND") || msg.includes("EAI_AGAIN")) {
    console.error("🔍 DIAGNOSIS: DNS/SRV Host Resolution Failed!");
    console.error("💡 Action Steps:");
    console.error("   1. Check if you have an active internet connection.");
    console.error("   2. Verify the host address in your MONGODB_URI connection string is correct.");
    console.error("   3. Your ISP or local router DNS might be blocking Atlas SRV lookup records.");
    console.error("      - Try changing your local DNS settings to Google DNS (8.8.8.8) or Cloudflare DNS (1.1.1.1).");
    console.error("      - Switch to a mobile hotspot or different network connection to bypass local router blocks.");
  } else if (msg.includes("Server selection timed out") || msg.includes("ETIMEDOUT")) {
    console.error("🔍 DIAGNOSIS: Network Connection Timed Out!");
    console.error("💡 Action Steps:");
    console.error("   1. Check if your current IP address is whitelisted in your MongoDB Atlas -> Network Access tab.");
    console.error("      - For local development, adding '0.0.0.0/0' (Allow access from anywhere) is the most reliable test.");
    console.error("   2. Your local router, firewall, or ISP is likely blocking outbound port 27017 (default MongoDB port).");
    console.error("      - Connect to your phone's mobile hotspot to verify if it connects immediately (hotspots don't block port 27017).");
  } else {
    console.error("🔍 DIAGNOSIS: General or system-level database connection failure.");
    console.error("💡 Action Steps:");
    console.error("   - Ensure MongoDB Atlas is online and active.");
    console.error("   - Verify that your connection string follows the format: mongodb+srv://<user>:<pwd>@<host>/<database>");
  }
  console.error("-----------------------------------------------\n");
}

// Validate MONGODB_URI env
const rawURI = process.env.MONGODB_URI;
if (!rawURI) {
  throw new Error(
    "FATAL: MONGODB_URI environment variable is not set. " +
      "Add it to your .env file before starting the server."
  );
}

const MONGODB_URI = formatMongoDBURI(rawURI);

// ── Connection cache (Vercel serverless-safe) ─────────────────────────────────
let cached = global._mongooseCache;
if (!cached) {
  cached = global._mongooseCache = { conn: null, promise: null };
}

// ── Register Mongoose Connection Listeners (Only Once) ────────────────────────
if (!global._mongooseListenersConfigured) {
  mongoose.connection.on("connected", () => {
    console.log("🟢 MongoDB Connected Successfully");
  });

  mongoose.connection.on("error", (err) => {
    console.error("🔴 MongoDB Connection Error event:");
    diagnoseConnectionError(err);
  });

  mongoose.connection.on("disconnected", () => {
    console.warn("⚠️ MongoDB Connection Disconnected.");
  });

  global._mongooseListenersConfigured = true;
}

export async function connectDB() {
  if (cached.conn) return cached.conn;

  if (!cached.promise) {
    cached.promise = mongoose
      .connect(MONGODB_URI, {
        bufferCommands: false,
        // Shortened connection timeouts for fast feedback during diagnostics
        serverSelectionTimeoutMS: 5000,
        connectTimeoutMS: 5000,
        socketTimeoutMS: 45000,
      })
      .then((m) => m)
      .catch((err) => {
        diagnoseConnectionError(err);
        throw err;
      });
  }

  try {
    cached.conn = await cached.promise;
  } catch (err) {
    cached.promise = null; // Reset cache promise to allow retries on subsequent requests
    throw err;
  }

  return cached.conn;
}
