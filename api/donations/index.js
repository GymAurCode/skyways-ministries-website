import { connectDB } from "../lib/db.js";
import { Donation } from "../lib/models.js";
import { requireAuth } from "../lib/auth.js";
import { validateDonation, sanitizeString } from "../lib/validate.js";
import { checkRateLimit, getClientIp } from "../lib/rateLimit.js";

export default async function handler(req, res) {
  await connectDB();

  // ── GET: protected (admin only) ──────────────────────────────────────────
  if (req.method === "GET") {
    try {
      requireAuth(req);
    } catch (err) {
      return res.status(401).json({ error: err.message || "Unauthorized" });
    }

    try {
      const donations = await Donation.find().sort({ createdAt: -1 }).lean();
      return res.status(200).json(donations);
    } catch (err) {
      console.error("[donations GET] error:", err.message);
      return res.status(500).json({ error: "Failed to fetch donations" });
    }
  }

  // ── POST: public (submit donation) ───────────────────────────────────────
  if (req.method === "POST") {
    // Rate limit: 5 donations per IP per 10 minutes (prevents spam)
    const ip = getClientIp(req);
    const rl = checkRateLimit(`donation:${ip}`, 5, 10 * 60 * 1000);
    if (!rl.allowed) {
      return res.status(429).json({
        error: "Too many donation submissions. Please wait a few minutes and try again.",
        retryAfter: Math.ceil((rl.resetAt - Date.now()) / 1000),
      });
    }

    // Validate all inputs on the backend — never trust the frontend
    const body = req.body || {};
    const validation = validateDonation(body);
    if (!validation.valid) {
      return res.status(400).json({ error: validation.error });
    }

    try {
      const donation = await Donation.create({
        name: sanitizeString(body.name),
        amount: Number(body.amount),
        method: body.method,
        transaction_id: sanitizeString(body.transaction_id || ""),
        status: "pending",
        ip_address: ip,
      });

      // Return only safe fields — never expose ip_address to the submitter
      return res.status(201).json({
        _id: donation._id,
        name: donation.name,
        amount: donation.amount,
        method: donation.method,
        status: donation.status,
        createdAt: donation.createdAt,
      });
    } catch (err) {
      console.error("[donations POST] error:", err.message);
      return res.status(500).json({ error: "Failed to submit donation" });
    }
  }

  return res.status(405).json({ error: "Method not allowed" });
}
