"use client";

import type { Dispatch, FormEvent, SetStateAction } from "react";
import Link from "next/link";
import {
  Code,
  Edit3,
  ExternalLink,
  ImagePlus,
  Plus,
  Quote,
  Save,
  Trash2,
  X,
} from "lucide-react";
import type { ArticleItem } from "@/types";
import { formatDateTR, slugify } from "@/lib/utils";
import { MarkdownRenderer } from "../MarkdownRenderer";
import type { ArticleFormState } from "./types";

interface AdminArticlesTabProps {
  articles: ArticleItem[];
  publishedCount: number;
  draftCount: number;
  editingArticle: boolean;
  setEditingArticle: Dispatch<SetStateAction<boolean>>;
  articleForm: ArticleFormState;
  setArticleForm: Dispatch<SetStateAction<ArticleFormState>>;
  editorMode: "write" | "split" | "preview";
  setEditorMode: Dispatch<SetStateAction<"write" | "split" | "preview">>;
  saving: boolean;
  uploading: boolean;
  onOpenNew: () => void;
  onOpenEdit: (article: ArticleItem) => void;
  onSave: (e: FormEvent) => void;
  onDelete: (id: string, title: string) => void;
  onUploadImage: (file: File) => Promise<string | null>;
}

export function AdminArticlesTab({
  articles,
  publishedCount,
  draftCount,
  editingArticle,
  setEditingArticle,
  articleForm,
  setArticleForm,
  editorMode,
  setEditorMode,
  saving,
  uploading,
  onOpenNew,
  onOpenEdit,
  onSave,
  onDelete,
  onUploadImage,
}: AdminArticlesTabProps) {
  const insertMarkdownSnippet = (snippet: string) => {
    setArticleForm((prev) => ({
      ...prev,
      content: prev.content ? `${prev.content}\n${snippet}` : snippet,
    }));
  };

  if (editingArticle) {
    return (
      <form
        onSubmit={onSave}
        className="rounded-3xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/80 p-6 sm:p-8 space-y-6"
      >
        <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-zinc-800">
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">
            {articleForm.id ? "Makaleyi Düzenle" : "Yeni Makale Yaz"}
          </h2>
          <button
            type="button"
            onClick={() => setEditingArticle(false)}
            className="inline-flex items-center gap-1 text-xs font-medium text-slate-500 hover:text-slate-900 dark:hover:text-white cursor-pointer"
          >
            <X className="w-4 h-4" />
            <span>İptal</span>
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div>
            <label className="block text-xs font-semibold mb-1.5">
              Makale Başlığı *
            </label>
            <input
              type="text"
              required
              value={articleForm.title}
              onChange={(e) =>
                setArticleForm({
                  ...articleForm,
                  title: e.target.value,
                  slug: articleForm.id
                    ? articleForm.slug
                    : slugify(e.target.value),
                })
              }
              placeholder="Örn: Modern Web Mimarisi Üzerine Notlar"
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-950 text-sm"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold mb-1.5">
              URL Uzantısı (Slug)
            </label>
            <input
              type="text"
              value={articleForm.slug}
              onChange={(e) =>
                setArticleForm({
                  ...articleForm,
                  slug: slugify(e.target.value),
                })
              }
              placeholder="modern-web-mimarisi-uzerine-notlar"
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-950 text-sm font-mono"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold mb-1.5">
              Kategori
            </label>
            <input
              type="text"
              value={articleForm.category}
              onChange={(e) =>
                setArticleForm({
                  ...articleForm,
                  category: e.target.value,
                })
              }
              placeholder="Örn: Yazılım Geliştirme, Yapay Zeka, Deneyim"
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-950 text-sm"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold mb-1.5">
              Etiketler (Virgülle ayırın)
            </label>
            <input
              type="text"
              value={articleForm.tagsInput}
              onChange={(e) =>
                setArticleForm({
                  ...articleForm,
                  tagsInput: e.target.value,
                })
              }
              placeholder="Next.js, Mimari, Performans"
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-950 text-sm"
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-xs font-semibold mb-1.5">
              Kısa Özet (Liste görünümünde ve SEO açıklamasında yer alır)
            </label>
            <textarea
              rows={2}
              value={articleForm.excerpt}
              onChange={(e) =>
                setArticleForm({
                  ...articleForm,
                  excerpt: e.target.value,
                })
              }
              placeholder="Makalenin ana fikrini anlatan 1-2 cümlelik giriş..."
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-950 text-sm"
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-xs font-semibold mb-1.5">
              Kapak Görseli (Opsiyonel)
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={articleForm.coverImage}
                onChange={(e) =>
                  setArticleForm({
                    ...articleForm,
                    coverImage: e.target.value,
                  })
                }
                placeholder="/uploads/... veya https://..."
                className="flex-1 px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-950 text-sm"
              />
              <label className="inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-zinc-700 bg-slate-100 dark:bg-zinc-800 text-xs font-semibold cursor-pointer hover:border-indigo-500 shrink-0">
                <ImagePlus className="w-4 h-4" />
                <span>{uploading ? "..." : "Kapak Yükle"}</span>
                <input
                  type="file"
                  accept="image/png,image/jpeg,image/webp,image/gif"
                  className="hidden"
                  onChange={async (e) => {
                    const file = e.target.files?.[0];
                    if (!file) return;
                    const url = await onUploadImage(file);
                    if (url) {
                      setArticleForm((prev) => ({
                        ...prev,
                        coverImage: url,
                      }));
                    }
                  }}
                />
              </label>
            </div>
          </div>
        </div>

        <div className="space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-2 bg-slate-100 dark:bg-zinc-950 p-2 rounded-xl border border-slate-200 dark:border-zinc-800">
            <div className="flex flex-wrap items-center gap-1">
              <button
                type="button"
                onClick={() => insertMarkdownSnippet("## Alt Başlık\n")}
                className="px-2.5 py-1 rounded-lg text-xs font-semibold hover:bg-white dark:hover:bg-zinc-800 cursor-pointer"
              >
                H2
              </button>
              <button
                type="button"
                onClick={() => insertMarkdownSnippet("**kalın metin**")}
                className="px-2.5 py-1 rounded-lg text-xs font-bold hover:bg-white dark:hover:bg-zinc-800 cursor-pointer"
              >
                B
              </button>
              <button
                type="button"
                onClick={() =>
                  insertMarkdownSnippet(
                    "```typescript\n// Kodunuzu buraya yazın\n```"
                  )
                }
                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium hover:bg-white dark:hover:bg-zinc-800 cursor-pointer"
              >
                <Code className="w-3.5 h-3.5" />
                <span>Kod</span>
              </button>
              <button
                type="button"
                onClick={() =>
                  insertMarkdownSnippet("> Önemli bir not veya alıntı")
                }
                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium hover:bg-white dark:hover:bg-zinc-800 cursor-pointer"
              >
                <Quote className="w-3.5 h-3.5" />
                <span>Alıntı</span>
              </button>
              <label className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium hover:bg-white dark:hover:bg-zinc-800 cursor-pointer">
                <ImagePlus className="w-3.5 h-3.5" />
                <span>İçeriğe Görsel Ekle</span>
                <input
                  type="file"
                  accept="image/png,image/jpeg,image/webp,image/gif"
                  className="hidden"
                  onChange={async (e) => {
                    const file = e.target.files?.[0];
                    if (!file) return;
                    const url = await onUploadImage(file);
                    if (url) {
                      insertMarkdownSnippet(`![Görsel Açıklaması](${url})`);
                    }
                  }}
                />
              </label>
            </div>

            <div className="flex items-center gap-1 bg-white dark:bg-zinc-900 p-1 rounded-lg border border-slate-200 dark:border-zinc-800 text-xs">
              {(
                [
                  { id: "write", label: "Yaz" },
                  { id: "split", label: "Yan Yana" },
                  { id: "preview", label: "Önizleme" },
                ] as const
              ).map((m) => (
                <button
                  key={m.id}
                  type="button"
                  onClick={() => setEditorMode(m.id)}
                  className={`px-2.5 py-1 rounded-md font-medium cursor-pointer ${
                    editorMode === m.id
                      ? "bg-indigo-600 text-white"
                      : "text-slate-600 dark:text-zinc-400"
                  }`}
                >
                  {m.label}
                </button>
              ))}
            </div>
          </div>

          <div
            className={`grid gap-4 ${
              editorMode === "split"
                ? "grid-cols-1 lg:grid-cols-2"
                : "grid-cols-1"
            }`}
          >
            {(editorMode === "write" || editorMode === "split") && (
              <textarea
                required
                rows={16}
                value={articleForm.content}
                onChange={(e) =>
                  setArticleForm({
                    ...articleForm,
                    content: e.target.value,
                  })
                }
                placeholder="Makalenizi Markdown formatında buraya yazın..."
                className="w-full p-4 rounded-2xl border border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-950 text-sm font-mono leading-relaxed focus:outline-none focus:border-indigo-500"
              />
            )}

            {(editorMode === "preview" || editorMode === "split") && (
              <div className="p-5 rounded-2xl border border-slate-200 dark:border-zinc-800 bg-slate-50/60 dark:bg-zinc-950/60 max-h-[460px] overflow-y-auto">
                <MarkdownRenderer
                  content={
                    articleForm.content ||
                    "*Canlı önizleme burada görünecek...*"
                  }
                />
              </div>
            )}
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-4 pt-4 border-t border-slate-200 dark:border-zinc-800">
          <div className="flex flex-wrap items-center gap-6">
            <label className="inline-flex items-center gap-2 text-sm font-medium cursor-pointer">
              <input
                type="checkbox"
                checked={articleForm.published}
                onChange={(e) =>
                  setArticleForm({
                    ...articleForm,
                    published: e.target.checked,
                  })
                }
                className="w-4 h-4 rounded accent-indigo-600"
              />
              <span>Hemen yayınla (işaret kaldırılırsa Taslak kalır)</span>
            </label>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setEditingArticle(false)}
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
              <span>
                {saving
                  ? "Kaydediliyor..."
                  : articleForm.published
                  ? "Makaleyi Yayınla"
                  : "Taslağı Kaydet"}
              </span>
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
          Toplam {articles.length} makale ({publishedCount} yayında,{" "}
          {draftCount} taslak).
        </p>
        <button
          type="button"
          onClick={onOpenNew}
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Yeni Makale Yaz</span>
        </button>
      </div>

      <div className="rounded-2xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/60 divide-y divide-slate-100 dark:divide-zinc-800">
        {articles.length === 0 ? (
          <div className="p-10 text-center text-sm text-slate-500">
            Henüz makale bulunmuyor.
          </div>
        ) : (
          articles.map((art) => (
            <div
              key={art.id}
              className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
            >
              <div className="space-y-1 min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-bold text-slate-900 dark:text-white">
                    {art.title}
                  </span>
                  <span
                    className={`px-2 py-0.5 rounded-full text-[11px] font-semibold ${
                      art.published
                        ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400"
                        : "bg-amber-500/15 text-amber-600 dark:text-amber-400"
                    }`}
                  >
                    {art.published ? "Yayında" : "Taslak"}
                  </span>
                </div>
                <p className="text-xs text-slate-500 dark:text-zinc-400">
                  {art.category} • {art.readingTimeMinutes} dk okuma •{" "}
                  {formatDateTR(art.createdAt)}
                </p>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <Link
                  href={`/articles/${art.slug}`}
                  target="_blank"
                  className="p-2 rounded-lg border border-slate-200 dark:border-zinc-800 text-slate-500 hover:text-indigo-500"
                  title="Yazıyı Görüntüle"
                >
                  <ExternalLink className="w-4 h-4" />
                </Link>
                <button
                  type="button"
                  onClick={() => onOpenEdit(art)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-zinc-800 text-xs font-semibold hover:border-indigo-500/50 cursor-pointer"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                  <span>Düzenle</span>
                </button>
                <button
                  type="button"
                  onClick={() => onDelete(art.id, art.title)}
                  className="p-2 rounded-lg border border-slate-200 dark:border-zinc-800 text-slate-500 hover:text-rose-500 hover:border-rose-500/40 cursor-pointer"
                  title="Sil"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
