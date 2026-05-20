import { connectDB } from "../lib/db.js";
import { ContactMessage } from "../lib/models.js";
import { requireAuth } from "../lib/auth.js";

export default async function handler(req, res) {
  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "DELETE" && req.method !== "PATCH") {
    return res.status(405).json({ error: "Method not allowed" });
  }

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

  if (req.method === "PATCH") {
    const body = req.body || {};
    if (typeof body.read !== "boolean") {
      return res.status(400).json({ error: "Body must include read: boolean" });
    }
    try {
      const doc = await ContactMessage.findByIdAndUpdate(
        id,
        { read: body.read },
        { new: true, runValidators: true }
      ).lean();
      if (!doc) return res.status(404).json({ error: "Not found" });
      return res.status(200).json(doc);
    } catch (err) {
      console.error("[messages PATCH]", err.message);
      return res.status(500).json({ error: "Failed to update message" });
    }
  }

  try {
    const doc = await ContactMessage.findByIdAndDelete(id);
    if (!doc) return res.status(404).json({ error: "Not found" });
    return res.status(200).json({ message: "Deleted" });
  } catch (err) {
    console.error("[messages DELETE]", err.message);
    return res.status(500).json({ error: "Failed to delete" });
  }
}
