// ── Ensure dotenv is loaded first before any other imports ──────────────────
import dotenv from "dotenv";
dotenv.config();

import express from "express";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import mongoose from "mongoose";
import { connectDB, getMaskedURI } from "./api/lib/db.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ── Validate environment variables ───────────────────────────────────────────
const requiredEnvVars = ["MONGODB_URI", "JWT_SECRET"];
const missingEnvVars = requiredEnvVars.filter((varName) => !process.env[varName]);

if (missingEnvVars.length > 0) {
  console.error("❌ Environment validation failed!");
  missingEnvVars.forEach((varName) => {
    console.error(`   - Missing required variable: ${varName}`);
  });
  console.error("Please configure these variables in your .env file.");
  process.exit(1);
} else {
  console.log("✅ Environment validation: All required variables are present.");
  console.log(`📡 MongoDB URI Target: ${getMaskedURI(process.env.MONGODB_URI)}`);
}

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json({ limit: "15mb" }));
app.use(express.urlencoded({ extended: true, limit: "15mb" }));

// ── Health Check Endpoints (GET /health and GET /api/health) ──────────────────
const healthCheckHandler = (req, res) => {
  const dbState = mongoose.connection.readyState;
  const dbStatusText = 
    dbState === 1 ? "connected" : 
    dbState === 2 ? "connecting" : 
    "disconnected";
  
  res.status(200).json({
    status: "ok",
    db: dbStatusText,
  });
};

app.get("/health", healthCheckHandler);
app.get("/api/health", healthCheckHandler);

// Dynamic routing adapter for Vercel Serverless Handlers
function adaptVercelHandler(handler) {
  return async (req, res, next) => {
    // Copy path parameters from Express req.params into req.query to match Vercel behavior
    req.query = { ...req.query, ...req.params };
    
    try {
      await handler(req, res);
    } catch (err) {
      console.error(`[API Error] in handler:`, err.message || err);
      if (!res.headersSent) {
        res.status(500).json({ error: "Internal server error" });
      }
    }
  };
}

// ── Import Vercel API Handlers ────────────────────────────────────────────────
import loginHandler from "./api/auth/login.js";
import changePasswordHandler from "./api/auth/change-password.js";
import contentHandler from "./api/content/index.js";
import donationsHandler from "./api/donations/index.js";
import donationsStatsHandler from "./api/donations/stats.js";
import donationsIdHandler from "./api/donations/[id].js";
import galleryHandler from "./api/gallery/index.js";
import galleryIdHandler from "./api/gallery/[id].js";
import messagesHandler from "./api/messages/index.js";
import messagesIdHandler from "./api/messages/[id].js";
import testimonialsHandler from "./api/testimonials/index.js";
import testimonialsIdHandler from "./api/testimonials/[id].js";

// ── Register API Routes ───────────────────────────────────────────────────────
app.post("/api/auth/login", adaptVercelHandler(loginHandler));
app.post("/api/auth/change-password", adaptVercelHandler(changePasswordHandler));

app.all("/api/content", adaptVercelHandler(contentHandler));

app.get("/api/donations/stats", adaptVercelHandler(donationsStatsHandler));
app.all("/api/donations/:id", adaptVercelHandler(donationsIdHandler));
app.all("/api/donations", adaptVercelHandler(donationsHandler));

app.all("/api/gallery/:id", adaptVercelHandler(galleryIdHandler));
app.all("/api/gallery", adaptVercelHandler(galleryHandler));

app.all("/api/messages/:id", adaptVercelHandler(messagesIdHandler));
app.all("/api/messages", adaptVercelHandler(messagesHandler));

app.all("/api/testimonials/:id", adaptVercelHandler(testimonialsIdHandler));
app.all("/api/testimonials", adaptVercelHandler(testimonialsHandler));

// ── Serve Frontend Static Files (Production/Render Compatibility) ─────────────
const distPath = path.join(__dirname, "dist");
if (fs.existsSync(distPath)) {
  console.log(`ℹ️ Serving static frontend assets from: ${distPath}`);
  app.use(express.static(distPath));
  
  // Fallback all non-API routing to index.html for React Router compatibility
  app.get("*", (req, res, next) => {
    if (req.path.startsWith("/api/")) return next();
    res.sendFile(path.join(distPath, "index.html"));
  });
} else {
  console.log("ℹ️ Running in API-only dev server mode. Static front-end files are not built.");
}

// ── Connect to DB & Start Server ─────────────────────────────────────────────
console.log("Connecting to database...");

connectDB()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`🚀 Server successfully started and running on http://localhost:${PORT}`);
    });
  })
  .catch((err) => {
    console.error("❌ Server start halted: Mongoose connection failed.");
    process.exit(1);
  });
