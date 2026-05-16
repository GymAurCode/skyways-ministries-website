import { useState, useEffect } from "react";
import { ArrowUp } from "lucide-react";

export default function BackToTop() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > 400);
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  if (!visible) return null;

  return (
    <button
      type="button"
      onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
      className="fixed bottom-6 right-6 z-50 h-11 w-11 rounded-full bg-primary-600 text-white shadow-lg shadow-sky-900/25 flex items-center justify-center hover:bg-primary-700 hover:scale-105 active:scale-95 transition-transform duration-200"
      aria-label="Back to top"
    >
      <ArrowUp size={18} />
    </button>
  );
}
