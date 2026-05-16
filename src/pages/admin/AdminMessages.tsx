import { useEffect, useState } from "react";
import { messagesApi } from "../../lib/api";
import type { ContactMessage } from "../../types";
import { Loader, Trash2, Mail, Inbox, CheckCircle } from "lucide-react";

export default function AdminMessages() {
  const [list, setList] = useState<ContactMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [openId, setOpenId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState<string | null>(null);

  async function load() {
    setLoading(true);
    try {
      const data = await messagesApi.list();
      setList(Array.isArray(data) ? (data as ContactMessage[]) : []);
    } catch {
      setList([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function toggleOpen(msg: ContactMessage) {
    if (openId === msg._id) {
      setOpenId(null);
      return;
    }
    setOpenId(msg._id);
    if (!msg.read) {
      try {
        const updated = await messagesApi.markRead(msg._id, true);
        setList((prev) => prev.map((m) => (m._id === msg._id ? { ...m, ...updated } : m)));
      } catch {
        /* still show message */
      }
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete this message permanently?")) return;
    setDeleting(id);
    try {
      await messagesApi.delete(id);
      setList((prev) => prev.filter((m) => m._id !== id));
      if (openId === id) setOpenId(null);
    } catch {
      /* ignore */
    } finally {
      setDeleting(null);
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <Loader className="w-8 h-8 text-primary-600 animate-spin" />
      </div>
    );
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="font-heading text-2xl font-bold text-neutral-900">Contact messages</h1>
        <p className="text-neutral-500 text-sm mt-1">Submissions from the website contact form</p>
      </div>

      {list.length === 0 ? (
        <div className="bg-white rounded-xl border border-neutral-200 p-12 text-center">
          <Inbox className="w-12 h-12 text-neutral-300 mx-auto mb-3" />
          <p className="text-neutral-500 text-sm">No messages yet.</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-neutral-200 divide-y divide-neutral-100">
          {list.map((msg) => {
            const expanded = openId === msg._id;
            return (
              <div key={msg._id} className="p-4 sm:p-5">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <button
                    type="button"
                    onClick={() => toggleOpen(msg)}
                    className="text-left flex-1 min-w-0"
                  >
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-semibold text-neutral-900">{msg.name}</span>
                      {!msg.read && (
                        <span className="text-[10px] uppercase tracking-wide px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 font-medium">
                          Unread
                        </span>
                      )}
                    </div>
                    <div className="text-sm text-neutral-500 flex items-center gap-1 mt-0.5">
                      <Mail size={14} className="shrink-0" />
                      <span className="truncate">{msg.email}</span>
                    </div>
                    <div className="text-sm text-neutral-700 mt-1 font-medium truncate">{msg.subject}</div>
                    <div className="text-xs text-neutral-400 mt-1">
                      {new Date(msg.createdAt).toLocaleString()}
                    </div>
                  </button>
                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      type="button"
                      onClick={() => toggleOpen(msg)}
                      className="px-3 py-1.5 text-sm rounded-lg border border-neutral-200 hover:bg-neutral-50 text-neutral-700"
                    >
                      {expanded ? "Hide" : "View"}
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDelete(msg._id)}
                      disabled={deleting === msg._id}
                      className="p-2 rounded-lg text-red-600 hover:bg-red-50 disabled:opacity-50"
                      aria-label="Delete"
                    >
                      {deleting === msg._id ? <Loader size={16} className="animate-spin" /> : <Trash2 size={16} />}
                    </button>
                  </div>
                </div>
                {expanded && (
                  <div className="mt-4 p-4 rounded-lg bg-neutral-50 border border-neutral-100 text-sm text-neutral-800 whitespace-pre-wrap">
                    {msg.read && (
                      <p className="text-xs text-green-700 flex items-center gap-1 mb-2">
                        <CheckCircle size={14} />
                        Marked as read
                      </p>
                    )}
                    {msg.message}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
