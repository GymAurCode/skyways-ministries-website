import { useState, useEffect } from "react";
import { Quote, Star, ChevronLeft, ChevronRight } from "lucide-react";
import ScrollReveal from "../ScrollReveal";
import { testimonialsApi } from "../../lib/api";
import type { Testimonial } from "../../types";
import { useTheme } from "../../contexts/ThemeContext";

export default function TestimonialsSection() {
  const { isDark } = useTheme();
  const [list, setList] = useState<Testimonial[]>([]);
  const [loading, setLoading] = useState(true);
  const [current, setCurrent] = useState(0);
  const [direction, setDirection] = useState(1);

  useEffect(() => {
    testimonialsApi
      .list()
      .then((data) => setList(Array.isArray(data) ? (data as Testimonial[]) : []))
      .catch(() => setList([]))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (list.length <= 1) return;
    const t = setInterval(() => {
      setDirection(1);
      setCurrent((c) => (c + 1) % list.length);
    }, 7000);
    return () => clearInterval(t);
  }, [list.length]);

  const go = (dir: number) => {
    if (list.length === 0) return;
    setDirection(dir);
    setCurrent((c) => (c + dir + list.length) % list.length);
  };

  const t = list[current];
  const tx = direction >= 0 ? "16px" : "-16px";

  if (!loading && list.length === 0) {
    return null;
  }

  return (
    <section className={`relative py-24 md:py-28 overflow-hidden cloud-texture ${isDark ? "" : "bg-white/60"}`}>
      <div className="absolute inset-0 pointer-events-none z-0">
        <div className="absolute top-0 left-0 right-0 section-divider-sky opacity-70" />
        <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] rounded-full blur-3xl ${isDark ? "bg-sky-500/5" : "bg-sky-200/25"}`} />
      </div>

      <div className="relative z-[1] max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <ScrollReveal>
          <div className="text-center mb-14 md:mb-16">
            <span className="section-label mb-5 inline-flex">
              <Quote size={11} />
              Testimonials
            </span>
            <h2 className={`font-heading text-4xl sm:text-5xl font-semibold ${isDark ? "text-white" : "text-slate-800"}`}>
              Lives Changed by
              <br />
              <span className="text-gradient-blue">God&apos;s Grace</span>
            </h2>
          </div>
        </ScrollReveal>

        {loading ? (
          <div className={`h-64 rounded-3xl animate-pulse ${isDark ? "bg-white/5" : "bg-sky-100"}`} />
        ) : t ? (
          <>
            <div
              key={t._id}
              className={`testimonial-enter relative rounded-3xl p-10 sm:p-14 border ${
                isDark ? "border-white/8 bg-white/[0.04]" : "border-slate-200 bg-white shadow-sm"
              }`}
              style={{ "--tx": tx } as React.CSSProperties}
            >
              <div className="absolute top-8 right-8 opacity-10">
                <Quote size={80} className={isDark ? "text-white" : "text-slate-800"} />
              </div>
              <div className="flex gap-1 mb-6">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} size={16} className="text-amber-400 fill-amber-400" />
                ))}
              </div>
              {t.image_url && (
                <img
                  src={t.image_url}
                  alt=""
                  className="w-20 h-20 rounded-full object-cover border border-sky-400/30 mb-6"
                  loading="lazy"
                />
              )}
              <blockquote className={`font-display text-xl sm:text-2xl leading-relaxed mb-8 italic ${isDark ? "text-white" : "text-slate-800"}`}>
                &ldquo;{t.message}&rdquo;
              </blockquote>
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-full bg-sky-500/20 border-2 border-sky-400/40 flex items-center justify-center flex-shrink-0 font-heading font-semibold text-sky-700 dark:text-sky-300 text-sm">
                  {t.name
                    .split(" ")
                    .map((w) => w[0])
                    .join("")
                    .slice(0, 2)
                    .toUpperCase()}
                </div>
                <div>
                  <div className={`font-semibold ${isDark ? "text-white" : "text-slate-800"}`}>{t.name}</div>
                  {t.role && <div className={`text-sm ${isDark ? "text-slate-400" : "text-slate-500"}`}>{t.role}</div>}
                </div>
              </div>
            </div>

            {list.length > 1 && (
              <div className="flex items-center justify-between mt-8">
                <div className="flex gap-2">
                  {list.map((_, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => {
                        setDirection(i > current ? 1 : -1);
                        setCurrent(i);
                      }}
                      className={`h-2 rounded-full transition-all duration-300 ${
                        i === current ? "w-8 bg-sky-500" : isDark ? "w-2 bg-white/20 hover:bg-white/40" : "w-2 bg-slate-300 hover:bg-slate-400"
                      }`}
                      aria-label={`Testimonial ${i + 1}`}
                    />
                  ))}
                </div>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => go(-1)}
                    className={`h-10 w-10 rounded-xl flex items-center justify-center transition-all duration-200 hover:scale-105 ${
                      isDark ? "bg-white/5 border border-white/10 text-slate-400 hover:text-white" : "bg-slate-100 border border-slate-200"
                    }`}
                    aria-label="Previous"
                  >
                    <ChevronLeft size={16} />
                  </button>
                  <button
                    type="button"
                    onClick={() => go(1)}
                    className={`h-10 w-10 rounded-xl flex items-center justify-center transition-all duration-200 hover:scale-105 ${
                      isDark ? "bg-white/5 border border-white/10 text-slate-400 hover:text-white" : "bg-slate-100 border border-slate-200"
                    }`}
                    aria-label="Next"
                  >
                    <ChevronRight size={16} />
                  </button>
                </div>
              </div>
            )}
          </>
        ) : null}
      </div>
    </section>
  );
}
