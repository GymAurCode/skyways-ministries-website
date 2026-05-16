/**
 * Lightweight input validation & sanitization helpers.
 * No external dependency — keeps the serverless bundle small.
 */

/**
 * Strip HTML tags and trim whitespace to prevent XSS via stored content.
 */
export function sanitizeString(value) {
  if (typeof value !== "string") return "";
  return value.replace(/<[^>]*>/g, "").trim();
}

/**
 * Validate a donation submission payload.
 * Returns { valid: true } or { valid: false, error: string }
 */
export function validateDonation({ name, amount, method, transaction_id }) {
  if (!name || typeof name !== "string" || name.trim().length === 0) {
    return { valid: false, error: "Donor name is required" };
  }
  if (name.trim().length > 100) {
    return { valid: false, error: "Name must be 100 characters or fewer" };
  }

  const parsedAmount = Number(amount);
  if (!amount || !Number.isFinite(parsedAmount) || parsedAmount < 1) {
    return { valid: false, error: "Amount must be a positive number (minimum 1)" };
  }
  if (parsedAmount > 10_000_000) {
    return { valid: false, error: "Amount exceeds the maximum allowed value" };
  }

  const validMethods = ["JazzCash", "EasyPaisa", "Bank Transfer"];
  if (!validMethods.includes(method)) {
    return { valid: false, error: "Payment method must be JazzCash, EasyPaisa, or Bank Transfer" };
  }

  if (transaction_id && transaction_id.length > 100) {
    return { valid: false, error: "Transaction ID must be 100 characters or fewer" };
  }

  return { valid: true };
}

/**
 * Public contact form
 */
export function validateContactMessage({ name, email, subject, message }) {
  if (!name || typeof name !== "string" || !name.trim()) {
    return { valid: false, error: "Name is required" };
  }
  if (name.trim().length > 100) return { valid: false, error: "Name is too long" };
  if (!email || typeof email !== "string" || !email.trim()) {
    return { valid: false, error: "Email is required" };
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
    return { valid: false, error: "Invalid email address" };
  }
  if (!subject || typeof subject !== "string" || !subject.trim()) {
    return { valid: false, error: "Subject is required" };
  }
  if (subject.length > 200) return { valid: false, error: "Subject is too long" };
  if (!message || typeof message !== "string" || !message.trim()) {
    return { valid: false, error: "Message is required" };
  }
  if (message.length > 5000) return { valid: false, error: "Message is too long" };
  return { valid: true };
}

/** Admin testimonial create/update (text fields; image validated separately) */
export function validateTestimonialBody({ name, message, role, sort_order }) {
  if (!name || typeof name !== "string" || !name.trim()) {
    return { valid: false, error: "Name is required" };
  }
  if (name.trim().length > 100) return { valid: false, error: "Name is too long" };
  if (!message || typeof message !== "string" || !message.trim()) {
    return { valid: false, error: "Message is required" };
  }
  if (message.length > 2000) return { valid: false, error: "Message is too long" };
  if (role != null && typeof role === "string" && role.length > 120) {
    return { valid: false, error: "Role is too long" };
  }
  if (sort_order != null && sort_order !== "") {
    const n = Number(sort_order);
    if (!Number.isFinite(n) || n < 0 || n > 1_000_000) {
      return { valid: false, error: "Invalid sort order" };
    }
  }
  return { valid: true };
}

export function validateLogin({ username, password }) {
  if (!username || typeof username !== "string" || username.trim().length === 0) {
    return { valid: false, error: "Username is required" };
  }
  if (!password || typeof password !== "string" || password.length === 0) {
    return { valid: false, error: "Password is required" };
  }
  return { valid: true };
}

/**
 * Validate a password change payload.
 */
export function validatePasswordChange({ currentPassword, newPassword }) {
  if (!currentPassword || typeof currentPassword !== "string") {
    return { valid: false, error: "Current password is required" };
  }
  if (!newPassword || typeof newPassword !== "string") {
    return { valid: false, error: "New password is required" };
  }
  if (newPassword.length < 8) {
    return { valid: false, error: "New password must be at least 8 characters" };
  }
  if (newPassword.length > 128) {
    return { valid: false, error: "New password must be 128 characters or fewer" };
  }
  // Require at least one letter and one number
  if (!/[a-zA-Z]/.test(newPassword) || !/[0-9]/.test(newPassword)) {
    return {
      valid: false,
      error: "New password must contain at least one letter and one number",
    };
  }
  return { valid: true };
}
