import { useState } from "react";
import { donationApi } from "../lib/api";
import { Heart, CheckCircle, AlertCircle, Loader2, UploadCloud, X } from "lucide-react";

type Method = "JazzCash" | "EasyPaisa" | "Bank Transfer";

const METHODS: Method[] = ["JazzCash", "EasyPaisa", "Bank Transfer"];

const QUICK_AMOUNTS = [500, 1000, 2500, 5000];

export default function DonationForm() {
  const [form, setForm] = useState({
    name: "",
    amount: "",
    method: "JazzCash" as Method,
    transaction_id: "",
  });
  const [imageFile, setImageFile] = useState<{
    name: string;
    size: number;
    base64: string;
  } | null>(null);
  const [status, setStatus] = useState<"idle" | "loading" | "success">("idle");
  const [error, setError] = useState("");

  const handleFileChange = (file: File) => {
    // Check format
    const validTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
    if (!validTypes.includes(file.type)) {
      setError("Invalid file format. Please upload JPG, JPEG, PNG, or WEBP.");
      return;
    }

    // Check size (10MB limit)
    const MAX_SIZE = 10 * 1024 * 1024;
    if (file.size > MAX_SIZE) {
      setError("File is too large. Maximum size allowed is 10MB.");
      return;
    }

    setError("");
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === "string") {
        setImageFile({
          name: file.name,
          size: file.size,
          base64: reader.result,
        });
      }
    };
    reader.onerror = () => {
      setError("Failed to read file. Please try again.");
    };
    reader.readAsDataURL(file);
  };

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
        image_base64: imageFile?.base64 || undefined,
      });
      setForm({ name: "", amount: "", method: "JazzCash", transaction_id: "" });
      setImageFile(null);
      setStatus("success");
    } catch (err) {
      setStatus("idle");
      setError(err instanceof Error ? err.message : "Failed to submit donation. Please try again.");
    }
  }

  const inputClass = "w-full px-4 py-3 rounded-xl text-sm transition-all duration-200 outline-none bg-slate-950/60 border border-slate-800/80 text-white placeholder-slate-500 focus:border-sky-500/50 focus:bg-slate-950/95 focus:ring-1 focus:ring-sky-500/20";
  const labelClass = "block text-xs font-semibold uppercase tracking-wider mb-2 text-slate-400";

  if (status === "success") {
    return (
      <div className="text-center py-8 animate-[fadeIn_0.35s_ease-out]">
        <div className="h-20 w-20 rounded-full bg-emerald-500/15 border-2 border-emerald-500/30 flex items-center justify-center mx-auto mb-6">
          <CheckCircle size={36} className="text-emerald-400" />
        </div>
        <h3 className="font-heading text-2xl font-semibold mb-3 text-white">Thank you</h3>
        <p className="text-sm mb-6 text-slate-400 font-medium">
          Your donation was received as <strong className="text-white">pending</strong>. Our team will review and confirm it soon.
        </p>
        <button
          type="button"
          onClick={() => setStatus("idle")}
          className="px-6 py-3 rounded-xl bg-gradient-to-r from-sky-500 to-primary-500 text-white text-sm font-semibold hover:opacity-95 hover:shadow-lg hover:shadow-sky-500/20 hover:-translate-y-0.5 transition-all duration-300"
        >
          Submit another
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="flex items-center gap-2 mb-2">
        <Heart size={18} className="text-rose-400 animate-pulse" />
        <h3 className="font-heading text-xl font-semibold text-white">Submit donation</h3>
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
                  ? "bg-sky-500 text-white shadow-md shadow-sky-500/25"
                  : "bg-slate-950/40 border border-slate-800 text-slate-400 hover:text-white hover:bg-slate-950/80"
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
                  ? "bg-sky-500 text-white shadow-md shadow-sky-500/25"
                  : "bg-slate-950/40 border border-slate-800 text-slate-400 hover:text-white hover:bg-slate-950/80"
              }`}
            >
              {m}
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className={labelClass}>
          Transaction ID <span className="text-slate-600 normal-case font-normal">(optional)</span>
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

      <div>
        <label className={labelClass}>
          Upload Proof of Payment <span className="text-slate-600 normal-case font-normal">(optional)</span>
        </label>
        
        {!imageFile ? (
          <div
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => {
              e.preventDefault();
              const file = e.dataTransfer.files?.[0];
              if (file) handleFileChange(file);
            }}
            className="border-2 border-dashed border-slate-800 hover:border-sky-500/50 bg-slate-950/30 rounded-xl p-5 text-center cursor-pointer transition-all duration-200 group relative"
          >
            <input
              type="file"
              accept=".png,.jpg,.jpeg,.webp"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) handleFileChange(file);
              }}
              className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
            />
            <div className="flex flex-col items-center justify-center space-y-2">
              <div className="h-10 w-10 rounded-lg bg-slate-950/60 flex items-center justify-center text-slate-400 group-hover:text-sky-400 transition-colors">
                <UploadCloud size={20} />
              </div>
              <div className="text-sm font-medium text-slate-300">
                Click to upload or drag & drop
              </div>
              <div className="text-xs text-slate-500">
                PNG, JPG, JPEG, or WEBP up to 10MB
              </div>
            </div>
          </div>
        ) : (
          <div className="border border-slate-800 bg-slate-950/40 rounded-xl p-4 flex items-center gap-4 animate-[fadeIn_0.25s_ease-out]">
            <div className="h-16 w-16 rounded-lg overflow-hidden border border-slate-800 bg-slate-950 flex-shrink-0 relative group">
              <img
                src={imageFile.base64}
                alt="Receipt preview"
                className="h-full w-full object-cover"
              />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-slate-200 truncate">{imageFile.name}</p>
              <p className="text-xs text-slate-500 mt-0.5 font-mono">
                {(imageFile.size / (1024 * 1024)).toFixed(2)} MB
              </p>
            </div>
            <button
              type="button"
              onClick={() => setImageFile(null)}
              className="h-8 w-8 rounded-lg bg-slate-950/60 hover:bg-red-500/20 text-slate-400 hover:text-red-400 flex items-center justify-center transition-all"
              title="Remove receipt"
            >
              <X size={16} />
            </button>
          </div>
        )}
      </div>

      <button
        type="submit"
        disabled={status === "loading"}
        className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl bg-gradient-to-r from-sky-500 to-primary-500 text-white font-semibold text-sm shadow-md hover:opacity-95 hover:shadow-sky-500/20 hover:-translate-y-0.5 transition-all duration-300 disabled:opacity-60 disabled:cursor-not-allowed"
      >
        {status === "loading" ? <Loader2 size={16} className="animate-spin" /> : <Heart size={15} />}
        {status === "loading" ? "Submitting…" : "Submit donation"}
      </button>

      <p className="text-xs text-center text-slate-600 font-medium">
        Submissions are reviewed manually. You will be contacted if we need more information.
      </p>
    </form>
  );
}
