import { Target, Eye, BookOpen } from "lucide-react";
import ScrollReveal from "../ScrollReveal";
import type { SiteContent } from "../../types";
import { useTheme } from "../../contexts/ThemeContext";

interface Props {
  content: SiteContent;
}

export default function AboutSection({ content }: Props) {
  const { isDark } = useTheme();

  const mission = content.about_mission?.trim() || content.about_text?.trim() || "";
  const vision = content.about_vision?.trim() || "";
  const intro = content.about_intro?.trim() || "";

  const cards = [
    {
      icon: Target,
      title: "Mission",
      body: mission || "Mission statement will appear here once added in the admin panel.",
    },
    {
      icon: Eye,
      title: "Vision",
      body: vision || "Vision statement will appear here once added in the admin panel.",
    },
    {
      icon: BookOpen,
      title: "Introduction",
      body: intro || "Introduction will appear here once added in the admin panel.",
    },
  ];

  return (
    <section id="about" className="relative py-24 md:py-28 overflow-hidden cloud-texture">
      <div className="absolute inset-0 pointer-events-none z-0">
        <div className="absolute top-0 left-0 right-0 section-divider-sky opacity-80" />
      </div>

      <div className="relative z-[1] max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <ScrollReveal>
          <div className="text-center mb-14 md:mb-16">
            <span className="section-label">
              <BookOpen size={11} />
              About Us
            </span>
            <h2
              className={`font-heading text-4xl sm:text-5xl font-semibold mt-5 mb-5 ${isDark ? "text-white" : "text-slate-800"}`}
            >
              Who We Are
            </h2>
            <div className="section-divider-sky w-24 mx-auto mb-6 opacity-90" />
            <p className={`max-w-2xl mx-auto text-lg ${isDark ? "text-slate-400" : "text-slate-600"}`}>
              Our calling is to teach, preach, and heal — pointing people toward Christ with clarity, compassion, and faithfulness.
            </p>
          </div>
        </ScrollReveal>

        <div className="grid md:grid-cols-3 gap-6 md:gap-8">
          {cards.map((card, i) => (
            <div
              key={card.title}
              data-aos="fade-up"
              data-aos-delay={i * 100}
              data-aos-once="true"
              className="rounded-2xl p-8 transition-all duration-300 hover:shadow-lg hover:-translate-y-1 glass-sky"
            >
              <div
                className={`h-12 w-12 rounded-xl flex items-center justify-center mb-6 ${
                  isDark ? "bg-sky-500/15 text-sky-300" : "bg-sky-100 text-sky-700"
                }`}
              >
                <card.icon size={22} />
              </div>
              <h3 className={`font-heading text-xl font-semibold mb-4 ${isDark ? "text-white" : "text-slate-800"}`}>
                {card.title}
              </h3>
              <p className={`text-sm leading-relaxed whitespace-pre-wrap ${isDark ? "text-slate-400" : "text-slate-600"}`}>
                {card.body}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
