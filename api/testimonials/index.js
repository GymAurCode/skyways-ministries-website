import { connectDB } from "../lib/db.js";
import { Testimonial } from "../lib/models.js";
import { requireAuth } from "../lib/auth.js";
import { uploadToCloudinary } from "../lib/cloudinary.js";
import { sanitizeString, validateTestimonialBody } from "../lib/validate.js";

const MAX_BASE64_BYTES = 14 * 1024 * 1024;

export default async function handler(req, res) {
  if (req.method === "OPTIONS") return res.status(200).end();
  await connectDB();

  if (req.method === "GET") {
    try {
      const list = await Testimonial.find().sort({ sort_order: 1, createdAt: -1 }).lean();
      return res.status(200).json(list);
    } catch (err) {
      console.error("[testimonials GET]", err.message);
      return res.status(500).json({ error: "Failed to load testimonials" });
    }
  }

  if (req.method === "POST") {
    try {
      requireAuth(req);
    } catch (e) {
      return res.status(401).json({ error: e.message || "Unauthorized" });
    }

    const body = req.body || {};
    const v = validateTestimonialBody(body);
    if (!v.valid) return res.status(400).json({ error: v.error });

    let image_url = "";
    let image_public_id = "";
    const b64 = body.image_base64;
    if (b64 && typeof b64 === "string" && b64.length > 0) {
      if (!b64.startsWith("data:image/")) {
        return res.status(400).json({ error: "Invalid image format" });
      }
      if (Buffer.byteLength(b64, "utf8") > MAX_BASE64_BYTES) {
        return res.status(413).json({ error: "Image too large" });
      }
      try {
        const up = await uploadToCloudinary(b64, "skyway/testimonials");
        image_url = up.url;
        image_public_id = up.public_id;
      } catch (e) {
        console.error("[testimonials POST] upload", e.message);
        return res.status(500).json({ error: "Image upload failed" });
      }
    }

    const sort_order =
      body.sort_order != null && body.sort_order !== "" ? Number(body.sort_order) : 0;

    try {
      const doc = await Testimonial.create({
        name: sanitizeString(body.name),
        role: sanitizeString(body.role || ""),
        message: sanitizeString(body.message),
        image_url,
        image_public_id,
        sort_order: Number.isFinite(sort_order) ? sort_order : 0,
      });
      return res.status(201).json(doc.toObject());
    } catch (err) {
      console.error("[testimonials POST]", err.message);
      return res.status(500).json({ error: "Failed to create testimonial" });
    }
  }

  return res.status(405).json({ error: "Method not allowed" });
}
