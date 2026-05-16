import { useState, useEffect, useRef } from "react";
import { contentApi } from "../../lib/api";
import type { SiteContent } from "../../types";
import { Save, Upload, CheckCircle, AlertCircle, Loader } from "lucide-react";

type SaveStatus = "idle" | "saving" | "saved" | "error";

const defaultContent: SiteContent = {
  institute_name: "SKYWAY MINISTRIES OF CHRIST",
  tagline: "TEACH - PREACH - HEAL",
  since: "SINCE 2023",
  logo_url: "",
  hero_title: "Teach · Preach · Heal",
  hero_description: "",
  hero_image_url: "",
  about_text: "",
  about_mission: "",
  about_vision: "",
  about_intro: "",
  contact_email: "",
  contact_phone: "",
  contact_address: "",
  donation_instructions: "",
  donation_jazzcash: "",
  donation_easypaisa: "",
  donation_bank_details: "",
  social_facebook: "",
  social_twitter: "",
  social_instagram: "",
};

function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

export default function AdminContent() {
  const [form, setForm] = useState<Partial<SiteContent>>(defaultContent);
  const [loading, setLoading] = useState(true);
  const [saveStatus, setSaveStatus] = useState<SaveStatus>("idle");
  const [saveError, setSaveError] = useState("");
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [uploadingHero, setUploadingHero] = useState(false);
  const [logoPreview, setLogoPreview] = useState<string>("");
  const [heroPreview, setHeroPreview] = useState<string>("");
  const [logoBase64, setLogoBase64] = useState<string>("");
  const [heroBase64, setHeroBase64] = useState<string>("");
  const logoRef = useRef<HTMLInputElement>(null);
  const heroRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    contentApi
      .get()
      .then((data) => {
        setForm(data as SiteContent);
        setLogoPreview(data.logo_url || "");
        setHeroPreview(data.hero_image_url || "");
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  async function handleLogoSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingLogo(true);
    const b64 = await fileToBase64(file);
    setLogoBase64(b64);
    setLogoPreview(b64);
    setUploadingLogo(false);
  }

  async function handleHeroSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingHero(true);
    const b64 = await fileToBase64(file);
    setHeroBase64(b64);
    setHeroPreview(b64);
    setUploadingHero(false);
  }

  async function handleSave() {
    setSaveStatus("saving");
    setSaveError("");

    try {
      const payload: Record<string, string> = { ...(form as Record<string, string>) };
      if (logoBase64) payload.logo_base64 = logoBase64;
      if (heroBase64) payload.hero_base64 = heroBase64;

      const updated = await contentApi.update(payload);
      setForm(updated as SiteContent);
      setLogoPreview(updated.logo_url || "");
      setHeroPreview(updated.hero_image_url || "");
      setLogoBase64("");
      setHeroBase64("");
      setSaveStatus("saved");
      setTimeout(() => setSaveStatus("idle"), 3000);
    } catch (err) {
      setSaveStatus("error");
      setSaveError(err instanceof Error ? err.message : "Failed to save changes.");
      setTimeout(() => setSaveStatus("idle"), 4000);
    }
  }

  const field = (
    label: string,
    key: keyof SiteContent,
    type: "text" | "textarea" | "url" = "text",
    placeholder = ""
  ) => (
    <div key={key}>
      <label className="block text-sm font-medium text-neutral-700 mb-1.5">{label}</label>
      {type === "textarea" ? (
        <textarea
          value={(form[key] as string) || ""}
          onChange={(e) => setForm({ ...form, [key]: e.target.value })}
          rows={5}
          className="w-full px-4 py-2.5 border border-neutral-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition resize-none"
          placeholder={placeholder}
        />
      ) : (
        <input
          type={type}
          value={(form[key] as string) || ""}
          onChange={(e) => setForm({ ...form, [key]: e.target.value })}
          className="w-full px-4 py-2.5 border border-neutral-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition"
          placeholder={placeholder}
        />
      )}
    </div>
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader size={24} className="text-primary-600 animate-spin" />
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-8 flex-wrap gap-4">
        <div>
          <h1 className="font-heading text-2xl font-bold text-neutral-900">Website Content</h1>
          <p className="text-neutral-500 text-sm mt-1">Manage all public-facing content</p>
        </div>
        <div className="flex flex-col items-end gap-1">
          <button
            onClick={handleSave}
            disabled={saveStatus === "saving"}
            className="flex items-center gap-2 px-5 py-2.5 bg-primary-600 text-white rounded-lg text-sm font-medium hover:bg-primary-700 transition-colors disabled:opacity-60"
          >
            {saveStatus === "saving" ? (
              <Loader size={15} className="animate-spin" />
            ) : saveStatus === "saved" ? (
              <CheckCircle size={15} />
            ) : saveStatus === "error" ? (
              <AlertCircle size={15} />
            ) : (
              <Save size={15} />
            )}
            {saveStatus === "saving"
              ? "Saving..."
              : saveStatus === "saved"
              ? "Saved!"
              : saveStatus === "error"
              ? "Error!"
              : "Save Changes"}
          </button>
          {saveStatus === "error" && saveError && (
            <p className="text-red-600 text-xs">{saveError}</p>
          )}
        </div>
      </div>

      <div className="space-y-6">
        {/* Branding */}
        <Section title="Branding">
          <div className="grid sm:grid-cols-2 gap-4">
            {field("Institute Name", "institute_name", "text", "SKYWAY MINISTRIES OF CHRIST")}
            {field("Tagline", "tagline", "text", "TEACH - PREACH - HEAL")}
            {field("Founded / Since", "since", "text", "SINCE 2023")}
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1.5">
                Institute Logo
              </label>
              <div className="flex items-center gap-3 flex-wrap">
                {logoPreview && (
                  <img
                    src={logoPreview}
                    alt="Logo preview"
                    className="h-12 w-12 rounded-full object-cover border border-neutral-200"
                  />
                )}
                <button
                  type="button"
                  onClick={() => logoRef.current?.click()}
                  disabled={uploadingLogo}
                  className="flex items-center gap-2 px-4 py-2 border border-neutral-300 rounded-lg text-sm hover:bg-neutral-50 transition-colors disabled:opacity-60"
                >
                  {uploadingLogo ? (
                    <Loader size={14} className="animate-spin" />
                  ) : (
                    <Upload size={14} />
                  )}
                  {uploadingLogo ? "Processing..." : "Upload Logo"}
                </button>
                <input
                  ref={logoRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleLogoSelect}
                />
              </div>
              {logoBase64 && (
                <p className="text-xs text-amber-600 mt-1">
                  ⚠ Logo selected — click Save Changes to upload.
                </p>
              )}
            </div>
          </div>
        </Section>

        {/* Hero Section */}
        <Section title="Hero Section">
          <div className="space-y-4">
            {field("Hero Title", "hero_title", "text", "Teach · Preach · Heal")}
            {field(
              "Hero Description",
              "hero_description",
              "textarea",
              "Short description shown in the hero area"
            )}
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1.5">
                Hero Background Image
              </label>
              <div className="flex items-center gap-3 flex-wrap">
                {heroPreview && (
                  <img
                    src={heroPreview}
                    alt="Hero preview"
                    className="h-16 w-28 rounded-lg object-cover border border-neutral-200"
                  />
                )}
                <button
                  type="button"
                  onClick={() => heroRef.current?.click()}
                  disabled={uploadingHero}
                  className="flex items-center gap-2 px-4 py-2 border border-neutral-300 rounded-lg text-sm hover:bg-neutral-50 transition-colors disabled:opacity-60"
                >
                  {uploadingHero ? (
                    <Loader size={14} className="animate-spin" />
                  ) : (
                    <Upload size={14} />
                  )}
                  {uploadingHero ? "Processing..." : "Upload Image"}
                </button>
                <input
                  ref={heroRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleHeroSelect}
                />
              </div>
              {heroBase64 && (
                <p className="text-xs text-amber-600 mt-1">
                  ⚠ Image selected — click Save Changes to upload.
                </p>
              )}
            </div>
          </div>
        </Section>

        {/* About — homepage */}
        <Section title="About (Homepage)">
          {field("Mission", "about_mission", "textarea", "What we are called to do…")}
          {field("Vision", "about_vision", "textarea", "Where we are headed…")}
          {field("Introduction", "about_intro", "textarea", "Welcome visitors and share your story…")}
          {field("Legacy combined about (optional)", "about_text", "textarea", "Optional longer block or fallback text")}
        </Section>

        {/* Donation display + instructions */}
        <Section title="Donation — payment details & instructions">
          {field("JazzCash number / account", "donation_jazzcash", "text", "03XX…")}
          {field("EasyPaisa number / account", "donation_easypaisa", "text", "03XX…")}
          {field("Bank details", "donation_bank_details", "textarea", "Bank name, IBAN, account title…")}
          {field(
            "Donation instructions",
            "donation_instructions",
            "textarea",
            "How to send a gift, what to include in the transfer note, processing time…"
          )}
        </Section>

        {/* Contact Details */}
        <Section title="Contact Details">
          <div className="grid sm:grid-cols-2 gap-4">
            {field("Email", "contact_email", "text", "contact@skywayministries.org")}
            {field("Phone", "contact_phone", "text", "+1 000 000 0000")}
          </div>
          {field("Address", "contact_address", "textarea", "123 Street, City, Country")}
        </Section>

        {/* Social Links */}
        <Section title="Social Media Links">
          <div className="grid sm:grid-cols-3 gap-4">
            {field("Facebook URL", "social_facebook", "url", "https://facebook.com/...")}
            {field("Twitter URL", "social_twitter", "url", "https://twitter.com/...")}
            {field("Instagram URL", "social_instagram", "url", "https://instagram.com/...")}
          </div>
        </Section>
      </div>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-white rounded-xl border border-neutral-200 p-6">
      <h2 className="font-heading font-semibold text-neutral-900 mb-4 pb-3 border-b border-neutral-100">
        {title}
      </h2>
      {children}
    </div>
  );
}
