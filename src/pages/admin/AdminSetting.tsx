import { useState } from "react";
import { authApi } from "../../lib/api";
import { useAuth } from "../../contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { KeyRound, CheckCircle, AlertCircle, Loader, ShieldCheck } from "lucide-react";

/** Must match backend validate.js rules exactly */
function validateNewPassword(password: string): string | null {
  if (password.length < 8) return "Password must be at least 8 characters";
  if (password.length > 128) return "Password must be 128 characters or fewer";
  if (!/[a-zA-Z]/.test(password)) return "Password must contain at least one letter";
  if (!/[0-9]/.test(password)) return "Password must contain at least one number";
  return null;
}

function PasswordStrength({ password }: { password: string }) {
  if (!password) return null;

  const checks = [
    { label: "8+ characters", pass: password.length >= 8 },
    { label: "Contains a letter", pass: /[a-zA-Z]/.test(password) },
    { label: "Contains a number", pass: /[0-9]/.test(password) },
  ];

  const score = checks.filter((c) => c.pass).length;
  const color = score === 3 ? "bg-green-500" : score === 2 ? "bg-amber-400" : "bg-red-400";

  return (
    <div className="mt-2 space-y-1.5">
      <div className="flex gap-1">
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            className={`h-1 flex-1 rounded-full transition-colors duration-300 ${
              i < score ? color : "bg-neutral-200"
            }`}
          />
        ))}
      </div>
      <div className="flex flex-wrap gap-x-3 gap-y-1">
        {checks.map((c) => (
          <span
            key={c.label}
            className={`text-xs flex items-center gap-1 ${
              c.pass ? "text-green-600" : "text-neutral-400"
            }`}
          >
            <span>{c.pass ? "✓" : "○"}</span>
            {c.label}
          </span>
        ))}
      </div>
    </div>
  );
}

export default function AdminSettings() {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [message, setMessage] = useState("");

  async function handleChangePassword(e: React.FormEvent) {
    e.preventDefault();
    setMessage("");

    // Client-side validation (mirrors backend rules)
    const pwError = validateNewPassword(form.newPassword);
    if (pwError) {
      setStatus("error");
      setMessage(pwError);
      return;
    }

    if (form.newPassword !== form.confirmPassword) {
      setStatus("error");
      setMessage("New passwords do not match.");
      return;
    }

    if (form.currentPassword === form.newPassword) {
      setStatus("error");
      setMessage("New password must be different from the current password.");
      return;
    }

    setStatus("loading");

    try {
      await authApi.changePassword(form.currentPassword, form.newPassword);
      setStatus("success");
      setMessage("Password changed successfully. You will be logged out in 3 seconds.");
      setForm({ currentPassword: "", newPassword: "", confirmPassword: "" });

      // Force re-login after password change for security
      setTimeout(() => {
        logout();
        navigate("/admin/login", { replace: true });
      }, 3000);
    } catch (err) {
      setStatus("error");
      setMessage(err instanceof Error ? err.message : "Failed to change password.");
    }
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="font-heading text-2xl font-bold text-neutral-900">Settings</h1>
        <p className="text-neutral-500 text-sm mt-1">Manage admin account security</p>
      </div>

      <div className="max-w-md space-y-6">
        {/* Change Password */}
        <div className="bg-white rounded-xl border border-neutral-200 p-4 sm:p-6">
          <div className="flex items-center gap-2 mb-5">
            <KeyRound size={18} className="text-primary-600" />
            <h2 className="font-heading font-semibold text-neutral-900">Change Password</h2>
          </div>

          {status === "success" && (
            <div className="flex items-center gap-2 bg-green-50 border border-green-200 text-green-700 rounded-lg px-4 py-3 mb-4 text-sm">
              <CheckCircle size={16} className="shrink-0" />
              {message}
            </div>
          )}
          {status === "error" && (
            <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 rounded-lg px-4 py-3 mb-4 text-sm">
              <AlertCircle size={16} className="shrink-0" />
              {message}
            </div>
          )}

          <form onSubmit={handleChangePassword} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1.5">
                Current Password
              </label>
              <input
                type="password"
                required
                autoComplete="current-password"
                value={form.currentPassword}
                onChange={(e) => setForm({ ...form, currentPassword: e.target.value })}
                className="w-full px-4 py-2.5 border border-neutral-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1.5">
                New Password
              </label>
              <input
                type="password"
                required
                minLength={8}
                autoComplete="new-password"
                value={form.newPassword}
                onChange={(e) => setForm({ ...form, newPassword: e.target.value })}
                className="w-full px-4 py-2.5 border border-neutral-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition"
              />
              <PasswordStrength password={form.newPassword} />
            </div>

            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1.5">
                Confirm New Password
              </label>
              <input
                type="password"
                required
                autoComplete="new-password"
                value={form.confirmPassword}
                onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })}
                className={`w-full px-4 py-2.5 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition ${
                  form.confirmPassword && form.confirmPassword !== form.newPassword
                    ? "border-red-300 bg-red-50"
                    : "border-neutral-300"
                }`}
              />
              {form.confirmPassword && form.confirmPassword !== form.newPassword && (
                <p className="text-xs text-red-500 mt-1">Passwords do not match</p>
              )}
            </div>

            <button
              type="submit"
              disabled={status === "loading" || status === "success"}
              className="w-full py-2.5 bg-primary-600 text-white rounded-lg text-sm font-medium hover:bg-primary-700 transition-colors disabled:opacity-60 flex items-center justify-center gap-2"
            >
              {status === "loading" ? (
                <Loader size={15} className="animate-spin" />
              ) : (
                <KeyRound size={15} />
              )}
              {status === "loading" ? "Changing..." : "Change Password"}
            </button>
          </form>
        </div>

        {/* Security Info */}
        <div className="bg-primary-50 border border-primary-100 rounded-xl p-5">
          <div className="flex items-center gap-2 mb-3">
            <ShieldCheck size={16} className="text-primary-600" />
            <h3 className="text-sm font-semibold text-primary-800">Security Notes</h3>
          </div>
          <ul className="text-xs text-primary-700 space-y-1.5">
            {[
              "Passwords are hashed with bcrypt (12 rounds) — never stored in plain text",
              "JWT tokens expire after 7 days — you will be logged out automatically",
              "After changing your password, you will be logged out and must sign in again",
              "Use a strong, unique password with letters and numbers",
            ].map((note) => (
              <li key={note} className="flex items-start gap-1.5">
                <span className="mt-0.5 shrink-0">•</span>
                {note}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
