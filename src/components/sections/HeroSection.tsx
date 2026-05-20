import { Play } from "lucide-react";
import type { SiteContent } from "../../types";
import skywaysDefault from "../../assets/skyways.webp";

interface Props {
  content: SiteContent;
}

export default function HeroSection({ content }: Props) {
  const heroBg = content.hero_image_url || skywaysDefault;
  const title = content.institute_name || "SKYWAY MINISTRIES OF CHRIST";

  return (
    <section
      id="home"
      className="relative min-h-[100svh] flex flex-col items-center justify-center overflow-hidden"
      aria-label="Hero section"
    >
      {/* Background image — LCP; admin can override via hero_image_url */}
      <div className="absolute inset-0">
        <img
          src={heroBg}
          alt=""
          className="absolute inset-0 h-full w-full object-cover object-center scale-105"
          fetchPriority="high"
          decoding="async"
        />
      </div>

      {/* Soft dark + sky overlay for readability */}
      <div className="absolute inset-0 bg-gradient-to-b from-nightsky-950/75 via-nightsky-900/55 to-nightsky-950/88" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_120%_80%_at_50%_20%,rgba(255,255,255,0.18)_0%,transparent_55%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_100%,rgba(4,9,20,0.85)_0%,transparent_50%)]" />
      <div className="cloud-drift-overlay opacity-50" aria-hidden />

      {/* Soft glow — static, GPU-friendly */}
      <div
        className="absolute left-1/2 top-1/3 h-[min(70vw,480px)] w-[min(90vw,720px)] -translate-x-1/2 -translate-y-1/2 rounded-full bg-sky-300/25 blur-[100px] pointer-events-none"
        aria-hidden
      />

      {/* Subtle cloud-like shapes (no continuous animation) */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden" aria-hidden>
        <div className="absolute -left-[10%] top-[18%] h-48 w-[55%] rounded-full bg-white/10 blur-3xl opacity-70" />
        <div className="absolute -right-[8%] top-[40%] h-40 w-[45%] rounded-full bg-sky-200/15 blur-3xl opacity-80" />
        <div className="absolute left-[20%] bottom-[8%] h-32 w-[40%] rounded-full bg-slate-100/10 blur-3xl opacity-60" />
      </div>

      {/* Main copy — Rendered immediately for SEO and performance */}
      <div className="relative z-10 w-full max-w-4xl mx-auto px-4 sm:px-6 text-center pt-28 pb-28 sm:pt-32 sm:pb-32">
        <p className="font-heading text-[10px] sm:text-xs font-semibold tracking-[0.35em] text-sky-200/90 uppercase mb-6">
          {content.tagline || "A path to heaven · A spiritual way to the sky"}
        </p>

        <h1 className="font-heading text-3xl sm:text-5xl md:text-6xl lg:text-7xl font-semibold leading-[1.08] tracking-[0.02em] text-white drop-shadow-[0_4px_32px_rgba(0,0,0,0.35)]">
          {title}
        </h1>

        <p className="mt-6 sm:mt-8 font-heading text-lg sm:text-2xl md:text-3xl font-medium tracking-[0.2em] sm:tracking-[0.28em] text-sky-100/95 uppercase">
          {content.hero_title || "Teach - Preach - Heal"}
        </p>

        <p className="mt-4 font-heading text-sm sm:text-base tracking-[0.35em] text-sky-200/80 uppercase">
          {content.since || "SINCE 2023"}
        </p>

        {content.hero_description && (
          <p className="mt-8 max-w-2xl mx-auto text-base sm:text-lg leading-relaxed text-slate-200/95 font-light">
            {content.hero_description}
          </p>
        )}

        <div className="mt-10 sm:mt-12 flex flex-wrap items-center justify-center gap-3">
          <a
            href="#about"
            onClick={(e) => {
              e.preventDefault();
              document.getElementById("about")?.scrollIntoView({ behavior: "smooth" });
            }}
            className="inline-flex items-center justify-center px-8 py-3.5 rounded-full bg-white/12 backdrop-blur-md border border-white/25 text-white text-sm font-semibold shadow-[0_8px_32px_rgba(56,189,248,0.15)] hover:bg-white/18 hover:border-white/35 hover:-translate-y-0.5 transition-all duration-300"
          >
            Our mission
          </a>
          <a
            href="#gallery"
            onClick={(e) => {
              e.preventDefault();
              document.getElementById("gallery")?.scrollIntoView({ behavior: "smooth" });
            }}
            className="inline-flex items-center gap-2.5 px-7 py-3.5 rounded-full bg-slate-950/35 backdrop-blur-md border border-white/15 text-white text-sm font-semibold hover:bg-slate-950/50 hover:-translate-y-0.5 transition-all duration-300"
          >
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-white/15">
              <Play size={12} className="ml-0.5" fill="currentColor" />
            </span>
            Gallery
          </a>
          <a
            href="#donation"
            onClick={(e) => {
              e.preventDefault();
              document.getElementById("donation")?.scrollIntoView({ behavior: "smooth" });
            }}
            className="inline-flex items-center justify-center px-7 py-3.5 rounded-full border border-amber-200/35 text-amber-100 text-sm font-semibold hover:bg-amber-400/10 hover:border-amber-200/50 hover:-translate-y-0.5 transition-all duration-300"
          >
            Give
          </a>
        </div>
      </div>

      {/* Scroll hint — CSS only (scroll-indicator in index.css) */}
      <div className="absolute bottom-8 left-1/2 z-10 flex -translate-x-1/2 flex-col items-center gap-2">
        <span className="text-slate-400 text-[10px] font-medium tracking-widest uppercase">Scroll</span>
        <div className="scroll-indicator border-slate-400/50" />
      </div>

      {/* Cinematic bottom fade into page body */}
      <div className="absolute bottom-0 left-0 right-0 h-40 sm:h-48 bg-gradient-to-t from-heavenly-50 via-heavenly-50/70 to-transparent pointer-events-none dark:from-nightsky-950 dark:via-nightsky-950/80" />
    </section>
  );
}
