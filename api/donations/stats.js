import { connectDB } from "../lib/db.js";
import { Donation } from "../lib/models.js";
import { Gallery } from "../lib/models.js";
import { Testimonial } from "../lib/models.js";
import { ContactMessage } from "../lib/models.js";
import { requireAuth } from "../lib/auth.js";

export default async function handler(req, res) {
  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    requireAuth(req);
  } catch {
    return res.status(401).json({ error: "Unauthorized" });
  }

  try {
    await connectDB();

    const [donations, galleryCount, testimonialCount, contactCount, unreadMessages] = await Promise.all([
      Donation.find({}, "amount status").lean(),
      Gallery.countDocuments(),
      Testimonial.countDocuments(),
      ContactMessage.countDocuments(),
      ContactMessage.countDocuments({ read: false }),
    ]);

    const pending = donations.filter((d) => d.status === "pending").length;
    const confirmed = donations.filter((d) => d.status === "confirmed").length;
    const rejected = donations.filter((d) => d.status === "rejected").length;
    const totalAmount = donations
      .filter((d) => d.status === "confirmed")
      .reduce((sum, d) => sum + Number(d.amount), 0);

    return res.status(200).json({
      total: donations.length,
      pending,
      confirmed,
      rejected,
      totalAmount,
      galleryCount,
      testimonialCount,
      contactCount,
      unreadMessages,
    });
  } catch (err) {
    console.error("[donations/stats]", err);
    return res.status(500).json({ error: "Failed to fetch stats" });
  }
}
