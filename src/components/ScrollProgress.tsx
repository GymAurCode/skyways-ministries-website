import { useEffect, useState } from "react";

export default function ScrollProgress() {
  const [p, setP] = useState(0);

  useEffect(() => {
    const onScroll = () => {
      const doc = document.documentElement;
      const max = doc.scrollHeight - doc.clientHeight;
      setP(max > 0 ? (doc.scrollTop / max) * 100 : 0);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <div
      className="fixed top-0 left-0 right-0 h-0.5 z-[100] bg-transparent pointer-events-none"
      aria-hidden
    >
      <div
        className="h-full bg-gradient-to-r from-sky-400 via-primary-400 to-sky-200 origin-left transition-[width] duration-150 ease-out will-change-[width]"
        style={{ width: `${p}%` }}
      />
    </div>
  );
}
