"use client";

import { Edit3, FileText, Layers } from "lucide-react";
import type { AppItem, ArticleItem } from "@/types";
import { formatDateTR } from "@/lib/utils";

interface AdminOverviewTabProps {
  apps: AppItem[];
  articles: ArticleItem[];
  publishedCount: number;
  draftCount: number;
  onNewApp: () => void;
  onEditApp: (app: AppItem) => void;
  onNewArticle: () => void;
  onEditArticle: (article: ArticleItem) => void;
}

export function AdminOverviewTab({
  apps,
  articles,
  publishedCount,
  draftCount,
  onNewApp,
  onEditApp,
  onNewArticle,
  onEditArticle,
}: AdminOverviewTabProps) {
  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <div className="rounded-2xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/70 p-6">
          <div className="flex items-center justify-between text-indigo-600 dark:text-indigo-400 mb-3">
            <Layers className="w-5 h-5" />
            <span className="text-xs font-mono">PORTFOLYO</span>
          </div>
          <p className="text-3xl font-extrabold text-slate-900 dark:text-white">
            {apps.length}
          </p>
          <p className="text-sm text-slate-500 dark:text-zinc-400 mt-1">
            Paylaşılan Uygulama
          </p>
        </div>

        <div className="rounded-2xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/70 p-6">
          <div className="flex items-center justify-between text-emerald-600 dark:text-emerald-400 mb-3">
            <FileText className="w-5 h-5" />
            <span className="text-xs font-mono">YAYINDA</span>
          </div>
          <p className="text-3xl font-extrabold text-slate-900 dark:text-white">
            {publishedCount}
          </p>
          <p className="text-sm text-slate-500 dark:text-zinc-400 mt-1">
            Yayınlanmış Makale
          </p>
        </div>

        <div className="rounded-2xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/70 p-6">
          <div className="flex items-center justify-between text-amber-600 dark:text-amber-400 mb-3">
            <Edit3 className="w-5 h-5" />
            <span className="text-xs font-mono">TASLAK</span>
          </div>
          <p className="text-3xl font-extrabold text-slate-900 dark:text-white">
            {draftCount}
          </p>
          <p className="text-sm text-slate-500 dark:text-zinc-400 mt-1">
            Taslak Yazı
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="rounded-2xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/60 p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-bold text-slate-900 dark:text-white">
              Son Eklenen Uygulamalar
            </h2>
            <button
              type="button"
              onClick={onNewApp}
              className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline cursor-pointer"
            >
              + Uygulama Ekle
            </button>
          </div>
          <div className="divide-y divide-slate-100 dark:divide-zinc-800">
            {apps.slice(0, 4).map((app) => (
              <div
                key={app.id}
                className="py-3 flex items-center justify-between gap-3"
              >
                <div className="min-w-0">
                  <p className="font-semibold text-sm text-slate-900 dark:text-zinc-100 truncate">
                    {app.title}
                  </p>
                  <p className="text-xs text-slate-500 dark:text-zinc-400 truncate">
                    {app.category} • {formatDateTR(app.createdAt)}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => onEditApp(app)}
                  className="px-2.5 py-1 rounded-lg text-xs font-medium border border-slate-200 dark:border-zinc-800 hover:border-indigo-500/50 cursor-pointer shrink-0"
                >
                  Düzenle
                </button>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/60 p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-bold text-slate-900 dark:text-white">
              Son Makaleler
            </h2>
            <button
              type="button"
              onClick={onNewArticle}
              className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline cursor-pointer"
            >
              + Makale Yaz
            </button>
          </div>
          <div className="divide-y divide-slate-100 dark:divide-zinc-800">
            {articles.slice(0, 4).map((art) => (
              <div
                key={art.id}
                className="py-3 flex items-center justify-between gap-3"
              >
                <div className="min-w-0">
                  <p className="font-semibold text-sm text-slate-900 dark:text-zinc-100 truncate">
                    {art.title}
                  </p>
                  <p className="text-xs text-slate-500 dark:text-zinc-400">
                    {art.published ? "Yayında" : "Taslak"} •{" "}
                    {formatDateTR(art.createdAt)}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => onEditArticle(art)}
                  className="px-2.5 py-1 rounded-lg text-xs font-medium border border-slate-200 dark:border-zinc-800 hover:border-indigo-500/50 cursor-pointer shrink-0"
                >
                  Düzenle
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
