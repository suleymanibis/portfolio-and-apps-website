import type { Metadata } from "next";
import { Layers } from "lucide-react";
import { getApps } from "@/lib/db";
import { AppsExplorer } from "@/components/AppsExplorer";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Uygulamalar",
  description: "Geliştirdiğim web, masaüstü ve açık kaynak uygulamaların tamamı.",
};

export default async function AppsPage() {
  const apps = await getApps();

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-12 space-y-8">
      <div className="space-y-2">
        <div className="inline-flex items-center gap-1.5 text-xs font-mono uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
          <Layers className="w-3.5 h-3.5" />
          <span>Portfolyo & Ürünler</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
          Uygulamalarım
        </h1>
        <p className="text-slate-600 dark:text-zinc-400 max-w-2xl">
          Geliştirdiğim ve yayına aldığım projeleri inceleyebilir, canlı demolarını test edebilir veya kaynak kodlarına göz atabilirsiniz.
        </p>
      </div>

      <AppsExplorer apps={apps} />
    </div>
  );
}
