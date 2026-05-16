import { Mail, Phone, MapPin, Clock, Send, MessageSquare, AlertCircle, CheckCircle, Loader2 } from "lucide-react";
import ScrollReveal from "../ScrollReveal";
import { fadeInLeft, fadeInRight } from "../../lib/animations";
import type { SiteContent } from "../../types";
import { useTheme } from "../../contexts/ThemeContext";
import { useState } from "react";
import { messagesApi } from "../../lib/api";

interface Props {
  content: SiteContent;
}

const serviceSchedule = [
  { day: "Sunday", time: "9:00 AM & 11:00 AM", type: "Main Service" },
  { day: "Wednesday", time: "7:00 PM", type: "Bible Study" },
  { day: "Friday", time: "6:30 PM", type: "Prayer Night" },
];

export default function ContactSection({ content }: Props) {
  const { isDark } = useTheme();
  const [form, setForm] = useState({ name: "", email: "", subject: "", message: "" });
  const [sending, setSending] = useState(false);
  const [done, setDone] = useState(false);
  const [err, setErr] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErr("");
    setSending(true);
    try {
      await messagesApi.submit({
        name: form.name.trim(),
        email: form.email.trim(),
        subject: form.subject.trim(),
        message: form.message.trim(),
      });
      setDone(true);
      setForm({ name: "", email: "", subject: "", message: "" });
    } catch (er) {
      setErr(er instanceof Error ? er.message : "Could not send message.");
    } finally {
      setSending(false);
    }
  }

  return (
    <section id="contact" className={`relative py-24 md:py-28 overflow-hidden cloud-texture ${isDark ? "bg-[#050f1a]/60" : "bg-sky-50/40"}`}>
      <div className="absolute inset-0 pointer-events-none z-0">
        <div className="absolute top-0 left-0 right-0 section-divider-sky opacity-70" />
        <div className={`absolute bottom-0 right-0 w-96 h-96 rounded-full blur-3xl ${isDark ? "bg-sky-500/5" : "bg-sky-200/30"}`} />
      </div>

      <div className="relative z-[1] max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <ScrollReveal>
          <div className="text-center mb-14 md:mb-16">
            <span className="section-label mb-5 inline-flex">
              <MessageSquare size={11} />
              Contact
            </span>
            <h2 className={`font-heading text-4xl sm:text-5xl font-semibold ${isDark ? "text-white" : "text-slate-800"}`}>
              We&apos;d Love to
              <br />
              <span className="text-gradient-blue">Hear From You</span>
            </h2>
          </div>
        </ScrollReveal>

        <div className="grid lg:grid-cols-2 gap-12">
          <ScrollReveal animation={fadeInLeft}>
            <div className="space-y-6">
              {[
                {
                  icon: Mail,
                  label: "Email",
                  value: content.contact_email || "info@skywayministries.org",
                  href: `mailto:${content.contact_email || "info@skywayministries.org"}`,
                  color: "text-sky-600 dark:text-sky-300",
                  bg: "bg-sky-100/80 dark:bg-sky-500/10",
                  border: "border-sky-200/80 dark:border-sky-500/15",
                },
                {
                  icon: Phone,
                  label: "Phone",
                  value: content.contact_phone || "",
                  href: content.contact_phone ? `tel:${content.contact_phone}` : "#",
                  color: "text-emerald-600 dark:text-emerald-400",
                  bg: "bg-emerald-100/80 dark:bg-emerald-500/10",
                  border: "border-emerald-200/80 dark:border-emerald-500/15",
                },
                {
                  icon: MapPin,
                  label: "Address",
                  value: content.contact_address || "",
                  href: "#",
                  color: "text-amber-700 dark:text-amber-300",
                  bg: "bg-amber-100/80 dark:bg-amber-500/10",
                  border: "border-amber-200/80 dark:border-amber-500/15",
                },
              ].map((item) =>
                item.value ? (
                  <a
                    key={item.label}
                    href={item.href}
                    className={`flex items-start gap-4 p-5 rounded-2xl border transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md ${
                      isDark ? `${item.bg} ${item.border}` : "bg-white/90 border-slate-200 hover:border-sky-200"
                    }`}
                  >
                    <div className={`h-11 w-11 rounded-xl ${item.bg} border ${item.border} flex items-center justify-center flex-shrink-0`}>
                      <item.icon size={18} className={item.color} />
                    </div>
                    <div>
                      <div className={`text-xs font-semibold uppercase tracking-wider mb-1 ${item.color}`}>{item.label}</div>
                      <div className={`text-sm font-medium ${isDark ? "text-white" : "text-slate-800"}`}>{item.value}</div>
                    </div>
                  </a>
                ) : null
              )}

              <div className={`rounded-2xl p-6 border ${isDark ? "bg-white/3 border-white/6" : "bg-white border-slate-200 shadow-sm"}`}>
                <h4 className={`font-heading font-semibold text-base mb-5 flex items-center gap-2 ${isDark ? "text-white" : "text-slate-800"}`}>
                  <Clock size={16} className="text-sky-500 dark:text-sky-400" />
                  Service schedule
                </h4>
                <div className="space-y-3">
                  {serviceSchedule.map((s) => (
                    <div
                      key={s.day}
                      className={`flex items-center justify-between py-2.5 border-b last:border-0 ${isDark ? "border-white/5" : "border-slate-100"}`}
                    >
                      <div>
                        <div className={`text-sm font-semibold ${isDark ? "text-white" : "text-slate-800"}`}>{s.day}</div>
                        <div className={`text-xs ${isDark ? "text-slate-500" : "text-slate-400"}`}>{s.type}</div>
                      </div>
                      <span
                        className={`text-xs font-medium px-3 py-1 rounded-full ${
                          isDark ? "bg-sky-500/10 text-sky-300 border border-sky-500/15" : "bg-sky-50 text-sky-700 border border-sky-100"
                        }`}
                      >
                        {s.time}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </ScrollReveal>

          <ScrollReveal animation={fadeInRight}>
            <div className={`rounded-2xl p-8 glass-sky`}>
              <h3 className={`font-heading text-xl font-semibold mb-6 ${isDark ? "text-white" : "text-slate-800"}`}>Send a message</h3>

              {done ? (
                <div className="flex flex-col items-center gap-3 py-8 text-center">
                  <CheckCircle className="text-emerald-500" size={40} />
                  <p className={isDark ? "text-slate-300" : "text-slate-600"}>Thank you. Your message has been received.</p>
                  <button
                    type="button"
                    onClick={() => setDone(false)}
                    className="text-sm text-sky-600 dark:text-sky-400 font-semibold hover:underline"
                  >
                    Send another
                  </button>
                </div>
              ) : (
                <form className="space-y-4" onSubmit={handleSubmit}>
                  {err && (
                    <div className="flex items-center gap-2 text-red-600 text-sm bg-red-50 dark:bg-red-950/30 dark:text-red-400 rounded-lg px-3 py-2">
                      <AlertCircle size={16} />
                      {err}
                    </div>
                  )}
                  <div>
                    <label className={`block text-xs font-semibold uppercase tracking-wider mb-2 ${isDark ? "text-slate-400" : "text-slate-500"}`}>
                      Name *
                    </label>
                    <input
                      required
                      maxLength={100}
                      value={form.name}
                      onChange={(e) => setForm({ ...form, name: e.target.value })}
                      className={`w-full px-4 py-3 rounded-xl text-sm outline-none transition ${
                        isDark
                          ? "bg-white/5 border border-white/8 text-white placeholder-slate-600 focus:border-sky-400/50"
                          : "bg-slate-50 border border-slate-200 text-slate-900 focus:border-sky-400"
                      }`}
                      placeholder="Your name"
                    />
                  </div>
                  <div>
                    <label className={`block text-xs font-semibold uppercase tracking-wider mb-2 ${isDark ? "text-slate-400" : "text-slate-500"}`}>
                      Email *
                    </label>
                    <input
                      required
                      type="email"
                      maxLength={100}
                      value={form.email}
                      onChange={(e) => setForm({ ...form, email: e.target.value })}
                      className={`w-full px-4 py-3 rounded-xl text-sm outline-none transition ${
                        isDark
                          ? "bg-white/5 border border-white/8 text-white placeholder-slate-600 focus:border-sky-400/50"
                          : "bg-slate-50 border border-slate-200 text-slate-900 focus:border-sky-400"
                      }`}
                      placeholder="you@example.com"
                    />
                  </div>
                  <div>
                    <label className={`block text-xs font-semibold uppercase tracking-wider mb-2 ${isDark ? "text-slate-400" : "text-slate-500"}`}>
                      Subject *
                    </label>
                    <input
                      required
                      maxLength={200}
                      value={form.subject}
                      onChange={(e) => setForm({ ...form, subject: e.target.value })}
                      className={`w-full px-4 py-3 rounded-xl text-sm outline-none transition ${
                        isDark
                          ? "bg-white/5 border border-white/8 text-white placeholder-slate-600 focus:border-sky-400/50"
                          : "bg-slate-50 border border-slate-200 text-slate-900 focus:border-sky-400"
                      }`}
                      placeholder="How can we help?"
                    />
                  </div>
                  <div>
                    <label className={`block text-xs font-semibold uppercase tracking-wider mb-2 ${isDark ? "text-slate-400" : "text-slate-500"}`}>
                      Message *
                    </label>
                    <textarea
                      required
                      rows={4}
                      maxLength={5000}
                      value={form.message}
                      onChange={(e) => setForm({ ...form, message: e.target.value })}
                      className={`w-full px-4 py-3 rounded-xl text-sm outline-none resize-none transition ${
                        isDark
                          ? "bg-white/5 border border-white/8 text-white placeholder-slate-600 focus:border-sky-400/50"
                          : "bg-slate-50 border border-slate-200 text-slate-900 focus:border-sky-400"
                      }`}
                      placeholder="Your message…"
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={sending}
                    className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl bg-gradient-to-r from-sky-500 to-primary-500 text-white font-semibold text-sm shadow-md hover:opacity-95 transition-all disabled:opacity-60"
                  >
                    {sending ? <Loader2 size={15} className="animate-spin" /> : <Send size={15} />}
                    {sending ? "Sending…" : "Send message"}
                  </button>
                </form>
              )}
            </div>
          </ScrollReveal>
        </div>
      </div>
    </section>
  );
}
