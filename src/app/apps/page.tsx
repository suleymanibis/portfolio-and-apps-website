import type { Metadata } from "next";
import { Layers } from "lucide-react";
import { getApps } from "@/lib/db";
import { getDictionary, getLocale } from "@/lib/i18n";
import { localizeApps } from "@/lib/translator";
import { AppsExplorer } from "@/components/AppsExplorer";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getLocale();
  const dict = getDictionary(locale);
  return {
    title: dict.apps.metaTitle,
    description: dict.apps.metaDesc,
  };
}

export default async function AppsPage() {
  const [locale, rawApps] = await Promise.all([getLocale(), getApps()]);
  const dict = getDictionary(locale);
  const apps = await localizeApps(rawApps, locale);

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-12 space-y-8">
      <div className="space-y-2">
        <div className="inline-flex items-center gap-1.5 text-xs font-mono uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
          <Layers className="w-3.5 h-3.5" />
          <span>{dict.apps.badge}</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
          {dict.apps.title}
        </h1>
        <p className="text-slate-600 dark:text-zinc-400 max-w-2xl">
          {dict.apps.subtitle}
        </p>
      </div>

      <AppsExplorer apps={apps} locale={locale} />
    </div>
  );
}
