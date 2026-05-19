import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { Menu, X, Sun, Moon } from "lucide-react";
import type { SiteContent } from "../types";
import logo from "../assets/logo.webp";
import { useTheme } from "../contexts/ThemeContext";

interface Props {
  content: SiteContent;
}

const navLinks = [
  { to: "/", label: "Home" },
  { to: "/#about", label: "About", scroll: true },
  { to: "/gallery", label: "Gallery", scroll: false },
  { to: "/#donation", label: "Donation", scroll: true },
  { to: "/#contact", label: "Contact", scroll: true },
];

export default function Navbar({ content }: Props) {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();
  const { theme, toggleTheme, isDark } = useTheme();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 48);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => setOpen(false), [location.pathname]);

  const handleNavClick = (link: (typeof navLinks)[0]) => {
    if (link.scroll && link.to.includes("#")) {
      const id = link.to.split("#")[1];
      const el = document.getElementById(id);
      if (el) {
        el.scrollIntoView({ behavior: "smooth" });
        setOpen(false);
      }
    }
  };

  const isActive = (to: string) => {
    if (to === "/") return location.pathname === "/" && !location.hash;
    if (to === "/gallery") return location.pathname === "/gallery";
    if (to.includes("#")) return location.hash === `#${to.split("#")[1]}`;
    return false;
  };

  const onTopHero = !scrolled && location.pathname === "/";

  return (
    <nav
      className={`fixed top-3 left-4 right-4 z-50 transition-[background,box-shadow,border-color] duration-300 rounded-2xl ${scrolled
          ? isDark
            ? "bg-nightsky-950/80 backdrop-blur-xl border border-white/10 shadow-[0_12px_40px_rgba(0,0,0,0.35)]"
            : "glass-sky border border-sky-100/80 shadow-[0_12px_40px_rgba(14,116,144,0.08)]"
          : "bg-transparent border border-transparent"
        }`}
    >
      {scrolled && (
        <div className="absolute top-0 left-8 right-8 h-px section-divider-sky opacity-80 rounded-full" />
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="flex items-center gap-3 group flex-shrink-0">
            <div className="relative">
              <div className="absolute inset-0 rounded-full bg-sky-400/25 blur-md opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <img
                src={logo}
                alt="Skyway Ministries Logo"
                className="relative h-9 w-9 rounded-full object-cover ring-2 ring-sky-300/50 group-hover:ring-sky-200 transition-all duration-300 group-hover:scale-105"
              />
            </div>
            <div className="hidden sm:block">
              <span
                className={`font-heading font-bold text-[11px] leading-tight block tracking-widest transition-colors duration-300 ${onTopHero ? "text-white" : isDark ? "text-white" : "text-slate-800"
                  }`}
              >
                {content.institute_name || "SKYWAY MINISTRIES"}
              </span>
              {content.tagline && (
                <span
                  className={`text-[8px] font-semibold tracking-[0.25em] uppercase transition-colors ${onTopHero ? "text-sky-200" : !isDark ? "text-sky-600" : "text-sky-200"
                    }`}
                >
                  {content.tagline}
                </span>
              )}
            </div>
          </Link>

          <div className="hidden lg:flex items-center gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                onClick={() => handleNavClick(link)}
                className={`relative px-4 py-2 rounded-xl text-[13px] font-medium transition-colors duration-200 group ${isActive(link.to)
                    ? "text-sky-500 dark:text-sky-300"
                    : onTopHero
                      ? "text-white/85 hover:text-white"
                      : isDark
                        ? "text-slate-300 hover:text-white"
                        : "text-slate-600 hover:text-slate-900"
                  }`}
              >
                <span
                  className={`absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-200 ${isDark ? "bg-white/6" : "bg-sky-500/8"
                    }`}
                />
                <span className="relative z-10">{link.label}</span>
                {isActive(link.to) && (
                  <span className="absolute bottom-1 left-4 right-4 h-0.5 rounded-full bg-gradient-to-r from-sky-400 to-sky-200" />
                )}
              </Link>
            ))}
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={toggleTheme}
              className={`p-2 rounded-xl transition-all duration-200 hover:scale-105 active:scale-95 ${isDark
                  ? "text-slate-400 hover:text-white hover:bg-white/8"
                  : onTopHero
                    ? "text-white/80 hover:text-white hover:bg-white/10"
                    : scrolled
                      ? "text-slate-500 hover:text-slate-900 hover:bg-sky-50"
                      : "text-slate-600 hover:text-slate-900 hover:bg-sky-50/80"
                }`}
              aria-label="Toggle theme"
            >
              {theme === "dark" ? <Sun size={16} /> : <Moon size={16} />}
            </button>

            <button
              type="button"
              className={`lg:hidden p-2 rounded-xl transition-colors ${isDark
                  ? "text-slate-300 hover:bg-white/8"
                  : onTopHero
                    ? "text-white hover:bg-white/10"
                    : scrolled
                      ? "text-slate-700 hover:bg-sky-50"
                      : "text-slate-700 hover:bg-sky-50"
                }`}
              onClick={() => setOpen(!open)}
              aria-label="Toggle menu"
              aria-expanded={open}
            >
              {open ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>
      </div>

      <div
        className={`lg:hidden overflow-hidden transition-[max-height,opacity] duration-300 ease-out border-t ${open ? "max-h-[400px] opacity-100" : "max-h-0 opacity-0 pointer-events-none border-transparent"
          } ${isDark ? "border-white/[0.06] bg-nightsky-950/95 backdrop-blur-xl rounded-b-2xl" : "border-sky-100/80 bg-white/95 backdrop-blur-xl rounded-b-2xl"}`}
      >
        <div className="px-4 py-4 space-y-1">
          {navLinks.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              onClick={() => handleNavClick(link)}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors duration-200 ${isActive(link.to)
                  ? "bg-sky-500/12 text-sky-600 dark:text-sky-300 border border-sky-500/20"
                  : isDark
                    ? "text-slate-300 hover:text-white hover:bg-white/5"
                    : "text-slate-600 hover:text-slate-900 hover:bg-sky-50"
                }`}
            >
              {link.label}
            </Link>
          ))}
        </div>
      </div>
    </nav>
  );
}
