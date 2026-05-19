import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import { authApi } from "../../lib/api";
import { LogIn, AlertCircle } from "lucide-react";
import logo from "../../assets/logo.webp";

export default function AdminLogin() {
  const { login, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ username: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isAuthenticated) navigate("/admin", { replace: true });
  }, [isAuthenticated, navigate]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const data = await authApi.login(form.username.trim(), form.password);
      login(data.token, data.admin);
      navigate("/admin", { replace: true });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-950 via-slate-900 to-slate-950 flex items-center justify-center p-4 relative overflow-hidden">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-32 -left-32 h-96 w-96 rounded-full bg-sky-400/10 blur-3xl" />
        <div className="absolute -bottom-32 -right-32 h-96 w-96 rounded-full bg-amber-300/8 blur-3xl" />
      </div>

      <div className="w-full max-w-sm relative space-y-8">
        <div className="text-center">
          <div className="inline-block mb-4 transition-transform duration-300 hover:scale-105">
            <img src={logo} alt="Skyway Ministries" className="h-20 w-20 rounded-full object-cover mx-auto ring-4 ring-white/15 shadow-2xl" />
          </div>
          <h1 className="font-heading text-2xl font-semibold text-white">Admin Panel</h1>
          <p className="text-sky-200 text-sm mt-1 font-medium tracking-wide">SKYWAY MINISTRIES OF CHRIST</p>
        </div>

        <div className="bg-white rounded-2xl shadow-2xl shadow-black/30 p-8">
          {error && (
            <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 rounded-lg px-4 py-3 mb-5 text-sm">
              <AlertCircle size={16} className="shrink-0" />
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {[
              { label: "Username", key: "username", type: "text", placeholder: "admin", autoComplete: "username" },
              { label: "Password", key: "password", type: "password", placeholder: "••••••••", autoComplete: "current-password" },
            ].map((field) => (
              <div key={field.key}>
                <label className="block text-sm font-medium text-neutral-700 mb-1.5">{field.label}</label>
                <input
                  type={field.type}
                  required
                  autoFocus={field.key === "username"}
                  autoComplete={field.autoComplete}
                  value={form[field.key as keyof typeof form]}
                  onChange={(e) => setForm({ ...form, [field.key]: e.target.value })}
                  className="w-full px-4 py-2.5 border border-neutral-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent transition-all duration-200 hover:border-neutral-400"
                  placeholder={field.placeholder}
                />
              </div>
            ))}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-sky-600 text-white rounded-lg font-semibold text-sm hover:bg-sky-700 transition-colors disabled:opacity-60 mt-2 flex items-center justify-center gap-2 shadow-md shadow-sky-900/20 hover:-translate-y-0.5 active:translate-y-0"
            >
              {loading ? <span className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full inline-block animate-spin" /> : <LogIn size={16} />}
              {loading ? "Signing in..." : "Sign In"}
            </button>
          </form>

          <p className="text-center text-xs text-neutral-400 mt-4">Default: admin / (your ADMIN_PASSWORD)</p>
        </div>
      </div>
    </div>
  );
}
