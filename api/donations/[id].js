import { connectDB } from "../lib/db.js";
import { Donation } from "../lib/models.js";
import { requireAuth } from "../lib/auth.js";
import { deleteFromCloudinary } from "../lib/cloudinary.js";

export default async function handler(req, res) {
  if (req.method === "OPTIONS") return res.status(200).end();
  // ── PATCH: protected ─────────────────────────────────────────────────────
  if (req.method === "PATCH") {
    let decoded;
    try {
      decoded = requireAuth(req);
    } catch (err) {
      return res.status(401).json({ error: err.message || "Unauthorized" });
    }

    try {
      await connectDB();
      const { id } = req.query;
      const { status } = req.body || {};

      if (!["confirmed", "rejected"].includes(status)) {
        return res.status(400).json({ error: "Status must be 'confirmed' or 'rejected'" });
      }

      const donation = await Donation.findByIdAndUpdate(
        id,
        {
          status,
          reviewed_at: new Date(),
          reviewed_by: decoded.username,
        },
        { new: true, runValidators: true }
      ).lean();

      if (!donation) {
        return res.status(404).json({ error: "Donation not found" });
      }

      return res.status(200).json(donation);
    } catch (err) {
      console.error("[donations PATCH] error:", err.message);
      return res.status(500).json({ error: "Failed to update donation status" });
    }
  }

  // ── DELETE: protected ────────────────────────────────────────────────────
  if (req.method === "DELETE") {
    try {
      requireAuth(req);
    } catch (err) {
      return res.status(401).json({ error: err.message || "Unauthorized" });
    }

    try {
      await connectDB();
      const { id } = req.query;
      const donation = await Donation.findById(id).lean();

      if (!donation) {
        return res.status(404).json({ error: "Donation not found" });
      }

      if (donation.image_public_id) {
        try {
          await deleteFromCloudinary(donation.image_public_id);
        } catch (cloudinaryErr) {
          console.error("[donations DELETE] Cloudinary error:", cloudinaryErr.message);
        }
      }

      await Donation.findByIdAndDelete(id);

      return res.status(200).json({ message: "Donation deleted successfully" });
    } catch (err) {
      console.error("[donations DELETE] error:", err.message);
      return res.status(500).json({ error: "Failed to delete donation" });
    }
  }

  return res.status(405).json({ error: "Method not allowed" });
}
