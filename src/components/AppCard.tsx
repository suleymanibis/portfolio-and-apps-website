import Link from "next/link";
import { ArrowUpRight, ExternalLink, Github, Layers } from "lucide-react";
import type { AppItem, Locale } from "@/types";
import { getStatusInfo } from "@/lib/utils";
import { dictionaries } from "@/lib/i18n";

export function AppCard({
  app,
  locale = "tr",
}: {
  app: AppItem;
  locale?: Locale;
}) {
  const statusInfo = getStatusInfo(app.status, locale);
  const t = dictionaries[locale]?.apps ?? dictionaries.tr.apps;

  return (
    <div className="group relative flex flex-col rounded-2xl border border-slate-200 dark:border-zinc-800/90 bg-white dark:bg-zinc-900/60 hover:border-indigo-500/50 dark:hover:border-indigo-500/50 transition-all duration-200 overflow-hidden shadow-xs hover:shadow-md">
      {/* Cover */}
      <Link
        href={`/apps/${app.slug}`}
        className="block relative h-44 overflow-hidden bg-gradient-to-br from-indigo-600/20 via-violet-600/15 to-sky-500/20 dark:from-indigo-500/15 dark:via-violet-500/10 dark:to-zinc-900"
      >
        {app.coverImage ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={app.coverImage}
            alt={app.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center gap-2 text-indigo-600/70 dark:text-indigo-400/70">
            <div className="p-3.5 rounded-2xl bg-white/70 dark:bg-zinc-900/80 border border-slate-200/60 dark:border-zinc-800 shadow-xs">
              <Layers className="w-7 h-7" />
            </div>
            <span className="text-xs font-mono uppercase tracking-wider opacity-75">
              {app.category}
            </span>
          </div>
        )}

        <div className="absolute top-3 left-3 flex items-center gap-2">
          <span
            className={`px-2.5 py-0.5 rounded-full text-xs font-medium border backdrop-blur-md ${statusInfo.colorClass}`}
          >
            {statusInfo.label}
          </span>
          {app.version && (
            <span className="px-2 py-0.5 rounded-full text-xs font-mono bg-zinc-900/75 text-zinc-200 backdrop-blur-md">
              {app.version}
            </span>
          )}
        </div>
      </Link>

      {/* Body */}
      <div className="flex flex-col flex-1 p-5">
        <div className="flex items-start justify-between gap-2">
          <Link
            href={`/apps/${app.slug}`}
            className="font-bold text-lg text-slate-900 dark:text-zinc-100 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors line-clamp-1"
          >
            {app.title}
          </Link>
          <Link
            href={`/apps/${app.slug}`}
            aria-label={app.title}
            className="text-slate-400 group-hover:text-indigo-500 transition-colors shrink-0 mt-1"
          >
            <ArrowUpRight className="w-4 h-4" />
          </Link>
        </div>

        <p className="text-sm text-slate-600 dark:text-zinc-400 mt-2 line-clamp-2 flex-1">
          {app.tagline}
        </p>

        {/* Tech stack */}
        {app.techStack.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mt-4">
            {app.techStack.slice(0, 4).map((tech) => (
              <span
                key={tech}
                className="px-2 py-0.5 text-xs font-mono rounded-md bg-slate-100 dark:bg-zinc-800/90 text-slate-600 dark:text-zinc-300"
              >
                {tech}
              </span>
            ))}
            {app.techStack.length > 4 && (
              <span className="px-2 py-0.5 text-xs font-mono rounded-md bg-slate-100 dark:bg-zinc-800 text-slate-500">
                +{app.techStack.length - 4}
              </span>
            )}
          </div>
        )}

        {/* Quick links */}
        <div className="flex items-center justify-between pt-4 mt-4 border-t border-slate-100 dark:border-zinc-800/80 text-xs font-medium">
          <Link
            href={`/apps/${app.slug}`}
            className="text-indigo-600 dark:text-indigo-400 hover:underline"
          >
            {t.viewDetails}
          </Link>
          <div className="flex items-center gap-3">
            {app.repoUrl && (
              <a
                href={app.repoUrl}
                target="_blank"
                rel="noopener noreferrer"
                title={t.sourceCode}
                className="inline-flex items-center gap-1 text-slate-500 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white transition-colors"
              >
                <Github className="w-3.5 h-3.5" />
                <span>{t.code}</span>
              </a>
            )}
            {app.demoUrl && (
              <a
                href={app.demoUrl}
                target="_blank"
                rel="noopener noreferrer"
                title={t.demo}
                className="inline-flex items-center gap-1 text-slate-500 dark:text-zinc-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                <span>{t.demo}</span>
              </a>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
