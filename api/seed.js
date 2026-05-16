/**
 * Database seed script — idempotent, safe to run multiple times.
 *
 * Usage:
 *   node api/seed.js
 *
 * Required environment variables (in .env):
 *   MONGODB_URI   — MongoDB Atlas connection string
 *   ADMIN_USERNAME — (optional) defaults to "admin"
 *   ADMIN_PASSWORD — REQUIRED: set a strong password in .env, never hardcoded
 */
import "dotenv/config";
import mongoose from "mongoose";
import bcrypt from "bcryptjs";

// ── Validate required env vars ────────────────────────────────────────────────
const MONGODB_URI = process.env.MONGODB_URI;
if (!MONGODB_URI) {
  console.error("❌  MONGODB_URI is not set in .env");
  process.exit(1);
}

const ADMIN_USERNAME = (process.env.ADMIN_USERNAME || "admin").trim().toLowerCase();
/** Set in .env — use `admin123` for local seed only (change in production). */
let adminPassword = process.env.ADMIN_PASSWORD;

if (!adminPassword) {
  console.error(
    "❌  ADMIN_PASSWORD is not set in .env\n" +
      "    Example for first-time local setup:\n" +
      "    ADMIN_PASSWORD=admin123\n" +
      "    Requirements: min 8 chars, at least 1 letter + 1 number"
  );
  process.exit(1);
}

if (adminPassword.length < 8) {
  console.error("❌  ADMIN_PASSWORD must be at least 8 characters");
  process.exit(1);
}

if (!/[a-zA-Z]/.test(adminPassword) || !/[0-9]/.test(adminPassword)) {
  console.error("❌  ADMIN_PASSWORD must contain at least one letter and one number");
  process.exit(1);
}

// ── Minimal schemas for seeding ───────────────────────────────────────────────
const adminSchema = new mongoose.Schema(
  { username: String, password: String },
  { timestamps: true }
);
const Admin = mongoose.models.Admin || mongoose.model("Admin", adminSchema);

const siteContentSchema = new mongoose.Schema({ singleton: String }, { strict: false });
const SiteContent =
  mongoose.models.SiteContent || mongoose.model("SiteContent", siteContentSchema);

// ── Seed ──────────────────────────────────────────────────────────────────────
async function seed() {
  await mongoose.connect(MONGODB_URI);
  console.log("✅  Connected to MongoDB");

  // ── Admin user (idempotent) ──────────────────────────────────────────────
  const existing = await Admin.findOne({ username: ADMIN_USERNAME });
  if (!existing) {
    const hashed = await bcrypt.hash(adminPassword, 12);
    await Admin.create({ username: ADMIN_USERNAME, password: hashed });
    // Never log the actual password
    console.log(`✅  Admin created  →  username: ${ADMIN_USERNAME}`);
    console.log("    Password was read from ADMIN_PASSWORD env var (not logged for security)");
  } else {
    console.log(`ℹ️   Admin "${ADMIN_USERNAME}" already exists — skipping (use Settings to change password)`);
  }

  // ── Default site content (idempotent) ────────────────────────────────────
  const content = await SiteContent.findOne({ singleton: "main" });
  if (!content) {
    await SiteContent.create({
      singleton: "main",
      institute_name: "SKYWAY MINISTRIES OF CHRIST",
      tagline: "TEACH - PREACH - HEAL",
      since: "SINCE 2023",
      hero_title: "Teach · Preach · Heal",
      hero_description:
        "A ministry dedicated to spreading the Gospel, nurturing faith, and serving communities with love and compassion.",
      about_mission:
        "To teach the Word of God with clarity, preach Christ to every heart, and walk alongside those who seek healing and hope.",
      about_vision:
        "A path to heaven — a spiritual way to the sky — building a Christ-centered community marked by worship, compassion, and faithful service.",
      about_intro:
        "SKYWAY MINISTRIES OF CHRIST was founded in 2023 to serve our community through faithful teaching, bold proclamation of the Gospel, and ministries of healing and care.",
      about_text:
        "SKYWAY MINISTRIES OF CHRIST is committed to teaching the Word of God, preaching the Gospel to all nations, and healing the broken-hearted.",
      donation_instructions:
        "After transferring your gift, please submit the form with your name, amount, and payment method. Our team will verify and confirm your donation.",
      donation_jazzcash: "",
      donation_easypaisa: "",
      donation_bank_details: "",
    });
    console.log("✅  Default site content created");
  } else {
    console.log("ℹ️   Site content already exists — skipping");
  }

  await mongoose.disconnect();
  console.log("✅  Seed complete");
}

seed().catch((err) => {
  console.error("❌  Seed failed:", err.message);
  process.exit(1);
});
