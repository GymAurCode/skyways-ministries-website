import { useState, useEffect } from "react";
import AOS from "aos";
import { galleryApi } from "../lib/api";
import { useSiteContent } from "../hooks/useSiteContent";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import ScrollProgress from "../components/ScrollProgress";
import BackToTop from "../components/BackToTop";
import type { GalleryImage } from "../types";
import { Images, X, ZoomIn, ChevronLeft, ChevronRight } from "lucide-react";
import { useTheme } from "../contexts/ThemeContext";

export default function GalleryPage() {
  const { content } = useSiteContent();
  const { isDark } = useTheme();
  const [images, setImages] = useState<GalleryImage[]>([]);
  const [loading, setLoading] = useState(true);
  const [lightbox, setLightbox] = useState<GalleryImage | null>(null);
  const [lightboxIndex, setLightboxIndex] = useState(0);

  useEffect(() => {
    galleryApi
      .list()
      .then((data) => setImages(Array.isArray(data) ? (data as GalleryImage[]) : []))
      .catch(() => setImages([]))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (!loading) requestAnimationFrame(() => AOS.refresh());
  }, [loading, images.length]);

  useEffect(() => {
    document.body.style.overflow = lightbox ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [lightbox]);

  const openLightbox = (img: GalleryImage, idx: number) => {
    setLightbox(img);
    setLightboxIndex(idx);
  };

  const navigate = (dir: number) => {
    const newIdx = (lightboxIndex + dir + images.length) % images.length;
    setLightboxIndex(newIdx);
    setLightbox(images[newIdx]);
  };

  return (
    <div className={`min-h-screen flex flex-col overflow-x-hidden page-sky-bg ${isDark ? "text-slate-200" : "text-slate-800"}`}>
      <ScrollProgress />
      <Navbar content={content} />

      <main className="flex-1 pt-20">
        <div className="relative py-20 sm:py-24 px-4 text-center overflow-hidden cloud-texture">
          <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-[#0a1a2e] to-slate-950" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_40%,rgba(56,189,248,0.12)_0%,transparent_65%)]" />
          <div className="absolute top-0 left-0 right-0 section-divider-sky opacity-80" />
          <div className="absolute bottom-0 left-0 right-0 section-divider-sky opacity-80" />

          <div className="relative z-[1]" data-aos="fade-up" data-aos-once="true">
            <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-sky-500/10 border border-sky-400/25 text-sky-200 text-xs font-semibold tracking-widest uppercase mb-6">
              <Images size={11} />
              Our Gallery
            </span>
            <h1 className="font-heading text-4xl sm:text-5xl md:text-6xl font-semibold text-white mb-4">
              Moments of
              <br />
              <span className="text-gradient-blue">Grace &amp; Glory</span>
            </h1>
            <p className="text-slate-400 text-lg max-w-xl mx-auto">
              A visual journey through our ministry — worship, community, outreach, and the love of God in action.
            </p>
            <div className="mt-6 h-px w-24 section-divider-sky mx-auto opacity-90" />
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14 sm:py-16">
          {loading ? (
            <div className="columns-1 sm:columns-2 lg:columns-3 gap-4 space-y-4">
              {Array.from({ length: 9 }).map((_, i) => (
                <div
                  key={i}
                  className={`break-inside-avoid rounded-2xl animate-pulse ${isDark ? "bg-white/5" : "bg-sky-100/80"}`}
                  style={{ height: `${180 + (i % 3) * 60}px` }}
                />
              ))}
            </div>
          ) : images.length === 0 ? (
            <div className="text-center py-28" data-aos="fade-up" data-aos-once="true">
              <div className={`h-20 w-20 rounded-2xl flex items-center justify-center mx-auto mb-6 ${isDark ? "bg-white/5 border border-white/8" : "bg-sky-50 border border-sky-200"}`}>
                <Images size={36} className={isDark ? "text-slate-600" : "text-sky-300"} />
              </div>
              <p className={`text-lg font-semibold mb-2 ${isDark ? "text-slate-400" : "text-slate-500"}`}>No images yet</p>
              <p className={`text-sm ${isDark ? "text-slate-600" : "text-slate-400"}`}>Check back soon for updates from our ministry.</p>
            </div>
          ) : (
            <div className="columns-1 sm:columns-2 lg:columns-3 gap-4 space-y-4">
              {images.map((img, idx) => (
                <div
                  key={img._id}
                  data-aos="fade-up"
                  data-aos-delay={(idx % 6) * 40}
                  data-aos-once="true"
                  className={`break-inside-avoid group cursor-pointer rounded-2xl overflow-hidden border transition-transform duration-300 hover:-translate-y-1 ${
                    isDark ? "border-white/6 bg-white/3 hover:border-sky-400/25" : "border-slate-200 bg-white hover:border-sky-200 hover:shadow-lg"
                  }`}
                  onClick={() => openLightbox(img, idx)}
                  onKeyDown={(e) => e.key === "Enter" && openLightbox(img, idx)}
                  role="button"
                  tabIndex={0}
                >
                  <div className="relative overflow-hidden">
                    <img
                      src={img.image_url}
                      alt={img.caption || "Gallery image"}
                      className="w-full object-cover transition-transform duration-500 group-hover:scale-[1.04]"
                      loading="lazy"
                      decoding="async"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-900/85 via-slate-900/15 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col items-center justify-center gap-3 p-4">
                      <div className="h-12 w-12 rounded-full bg-white/15 backdrop-blur-sm border border-white/25 flex items-center justify-center scale-95 group-hover:scale-100 transition-transform duration-300">
                        <ZoomIn size={18} className="text-white" />
                      </div>
                      {img.caption && <p className="text-white text-sm font-medium text-center line-clamp-2">{img.caption}</p>}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      <Footer content={content} />
      <BackToTop />

      {lightbox && (
        <div
          className="fixed inset-0 z-50 bg-black/92 flex items-center justify-center p-4 animate-[fadeIn_0.2s_ease-out]"
          onClick={() => setLightbox(null)}
          role="presentation"
        >
          <button
            type="button"
            onClick={() => setLightbox(null)}
            className="absolute top-5 right-5 h-10 w-10 rounded-xl bg-white/8 border border-white/12 text-white flex items-center justify-center hover:bg-white/15 transition-colors z-10 hover:scale-105 active:scale-95"
            aria-label="Close"
          >
            <X size={18} />
          </button>

          {images.length > 1 && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                navigate(-1);
              }}
              className="absolute left-4 sm:left-5 top-1/2 -translate-y-1/2 h-10 w-10 rounded-xl bg-white/8 border border-white/12 text-white flex items-center justify-center hover:bg-white/15 transition-colors z-10 hover:scale-105 active:scale-95"
              aria-label="Previous"
            >
              <ChevronLeft size={18} />
            </button>
          )}

          {images.length > 1 && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                navigate(1);
              }}
              className="absolute right-4 sm:right-5 top-1/2 -translate-y-1/2 h-10 w-10 rounded-xl bg-white/8 border border-white/12 text-white flex items-center justify-center hover:bg-white/15 transition-colors z-10 hover:scale-105 active:scale-95"
              aria-label="Next"
            >
              <ChevronRight size={18} />
            </button>
          )}

          <div className="max-w-4xl w-full animate-[fadeIn_0.25s_ease-out]" onClick={(e) => e.stopPropagation()} role="dialog" aria-modal="true">
            <img
              key={lightbox._id}
              src={lightbox.image_url}
              alt={lightbox.caption || "Gallery image"}
              className="w-full max-h-[80vh] object-contain rounded-2xl"
              decoding="async"
            />
            {lightbox.caption && <p className="text-slate-400 text-center mt-4 text-sm">{lightbox.caption}</p>}
            {images.length > 1 && (
              <div className="flex justify-center mt-4 gap-1.5">
                {images.map((_, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setLightboxIndex(i);
                      setLightbox(images[i]);
                    }}
                    className={`h-1.5 rounded-full transition-all duration-300 ${i === lightboxIndex ? "w-6 bg-sky-400" : "w-1.5 bg-white/20 hover:bg-white/40"}`}
                    aria-label={`Image ${i + 1}`}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
