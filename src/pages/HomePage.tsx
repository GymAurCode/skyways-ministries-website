import { useEffect } from "react";
import AOS from "aos";
import { useSiteContent } from "../hooks/useSiteContent";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import BackToTop from "../components/BackToTop";
import ScrollProgress from "../components/ScrollProgress";
import HeroSection from "../components/sections/HeroSection";
import AboutSection from "../components/sections/AboutSection";
import GalleryPreviewSection from "../components/sections/GalleryPreviewSection";
import TestimonialsSection from "../components/sections/TestimonialsSection";
import DonationSection from "../components/sections/DonationSection";
import ContactSection from "../components/sections/ContactSection";
import { useTheme } from "../contexts/ThemeContext";

export default function HomePage() {
  const { content, loading } = useSiteContent();
  const { isDark } = useTheme();

  useEffect(() => {
    if (!loading) {
      const id = requestAnimationFrame(() => AOS.refresh());
      return () => cancelAnimationFrame(id);
    }
  }, [loading]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center page-sky-bg">
        <div className="flex flex-col items-center gap-5">
          <div
            className="h-12 w-12 rounded-full border-2 border-sky-300/30 border-t-sky-400 animate-spin"
            aria-hidden
          />
          <p className="text-slate-500 dark:text-slate-400 text-sm font-medium tracking-widest uppercase">
            Loading…
          </p>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`min-h-screen flex flex-col overflow-x-hidden page-sky-bg ${isDark ? "text-slate-200" : "text-slate-800"}`}
    >
      <ScrollProgress />
      <Navbar content={content} />
      <HeroSection content={content} />
      <AboutSection content={content} />
      <GalleryPreviewSection />
      <TestimonialsSection />
      <DonationSection content={content} />
      <ContactSection content={content} />
      <Footer content={content} />
      <BackToTop />
    </div>
  );
}
