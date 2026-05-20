import { useState, useEffect } from "react";
import { donationApi } from "../../lib/api";
import type { Donation } from "../../types";
import { CheckCircle, XCircle, Clock, Loader, Heart, TrendingUp, Trash2, ExternalLink } from "lucide-react";

type Filter = "all" | "pending" | "confirmed" | "rejected";

export default function AdminDonations() {
  const [donations, setDonations] = useState<Donation[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<Filter>("all");
  const [updating, setUpdating] = useState<string | null>(null);

  useEffect(() => {
    donationApi
      .list()
      .then((data) => setDonations(Array.isArray(data) ? (data as Donation[]) : []))
      .catch(() => setDonations([]))
      .finally(() => setLoading(false));
  }, []);

  async function updateStatus(id: string, status: "confirmed" | "rejected") {
    setUpdating(id);
    try {
      await donationApi.updateStatus(id, status);
      setDonations((prev) => prev.map((d) => (d._id === id ? { ...d, status } : d)));
    } catch {
      // silently fail
    } finally {
      setUpdating(null);
    }
  }

  async function deleteDonation(id: string) {
    if (!window.confirm("Are you sure you want to delete this donation record? This cannot be undone.")) return;
    setUpdating(id);
    try {
      await donationApi.delete(id);
      setDonations((prev) => prev.filter((d) => d._id !== id));
    } catch {
      // silently fail
    } finally {
      setUpdating(null);
    }
  }

  const filtered = donations.filter((d) => filter === "all" || d.status === filter);
  const confirmedTotal = donations
    .filter((d) => d.status === "confirmed")
    .reduce((s, d) => s + Number(d.amount), 0);
  const pending = donations.filter((d) => d.status === "pending").length;

  const statusBadge = (status: string) => {
    const map: Record<string, string> = {
      pending: "bg-amber-100 text-amber-700",
      confirmed: "bg-green-100 text-green-700",
      rejected: "bg-red-100 text-red-700",
    };
    return `inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${
      map[status] || "bg-neutral-100 text-neutral-700"
    }`;
  };

  return (
    <div>
      <div className="mb-6">
        <h1 className="font-heading text-2xl font-bold text-neutral-900">Donation Management</h1>
        <p className="text-neutral-500 text-sm mt-1">Review and process donation submissions</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {[
          {
            icon: Heart,
            value: donations.length,
            label: "Total",
            color: "bg-blue-50 text-blue-600",
            border: "border-neutral-200",
          },
          {
            icon: Clock,
            value: pending,
            label: "Pending",
            color: "bg-amber-50 text-amber-600",
            border: "border-amber-100",
          },
          {
            icon: CheckCircle,
            value: donations.filter((d) => d.status === "confirmed").length,
            label: "Confirmed",
            color: "bg-green-50 text-green-600",
            border: "border-green-100",
          },
          {
            icon: TrendingUp,
            value: `₨${confirmedTotal.toLocaleString()}`,
            label: "Confirmed Total",
            color: "bg-primary-50 text-primary-600",
            border: "border-primary-100",
          },
        ].map((card) => (
          <div
            key={card.label}
            className={`bg-white rounded-xl border ${card.border} p-4 flex items-center gap-3`}
          >
            <div
              className={`h-10 w-10 ${card.color} rounded-xl flex items-center justify-center shrink-0`}
            >
              <card.icon size={18} />
            </div>
            <div>
              <div className="text-xl font-bold text-neutral-900">{card.value}</div>
              <div className="text-xs text-neutral-500">{card.label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-neutral-200 overflow-hidden">
        <div className="p-4 border-b border-neutral-100 flex flex-wrap items-center gap-3">
          <div className="flex flex-wrap gap-1">
            {(["all", "pending", "confirmed", "rejected"] as Filter[]).map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium capitalize transition-colors ${
                  filter === f
                    ? "bg-primary-600 text-white"
                    : "text-neutral-600 hover:bg-neutral-100"
                }`}
              >
                {f}
              </button>
            ))}
          </div>
          <span className="ml-auto text-xs text-neutral-400">{filtered.length} record(s)</span>
        </div>

        {loading ? (
          <div className="flex justify-center py-12">
            <Loader size={24} className="text-primary-600 animate-spin" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-12">
            <Heart size={36} className="text-neutral-300 mx-auto mb-3" />
            <p className="text-neutral-500 text-sm">No donations found.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-neutral-100 bg-neutral-50 text-left">
                  {["Donor", "Amount", "Method", "Transaction ID", "Receipt", "Date", "Status", "Actions"].map(
                    (h) => (
                      <th
                        key={h}
                        className="px-4 py-3 text-xs font-semibold text-neutral-500 uppercase tracking-wider whitespace-nowrap"
                      >
                        {h}
                      </th>
                    )
                  )}
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100">
                {filtered.map((d) => (
                  <tr key={d._id} className="hover:bg-neutral-50 transition-colors">
                    <td className="px-4 py-3 font-medium text-neutral-900 whitespace-nowrap">{d.name}</td>
                    <td className="px-4 py-3 text-neutral-700 font-semibold whitespace-nowrap">
                      ₨{Number(d.amount).toLocaleString()}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <span className="bg-neutral-100 text-neutral-700 px-2 py-0.5 rounded text-xs">
                        {d.method}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-neutral-500 text-xs font-mono whitespace-nowrap">
                      {d.transaction_id || <span className="text-neutral-300">—</span>}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      {d.image_url ? (
                        <a
                          href={d.image_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-xs font-medium text-sky-600 hover:text-sky-700 bg-sky-50 hover:bg-sky-100 px-2.5 py-1 rounded-md transition-colors"
                        >
                          <ExternalLink size={12} />
                          <span>View Proof</span>
                        </a>
                      ) : (
                        <span className="text-neutral-400 text-xs">No proof</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-neutral-500 text-xs whitespace-nowrap">
                      {new Date(d.createdAt).toLocaleDateString("en-PK", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <span className={statusBadge(d.status)}>
                        {d.status === "pending" && <Clock size={11} />}
                        {d.status === "confirmed" && <CheckCircle size={11} />}
                        {d.status === "rejected" && <XCircle size={11} />}
                        {d.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      {d.status === "pending" ? (
                        <div className="flex items-center gap-1.5">
                          <button
                            onClick={() => updateStatus(d._id, "confirmed")}
                            disabled={updating === d._id}
                            className="flex items-center gap-1 px-2.5 py-1 bg-green-600 text-white rounded text-xs hover:bg-green-700 transition-colors disabled:opacity-50"
                          >
                            {updating === d._id ? (
                              <Loader size={11} className="animate-spin" />
                            ) : (
                              <CheckCircle size={11} />
                            )}
                            Confirm
                          </button>
                          <button
                            onClick={() => updateStatus(d._id, "rejected")}
                            disabled={updating === d._id}
                            className="flex items-center gap-1 px-2.5 py-1 bg-red-100 text-red-700 rounded text-xs hover:bg-red-200 transition-colors disabled:opacity-50"
                          >
                            <XCircle size={11} />
                            Reject
                          </button>
                          <button
                            onClick={() => deleteDonation(d._id)}
                            disabled={updating === d._id}
                            className="flex items-center justify-center p-1.5 text-neutral-400 hover:text-red-600 transition-colors disabled:opacity-50 ml-1"
                            title="Delete record"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => deleteDonation(d._id)}
                          disabled={updating === d._id}
                          className="flex items-center justify-center p-1.5 text-neutral-300 hover:text-red-600 transition-colors disabled:opacity-50"
                          title="Delete record"
                        >
                          <Trash2 size={14} />
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
