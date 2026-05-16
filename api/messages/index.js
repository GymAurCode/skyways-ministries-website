import { connectDB } from "../lib/db.js";
import { ContactMessage } from "../lib/models.js";
import { requireAuth } from "../lib/auth.js";
import { validateContactMessage, sanitizeString } from "../lib/validate.js";
import { checkRateLimit, getClientIp } from "../lib/rateLimit.js";

export default async function handler(req, res) {
  await connectDB();

  if (req.method === "GET") {
    try {
      requireAuth(req);
    } catch (e) {
      return res.status(401).json({ error: e.message || "Unauthorized" });
    }
    try {
      const list = await ContactMessage.find().sort({ createdAt: -1 }).lean();
      return res.status(200).json(list);
    } catch (err) {
      console.error("[messages GET]", err.message);
      return res.status(500).json({ error: "Failed to load messages" });
    }
  }

  if (req.method === "POST") {
    const ip = getClientIp(req);
    const rl = checkRateLimit(`contact:${ip}`, 8, 15 * 60 * 1000);
    if (!rl.allowed) {
      return res.status(429).json({
        error: "Too many messages from this address. Please try again later.",
        retryAfter: Math.ceil((rl.resetAt - Date.now()) / 1000),
      });
    }

    const body = req.body || {};
    const v = validateContactMessage(body);
    if (!v.valid) return res.status(400).json({ error: v.error });

    try {
      const msg = await ContactMessage.create({
        name: sanitizeString(body.name),
        email: sanitizeString(body.email),
        subject: sanitizeString(body.subject),
        message: sanitizeString(body.message),
        read: false,
        ip_address: ip,
      });
      return res.status(201).json({
        _id: msg._id,
        createdAt: msg.createdAt,
        message: "Thank you — we will get back to you soon.",
      });
    } catch (err) {
      console.error("[messages POST]", err.message);
      return res.status(500).json({ error: "Failed to send message" });
    }
  }

  return res.status(405).json({ error: "Method not allowed" });
}
