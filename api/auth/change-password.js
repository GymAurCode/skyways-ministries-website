import bcrypt from "bcryptjs";
import { connectDB } from "../lib/db.js";
import { Admin } from "../lib/models.js";
import { requireAuth } from "../lib/auth.js";
import { validatePasswordChange } from "../lib/validate.js";

export default async function handler(req, res) {
  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  // Authenticate
  let decoded;
  try {
    decoded = requireAuth(req);
  } catch (err) {
    return res.status(401).json({ error: err.message || "Unauthorized" });
  }

  // Validate input
  const validation = validatePasswordChange(req.body || {});
  if (!validation.valid) {
    return res.status(400).json({ error: validation.error });
  }

  try {
    await connectDB();

    const { currentPassword, newPassword } = req.body;

    const admin = await Admin.findById(decoded.id).select("+password");
    if (!admin) {
      return res.status(404).json({ error: "Admin account not found" });
    }

    const valid = await bcrypt.compare(currentPassword, admin.password);
    if (!valid) {
      return res.status(401).json({ error: "Current password is incorrect" });
    }

    // Prevent reusing the same password
    const isSame = await bcrypt.compare(newPassword, admin.password);
    if (isSame) {
      return res.status(400).json({ error: "New password must be different from the current password" });
    }

    admin.password = await bcrypt.hash(newPassword, 12);
    await admin.save();

    return res.status(200).json({ message: "Password changed successfully" });
  } catch (err) {
    console.error("[auth/change-password] error:", err.message);
    return res.status(500).json({ error: "Internal server error" });
  }
}
