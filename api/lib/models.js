import mongoose from "mongoose";

// ─── Admin Model ──────────────────────────────────────────────────────────────
const adminSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: [true, "Username is required"],
      unique: true,
      trim: true,
      lowercase: true,
      minlength: [3, "Username must be at least 3 characters"],
      maxlength: [50, "Username must be at most 50 characters"],
    },
    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: [8, "Password hash must be present"],
      select: false, // never returned in queries by default
    },
  },
  { timestamps: true }
);

// Prevent password hash from leaking in JSON responses
adminSchema.methods.toJSON = function () {
  const obj = this.toObject();
  delete obj.password;
  return obj;
};

export const Admin =
  mongoose.models.Admin || mongoose.model("Admin", adminSchema);

// ─── Site Content Model ───────────────────────────────────────────────────────
const siteContentSchema = new mongoose.Schema(
  {
    singleton: { type: String, default: "main", unique: true, immutable: true },
    institute_name: {
      type: String,
      default: "SKYWAY MINISTRIES OF CHRIST",
      maxlength: [100, "Institute name too long"],
    },
    tagline: { type: String, default: "TEACH - PREACH - HEAL", maxlength: [100, "Tagline too long"] },
    since: { type: String, default: "SINCE 2023", maxlength: [20, "Since field too long"] },
    logo_url: { type: String, default: "" },
    logo_public_id: { type: String, default: "" },
    hero_title: { type: String, default: "Teach · Preach · Heal", maxlength: [150, "Hero title too long"] },
    hero_description: { type: String, default: "", maxlength: [500, "Hero description too long"] },
    hero_image_url: { type: String, default: "" },
    hero_public_id: { type: String, default: "" },
    contact_email: {
      type: String,
      default: "",
      maxlength: [100, "Email too long"],
      validate: {
        validator: (v) => !v || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v),
        message: "Invalid email format",
      },
    },
    contact_phone: { type: String, default: "", maxlength: [30, "Phone too long"] },
    contact_address: { type: String, default: "", maxlength: [300, "Address too long"] },
    donation_instructions: { type: String, default: "", maxlength: [2000, "Instructions too long"] },
    /** Displayed on donation page — editable in admin */
    donation_jazzcash: { type: String, default: "", maxlength: [200, "JazzCash field too long"] },
    donation_easypaisa: { type: String, default: "", maxlength: [200, "EasyPaisa field too long"] },
    donation_bank_details: { type: String, default: "", maxlength: [2000, "Bank details too long"] },
    /** About section — mission / vision / intro (homepage) */
    about_mission: { type: String, default: "", maxlength: [3000, "Mission text too long"] },
    about_vision: { type: String, default: "", maxlength: [3000, "Vision text too long"] },
    about_intro: { type: String, default: "", maxlength: [5000, "Introduction too long"] },
    /** Legacy combined about (optional fallback) */
    about_text: { type: String, default: "", maxlength: [5000, "About text too long"] },
    social_facebook: { type: String, default: "", maxlength: [200, "URL too long"] },
    social_twitter: { type: String, default: "", maxlength: [200, "URL too long"] },
    social_instagram: { type: String, default: "", maxlength: [200, "URL too long"] },
  },
  { timestamps: true }
);

export const SiteContent =
  mongoose.models.SiteContent || mongoose.model("SiteContent", siteContentSchema);

// ─── Gallery Model ────────────────────────────────────────────────────────────
const gallerySchema = new mongoose.Schema(
  {
    image_url: {
      type: String,
      required: [true, "Image URL is required"],
    },
    public_id: {
      type: String,
      required: [true, "Cloudinary public_id is required for deletion support"],
    },
    caption: {
      type: String,
      default: "",
      trim: true,
      maxlength: [200, "Caption too long"],
    },
  },
  { timestamps: true }
);

// Index for faster sorted queries
gallerySchema.index({ createdAt: -1 });

export const Gallery =
  mongoose.models.Gallery || mongoose.model("Gallery", gallerySchema);

// ─── Donation Model ───────────────────────────────────────────────────────────
const donationSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Donor name is required"],
      trim: true,
      maxlength: [100, "Name too long"],
    },
    amount: {
      type: Number,
      required: [true, "Amount is required"],
      min: [1, "Amount must be at least 1"],
      max: [10_000_000, "Amount exceeds maximum allowed"],
      validate: {
        validator: Number.isFinite,
        message: "Amount must be a valid number",
      },
    },
    method: {
      type: String,
      enum: {
        values: ["JazzCash", "EasyPaisa", "Bank Transfer"],
        message: "Invalid payment method",
      },
      required: [true, "Payment method is required"],
    },
    transaction_id: {
      type: String,
      default: "",
      trim: true,
      maxlength: [100, "Transaction ID too long"],
    },
    purpose: {
      type: String,
      default: "",
      trim: true,
      maxlength: [200, "Purpose too long"],
    },
    status: {
      type: String,
      enum: {
        values: ["pending", "confirmed", "rejected"],
        message: "Invalid status",
      },
      default: "pending",
    },
    ip_address: { type: String, default: "" }, // for audit / rate-limit reference
    reviewed_at: { type: Date, default: null },
    reviewed_by: { type: String, default: "" },
  },
  { timestamps: true }
);

// Indexes for common admin queries
donationSchema.index({ status: 1, createdAt: -1 });
donationSchema.index({ createdAt: -1 });

export const Donation =
  mongoose.models.Donation || mongoose.model("Donation", donationSchema);

// ─── Testimonial Model ────────────────────────────────────────────────────────
const testimonialSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, maxlength: [100, "Name too long"] },
    role: { type: String, default: "", trim: true, maxlength: [120, "Role too long"] },
    message: { type: String, required: true, trim: true, maxlength: [2000, "Message too long"] },
    image_url: { type: String, default: "" },
    image_public_id: { type: String, default: "" },
    sort_order: { type: Number, default: 0 },
  },
  { timestamps: true }
);

testimonialSchema.index({ sort_order: 1, createdAt: -1 });

export const Testimonial =
  mongoose.models.Testimonial || mongoose.model("Testimonial", testimonialSchema);

// ─── Contact message (public form) ───────────────────────────────────────────
const contactMessageSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, maxlength: [100, "Name too long"] },
    email: { type: String, required: true, trim: true, maxlength: [100, "Email too long"] },
    subject: { type: String, required: true, trim: true, maxlength: [200, "Subject too long"] },
    message: { type: String, required: true, trim: true, maxlength: [5000, "Message too long"] },
    read: { type: Boolean, default: false },
    ip_address: { type: String, default: "" },
  },
  { timestamps: true }
);

contactMessageSchema.index({ createdAt: -1 });

export const ContactMessage =
  mongoose.models.ContactMessage || mongoose.model("ContactMessage", contactMessageSchema);
