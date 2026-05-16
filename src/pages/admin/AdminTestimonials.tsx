import { useEffect, useState, useRef } from "react";
import { testimonialsApi } from "../../lib/api";
import type { Testimonial } from "../../types";
import { Loader, Plus, Pencil, Trash2, ImageIcon, X, CheckCircle } from "lucide-react";

function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

const emptyForm = {
  name: "",
  role: "",
  message: "",
  sort_order: "0",
};

export default function AdminTestimonials() {
  const [list, setList] = useState<Testimonial[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [banner, setBanner] = useState<{ type: "ok" | "err"; text: string } | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [imageB64, setImageB64] = useState("");
  const [imagePreview, setImagePreview] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);

  const [editId, setEditId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState(emptyForm);
  const [editImageB64, setEditImageB64] = useState("");
  const [editPreview, setEditPreview] = useState("");
  const [removeImage, setRemoveImage] = useState(false);
  const editFileRef = useRef<HTMLInputElement>(null);

  async function load() {
    setLoading(true);
    try {
      const data = await testimonialsApi.list();
      setList(Array.isArray(data) ? (data as Testimonial[]) : []);
    } catch {
      setList([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setBanner(null);
    try {
      await testimonialsApi.create({
        name: form.name.trim(),
        role: form.role.trim(),
        message: form.message.trim(),
        sort_order: Number(form.sort_order) || 0,
        image_base64: imageB64 || undefined,
      });
      setForm(emptyForm);
      setImageB64("");
      setImagePreview("");
      if (fileRef.current) fileRef.current.value = "";
      setBanner({ type: "ok", text: "Testimonial added." });
      await load();
    } catch (err) {
      setBanner({ type: "err", text: err instanceof Error ? err.message : "Failed to add." });
    } finally {
      setSaving(false);
    }
  }

  function startEdit(t: Testimonial) {
    setEditId(t._id);
    setEditForm({
      name: t.name,
      role: t.role || "",
      message: t.message,
      sort_order: String(t.sort_order ?? 0),
    });
    setEditImageB64("");
    setEditPreview(t.image_url || "");
    setRemoveImage(false);
    if (editFileRef.current) editFileRef.current.value = "";
  }

  function cancelEdit() {
    setEditId(null);
    setEditImageB64("");
    setEditPreview("");
    setRemoveImage(false);
  }

  async function handleUpdate(e: React.FormEvent) {
    e.preventDefault();
    if (!editId) return;
    setSaving(true);
    setBanner(null);
    try {
      await testimonialsApi.update(editId, {
        name: editForm.name.trim(),
        role: editForm.role.trim(),
        message: editForm.message.trim(),
        sort_order: Number(editForm.sort_order) || 0,
        image_base64: editImageB64 || undefined,
        remove_image: removeImage,
      });
      cancelEdit();
      setBanner({ type: "ok", text: "Testimonial updated." });
      await load();
    } catch (err) {
      setBanner({ type: "err", text: err instanceof Error ? err.message : "Failed to update." });
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete this testimonial?")) return;
    setBanner(null);
    try {
      await testimonialsApi.delete(id);
      if (editId === id) cancelEdit();
      setBanner({ type: "ok", text: "Deleted." });
      await load();
    } catch (err) {
      setBanner({ type: "err", text: err instanceof Error ? err.message : "Failed to delete." });
    }
  }

  async function onPickCreateFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const b64 = await fileToBase64(file);
    setImageB64(b64);
    setImagePreview(b64);
  }

  async function onPickEditFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const b64 = await fileToBase64(file);
    setEditImageB64(b64);
    setEditPreview(b64);
    setRemoveImage(false);
  }

  const input =
    "w-full px-4 py-2.5 border border-neutral-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent";

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
        <h1 className="font-heading text-2xl font-bold text-neutral-900">Testimonials</h1>
        <p className="text-neutral-500 text-sm mt-1">Manage homepage testimonial cards</p>
      </div>

      {banner && (
        <div
          className={`mb-6 flex items-center gap-2 rounded-lg border px-4 py-3 text-sm ${
            banner.type === "ok"
              ? "border-green-200 bg-green-50 text-green-800"
              : "border-red-200 bg-red-50 text-red-800"
          }`}
        >
          {banner.type === "ok" ? <CheckCircle size={16} /> : <X size={16} />}
          {banner.text}
        </div>
      )}

      <div className="bg-white rounded-xl border border-neutral-200 p-6 mb-8">
        <h2 className="font-heading font-semibold text-neutral-900 mb-4 flex items-center gap-2">
          <Plus size={18} />
          Add testimonial
        </h2>
        <form onSubmit={handleCreate} className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-1">Name *</label>
            <input
              className={input}
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              maxLength={100}
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-1">Role / title</label>
            <input
              className={input}
              value={form.role}
              onChange={(e) => setForm({ ...form, role: e.target.value })}
              maxLength={100}
              placeholder="Member, visitor…"
            />
          </div>
          <div className="sm:col-span-2">
            <label className="block text-sm font-medium text-neutral-700 mb-1">Message *</label>
            <textarea
              className={`${input} resize-y min-h-[100px]`}
              value={form.message}
              onChange={(e) => setForm({ ...form, message: e.target.value })}
              maxLength={2000}
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-1">Sort order</label>
            <input
              type="number"
              min={0}
              className={input}
              value={form.sort_order}
              onChange={(e) => setForm({ ...form, sort_order: e.target.value })}
            />
            <p className="text-xs text-neutral-400 mt-1">Lower numbers appear first.</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-1">Photo (optional)</label>
            <div className="flex flex-wrap items-center gap-2">
              <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={onPickCreateFile} />
              <button
                type="button"
                onClick={() => fileRef.current?.click()}
                className="inline-flex items-center gap-2 px-4 py-2 border border-neutral-300 rounded-lg text-sm hover:bg-neutral-50"
              >
                <ImageIcon size={16} />
                Choose image
              </button>
              {imagePreview && (
                <button
                  type="button"
                  className="text-xs text-red-600 hover:underline"
                  onClick={() => {
                    setImageB64("");
                    setImagePreview("");
                    if (fileRef.current) fileRef.current.value = "";
                  }}
                >
                  Clear
                </button>
              )}
            </div>
            {imagePreview && (
              <img src={imagePreview} alt="" className="mt-2 h-16 w-16 rounded-full object-cover border" />
            )}
          </div>
          <div className="sm:col-span-2">
            <button
              type="submit"
              disabled={saving}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-primary-600 text-white rounded-lg text-sm font-medium hover:bg-primary-700 disabled:opacity-60"
            >
              {saving ? <Loader size={15} className="animate-spin" /> : <Plus size={15} />}
              {saving ? "Saving…" : "Add testimonial"}
            </button>
          </div>
        </form>
      </div>

      <div className="bg-white rounded-xl border border-neutral-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-neutral-100">
          <h2 className="font-heading font-semibold text-neutral-900">All testimonials ({list.length})</h2>
        </div>
        {list.length === 0 ? (
          <p className="p-8 text-sm text-neutral-500 text-center">No testimonials yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-neutral-50 text-left text-neutral-600">
                  <th className="px-4 py-3 font-medium">Order</th>
                  <th className="px-4 py-3 font-medium">Name</th>
                  <th className="px-4 py-3 font-medium">Message</th>
                  <th className="px-4 py-3 font-medium w-32">Actions</th>
                </tr>
              </thead>
              <tbody>
                {list.map((t) => (
                  <tr key={t._id} className="border-t border-neutral-100 hover:bg-neutral-50/80">
                    <td className="px-4 py-3 text-neutral-500">{t.sort_order}</td>
                    <td className="px-4 py-3 font-medium text-neutral-900">
                      {t.name}
                      {t.role ? <div className="text-xs font-normal text-neutral-500">{t.role}</div> : null}
                    </td>
                    <td className="px-4 py-3 text-neutral-600 max-w-md truncate" title={t.message}>
                      {t.message}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => startEdit(t)}
                          className="p-2 rounded-lg text-primary-600 hover:bg-primary-50"
                          aria-label="Edit"
                        >
                          <Pencil size={16} />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDelete(t._id)}
                          className="p-2 rounded-lg text-red-600 hover:bg-red-50"
                          aria-label="Delete"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {editId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50" role="dialog">
          <div className="bg-white rounded-xl shadow-xl max-w-lg w-full max-h-[90vh] overflow-y-auto p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-heading text-lg font-semibold text-neutral-900">Edit testimonial</h3>
              <button type="button" onClick={cancelEdit} className="p-2 rounded-lg hover:bg-neutral-100 text-neutral-500">
                <X size={18} />
              </button>
            </div>
            <form onSubmit={handleUpdate} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">Name *</label>
                <input
                  className={input}
                  value={editForm.name}
                  onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                  required
                  maxLength={100}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">Role</label>
                <input
                  className={input}
                  value={editForm.role}
                  onChange={(e) => setEditForm({ ...editForm, role: e.target.value })}
                  maxLength={100}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">Message *</label>
                <textarea
                  className={`${input} min-h-[120px]`}
                  value={editForm.message}
                  onChange={(e) => setEditForm({ ...editForm, message: e.target.value })}
                  required
                  maxLength={2000}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">Sort order</label>
                <input
                  type="number"
                  min={0}
                  className={input}
                  value={editForm.sort_order}
                  onChange={(e) => setEditForm({ ...editForm, sort_order: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">Photo</label>
                <input ref={editFileRef} type="file" accept="image/*" className="hidden" onChange={onPickEditFile} />
                <div className="flex flex-wrap gap-2 items-center">
                  <button
                    type="button"
                    onClick={() => editFileRef.current?.click()}
                    className="inline-flex items-center gap-2 px-4 py-2 border border-neutral-300 rounded-lg text-sm hover:bg-neutral-50"
                  >
                    <ImageIcon size={16} />
                    Replace image
                  </button>
                  {editPreview && (
                    <img src={editPreview} alt="" className="h-14 w-14 rounded-full object-cover border" />
                  )}
                </div>
                <label className="mt-2 flex items-center gap-2 text-sm text-neutral-600 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={removeImage}
                    onChange={(e) => {
                      setRemoveImage(e.target.checked);
                      if (e.target.checked) {
                        setEditImageB64("");
                        setEditPreview("");
                        if (editFileRef.current) editFileRef.current.value = "";
                      }
                    }}
                  />
                  Remove photo
                </label>
              </div>
              <div className="flex gap-2 pt-2">
                <button
                  type="submit"
                  disabled={saving}
                  className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-primary-600 text-white rounded-lg text-sm font-medium hover:bg-primary-700 disabled:opacity-60"
                >
                  {saving ? <Loader size={15} className="animate-spin" /> : null}
                  Save changes
                </button>
                <button type="button" onClick={cancelEdit} className="px-4 py-2.5 border border-neutral-300 rounded-lg text-sm">
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
