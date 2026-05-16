import { Mail, Phone, MapPin, Globe, Share2, MessageCircle, PlayCircle, ArrowRight, Heart, Sparkles } from "lucide-react";
import { Link } from "react-router-dom";
import type { SiteContent } from "../types";
import logo from "../assets/logo.png";

export default function Footer({ content }: { content: SiteContent }) {
  const year = new Date().getFullYear();

  const quickLinks = [
    { label: "Home", href: "/" },
    { label: "About", href: "/#about" },
    { label: "Gallery", href: "/gallery" },
    { label: "Donation", href: "/#donation" },
    { label: "Contact", href: "/#contact" },
  ];

  return (
    <footer className="relative overflow-hidden bg-gradient-to-b from-slate-950 via-[#0a1522] to-[#050c18] text-slate-300">
      <div className="absolute top-0 left-0 right-0 h-px section-divider-sky opacity-90" />
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[min(900px,100%)] h-64 bg-sky-500/6 blur-[100px] rounded-full pointer-events-none" />

      <div className="border-b border-white/[0.05]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="text-center md:text-left" data-aos="fade-up" data-aos-once="true">
              <div className="flex items-center gap-2 justify-center md:justify-start mb-2">
                <Sparkles size={14} className="text-sky-300" />
                <span className="text-sky-200 text-xs font-semibold uppercase tracking-widest">Stay Connected</span>
              </div>
              <h3 className="font-heading text-2xl font-semibold text-white mb-1">Join Our Community Newsletter</h3>
              <p className="text-slate-500 text-sm">Get updates on ministry news and events.</p>
            </div>
            <div className="flex gap-3 w-full md:w-auto" data-aos="fade-up" data-aos-delay="80" data-aos-once="true">
              <input
                type="email"
                placeholder="Enter your email"
                readOnly
                className="flex-1 md:w-72 px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-slate-600 text-sm cursor-not-allowed opacity-80"
                title="Newsletter integration can be connected later"
              />
              <button
                type="button"
                disabled
                className="px-5 py-3 rounded-xl bg-slate-700 text-slate-400 text-sm font-semibold cursor-not-allowed"
              >
                Soon
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
          <div data-aos="fade-up" data-aos-once="true">
            <Link to="/" className="flex items-center gap-3 group mb-6">
              <div className="relative">
                <div className="absolute inset-0 rounded-full bg-sky-400/15 blur-lg opacity-0 group-hover:opacity-100 transition-opacity" />
                <img
                  src={logo}
                  alt="Logo"
                  className="relative h-12 w-12 rounded-full object-cover ring-2 ring-sky-400/30 group-hover:ring-sky-300/50 transition-all group-hover:scale-105"
                />
              </div>
              <div>
                <span className="font-heading font-bold text-white text-[11px] block leading-tight tracking-widest">
                  {content.institute_name || "SKYWAY MINISTRIES"}
                </span>
                {content.tagline && (
                  <span className="text-sky-300 text-[8px] font-semibold tracking-[0.25em] uppercase">{content.tagline}</span>
                )}
              </div>
            </Link>
            <p className="text-slate-500 text-sm leading-relaxed mb-6">
              {content.about_intro?.slice(0, 220) ||
                "Teaching the Word of God, preaching the Gospel, and healing communities in Christ's name."}
              {(content.about_intro?.length || 0) > 220 ? "…" : ""}
            </p>
            <div className="flex gap-2.5">
              {[
                { href: content.social_facebook, icon: Globe, label: "Facebook" },
                { href: content.social_twitter, icon: Share2, label: "Twitter" },
                { href: content.social_instagram, icon: MessageCircle, label: "Instagram" },
                { href: "#", icon: PlayCircle, label: "YouTube" },
              ].map(({ href, icon: Icon, label }) => (
                <a
                  key={label}
                  href={href || "#"}
                  target={href && href !== "#" ? "_blank" : undefined}
                  rel="noreferrer"
                  aria-label={label}
                  className="h-9 w-9 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-slate-500 hover:text-white hover:bg-sky-500/15 hover:border-sky-400/25 hover:-translate-y-0.5 transition-all duration-200"
                >
                  <Icon size={14} />
                </a>
              ))}
            </div>
          </div>

          <div data-aos="fade-up" data-aos-delay="60" data-aos-once="true">
            <h4 className="text-white font-semibold mb-5 text-xs uppercase tracking-[0.15em] flex items-center gap-2">
              <span className="h-3 w-0.5 bg-sky-400 rounded-full" />
              Quick Links
            </h4>
            <ul className="space-y-2">
              {quickLinks.map((link) => (
                <li key={link.label}>
                  <a
                    href={link.href}
                    className="flex items-center gap-2 text-slate-500 hover:text-white text-sm transition-colors duration-200 group"
                  >
                    <ArrowRight size={11} className="text-sky-500/40 group-hover:text-sky-300 transition-colors" />
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div data-aos="fade-up" data-aos-delay="120" data-aos-once="true">
            <h4 className="text-white font-semibold mb-5 text-xs uppercase tracking-[0.15em] flex items-center gap-2">
              <span className="h-3 w-0.5 bg-sky-400 rounded-full" />
              Contact
            </h4>
            <div className="space-y-3.5">
              {content.contact_email && (
                <a
                  href={`mailto:${content.contact_email}`}
                  className="flex items-start gap-3 text-slate-500 hover:text-white text-sm transition-colors group"
                >
                  <div className="h-8 w-8 rounded-lg bg-sky-500/10 border border-sky-500/15 flex items-center justify-center flex-shrink-0">
                    <Mail size={12} className="text-sky-300" />
                  </div>
                  <span className="mt-1 break-all">{content.contact_email}</span>
                </a>
              )}
              {content.contact_phone && (
                <div className="flex items-start gap-3 text-slate-500 text-sm">
                  <div className="h-8 w-8 rounded-lg bg-sky-500/10 border border-sky-500/15 flex items-center justify-center flex-shrink-0">
                    <Phone size={12} className="text-sky-300" />
                  </div>
                  <span className="mt-1">{content.contact_phone}</span>
                </div>
              )}
              {content.contact_address && (
                <div className="flex items-start gap-3 text-slate-500 text-sm">
                  <div className="h-8 w-8 rounded-lg bg-sky-500/10 border border-sky-500/15 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <MapPin size={12} className="text-sky-300" />
                  </div>
                  <span>{content.contact_address}</span>
                </div>
              )}
              {!content.contact_email && !content.contact_phone && !content.contact_address && (
                <p className="text-slate-600 text-sm">Update contact details in the admin panel.</p>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="border-t border-white/[0.04]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5 flex flex-col sm:flex-row items-center justify-between gap-3">
          <span className="text-slate-600 text-xs">
            &copy; {year} {content.institute_name || "SKYWAY MINISTRIES OF CHRIST"}. All rights reserved.
          </span>
          <span className="text-slate-700 text-xs flex items-center gap-1.5">
            Built with <Heart size={10} className="text-rose-500 fill-rose-500" /> for the Kingdom of God
          </span>
        </div>
      </div>
    </footer>
  );
}
