import type { Metadata } from "next";
import { FileText } from "lucide-react";
import { getArticles } from "@/lib/db";
import { getDictionary, getLocale } from "@/lib/i18n";
import { buildAlternates, canonicalUrlFor } from "@/lib/seo";
import { localizeArticles } from "@/lib/translator";
import { ArticlesExplorer } from "@/components/ArticlesExplorer";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getLocale();
  const dict = getDictionary(locale);
  return {
    title: dict.articles.metaTitle,
    description: dict.articles.metaDesc,
    alternates: buildAlternates("/articles", locale),
    openGraph: {
      title: dict.articles.metaTitle,
      description: dict.articles.metaDesc,
      url: canonicalUrlFor("/articles", locale),
      locale: locale === "en" ? "en_US" : "tr_TR",
      alternateLocale: locale === "en" ? ["tr_TR"] : ["en_US"],
      type: "website",
    },
  };
}

export default async function ArticlesPage() {
  const [locale, rawArticles] = await Promise.all([
    getLocale(),
    getArticles(false),
  ]);
  const dict = getDictionary(locale);
  const articles = await localizeArticles(rawArticles, locale);

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-12 space-y-8">
      <div className="space-y-2">
        <div className="inline-flex items-center gap-1.5 text-xs font-mono uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
          <FileText className="w-3.5 h-3.5" />
          <span>{dict.articles.badge}</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
          {dict.articles.title}
        </h1>
        <p className="text-slate-600 dark:text-zinc-400 max-w-2xl">
          {dict.articles.subtitle}
        </p>
      </div>

      <ArticlesExplorer articles={articles} locale={locale} />
    </div>
  );
}
