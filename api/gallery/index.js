import { connectDB } from "../lib/db.js";
import { Gallery } from "../lib/models.js";
import { requireAuth } from "../lib/auth.js";
import { uploadToCloudinary } from "../lib/cloudinary.js";
import { sanitizeString } from "../lib/validate.js";

// Max base64 image size: ~10MB (base64 is ~33% larger than binary)
const MAX_BASE64_BYTES = 14 * 1024 * 1024;

export default async function handler(req, res) {
  await connectDB();

  // ── GET: public ──────────────────────────────────────────────────────────
  if (req.method === "GET") {
    try {
      const images = await Gallery.find().sort({ createdAt: -1 }).lean();
      return res.status(200).json(images);
    } catch (err) {
      console.error("[gallery GET] error:", err.message);
      return res.status(500).json({ error: "Failed to fetch gallery" });
    }
  }

  // ── POST: protected ──────────────────────────────────────────────────────
  if (req.method === "POST") {
    try {
      requireAuth(req);
    } catch (err) {
      return res.status(401).json({ error: err.message || "Unauthorized" });
    }

    try {
      const { image_base64, caption } = req.body || {};

      if (!image_base64 || typeof image_base64 !== "string") {
        return res.status(400).json({ error: "Image data is required" });
      }

      // Validate it's actually a base64 data URI
      if (!image_base64.startsWith("data:image/")) {
        return res.status(400).json({ error: "Invalid image format. Must be a base64 data URI." });
      }

      // Size guard
      if (Buffer.byteLength(image_base64, "utf8") > MAX_BASE64_BYTES) {
        return res.status(413).json({ error: "Image is too large. Maximum size is 10MB." });
      }

      const { url, public_id } = await uploadToCloudinary(image_base64, "skyway/gallery");

      if (!url || !public_id) {
        return res.status(500).json({ error: "Cloudinary upload failed — no URL returned" });
      }

      const image = await Gallery.create({
        image_url: url,
        public_id,
        caption: sanitizeString(caption || ""),
      });

      return res.status(201).json(image);
    } catch (err) {
      console.error("[gallery POST] error:", err.message);
      return res.status(500).json({ error: "Failed to upload image" });
    }
  }

  return res.status(405).json({ error: "Method not allowed" });
}
