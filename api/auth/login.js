import bcrypt from "bcryptjs";
import { connectDB } from "../lib/db.js";
import { Admin } from "../lib/models.js";
import { signToken } from "../lib/auth.js";
import { validateLogin } from "../lib/validate.js";
import { checkRateLimit, getClientIp } from "../lib/rateLimit.js";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  // Rate limit: 10 login attempts per IP per 15 minutes
  const ip = getClientIp(req);
  const rl = checkRateLimit(`login:${ip}`, 10, 15 * 60 * 1000);
  if (!rl.allowed) {
    return res.status(429).json({
      error: "Too many login attempts. Please try again later.",
      retryAfter: Math.ceil((rl.resetAt - Date.now()) / 1000),
    });
  }

  // Validate input
  const validation = validateLogin(req.body || {});
  if (!validation.valid) {
    return res.status(400).json({ error: validation.error });
  }

  try {
    await connectDB();

    // ── Auto-seed admin if database is empty ──────────────────────────────────
    const defaultUsername = (process.env.ADMIN_USERNAME || "admin").trim().toLowerCase();
    // Use env password or fallback to admin123
    let defaultPassword = process.env.ADMIN_PASSWORD;
    if (!defaultPassword || defaultPassword.length < 8) {
       defaultPassword = "admin123";
    }

    const adminCount = await Admin.countDocuments();
    if (adminCount === 0) {
      console.log("ℹ️   No admins found. Auto-seeding default admin...");
      const hashed = await bcrypt.hash(defaultPassword, 12);
      await Admin.create({ username: defaultUsername, password: hashed });
      console.log(`✅  Auto-seeded default admin: ${defaultUsername}`);
    }
    // ──────────────────────────────────────────────────────────────────────────

    const { username, password } = req.body;
    const normUsername = username.trim().toLowerCase();

    // If the input credentials match the default config exactly, auto-sync/ensure they are correct in DB
    if (normUsername === defaultUsername && password === defaultPassword) {
      const existingDefault = await Admin.findOne({ username: defaultUsername }).select("+password");
      const hashed = await bcrypt.hash(defaultPassword, 12);
      if (!existingDefault) {
        await Admin.create({ username: defaultUsername, password: hashed });
        console.log(`✅  Auto-seeded default admin from login: ${defaultUsername}`);
      } else {
        const matches = await bcrypt.compare(defaultPassword, existingDefault.password);
        if (!matches) {
          existingDefault.password = hashed;
          await existingDefault.save();
          console.log(`✅  Updated default admin password in DB to match .env: ${defaultUsername}`);
        }
      }
    }

    // Always use lowercase for lookup (schema stores lowercase)
    const admin = await Admin.findOne({ username: normUsername })
      .select("+password") // password field has select:false on schema
      .lean();

    // Use constant-time comparison even when admin not found (prevents timing attacks)
    const dummyHash = "$2b$12$invalidhashfortimingprotection000000000000000000000000";
    const hashToCompare = admin ? admin.password : dummyHash;
    const valid = await bcrypt.compare(password, hashToCompare);

    if (!admin || !valid) {
      // Generic message — never reveal whether username exists
      return res.status(401).json({ error: "Invalid credentials" });
    }

    const token = signToken({ id: admin._id.toString(), username: admin.username });

    return res.status(200).json({
      token,
      admin: { id: admin._id.toString(), username: admin.username },
    });
  } catch (err) {
    console.error("[auth/login] error:", err.message);
    return res.status(500).json({ error: "Internal server error" });
  }
}
