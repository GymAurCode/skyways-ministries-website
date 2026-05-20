import { useEffect, useState } from "react";
import { donationApi } from "../../lib/api";
import { Heart, CheckCircle, Clock, XCircle, TrendingUp, Images, Lightbulb, Quote, MessageSquare, Mail } from "lucide-react";

interface Stats {
  total: number;
  pending: number;
  confirmed: number;
  rejected: number;
  totalAmount: number;
  galleryCount: number;
  testimonialCount: number;
  contactCount: number;
  unreadMessages: number;
}

function StatCard({
  label,
  value,
  icon: Icon,
  color,
  border,
}: {
  label: string;
  value: string | number;
  icon: React.ElementType;
  color: string;
  border: string;
}) {
  return (
    <div
      className={`bg-white rounded-xl border ${border} p-6 flex items-center gap-4 cursor-default transition-shadow duration-200 hover:-translate-y-1 hover:shadow-md`}
    >
      <div className={`h-12 w-12 rounded-xl ${color} flex items-center justify-center shrink-0 transition-transform duration-200 hover:scale-105`}>
        <Icon size={22} />
      </div>
      <div className="min-w-0 flex-1">
        <div className="text-xl sm:text-2xl font-bold text-neutral-900 truncate" title={String(value)}>{value}</div>
        <div className="text-sm text-neutral-500 truncate" title={label}>{label}</div>
      </div>
    </div>
  );
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<Stats>({
    total: 0,
    pending: 0,
    confirmed: 0,
    rejected: 0,
    totalAmount: 0,
    galleryCount: 0,
    testimonialCount: 0,
    contactCount: 0,
    unreadMessages: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    donationApi.stats()
      .then(setStats)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const cards = [
    { label: "Total Donations", value: stats.total, icon: Heart, color: "bg-blue-50 text-blue-600", border: "border-blue-100" },
    { label: "Pending", value: stats.pending, icon: Clock, color: "bg-amber-50 text-amber-600", border: "border-amber-100" },
    { label: "Confirmed", value: stats.confirmed, icon: CheckCircle, color: "bg-green-50 text-green-600", border: "border-green-100" },
    { label: "Rejected", value: stats.rejected, icon: XCircle, color: "bg-red-50 text-red-600", border: "border-red-100" },
    { label: "Total Confirmed (PKR)", value: `₨ ${stats.totalAmount.toLocaleString()}`, icon: TrendingUp, color: "bg-primary-50 text-primary-600", border: "border-primary-100" },
    { label: "Gallery Images", value: stats.galleryCount, icon: Images, color: "bg-neutral-50 text-neutral-600", border: "border-neutral-200" },
    { label: "Testimonials", value: stats.testimonialCount, icon: Quote, color: "bg-violet-50 text-violet-600", border: "border-violet-100" },
    { label: "Contact Messages", value: stats.contactCount, icon: MessageSquare, color: "bg-cyan-50 text-cyan-600", border: "border-cyan-100" },
    { label: "Unread Messages", value: stats.unreadMessages, icon: Mail, color: "bg-orange-50 text-orange-600", border: "border-orange-100" },
  ];

  const tips = [
    "Use Website Content for mission, vision, hero text, contact details, and payment display fields.",
    "Gallery and Testimonials power the homepage preview sections.",
    "Confirm or reject pending donations from the Donations page.",
    "Change your admin password in Settings.",
  ];

  return (
    <div>
      <div className="mb-8">
        <h1 className="font-heading text-2xl font-bold text-neutral-900">Dashboard</h1>
        <p className="text-neutral-500 text-sm mt-1">Overview of SKYWAY MINISTRIES OF CHRIST website</p>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 9 }).map((_, i) => (
            <div key={i} className="h-28 bg-white rounded-xl border border-neutral-200 animate-pulse" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {cards.map((card) => (
            <StatCard key={card.label} {...card} />
          ))}
        </div>
      )}

      <div className="mt-8 bg-white rounded-xl border border-neutral-200 p-6">
        <div className="flex items-center gap-2 mb-4">
          <Lightbulb size={18} className="text-gold-500" />
          <h2 className="font-heading text-lg font-semibold text-neutral-900">Quick Tips</h2>
        </div>
        <ul className="text-sm text-neutral-600 space-y-2.5">
          {tips.map((tip, i) => (
            <li key={i} className="flex items-start gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-primary-500 mt-1.5 shrink-0" />
              {tip}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
