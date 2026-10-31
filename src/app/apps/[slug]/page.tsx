import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowLeft,
  Calendar,
  Download,
  ExternalLink,
  Github,
  Tag,
} from "lucide-react";
import { getAppBySlug } from "@/lib/db";
import { formatDateTR, statusLabels } from "@/lib/utils";
import { MarkdownRenderer } from "@/components/MarkdownRenderer";

export const dynamic = "force-dynamic";

export async function generateMetadata(context: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await context.params;
  const app = await getAppBySlug(slug);
  if (!app) return { title: "Uygulama Bulunamadı" };
  return {
    title: app.title,
    description: app.tagline,
  };
}

export default async function AppDetailPage(context: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await context.params;
  const app = await getAppBySlug(slug);

  if (!app) {
    notFound();
  }

  const statusInfo = statusLabels[app.status] || statusLabels.live;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12 space-y-8">
      <Link
        href="/apps"
        className="inline-flex items-center gap-2 text-sm font-medium text-slate-600 dark:text-zinc-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Tüm Uygulamalara Dön</span>
      </Link>

      {/* Header Card */}
      <div className="rounded-3xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/70 p-6 sm:p-8 space-y-6 shadow-xs">
        <div className="flex flex-wrap items-center gap-2.5">
          <span
            className={`px-3 py-1 rounded-full text-xs font-semibold border ${statusInfo.colorClass}`}
          >
            {statusInfo.label}
          </span>
          <span className="px-3 py-1 rounded-full text-xs font-medium bg-slate-100 dark:bg-zinc-800 text-slate-700 dark:text-zinc-300">
            {app.category}
          </span>
          {app.version && (
            <span className="px-2.5 py-1 rounded-full text-xs font-mono bg-indigo-500/10 text-indigo-600 dark:text-indigo-400">
              {app.version}
            </span>
          )}
          <span className="inline-flex items-center gap-1 text-xs text-slate-500 dark:text-zinc-400 ml-auto">
            <Calendar className="w-3.5 h-3.5" />
            {formatDateTR(app.createdAt)}
          </span>
        </div>

        <div className="space-y-3">
          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            {app.title}
          </h1>
          <p className="text-lg text-slate-600 dark:text-zinc-300 leading-relaxed">
            {app.tagline}
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap gap-3 pt-2">
          {app.demoUrl && (
            <a
              href={app.demoUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-sm bg-indigo-600 hover:bg-indigo-500 text-white shadow-sm transition-colors"
            >
              <ExternalLink className="w-4 h-4" />
              <span>Canlı Uygulamayı Aç</span>
            </a>
          )}
          {app.downloadUrl && (
            <a
              href={app.downloadUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-sm bg-emerald-600 hover:bg-emerald-500 text-white shadow-sm transition-colors"
            >
              <Download className="w-4 h-4" />
              <span>İndir</span>
            </a>
          )}
          {app.repoUrl && (
            <a
              href={app.repoUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-sm border border-slate-200 dark:border-zinc-700 bg-slate-50 dark:bg-zinc-900 hover:border-indigo-500/50 text-slate-800 dark:text-zinc-200 transition-colors"
            >
              <Github className="w-4 h-4" />
              <span>Kaynak Kod (GitHub)</span>
            </a>
          )}
        </div>

        {/* Cover Image */}
        {app.coverImage && (
          <div className="rounded-2xl overflow-hidden border border-slate-200 dark:border-zinc-800 mt-4">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={app.coverImage}
              alt={app.title}
              className="w-full max-h-[460px] object-cover"
            />
          </div>
        )}

        {/* Tech Stack */}
        {app.techStack.length > 0 && (
          <div className="pt-4 border-t border-slate-100 dark:border-zinc-800 flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1 text-xs font-semibold text-slate-500 dark:text-zinc-400 mr-1">
              <Tag className="w-3.5 h-3.5" />
              Teknolojiler:
            </span>
            {app.techStack.map((tech) => (
              <span
                key={tech}
                className="px-2.5 py-1 rounded-lg text-xs font-mono bg-slate-100 dark:bg-zinc-800 text-slate-700 dark:text-zinc-200"
              >
                {tech}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Markdown Description */}
      {app.description && (
        <div className="rounded-3xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/50 p-6 sm:p-10 shadow-xs">
          <MarkdownRenderer content={app.description} />
        </div>
      )}
    </div>
  );
}
