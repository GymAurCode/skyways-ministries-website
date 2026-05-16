import { useState } from "react";
import { donationApi } from "../lib/api";
import { Heart, CheckCircle, AlertCircle, Loader2 } from "lucide-react";
import { useTheme } from "../contexts/ThemeContext";

type Method = "JazzCash" | "EasyPaisa" | "Bank Transfer";

const METHODS: Method[] = ["JazzCash", "EasyPaisa", "Bank Transfer"];

const QUICK_AMOUNTS = [500, 1000, 2500, 5000];

export default function DonationForm() {
  const { isDark } = useTheme();
  const [form, setForm] = useState({
    name: "",
    amount: "",
    method: "JazzCash" as Method,
    transaction_id: "",
  });
  const [status, setStatus] = useState<"idle" | "loading" | "success">("idle");
  const [error, setError] = useState("");

  function validate(): string | null {
    if (!form.name.trim()) return "Please enter your full name.";
    if (!form.amount || isNaN(Number(form.amount)) || Number(form.amount) < 1)
      return "Please enter a valid donation amount (minimum 1).";
    if (Number(form.amount) > 10_000_000) return "Amount exceeds the maximum allowed value.";
    return null;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const validationError = validate();
    if (validationError) {
      setError(validationError);
      return;
    }

    setStatus("loading");
    setError("");

    try {
      await donationApi.submit({
        name: form.name.trim(),
        amount: parseFloat(form.amount),
        method: form.method,
        transaction_id: form.transaction_id.trim(),
      });
      setForm({ name: "", amount: "", method: "JazzCash", transaction_id: "" });
      setStatus("success");
    } catch (err) {
      setStatus("idle");
      setError(err instanceof Error ? err.message : "Failed to submit donation. Please try again.");
    }
  }

  const inputClass = `w-full px-4 py-3 rounded-xl text-sm transition-all duration-200 outline-none ${
    isDark
      ? "bg-white/5 border border-white/8 text-white placeholder-slate-600 focus:border-sky-400/50 focus:bg-white/8"
      : "bg-slate-50 border border-slate-200 text-slate-900 placeholder-slate-400 focus:border-sky-400 focus:bg-white"
  }`;

  const labelClass = `block text-xs font-semibold uppercase tracking-wider mb-2 ${isDark ? "text-slate-400" : "text-slate-500"}`;

  if (status === "success") {
    return (
      <div className="text-center py-8 animate-[fadeIn_0.35s_ease-out]">
        <div className="h-20 w-20 rounded-full bg-emerald-500/15 border-2 border-emerald-500/30 flex items-center justify-center mx-auto mb-6">
          <CheckCircle size={36} className="text-emerald-400" />
        </div>
        <h3 className={`font-heading text-2xl font-semibold mb-3 ${isDark ? "text-white" : "text-slate-900"}`}>Thank you</h3>
        <p className={`text-sm mb-6 ${isDark ? "text-slate-400" : "text-slate-600"}`}>
          Your donation was received as <strong>pending</strong>. Our team will review and confirm it soon.
        </p>
        <button
          type="button"
          onClick={() => setStatus("idle")}
          className="px-6 py-3 rounded-xl bg-gradient-to-r from-sky-500 to-primary-500 text-white text-sm font-semibold hover:opacity-95 transition-all"
        >
          Submit another
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="flex items-center gap-2 mb-2">
        <Heart size={18} className="text-rose-400" />
        <h3 className={`font-heading text-xl font-semibold ${isDark ? "text-white" : "text-slate-900"}`}>Submit donation</h3>
      </div>

      {error && (
        <div className="flex items-center gap-2 bg-red-500/10 border border-red-500/20 text-red-400 rounded-xl px-4 py-3 text-sm">
          <AlertCircle size={15} className="shrink-0" />
          {error}
        </div>
      )}

      <div>
        <label className={labelClass}>Full name *</label>
        <input
          type="text"
          required
          maxLength={100}
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
          className={inputClass}
          placeholder="Your full name"
        />
      </div>

      <div>
        <label className={labelClass}>Amount (PKR) *</label>
        <div className="grid grid-cols-4 gap-2 mb-2">
          {QUICK_AMOUNTS.map((amt) => (
            <button
              key={amt}
              type="button"
              onClick={() => setForm({ ...form, amount: String(amt) })}
              className={`py-2 rounded-xl text-xs font-semibold transition-all duration-200 ${
                form.amount === String(amt)
                  ? "bg-sky-500 text-white shadow-md"
                  : isDark
                  ? "bg-white/5 border border-white/8 text-slate-400 hover:text-white hover:bg-white/10"
                  : "bg-slate-100 border border-slate-200 text-slate-500 hover:text-slate-900 hover:bg-slate-200"
              }`}
            >
              {amt.toLocaleString()}
            </button>
          ))}
        </div>
        <input
          type="number"
          required
          min="1"
          max="10000000"
          step="1"
          value={form.amount}
          onChange={(e) => setForm({ ...form, amount: e.target.value })}
          className={inputClass}
          placeholder="Or enter custom amount"
        />
      </div>

      <div>
        <label className={labelClass}>Payment method *</label>
        <div className="grid grid-cols-3 gap-2">
          {METHODS.map((m) => (
            <button
              key={m}
              type="button"
              onClick={() => setForm({ ...form, method: m })}
              className={`py-2.5 px-2 rounded-xl text-xs font-semibold transition-all duration-200 ${
                form.method === m
                  ? "bg-sky-500 text-white shadow-md"
                  : isDark
                  ? "bg-white/5 border border-white/8 text-slate-400 hover:text-white hover:bg-white/10"
                  : "bg-slate-100 border border-slate-200 text-slate-500 hover:text-slate-900 hover:bg-slate-200"
              }`}
            >
              {m}
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className={labelClass}>
          Transaction ID <span className={isDark ? "text-slate-600 normal-case font-normal" : "text-slate-400 normal-case font-normal"}>(optional)</span>
        </label>
        <input
          type="text"
          maxLength={100}
          value={form.transaction_id}
          onChange={(e) => setForm({ ...form, transaction_id: e.target.value })}
          className={inputClass}
          placeholder="Reference or transaction ID"
        />
      </div>

      <button
        type="submit"
        disabled={status === "loading"}
        className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl bg-gradient-to-r from-sky-500 to-primary-500 text-white font-semibold text-sm shadow-md hover:opacity-95 hover:-translate-y-0.5 transition-all duration-300 disabled:opacity-60 disabled:cursor-not-allowed"
      >
        {status === "loading" ? <Loader2 size={16} className="animate-spin" /> : <Heart size={15} />}
        {status === "loading" ? "Submitting…" : "Submit donation"}
      </button>

      <p className={`text-xs text-center ${isDark ? "text-slate-600" : "text-slate-400"}`}>
        Submissions are reviewed manually. You will be contacted if we need more information.
      </p>
    </form>
  );
}
