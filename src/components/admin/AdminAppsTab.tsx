"use client";

import type { Dispatch, FormEvent, SetStateAction } from "react";
import Link from "next/link";
import {
  Edit3,
  ExternalLink,
  Eye,
  ImagePlus,
  Plus,
  Save,
  Sparkles,
  Trash2,
  X,
} from "lucide-react";
import type { AppItem, AppStatus } from "@/types";
import { slugify, statusLabels } from "@/lib/utils";
import { MarkdownRenderer } from "../MarkdownRenderer";
import type { AppFormState } from "./types";

interface AdminAppsTabProps {
  apps: AppItem[];
  editingApp: boolean;
  setEditingApp: Dispatch<SetStateAction<boolean>>;
  appForm: AppFormState;
  setAppForm: Dispatch<SetStateAction<AppFormState>>;
  appPreview: boolean;
  setAppPreview: Dispatch<SetStateAction<boolean>>;
  saving: boolean;
  uploading: boolean;
  onOpenNew: () => void;
  onOpenEdit: (app: AppItem) => void;
  onSave: (e: FormEvent) => void;
  onDelete: (id: string, title: string) => void;
  onUploadImage: (file: File) => Promise<string | null>;
}

export function AdminAppsTab({
  apps,
  editingApp,
  setEditingApp,
  appForm,
  setAppForm,
  appPreview,
  setAppPreview,
  saving,
  uploading,
  onOpenNew,
  onOpenEdit,
  onSave,
  onDelete,
  onUploadImage,
}: AdminAppsTabProps) {
  if (editingApp) {
    return (
      <form
        onSubmit={onSave}
        className="rounded-3xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/80 p-6 sm:p-8 space-y-6"
      >
        <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-zinc-800">
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">
            {appForm.id ? "Uygulamayı Düzenle" : "Yeni Uygulama Paylaş"}
          </h2>
          <button
            type="button"
            onClick={() => setEditingApp(false)}
            className="inline-flex items-center gap-1 text-xs font-medium text-slate-500 hover:text-slate-900 dark:hover:text-white cursor-pointer"
          >
            <X className="w-4 h-4" />
            <span>İptal</span>
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div>
            <label className="block text-xs font-semibold mb-1.5">
              Uygulama Adı *
            </label>
            <input
              type="text"
              required
              value={appForm.title}
              onChange={(e) =>
                setAppForm({
                  ...appForm,
                  title: e.target.value,
                  slug: appForm.id ? appForm.slug : slugify(e.target.value),
                })
              }
              placeholder="Örn: FocusFlow Görev Yöneticisi"
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-950 text-sm"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold mb-1.5">
              URL Uzantısı (Slug)
            </label>
            <input
              type="text"
              value={appForm.slug}
              onChange={(e) =>
                setAppForm({ ...appForm, slug: slugify(e.target.value) })
              }
              placeholder="focusflow-gorev-yoneticisi"
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-950 text-sm font-mono"
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-xs font-semibold mb-1.5">
              Kısa Özet (Tagline) *
            </label>
            <input
              type="text"
              required
              value={appForm.tagline}
              onChange={(e) =>
                setAppForm({ ...appForm, tagline: e.target.value })
              }
              placeholder="Uygulamanın ne işe yaradığını anlatan tek cümlelik özet"
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-950 text-sm"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold mb-1.5">
              Kategori
            </label>
            <input
              type="text"
              value={appForm.category}
              onChange={(e) =>
                setAppForm({ ...appForm, category: e.target.value })
              }
              placeholder="Örn: Üretkenlik, Yapay Zeka, Mobil, Oyun"
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-950 text-sm"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold mb-1.5">
                Durum
              </label>
              <select
                value={appForm.status}
                onChange={(e) =>
                  setAppForm({
                    ...appForm,
                    status: e.target.value as AppStatus,
                  })
                }
                className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-950 text-sm"
              >
                <option value="live">Yayında</option>
                <option value="open-source">Açık Kaynak</option>
                <option value="beta">Beta</option>
                <option value="in-progress">Geliştiriliyor</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold mb-1.5">
                Sürüm
              </label>
              <input
                type="text"
                value={appForm.version}
                onChange={(e) =>
                  setAppForm({ ...appForm, version: e.target.value })
                }
                placeholder="v1.0.0"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-950 text-sm font-mono"
              />
            </div>
          </div>

          <div className="md:col-span-2">
            <label className="block text-xs font-semibold mb-1.5">
              Kullanılan Teknolojiler (Virgülle ayırın)
            </label>
            <input
              type="text"
              value={appForm.techStackInput}
              onChange={(e) =>
                setAppForm({ ...appForm, techStackInput: e.target.value })
              }
              placeholder="Next.js, TypeScript, Tailwind CSS, Electron, Python"
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-950 text-sm"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold mb-1.5">
              Canlı Demo Bağlantısı
            </label>
            <input
              type="url"
              value={appForm.demoUrl}
              onChange={(e) =>
                setAppForm({ ...appForm, demoUrl: e.target.value })
              }
              placeholder="https://uygulama.com"
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-950 text-sm"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold mb-1.5">
              GitHub / Kaynak Kod Bağlantısı
            </label>
            <input
              type="url"
              value={appForm.repoUrl}
              onChange={(e) =>
                setAppForm({ ...appForm, repoUrl: e.target.value })
              }
              placeholder="https://github.com/kullanici/proje"
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-950 text-sm"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold mb-1.5">
              İndirme Bağlantısı (Opsiyonel - APK / EXE / ZIP)
            </label>
            <input
              type="url"
              value={appForm.downloadUrl}
              onChange={(e) =>
                setAppForm({ ...appForm, downloadUrl: e.target.value })
              }
              placeholder="https://github.com/.../releases/latest"
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-950 text-sm"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold mb-1.5">
              Kapak Görseli (URL veya Dosya Yükle)
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={appForm.coverImage}
                onChange={(e) =>
                  setAppForm({ ...appForm, coverImage: e.target.value })
                }
                placeholder="/uploads/... veya https://..."
                className="flex-1 px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-950 text-sm"
              />
              <label className="inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-zinc-700 bg-slate-100 dark:bg-zinc-800 text-xs font-semibold cursor-pointer hover:border-indigo-500 shrink-0">
                <ImagePlus className="w-4 h-4" />
                <span>{uploading ? "..." : "Yükle"}</span>
                <input
                  type="file"
                  accept="image/png,image/jpeg,image/webp,image/gif"
                  className="hidden"
                  onChange={async (e) => {
                    const file = e.target.files?.[0];
                    if (!file) return;
                    const url = await onUploadImage(file);
                    if (url) {
                      setAppForm((prev) => ({ ...prev, coverImage: url }));
                    }
                  }}
                />
              </label>
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-xs font-semibold">
              Detaylı Açıklama & Özellikler (Markdown destekli)
            </label>
            <button
              type="button"
              onClick={() => setAppPreview(!appPreview)}
              className="inline-flex items-center gap-1 text-xs font-semibold text-indigo-600 dark:text-indigo-400 cursor-pointer"
            >
              <Eye className="w-3.5 h-3.5" />
              <span>{appPreview ? "Düzenlemeye Dön" : "Önizleme"}</span>
            </button>
          </div>

          {appPreview ? (
            <div className="min-h-[220px] p-5 rounded-2xl border border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-950">
              <MarkdownRenderer
                content={appForm.description || "*Henüz içerik girilmedi.*"}
              />
            </div>
          ) : (
            <textarea
              rows={9}
              value={appForm.description}
              onChange={(e) =>
                setAppForm({ ...appForm, description: e.target.value })
              }
              placeholder={"## Uygulama Özellikleri\n- Özellik 1\n- Özellik 2"}
              className="w-full p-4 rounded-2xl border border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-950 text-sm font-mono leading-relaxed"
            />
          )}
        </div>

        <div className="flex flex-wrap items-center justify-between gap-4 pt-4 border-t border-slate-200 dark:border-zinc-800">
          <label className="inline-flex items-center gap-2 text-sm font-medium cursor-pointer">
            <input
              type="checkbox"
              checked={appForm.featured}
              onChange={(e) =>
                setAppForm({ ...appForm, featured: e.target.checked })
              }
              className="w-4 h-4 rounded accent-indigo-600"
            />
            <span>Ana sayfadaki vitrinde öne çıkar</span>
          </label>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setEditingApp(false)}
              className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-zinc-800 text-sm font-medium cursor-pointer"
            >
              Vazgeç
            </button>
            <button
              type="submit"
              disabled={saving}
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold cursor-pointer"
            >
              <Save className="w-4 h-4" />
              <span>{saving ? "Kaydediliyor..." : "Uygulamayı Kaydet"}</span>
            </button>
          </div>
        </div>
      </form>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-slate-500 dark:text-zinc-400">
          Toplam {apps.length} uygulama listeleniyor.
        </p>
        <button
          type="button"
          onClick={onOpenNew}
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Yeni Uygulama Ekle</span>
        </button>
      </div>

      <div className="rounded-2xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/60 divide-y divide-slate-100 dark:divide-zinc-800">
        {apps.length === 0 ? (
          <div className="p-10 text-center text-sm text-slate-500">
            Henüz uygulama eklenmemiş.
          </div>
        ) : (
          apps.map((app) => {
            const st = statusLabels[app.status] || statusLabels.live;
            return (
              <div
                key={app.id}
                className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
              >
                <div className="space-y-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-bold text-slate-900 dark:text-white">
                      {app.title}
                    </span>
                    <span
                      className={`px-2 py-0.5 rounded-full text-[11px] font-medium border ${st.colorClass}`}
                    >
                      {st.label}
                    </span>
                    {app.featured && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium bg-indigo-500/10 text-indigo-600 dark:text-indigo-400">
                        <Sparkles className="w-3 h-3" />
                        Vitrin
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-500 dark:text-zinc-400 line-clamp-1">
                    {app.tagline}
                  </p>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <Link
                    href={`/apps/${app.slug}`}
                    target="_blank"
                    className="p-2 rounded-lg border border-slate-200 dark:border-zinc-800 text-slate-500 hover:text-indigo-500"
                    title="Sayfayı Görüntüle"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </Link>
                  <button
                    type="button"
                    onClick={() => onOpenEdit(app)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-zinc-800 text-xs font-semibold hover:border-indigo-500/50 cursor-pointer"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                    <span>Düzenle</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => onDelete(app.id, app.title)}
                    className="p-2 rounded-lg border border-slate-200 dark:border-zinc-800 text-slate-500 hover:text-rose-500 hover:border-rose-500/40 cursor-pointer"
                    title="Sil"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
