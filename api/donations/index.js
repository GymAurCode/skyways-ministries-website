import { connectDB } from "../lib/db.js";
import { Donation } from "../lib/models.js";
import { requireAuth } from "../lib/auth.js";
import { validateDonation, sanitizeString } from "../lib/validate.js";
import { checkRateLimit, getClientIp } from "../lib/rateLimit.js";
import { uploadToCloudinary } from "../lib/cloudinary.js";

export default async function handler(req, res) {
  if (req.method === "OPTIONS") return res.status(200).end();
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
      let image_url = "";
      let image_public_id = "";

      if (body.image_base64) {
        if (typeof body.image_base64 !== "string" || !body.image_base64.startsWith("data:image/")) {
          return res.status(400).json({ error: "Invalid image format. Must be a base64 data URI." });
        }

        const MAX_BASE64_BYTES = 14 * 1024 * 1024; // ~10MB binary limit
        if (Buffer.byteLength(body.image_base64, "utf8") > MAX_BASE64_BYTES) {
          return res.status(413).json({ error: "Receipt image is too large. Maximum size is 10MB." });
        }

        const upload = await uploadToCloudinary(body.image_base64, "skyway/donations");
        if (upload.url && upload.public_id) {
          image_url = upload.url;
          image_public_id = upload.public_id;
        } else {
          return res.status(500).json({ error: "Failed to upload receipt image to storage." });
        }
      }

      const donation = await Donation.create({
        name: sanitizeString(body.name),
        amount: Number(body.amount),
        method: body.method,
        transaction_id: sanitizeString(body.transaction_id || ""),
        status: "pending",
        ip_address: ip,
        image_url,
        image_public_id,
      });

      // Return only safe fields — never expose ip_address to the submitter
      return res.status(201).json({
        _id: donation._id,
        name: donation.name,
        amount: donation.amount,
        method: donation.method,
        status: donation.status,
        image_url: donation.image_url,
        createdAt: donation.createdAt,
      });
    } catch (err) {
      console.error("[donations POST] error:", err.message);
      return res.status(500).json({ error: "Failed to submit donation" });
    }
  }

  return res.status(405).json({ error: "Method not allowed" });
}
