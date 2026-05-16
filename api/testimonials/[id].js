import { connectDB } from "../lib/db.js";
import { Testimonial } from "../lib/models.js";
import { requireAuth } from "../lib/auth.js";
import { uploadToCloudinary, deleteFromCloudinary } from "../lib/cloudinary.js";
import { sanitizeString, validateTestimonialBody } from "../lib/validate.js";

const MAX_BASE64_BYTES = 14 * 1024 * 1024;

export default async function handler(req, res) {
  try {
    requireAuth(req);
  } catch (e) {
    return res.status(401).json({ error: e.message || "Unauthorized" });
  }

  await connectDB();

  const { id } = req.query;
  if (!id || typeof id !== "string" || id.length !== 24) {
    return res.status(400).json({ error: "Invalid ID" });
  }

  const doc = await Testimonial.findById(id);
  if (!doc) return res.status(404).json({ error: "Not found" });

  if (req.method === "PUT") {
    const body = req.body || {};
    const v = validateTestimonialBody(body);
    if (!v.valid) return res.status(400).json({ error: v.error });

    doc.name = sanitizeString(body.name);
    doc.role = sanitizeString(body.role || "");
    doc.message = sanitizeString(body.message);
    if (body.sort_order != null && body.sort_order !== "") {
      const n = Number(body.sort_order);
      if (Number.isFinite(n) && n >= 0) doc.sort_order = n;
    }

    const b64 = body.image_base64;
    if (b64 && typeof b64 === "string" && b64.startsWith("data:image/")) {
      if (Buffer.byteLength(b64, "utf8") > MAX_BASE64_BYTES) {
        return res.status(413).json({ error: "Image too large" });
      }
      if (doc.image_public_id) {
        try {
          await deleteFromCloudinary(doc.image_public_id);
        } catch (_) {
          /* ignore */
        }
      }
      try {
        const up = await uploadToCloudinary(b64, "skyway/testimonials");
        doc.image_url = up.url;
        doc.image_public_id = up.public_id;
      } catch (e) {
        console.error("[testimonials PUT] upload", e.message);
        return res.status(500).json({ error: "Image upload failed" });
      }
    }

    if (body.remove_image === true) {
      if (doc.image_public_id) {
        try {
          await deleteFromCloudinary(doc.image_public_id);
        } catch (_) {}
      }
      doc.image_url = "";
      doc.image_public_id = "";
    }

    await doc.save();
    return res.status(200).json(doc.toObject());
  }

  if (req.method === "DELETE") {
    try {
      if (doc.image_public_id) {
        try {
          await deleteFromCloudinary(doc.image_public_id);
        } catch (_) {}
      }
      await doc.deleteOne();
      return res.status(200).json({ message: "Deleted" });
    } catch (err) {
      console.error("[testimonials DELETE]", err.message);
      return res.status(500).json({ error: "Failed to delete" });
    }
  }

  return res.status(405).json({ error: "Method not allowed" });
}
