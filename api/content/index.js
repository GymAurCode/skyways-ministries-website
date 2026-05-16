import { connectDB } from "../lib/db.js";
import { SiteContent } from "../lib/models.js";
import { requireAuth } from "../lib/auth.js";
import { uploadToCloudinary } from "../lib/cloudinary.js";
import { sanitizeString } from "../lib/validate.js";

// Fields that are allowed to be updated (whitelist approach)
const ALLOWED_TEXT_FIELDS = [
  "institute_name",
  "tagline",
  "since",
  "hero_title",
  "hero_description",
  "about_text",
  "about_mission",
  "about_vision",
  "about_intro",
  "contact_email",
  "contact_phone",
  "contact_address",
  "donation_instructions",
  "donation_jazzcash",
  "donation_easypaisa",
  "donation_bank_details",
  "social_facebook",
  "social_twitter",
  "social_instagram",
];

export default async function handler(req, res) {
  await connectDB();

  // ── GET: public ──────────────────────────────────────────────────────────
  if (req.method === "GET") {
    try {
      let content = await SiteContent.findOne({ singleton: "main" }).lean();
      if (!content) {
        // Auto-create with defaults on first request
        const created = await SiteContent.create({ singleton: "main" });
        content = created.toObject();
      }
      return res.status(200).json(content);
    } catch (err) {
      console.error("[content GET] error:", err.message);
      return res.status(500).json({ error: "Failed to fetch content" });
    }
  }

  // ── PUT: protected ───────────────────────────────────────────────────────
  if (req.method === "PUT") {
    try {
      requireAuth(req);
    } catch (err) {
      return res.status(401).json({ error: err.message || "Unauthorized" });
    }

    try {
      const body = req.body || {};

      // Build update object using whitelist — prevents mass assignment
      const updates = {};
      for (const field of ALLOWED_TEXT_FIELDS) {
        if (field in body) {
          updates[field] = sanitizeString(body[field]);
        }
      }

      // Handle logo upload
      if (body.logo_base64 && typeof body.logo_base64 === "string") {
        if (!body.logo_base64.startsWith("data:image/")) {
          return res.status(400).json({ error: "Invalid logo image format" });
        }
        const { url, public_id } = await uploadToCloudinary(body.logo_base64, "skyway/logos");
        updates.logo_url = url;
        updates.logo_public_id = public_id;
      }

      // Handle hero image upload
      if (body.hero_base64 && typeof body.hero_base64 === "string") {
        if (!body.hero_base64.startsWith("data:image/")) {
          return res.status(400).json({ error: "Invalid hero image format" });
        }
        const { url, public_id } = await uploadToCloudinary(body.hero_base64, "skyway/hero");
        updates.hero_image_url = url;
        updates.hero_public_id = public_id;
      }

      if (Object.keys(updates).length === 0) {
        return res.status(400).json({ error: "No valid fields provided for update" });
      }

      const content = await SiteContent.findOneAndUpdate(
        { singleton: "main" },
        { $set: updates },
        { new: true, upsert: true, runValidators: true }
      ).lean();

      return res.status(200).json(content);
    } catch (err) {
      if (err.name === "ValidationError") {
        const messages = Object.values(err.errors).map((e) => e.message);
        return res.status(400).json({ error: messages.join("; ") });
      }
      console.error("[content PUT] error:", err.message);
      return res.status(500).json({ error: "Failed to update content" });
    }
  }

  return res.status(405).json({ error: "Method not allowed" });
}
