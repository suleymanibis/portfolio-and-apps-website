import type { Metadata } from "next";
import { FileText } from "lucide-react";
import { getArticles } from "@/lib/db";
import { ArticlesExplorer } from "@/components/ArticlesExplorer";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Makaleler",
  description: "Yazılım geliştirme, mimari, üretkenlik ve teknoloji üzerine makaleler.",
};

export default async function ArticlesPage() {
  const articles = await getArticles(false);

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-12 space-y-8">
      <div className="space-y-2">
        <div className="inline-flex items-center gap-1.5 text-xs font-mono uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
          <FileText className="w-3.5 h-3.5" />
          <span>Teknik Blog & Notlar</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
          Makaleler
        </h1>
        <p className="text-slate-600 dark:text-zinc-400 max-w-2xl">
          Uygulama geliştirirken edindiğim deneyimleri, mimari notları ve modern geliştirici araçları üzerine yazılarımı burada paylaşıyorum.
        </p>
      </div>

      <ArticlesExplorer articles={articles} />
    </div>
  );
}
