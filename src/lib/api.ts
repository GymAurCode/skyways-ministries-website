/**
 * Centralized API client — all requests go to /api/* (Vercel serverless).
 *
 * Security features:
 * - Automatic 401 handling: clears token and redirects to login
 * - Safe JSON parsing: HTML error pages won't crash the app
 * - No secrets in this file — token read from localStorage only
 */

const BASE = "/api";

function getToken(): string | null {
  return localStorage.getItem("admin_token");
}

function authHeaders(): Record<string, string> {
  const token = getToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
}

/** Clear session and redirect to login on 401 */
function handleUnauthorized() {
  localStorage.removeItem("admin_token");
  localStorage.removeItem("admin_data");
  if (
    window.location.pathname.startsWith("/admin") &&
    window.location.pathname !== "/admin/login"
  ) {
    window.location.replace("/admin/login");
  }
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    headers: {
      "Content-Type": "application/json",
      ...authHeaders(),
      ...(options.headers as Record<string, string>),
    },
    ...options,
  });

  let data: Record<string, unknown> = {};
  try {
    data = await res.json();
  } catch {
    if (!res.ok) throw new Error(`Request failed: ${res.status}`);
  }

  if (res.status === 401) {
    handleUnauthorized();
    throw new Error((data.error as string) || "Session expired. Please log in again.");
  }

  if (!res.ok) {
    throw new Error((data.error as string) || `Request failed: ${res.status}`);
  }

  return data as T;
}

export const authApi = {
  login: (username: string, password: string) =>
    request<{ token: string; admin: { id: string; username: string } }>("/auth/login", {
      method: "POST",
      body: JSON.stringify({ username, password }),
    }),

  changePassword: (currentPassword: string, newPassword: string) =>
    request<{ message: string }>("/auth/change-password", {
      method: "POST",
      body: JSON.stringify({ currentPassword, newPassword }),
    }),
};

export const contentApi = {
  get: () => request<SiteContentResponse>("/content"),

  update: (data: Partial<SiteContentResponse> & { logo_base64?: string; hero_base64?: string }) =>
    request<SiteContentResponse>("/content", {
      method: "PUT",
      body: JSON.stringify(data),
    }),
};

export const galleryApi = {
  list: () => request<GalleryImageResponse[]>("/gallery"),

  upload: (image_base64: string, caption: string) =>
    request<GalleryImageResponse>("/gallery", {
      method: "POST",
      body: JSON.stringify({ image_base64, caption }),
    }),

  updateCaption: (id: string, caption: string) =>
    request<GalleryImageResponse>(`/gallery/${id}`, {
      method: "PATCH",
      body: JSON.stringify({ caption }),
    }),

  delete: (id: string) => request<{ message: string }>(`/gallery/${id}`, { method: "DELETE" }),
};

export const donationApi = {
  submit: (data: { name: string; amount: number; method: string; transaction_id: string }) =>
    request<DonationResponse>("/donations", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  list: () => request<DonationResponse[]>("/donations"),

  updateStatus: (id: string, status: "confirmed" | "rejected") =>
    request<DonationResponse>(`/donations/${id}`, {
      method: "PATCH",
      body: JSON.stringify({ status }),
    }),

  delete: (id: string) => request<{ message: string }>(`/donations/${id}`, { method: "DELETE" }),

  stats: () =>
    request<{
      total: number;
      pending: number;
      confirmed: number;
      rejected: number;
      totalAmount: number;
      galleryCount: number;
      testimonialCount: number;
      contactCount: number;
      unreadMessages: number;
    }>("/donations/stats"),
};

export const testimonialsApi = {
  list: () => request<TestimonialResponse[]>("/testimonials"),

  create: (body: {
    name: string;
    role?: string;
    message: string;
    sort_order?: number;
    image_base64?: string;
  }) =>
    request<TestimonialResponse>("/testimonials", {
      method: "POST",
      body: JSON.stringify(body),
    }),

  update: (
    id: string,
    body: {
      name: string;
      role?: string;
      message: string;
      sort_order?: number;
      image_base64?: string;
      remove_image?: boolean;
    }
  ) =>
    request<TestimonialResponse>(`/testimonials/${id}`, {
      method: "PUT",
      body: JSON.stringify(body),
    }),

  delete: (id: string) => request<{ message: string }>(`/testimonials/${id}`, { method: "DELETE" }),
};

export const messagesApi = {
  submit: (body: { name: string; email: string; subject: string; message: string }) =>
    request<{ _id: string; createdAt: string; message: string }>("/messages", {
      method: "POST",
      body: JSON.stringify(body),
    }),

  list: () => request<ContactMessageResponse[]>("/messages"),

  delete: (id: string) => request<{ message: string }>(`/messages/${id}`, { method: "DELETE" }),

  markRead: (id: string, read = true) =>
    request<ContactMessageResponse>(`/messages/${id}`, {
      method: "PATCH",
      body: JSON.stringify({ read }),
    }),
};

export interface SiteContentResponse {
  _id: string;
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
  updatedAt: string;
}

export interface GalleryImageResponse {
  _id: string;
  image_url: string;
  caption: string;
  createdAt: string;
}

export interface DonationResponse {
  _id: string;
  name: string;
  amount: number;
  method: "JazzCash" | "EasyPaisa" | "Bank Transfer";
  transaction_id: string;
  status: "pending" | "confirmed" | "rejected";
  createdAt: string;
}

export interface TestimonialResponse {
  _id: string;
  name: string;
  role: string;
  message: string;
  image_url: string;
  sort_order: number;
  createdAt: string;
}

export interface ContactMessageResponse {
  _id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  read: boolean;
  createdAt: string;
}
