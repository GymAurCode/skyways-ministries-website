import { Heart, Shield } from "lucide-react";
import ScrollReveal from "../ScrollReveal";
import { fadeInLeft, fadeInRight } from "../../lib/animations";
import type { SiteContent } from "../../types";
import DonationForm from "../DonationForm";

interface Props {
  content: SiteContent;
}

function DetailBlock({
  label,
  value,
  isDark,
}: {
  label: string;
  value: string;
  isDark: boolean;
}) {
  if (!value?.trim()) return null;
  return (
    <div
      className={`rounded-xl p-4 border ${isDark ? "bg-white/[0.04] border-white/10" : "bg-white/60 border-slate-200"
        }`}
    >
      <div className={`text-xs font-semibold uppercase tracking-wider mb-2 ${isDark ? "text-sky-300" : "text-sky-700"}`}>
        {label}
      </div>
      <p className={`text-sm whitespace-pre-wrap leading-relaxed ${isDark ? "text-slate-200" : "text-slate-700"}`}>
        {value}
      </p>
    </div>
  );
}

export default function DonationSection({ content }: Props) {
  const isDark = true;

  return (
    <section id="donation" className="relative py-24 md:py-28 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-slate-950 via-[#0a1a2e] to-slate-950" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_30%_40%,rgba(56,189,248,0.1)_0%,transparent_55%)]" />
      <div className="absolute top-0 left-0 right-0 h-px section-divider-sky opacity-80" />
      <div className="absolute bottom-0 left-0 right-0 h-px section-divider-sky opacity-80" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <ScrollReveal>
          <div className="text-center mb-14 md:mb-16">
            <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-amber-500/10 border border-amber-400/25 text-amber-200 text-xs font-semibold tracking-widest uppercase mb-5">
              <Heart size={11} />
              Donation
            </span>
            <h2 className="font-heading text-4xl sm:text-5xl font-semibold text-white mb-5">
              Support the Ministry
            </h2>
            <div className="h-px w-24 bg-gradient-to-r from-transparent via-amber-300/60 to-transparent mx-auto mb-6" />
            <p className="max-w-xl mx-auto text-slate-400 text-lg">
              Your gift helps us teach, preach, and heal. Use the details below, then submit your contribution for verification.
            </p>
          </div>
        </ScrollReveal>

        <div className="grid lg:grid-cols-2 gap-10 lg:gap-12 items-start">
          <ScrollReveal animation={fadeInLeft}>
            <div className="space-y-5">
              <div className="flex items-center gap-2 mb-2">
                <Shield size={18} className="text-sky-300" />
                <h3 className="font-heading text-lg font-semibold text-white">Payment details</h3>
              </div>

              <DetailBlock label="JazzCash" value={content.donation_jazzcash} isDark={isDark} />
              <DetailBlock label="EasyPaisa" value={content.donation_easypaisa} isDark={isDark} />
              <DetailBlock label="Bank transfer" value={content.donation_bank_details} isDark={isDark} />

              {content.donation_instructions?.trim() && (
                <div className="rounded-xl p-5 bg-white/5 border border-white/10">
                  <h4 className="text-white font-semibold text-sm mb-2">Instructions</h4>
                  <p className="text-slate-400 text-sm leading-relaxed whitespace-pre-wrap">{content.donation_instructions}</p>
                </div>
              )}

              {!content.donation_jazzcash?.trim() &&
                !content.donation_easypaisa?.trim() &&
                !content.donation_bank_details?.trim() && (
                  <p className="text-slate-500 text-sm">
                    Payment numbers and bank details can be added in Admin → Website Content → Donation details.
                  </p>
                )}
            </div>
          </ScrollReveal>

          <ScrollReveal animation={fadeInRight}>
            <div className="rounded-2xl overflow-hidden border border-white/10 bg-slate-900/50 backdrop-blur-md shadow-xl shadow-black/20 p-6 sm:p-8">
              <DonationForm />
            </div>
          </ScrollReveal>
        </div>
      </div>
    </section>
  );
}
