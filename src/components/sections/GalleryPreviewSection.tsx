import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { galleryApi } from "../../lib/api";
import type { GalleryImage } from "../../types";
import { Images, X, ZoomIn } from "lucide-react";
import ScrollReveal from "../ScrollReveal";
import { useTheme } from "../../contexts/ThemeContext";

export default function GalleryPreviewSection() {
  const { isDark } = useTheme();
  const [images, setImages] = useState<GalleryImage[]>([]);
  const [loading, setLoading] = useState(true);
  const [lightbox, setLightbox] = useState<GalleryImage | null>(null);

  useEffect(() => {
    galleryApi
      .list()
      .then((data) => {
        const list = Array.isArray(data) ? (data as GalleryImage[]) : [];
        setImages(list.slice(0, 5));
      })
      .catch(() => setImages([]))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    document.body.style.overflow = lightbox ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [lightbox]);

  return (
    <section id="gallery-preview" className="relative py-24 md:py-28 overflow-hidden cloud-texture">
      <div className="absolute inset-0 pointer-events-none z-0">
        <div className="absolute top-0 left-0 right-0 section-divider-sky opacity-70" />
      </div>

      <div className="relative z-[1] max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <ScrollReveal>
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 mb-10 md:mb-12">
            <div>
              <span className="section-label mb-4 inline-flex">
                <Images size={11} />
                Gallery
              </span>
              <h2 className={`font-heading text-4xl sm:text-5xl font-semibold ${isDark ? "text-white" : "text-slate-800"}`}>
                Moments of Grace
              </h2>
              <p className={`mt-3 max-w-xl ${isDark ? "text-slate-400" : "text-slate-600"}`}>
                A glimpse of worship, community, and ministry life. All photos are managed from the admin panel.
              </p>
            </div>
            <Link
              to="/gallery"
              className="inline-flex items-center justify-center px-6 py-3 rounded-full bg-gradient-to-r from-sky-400 to-sky-500 text-white text-sm font-semibold shadow-[0_8px_32px_rgba(56,189,248,0.25)] hover:shadow-[0_8px_32px_rgba(56,189,248,0.4)] hover:-translate-y-0.5 transition-all shrink-0"
            >
              View more
            </Link>
          </div>
        </ScrollReveal>

        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 md:gap-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <div
                key={i}
                className={`aspect-square rounded-2xl animate-pulse ${isDark ? "bg-white/5" : "bg-sky-100"}`}
              />
            ))}
          </div>
        ) : images.length === 0 ? (
          <div
            className="text-center py-16 rounded-2xl glass-sky"
            data-aos="fade-up"
            data-aos-once="true"
          >
            <Images className={`mx-auto mb-3 ${isDark ? "text-slate-600" : "text-slate-300"}`} size={40} />
            <p className={isDark ? "text-slate-400" : "text-slate-500"}>No gallery images yet. Upload photos in the admin panel.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 md:gap-4">
            {images.map((img, i) => (
              <button
                key={img._id}
                type="button"
                data-aos="fade-up"
                data-aos-delay={i * 70}
                data-aos-once="true"
                onClick={() => setLightbox(img)}
                className="group relative aspect-square rounded-2xl overflow-hidden text-left transition-transform duration-300 hover:-translate-y-1 focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-400 glass-sky"
              >
                <img src={img.image_url} alt={img.caption || "Gallery"} className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" loading="lazy" decoding="async" />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <ZoomIn className="text-white w-8 h-8" />
                </div>
                {img.caption && (
                  <div className="absolute bottom-0 left-0 right-0 px-2 py-2 bg-black/50">
                    <p className="text-white text-xs truncate">{img.caption}</p>
                  </div>
                )}
              </button>
            ))}
          </div>
        )}
      </div>

      {lightbox && (
        <div
          className="fixed inset-0 z-[100] bg-black/90 flex items-center justify-center p-4 animate-[fadeIn_0.2s_ease-out]"
          onClick={() => setLightbox(null)}
          role="presentation"
        >
          <button
            type="button"
            className="absolute top-4 right-4 h-10 w-10 rounded-xl bg-white/10 border border-white/15 text-white flex items-center justify-center hover:bg-white/20 z-10"
            onClick={() => setLightbox(null)}
            aria-label="Close"
          >
            <X size={18} />
          </button>
          <div className="max-w-4xl w-full" onClick={(e) => e.stopPropagation()}>
            <img src={lightbox.image_url} alt={lightbox.caption || ""} className="w-full max-h-[80vh] object-contain rounded-xl" decoding="async" />
            {lightbox.caption && <p className="text-slate-300 text-center mt-4 text-sm">{lightbox.caption}</p>}
          </div>
        </div>
      )}
    </section>
  );
}
