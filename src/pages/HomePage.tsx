import { useEffect } from "react";
import { useLocation } from "react-router-dom";
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
  const location = useLocation();

  useEffect(() => {
    if (!loading) {
      const id = requestAnimationFrame(() => AOS.refresh());
      return () => cancelAnimationFrame(id);
    }
  }, [loading]);

  useEffect(() => {
    if (!loading && location.hash) {
      const id = location.hash.replace("#", "");
      const timer = setTimeout(() => {
        const el = document.getElementById(id);
        if (el) {
          el.scrollIntoView({ behavior: "smooth" });
        }
      }, 150);
      return () => clearTimeout(timer);
    }
  }, [loading, location.hash]);



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
