import { connectDB } from "../lib/db.js";
import { Gallery } from "../lib/models.js";
import { requireAuth } from "../lib/auth.js";
import { deleteFromCloudinary } from "../lib/cloudinary.js";
import { sanitizeString } from "../lib/validate.js";

export default async function handler(req, res) {
  if (req.method === "OPTIONS") return res.status(200).end();
  try {
    requireAuth(req);
  } catch (err) {
    return res.status(401).json({ error: err.message || "Unauthorized" });
  }

  await connectDB();

  const { id } = req.query;
  if (!id || typeof id !== "string" || id.length !== 24) {
    return res.status(400).json({ error: "Invalid image ID" });
  }

  const image = await Gallery.findById(id);
  if (!image) {
    return res.status(404).json({ error: "Image not found" });
  }

  if (req.method === "PATCH") {
    try {
      const { caption } = req.body || {};
      if (typeof caption !== "string") {
        return res.status(400).json({ error: "Caption must be a string" });
      }
      image.caption = sanitizeString(caption);
      await image.save();
      return res.status(200).json(image.toObject());
    } catch (err) {
      console.error("[gallery PATCH]", err.message);
      return res.status(500).json({ error: "Failed to update caption" });
    }
  }

  if (req.method === "DELETE") {
    try {
      if (image.public_id) {
        try {
          await deleteFromCloudinary(image.public_id);
        } catch (cloudErr) {
          console.error("[gallery DELETE] Cloudinary:", cloudErr.message);
        }
      }
      await image.deleteOne();
      return res.status(200).json({ message: "Image deleted successfully" });
    } catch (err) {
      console.error("[gallery DELETE]", err.message);
      return res.status(500).json({ error: "Failed to delete image" });
    }
  }

  return res.status(405).json({ error: "Method not allowed" });
}
