"use client";

import type { Dispatch, FormEvent, SetStateAction } from "react";
import Link from "next/link";
import {
  ExternalLink,
  Eye,
  ImagePlus,
  Plus,
  Save,
  Trash2,
  User,
} from "lucide-react";
import type { AboutPageData } from "@/types";
import { MarkdownRenderer } from "../MarkdownRenderer";
import type { SkillGroupInput } from "./types";

interface AdminAboutTabProps {
  about: AboutPageData;
  setAbout: Dispatch<SetStateAction<AboutPageData>>;
  skillGroupInputs: SkillGroupInput[];
  setSkillGroupInputs: Dispatch<SetStateAction<SkillGroupInput[]>>;
  aboutPreview: boolean;
  setAboutPreview: Dispatch<SetStateAction<boolean>>;
  saving: boolean;
  uploading: boolean;
  onSubmit: (e: FormEvent) => void;
  onUploadImage: (file: File) => Promise<string | null>;
}

export function AdminAboutTab({
  about,
  setAbout,
  skillGroupInputs,
  setSkillGroupInputs,
  aboutPreview,
  setAboutPreview,
  saving,
  uploading,
  onSubmit,
  onUploadImage,
}: AdminAboutTabProps) {
  return (
    <form
      onSubmit={onSubmit}
      className="rounded-3xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/80 p-6 sm:p-8 space-y-8"
    >
      <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-zinc-800">
        <div className="space-y-1">
          <div className="flex items-center gap-2.5">
            <User className="w-5 h-5 text-indigo-500" />
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">
              Hakkımda Sayfası Yönetimi (/about)
            </h2>
          </div>
          <p className="text-xs text-slate-500 dark:text-zinc-400">
            Burada Türkçe yazdığınız tüm başlık, hikaye, eğitim ve yetenek alanları kaydedildiğinde İngilizce (EN) sürüme otomatik çevrilir.
          </p>
        </div>

        <Link
          href="/about"
          target="_blank"
          className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold border border-slate-200 dark:border-zinc-800 text-indigo-600 dark:text-indigo-400 hover:border-indigo-500/50 transition-colors"
        >
          <ExternalLink className="w-3.5 h-3.5" />
          <span>Hakkımda Sayfasını Aç</span>
        </Link>
      </div>

      {/* Photo & CV Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <label className="block text-xs font-semibold">
            Profil Fotoğrafı (İsteğe Bağlı — Sonradan Ekleyebilirsiniz)
          </label>
          <div className="flex items-center gap-3">
            {about.photoUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={about.photoUrl}
                alt="Profil önizleme"
                className="w-14 h-14 rounded-2xl object-cover border border-indigo-500/30 shrink-0"
              />
            ) : (
              <div className="w-14 h-14 rounded-2xl border border-dashed border-slate-300 dark:border-zinc-700 flex items-center justify-center text-xs font-mono text-slate-400 shrink-0">
                Yok
              </div>
            )}
            <div className="flex-1 space-y-2">
              <input
                type="text"
                value={about.photoUrl || ""}
                onChange={(e) =>
                  setAbout({ ...about, photoUrl: e.target.value })
                }
                placeholder="/uploads/... veya https://..."
                className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-950 text-xs"
              />
              <div className="flex items-center gap-2">
                <label className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-500/20 transition-colors cursor-pointer">
                  <ImagePlus className="w-3.5 h-3.5" />
                  <span>
                    {uploading ? "Yükleniyor..." : "Bilgisayardan Yükle"}
                  </span>
                  <input
                    type="file"
                    accept="image/png,image/jpeg,image/webp,image/gif"
                    className="hidden"
                    disabled={uploading}
                    onChange={async (e) => {
                      const file = e.target.files?.[0];
                      if (!file) return;
                      const url = await onUploadImage(file);
                      if (url) {
                        setAbout((prev) => ({ ...prev, photoUrl: url }));
                      }
                      e.target.value = "";
                    }}
                  />
                </label>
                {about.photoUrl && (
                  <button
                    type="button"
                    onClick={() => setAbout({ ...about, photoUrl: "" })}
                    className="text-xs text-rose-500 hover:underline cursor-pointer"
                  >
                    Fotoğrafı Kaldır
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <label className="block text-xs font-semibold">
            CV Bağlantısı (PDF / Google Drive Linki — İsteğe Bağlı)
          </label>
          <input
            type="url"
            value={about.cvUrl || ""}
            onChange={(e) => setAbout({ ...about, cvUrl: e.target.value })}
            placeholder="https://drive.google.com/... (Boşsa buton gizlenir)"
            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-950 text-sm"
          />
          <p className="text-[11px] text-slate-500 dark:text-zinc-500">
            Şu an boş bırakabilirsiniz. İleride CV linkinizi yapıştırıp kaydettiğiniz an sayfada otomatik olarak &ldquo;CV Görüntüle / İndir&rdquo; butonu görünür.
          </p>
        </div>
      </div>

      {/* Headline, Subheadline, Current Focus */}
      <div className="grid grid-cols-1 gap-5">
        <div>
          <label className="block text-xs font-semibold mb-1.5">
            Sayfa Ana Başlığı
          </label>
          <input
            type="text"
            required
            value={about.headline}
            onChange={(e) => setAbout({ ...about, headline: e.target.value })}
            placeholder="Merhaba, ben Süleyman İbiş."
            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-950 text-sm"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold mb-1.5">
            Kısa Giriş Özeti (Üst Kart Açıklaması)
          </label>
          <textarea
            rows={2}
            value={about.subheadline}
            onChange={(e) =>
              setAbout({ ...about, subheadline: e.target.value })
            }
            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-950 text-sm"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold mb-1.5">
            Şu Sıralar Neye Odaklanıyorum? (Vurgu Kutusu)
          </label>
          <textarea
            rows={2}
            value={about.currentFocus}
            onChange={(e) =>
              setAbout({ ...about, currentFocus: e.target.value })
            }
            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-950 text-sm"
          />
        </div>
      </div>

      {/* Story Markdown */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <label className="block text-xs font-semibold">
            Hikayem & Mühendislik Yaklaşımım (Markdown Destekli)
          </label>
          <button
            type="button"
            onClick={() => setAboutPreview(!aboutPreview)}
            className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-medium border border-slate-200 dark:border-zinc-800 text-slate-600 dark:text-zinc-300 cursor-pointer"
          >
            <Eye className="w-3.5 h-3.5" />
            <span>{aboutPreview ? "Düzenlemeye Dön" : "Önizleme"}</span>
          </button>
        </div>

        {aboutPreview ? (
          <div className="rounded-2xl border border-slate-200 dark:border-zinc-800 bg-slate-50/50 dark:bg-zinc-950 p-6">
            <MarkdownRenderer content={about.storyMarkdown} />
          </div>
        ) : (
          <textarea
            rows={11}
            value={about.storyMarkdown}
            onChange={(e) =>
              setAbout({ ...about, storyMarkdown: e.target.value })
            }
            className="w-full px-4 py-3 rounded-2xl border border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-950 text-sm font-mono leading-relaxed"
          />
        )}
      </div>

      {/* Education Items */}
      <div className="space-y-4 pt-2 border-t border-slate-200 dark:border-zinc-800">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white">
            Eğitim & Akademik Süreç Kartları
          </h3>
          <button
            type="button"
            onClick={() =>
              setAbout({
                ...about,
                education: [
                  ...about.education,
                  {
                    period: "",
                    institution: "",
                    title: "",
                    description: "",
                  },
                ],
              })
            }
            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-500/20 cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Eğitim Ekle</span>
          </button>
        </div>

        <div className="space-y-4">
          {about.education.map((edu, idx) => (
            <div
              key={idx}
              className="rounded-2xl border border-slate-200 dark:border-zinc-800 bg-slate-50/60 dark:bg-zinc-950/60 p-4 space-y-3"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono text-slate-500">
                  #{idx + 1} Eğitim Kartı
                </span>
                <button
                  type="button"
                  onClick={() =>
                    setAbout({
                      ...about,
                      education: about.education.filter((_, i) => i !== idx),
                    })
                  }
                  className="inline-flex items-center gap-1 text-xs text-rose-500 hover:underline cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Kaldır</span>
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <input
                  type="text"
                  value={edu.period}
                  onChange={(e) => {
                    const next = [...about.education];
                    next[idx] = { ...next[idx], period: e.target.value };
                    setAbout({ ...about, education: next });
                  }}
                  placeholder="Dönem (ör. 2026 — Günümüz)"
                  className="px-3 py-2 rounded-xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-xs"
                />
                <input
                  type="text"
                  value={edu.institution}
                  onChange={(e) => {
                    const next = [...about.education];
                    next[idx] = {
                      ...next[idx],
                      institution: e.target.value,
                    };
                    setAbout({ ...about, education: next });
                  }}
                  placeholder="Kurum / Üniversite"
                  className="px-3 py-2 rounded-xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-xs"
                />
                <input
                  type="text"
                  value={edu.title}
                  onChange={(e) => {
                    const next = [...about.education];
                    next[idx] = { ...next[idx], title: e.target.value };
                    setAbout({ ...about, education: next });
                  }}
                  placeholder="Bölüm / Başlık"
                  className="px-3 py-2 rounded-xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-xs"
                />
              </div>
              <input
                type="text"
                value={edu.description}
                onChange={(e) => {
                  const next = [...about.education];
                  next[idx] = { ...next[idx], description: e.target.value };
                  setAbout({ ...about, education: next });
                }}
                placeholder="Kısa açıklama"
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-xs"
              />
            </div>
          ))}
        </div>
      </div>

      {/* Skill Groups */}
      <div className="space-y-4 pt-2 border-t border-slate-200 dark:border-zinc-800">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white">
            Teknoloji & Geliştirme Ortamı (IDE) Grupları
          </h3>
          <button
            type="button"
            onClick={() =>
              setSkillGroupInputs([
                ...skillGroupInputs,
                { category: "", itemsText: "" },
              ])
            }
            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-500/20 cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Grup Ekle</span>
          </button>
        </div>

        <div className="space-y-3">
          {skillGroupInputs.map((grp, idx) => (
            <div
              key={idx}
              className="rounded-2xl border border-slate-200 dark:border-zinc-800 bg-slate-50/60 dark:bg-zinc-950/60 p-4 space-y-3"
            >
              <div className="flex items-center justify-between gap-3">
                <input
                  type="text"
                  value={grp.category}
                  onChange={(e) => {
                    const next = [...skillGroupInputs];
                    next[idx] = { ...next[idx], category: e.target.value };
                    setSkillGroupInputs(next);
                  }}
                  placeholder="Grup Başlığı (ör. IDE & Geliştirme Ortamları)"
                  className="flex-1 px-3 py-2 rounded-xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-xs font-semibold"
                />
                <button
                  type="button"
                  onClick={() =>
                    setSkillGroupInputs(
                      skillGroupInputs.filter((_, i) => i !== idx)
                    )
                  }
                  className="inline-flex items-center gap-1 text-xs text-rose-500 hover:underline cursor-pointer shrink-0"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Sil</span>
                </button>
              </div>
              <input
                type="text"
                value={grp.itemsText}
                onChange={(e) => {
                  const next = [...skillGroupInputs];
                  next[idx] = { ...next[idx], itemsText: e.target.value };
                  setSkillGroupInputs(next);
                }}
                placeholder="Virgülle ayırarak yazın: IntelliJ IDEA, VS Code, Visual Studio..."
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-xs font-mono"
              />
            </div>
          ))}
        </div>
      </div>

      <div className="flex justify-end pt-4 border-t border-slate-200 dark:border-zinc-800">
        <button
          type="submit"
          disabled={saving}
          className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold cursor-pointer"
        >
          <Save className="w-4 h-4" />
          <span>
            {saving
              ? "Çevriliyor & Kaydediliyor..."
              : "Hakkımda Sayfasını Kaydet"}
          </span>
        </button>
      </div>
    </form>
  );
}
