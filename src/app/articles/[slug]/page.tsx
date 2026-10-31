import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Calendar, Clock } from "lucide-react";
import { getArticleBySlug, getProfile } from "@/lib/db";
import { isAuthenticated } from "@/lib/auth";
import { formatDateTR } from "@/lib/utils";
import { MarkdownRenderer } from "@/components/MarkdownRenderer";
import { ShareButton } from "@/components/ShareButton";

export const dynamic = "force-dynamic";

export async function generateMetadata(context: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await context.params;
  const admin = await isAuthenticated();
  const article = await getArticleBySlug(slug, admin);
  if (!article) return { title: "Makale Bulunamadı" };
  return {
    title: article.title,
    description: article.excerpt,
  };
}

export default async function ArticleDetailPage(context: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await context.params;
  const [admin, profile] = await Promise.all([isAuthenticated(), getProfile()]);
  const article = await getArticleBySlug(slug, admin);

  if (!article) {
    notFound();
  }

  return (
    <article className="max-w-3xl mx-auto px-4 sm:px-6 py-12 space-y-8">
      <div className="flex items-center justify-between">
        <Link
          href="/articles"
          className="inline-flex items-center gap-2 text-sm font-medium text-slate-600 dark:text-zinc-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Tüm Makaleler</span>
        </Link>
        <ShareButton title={article.title} />
      </div>

      {/* Article Header */}
      <header className="space-y-4">
        <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 dark:text-zinc-400">
          <span className="px-3 py-1 rounded-full font-semibold bg-indigo-500/10 text-indigo-600 dark:text-indigo-400">
            {article.category}
          </span>
          {!article.published && (
            <span className="px-2.5 py-1 rounded-full font-semibold bg-amber-500/15 text-amber-600 dark:text-amber-400">
              Taslak Önizleme
            </span>
          )}
          <span className="inline-flex items-center gap-1">
            <Calendar className="w-3.5 h-3.5" />
            {formatDateTR(article.createdAt)}
          </span>
          <span className="inline-flex items-center gap-1">
            <Clock className="w-3.5 h-3.5" />
            {article.readingTimeMinutes} dk okuma
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
        <MarkdownRenderer content={article.content} />
      </div>

      {/* Author Box */}
      <div className="rounded-2xl border border-slate-200 dark:border-zinc-800 bg-white/80 dark:bg-zinc-900/60 p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <p className="text-xs font-mono uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
            Yazar
          </p>
          <p className="font-bold text-slate-900 dark:text-white mt-0.5">
            {profile.ownerName}
          </p>
          <p className="text-sm text-slate-600 dark:text-zinc-400 mt-1">
            {profile.roleTitle}
          </p>
        </div>
        <Link
          href="/apps"
          className="inline-flex items-center justify-center px-4 py-2 rounded-xl text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white transition-colors shrink-0"
        >
          Geliştirdiğim Uygulamaları Gör
        </Link>
      </div>
    </article>
  );
}
