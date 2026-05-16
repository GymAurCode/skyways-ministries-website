/** Public + admin shared shapes */

export interface SiteContent {
  _id?: string;
  institute_name: string;
  tagline: string;
  since: string;
  logo_url: string;
  hero_title: string;
  hero_description: string;
  hero_image_url: string;
  about_text: string;
  about_mission: string;
  about_vision: string;
  about_intro: string;
  contact_email: string;
  contact_phone: string;
  contact_address: string;
  donation_instructions: string;
  donation_jazzcash: string;
  donation_easypaisa: string;
  donation_bank_details: string;
  social_facebook: string;
  social_twitter: string;
  social_instagram: string;
  updatedAt?: string;
}

export interface GalleryImage {
  _id: string;
  image_url: string;
  caption: string;
  createdAt: string;
}

export interface Donation {
  _id: string;
  name: string;
  amount: number;
  method: "JazzCash" | "EasyPaisa" | "Bank Transfer";
  transaction_id: string;
  status: "pending" | "confirmed" | "rejected";
  createdAt: string;
  reviewed_at?: string;
  reviewed_by?: string;
}

export interface Testimonial {
  _id: string;
  name: string;
  role: string;
  message: string;
  image_url: string;
  sort_order: number;
  createdAt: string;
}

export interface ContactMessage {
  _id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  read: boolean;
  createdAt: string;
}

export interface Admin {
  id: string;
  username: string;
}
