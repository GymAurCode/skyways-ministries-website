import { useState, useEffect, useRef } from "react";
import { galleryApi } from "../../lib/api";
import type { GalleryImage } from "../../types";
import { Upload, Trash2, Loader, Images, X, CheckCircle, Save } from "lucide-react";

function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

export default function AdminGallery() {
  const [images, setImages] = useState<GalleryImage[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [uploadMsg, setUploadMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [caption, setCaption] = useState("");
  const [preview, setPreview] = useState<string | null>(null);
  const [selectedBase64, setSelectedBase64] = useState<string>("");
  const [deleting, setDeleting] = useState<string | null>(null);
  const [captionDrafts, setCaptionDrafts] = useState<Record<string, string>>({});
  const [savingCaption, setSavingCaption] = useState<string | null>(null);
  const [captionMsg, setCaptionMsg] = useState<{ id: string; type: "ok" | "err"; text: string } | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    loadImages();
  }, []);

  async function loadImages() {
    try {
      const data = await galleryApi.list();
      setImages(Array.isArray(data) ? (data as GalleryImage[]) : []);
    } catch {
      setImages([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    setCaptionDrafts((prev) => {
      const next: Record<string, string> = {};
      for (const im of images) {
        next[im._id] = prev[im._id] !== undefined ? prev[im._id] : im.caption || "";
      }
      return next;
    });
  }, [images]);

  async function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const b64 = await fileToBase64(file);
    setSelectedBase64(b64);
    setPreview(b64);
    setUploadMsg(null);
  }

  function clearSelection() {
    setSelectedBase64("");
    setPreview(null);
    setCaption("");
    if (fileRef.current) fileRef.current.value = "";
    setUploadMsg(null);
  }

  async function handleUpload() {
    if (!selectedBase64) return;
    setUploading(true);
    setUploadMsg(null);

    try {
      const newImage = await galleryApi.upload(selectedBase64, caption);
      setUploadMsg({ type: "success", text: "Image uploaded successfully!" });
      clearSelection();
      setImages((prev) => [newImage as GalleryImage, ...prev]);
    } catch (err) {
      setUploadMsg({
        type: "error",
        text: err instanceof Error ? err.message : "Upload failed. Please try again.",
      });
    } finally {
      setUploading(false);
    }
  }

  async function handleDelete(img: GalleryImage) {
    if (!confirm(`Delete this image${img.caption ? ` "${img.caption}"` : ""}?`)) return;
    setDeleting(img._id);
    try {
      await galleryApi.delete(img._id);
      setImages((prev) => prev.filter((i) => i._id !== img._id));
    } catch {
      // silently fail — image stays in list
    } finally {
      setDeleting(null);
    }
  }

  async function handleSaveCaption(id: string) {
    setCaptionMsg(null);
    setSavingCaption(id);
    try {
      const text = (captionDrafts[id] ?? "").trim();
      const updated = await galleryApi.updateCaption(id, text);
      setImages((prev) => prev.map((i) => (i._id === id ? { ...i, caption: updated.caption } : i)));
      setCaptionMsg({ id, type: "ok", text: "Caption saved." });
      setTimeout(() => setCaptionMsg((m) => (m?.id === id ? null : m)), 2500);
    } catch (err) {
      setCaptionMsg({
        id,
        type: "err",
        text: err instanceof Error ? err.message : "Could not save caption.",
      });
    } finally {
      setSavingCaption(null);
    }
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="font-heading text-2xl font-bold text-neutral-900">Gallery Management</h1>
        <p className="text-neutral-500 text-sm mt-1">Upload and manage gallery images</p>
      </div>

      {/* Upload Card */}
      <div className="bg-white rounded-xl border border-neutral-200 p-6 mb-6">
        <h2 className="font-heading font-semibold text-neutral-900 mb-4">Upload New Image</h2>

        <div className="grid sm:grid-cols-2 gap-6 items-start">
          <div>
            {!preview ? (
              <div
                className="border-2 border-dashed border-neutral-300 rounded-xl p-8 text-center cursor-pointer hover:border-primary-400 hover:bg-primary-50 transition-colors"
                onClick={() => fileRef.current?.click()}
              >
                <Upload size={28} className="text-neutral-400 mx-auto mb-3" />
                <p className="text-sm font-medium text-neutral-600">Click to select image</p>
                <p className="text-xs text-neutral-400 mt-1">JPG, PNG, WEBP up to 10MB</p>
              </div>
            ) : (
              <div className="relative">
                <img
                  src={preview}
                  alt="Preview"
                  className="w-full rounded-xl object-cover max-h-56"
                />
                <button
                  onClick={clearSelection}
                  className="absolute top-2 right-2 h-7 w-7 rounded-full bg-black/50 hover:bg-black/70 text-white flex items-center justify-center transition-colors"
                  aria-label="Remove selection"
                >
                  <X size={14} />
                </button>
              </div>
            )}
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleFileSelect}
            />
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1.5">
                Caption{" "}
                <span className="text-neutral-400 font-normal">(optional)</span>
              </label>
              <input
                type="text"
                value={caption}
                onChange={(e) => setCaption(e.target.value)}
                className="w-full px-4 py-2.5 border border-neutral-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition"
                placeholder="Describe this image..."
              />
            </div>

            {uploadMsg && (
              <div
                className={`flex items-center gap-2 text-sm ${
                  uploadMsg.type === "success" ? "text-green-600" : "text-red-600"
                }`}
              >
                {uploadMsg.type === "success" ? (
                  <CheckCircle size={16} />
                ) : (
                  <X size={16} />
                )}
                {uploadMsg.text}
              </div>
            )}

            <button
              onClick={handleUpload}
              disabled={!selectedBase64 || uploading}
              className="flex items-center gap-2 px-5 py-2.5 bg-primary-600 text-white rounded-lg text-sm font-medium hover:bg-primary-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {uploading ? (
                <Loader size={15} className="animate-spin" />
              ) : (
                <Upload size={15} />
              )}
              {uploading ? "Uploading..." : "Upload Image"}
            </button>
          </div>
        </div>
      </div>

      {/* Images Grid */}
      <div className="bg-white rounded-xl border border-neutral-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-heading font-semibold text-neutral-900">
            Gallery ({images.length} images)
          </h2>
        </div>

        {loading ? (
          <div className="flex justify-center py-12">
            <Loader size={24} className="text-primary-600 animate-spin" />
          </div>
        ) : images.length === 0 ? (
          <div className="text-center py-12">
            <Images size={40} className="text-neutral-300 mx-auto mb-3" />
            <p className="text-neutral-500 text-sm">No images yet. Upload one above.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {images.map((img) => (
              <div
                key={img._id}
                className="rounded-xl border border-neutral-200 bg-white overflow-hidden flex flex-col shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="aspect-[4/3] bg-neutral-100">
                  <img
                    src={img.image_url}
                    alt={captionDrafts[img._id] || img.caption || "Gallery"}
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                </div>
                <div className="p-3 flex flex-col gap-2 flex-1">
                  <label className="sr-only" htmlFor={`cap-${img._id}`}>
                    Caption
                  </label>
                  <input
                    id={`cap-${img._id}`}
                    type="text"
                    maxLength={200}
                    value={captionDrafts[img._id] ?? ""}
                    onChange={(e) =>
                      setCaptionDrafts((p) => ({ ...p, [img._id]: e.target.value }))
                    }
                    className="w-full px-3 py-2 border border-neutral-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                    placeholder="Caption (optional)"
                  />
                  {captionMsg?.id === img._id && (
                    <p
                      className={`text-xs ${
                        captionMsg.type === "ok" ? "text-green-600" : "text-red-600"
                      }`}
                    >
                      {captionMsg.text}
                    </p>
                  )}
                  <div className="flex flex-wrap gap-2 mt-auto pt-1">
                    <button
                      type="button"
                      onClick={() => handleSaveCaption(img._id)}
                      disabled={savingCaption === img._id}
                      className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-primary-600 text-white text-xs font-medium hover:bg-primary-700 disabled:opacity-60"
                    >
                      {savingCaption === img._id ? (
                        <Loader size={14} className="animate-spin" />
                      ) : (
                        <Save size={14} />
                      )}
                      Save caption
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDelete(img)}
                      disabled={deleting === img._id}
                      className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg border border-red-200 text-red-600 text-xs font-medium hover:bg-red-50 disabled:opacity-60"
                    >
                      {deleting === img._id ? (
                        <Loader size={14} className="animate-spin" />
                      ) : (
                        <Trash2 size={14} />
                      )}
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
