import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Calendar, Clock } from "lucide-react";
import { getArticleBySlug, getProfile } from "@/lib/db";
import { isAuthenticated } from "@/lib/auth";
import { getDictionary, getLocale, localePath } from "@/lib/i18n";
import {
  absoluteUrl,
  buildAlternates,
  buildArticleJsonLd,
  canonicalUrlFor,
} from "@/lib/seo";
import { localizeArticle, localizeProfile } from "@/lib/translator";
import { formatDate } from "@/lib/utils";
import { MarkdownRenderer } from "@/components/MarkdownRenderer";
import { ShareButton } from "@/components/ShareButton";
import { JsonLd } from "@/components/JsonLd";

export const dynamic = "force-dynamic";

export async function generateMetadata(context: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await context.params;
  const [locale, admin, rawProfile] = await Promise.all([
    getLocale(),
    isAuthenticated(),
    getProfile(),
  ]);
  const dict = getDictionary(locale);
  const rawArticle = await getArticleBySlug(slug, admin);
  if (!rawArticle) {
    return {
      title: dict.articles.notFoundTitle,
      robots: { index: false, follow: false },
    };
  }

  const [article, profile] = await Promise.all([
    localizeArticle(rawArticle, locale),
    localizeProfile(rawProfile, locale),
  ]);

  const cleanPath = `/articles/${rawArticle.slug}`;
  const canonicalUrl = canonicalUrlFor(cleanPath, locale);
  const ogImg = absoluteUrl(article.coverImage || "/logo.jpg");

  return {
    title: article.title,
    description: article.excerpt,
    keywords: [article.category, ...article.tags].filter(Boolean),
    authors: [{ name: profile.ownerName, url: canonicalUrlFor("/about", locale) }],
    alternates: buildAlternates(cleanPath, locale),
    ...(!rawArticle.published
      ? { robots: { index: false, follow: false } }
      : {}),
    openGraph: {
      type: "article",
      title: article.title,
      description: article.excerpt,
      url: canonicalUrl,
      siteName: profile.siteName,
      locale: locale === "en" ? "en_US" : "tr_TR",
      alternateLocale: locale === "en" ? ["tr_TR"] : ["en_US"],
      publishedTime: article.createdAt,
      modifiedTime: article.updatedAt || article.createdAt,
      authors: [profile.ownerName],
      section: article.category,
      tags: article.tags,
      images: [
        {
          url: ogImg,
          alt: article.title,
        },
      ],
    },
    twitter: {
      card: article.coverImage ? "summary_large_image" : "summary",
      title: article.title,
      description: article.excerpt,
      images: [ogImg],
    },
  };
}

export default async function ArticleDetailPage(context: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await context.params;
  const [locale, admin, rawProfile] = await Promise.all([
    getLocale(),
    isAuthenticated(),
    getProfile(),
  ]);
  const rawArticle = await getArticleBySlug(slug, admin);

  if (!rawArticle) {
    notFound();
  }

  const dict = getDictionary(locale);
  const [article, profile] = await Promise.all([
    localizeArticle(rawArticle, locale),
    localizeProfile(rawProfile, locale),
  ]);

  const jsonLd = buildArticleJsonLd(article, profile, locale);

  return (
    <article className="max-w-3xl mx-auto px-4 sm:px-6 py-12 space-y-8">
      {rawArticle.published && <JsonLd data={jsonLd} />}

      <div className="flex items-center justify-between">
        <Link
          href={localePath("/articles", locale)}
          className="inline-flex items-center gap-2 text-sm font-medium text-slate-600 dark:text-zinc-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>{dict.articles.backToAll}</span>
        </Link>
        <ShareButton title={article.title} locale={locale} />
      </div>

      {/* Article Header */}
      <header className="space-y-4">
        <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 dark:text-zinc-400">
          <span className="px-3 py-1 rounded-full font-semibold bg-indigo-500/10 text-indigo-600 dark:text-indigo-400">
            {article.category}
          </span>
          {!article.published && (
            <span className="px-2.5 py-1 rounded-full font-semibold bg-amber-500/15 text-amber-600 dark:text-amber-400">
              {dict.articles.draftPreview}
            </span>
          )}
          <span className="inline-flex items-center gap-1">
            <Calendar className="w-3.5 h-3.5" />
            {formatDate(article.createdAt, locale)}
          </span>
          <span className="inline-flex items-center gap-1">
            <Clock className="w-3.5 h-3.5" />
            {article.readingTimeMinutes} {dict.articles.minRead}
          </span>
        </div>

        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight leading-tight">
          {article.title}
        </h1>

        <p className="text-lg text-slate-600 dark:text-zinc-400 leading-relaxed">
          {article.excerpt}
        </p>

        {article.tags.length > 0 && (
          <div className="flex flex-wrap gap-2 pt-1">
            {article.tags.map((tag) => (
              <span
                key={tag}
                className="px-2.5 py-0.5 rounded-md text-xs font-mono bg-slate-100 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 text-slate-600 dark:text-zinc-400"
              >
                #{tag}
              </span>
            ))}
          </div>
        )}
      </header>

      {article.coverImage && (
        <div className="rounded-2xl overflow-hidden border border-slate-200 dark:border-zinc-800">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={article.coverImage}
            alt={article.title}
            className="w-full max-h-[440px] object-cover"
          />
        </div>
      )}

      {/* Markdown Body */}
      <div className="rounded-3xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/50 p-6 sm:p-10 shadow-xs">
        <MarkdownRenderer content={article.content} locale={locale} />
      </div>

      {/* Author Box */}
      <div className="rounded-2xl border border-slate-200 dark:border-zinc-800 bg-white/80 dark:bg-zinc-900/60 p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <p className="text-xs font-mono uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
            {dict.articles.authorLabel}
          </p>
          <Link
            href={localePath("/about", locale)}
            className="font-bold text-slate-900 dark:text-white hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors mt-0.5 inline-block"
          >
            {profile.ownerName}
          </Link>
          <p className="text-sm text-slate-600 dark:text-zinc-400 mt-1">
            {profile.roleTitle}
          </p>
        </div>
        <Link
          href={localePath("/apps", locale)}
          className="inline-flex items-center justify-center px-4 py-2 rounded-xl text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white transition-colors shrink-0"
        >
          {dict.articles.authorCta}
        </Link>
      </div>
    </article>
  );
}
