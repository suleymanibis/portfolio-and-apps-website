import {
  ArrowUpRight,
  BookMarked,
  ExternalLink,
  GitFork,
  Pin,
  Star,
} from "lucide-react";
import { PinnedRepoItem } from "@/types";
import { formatDateTR } from "@/lib/utils";

export function PinnedRepoCard({ repo }: { repo: PinnedRepoItem }) {
  return (
    <div className="group flex flex-col justify-between rounded-2xl border border-slate-200 dark:border-zinc-800/90 bg-white dark:bg-zinc-900/60 hover:border-indigo-500/50 dark:hover:border-indigo-500/50 p-5 transition-all duration-200 shadow-xs hover:shadow-md">
      <div className="space-y-3">
        {/* Header */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-2 min-w-0">
            <BookMarked className="w-4 h-4 text-indigo-600 dark:text-indigo-400 shrink-0" />
            <a
              href={repo.repoUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="font-bold text-base text-slate-900 dark:text-zinc-100 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors truncate"
            >
              {repo.name}
            </a>
          </div>

          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium bg-slate-100 dark:bg-zinc-800/90 text-slate-600 dark:text-zinc-400 border border-slate-200/70 dark:border-zinc-700/70 shrink-0">
            <Pin className="w-3 h-3 text-indigo-500" />
            <span>Sabitli</span>
          </span>
        </div>

        {/* Description */}
        <p className="text-sm text-slate-600 dark:text-zinc-400 line-clamp-3 leading-relaxed">
          {repo.description || "GitHub üzerinde paylaşılan açık kaynak yazılım deposu."}
        </p>

        {/* Topics if available */}
        {repo.topics.length > 0 && (
          <div className="flex flex-wrap gap-1.5 pt-1">
            {repo.topics.slice(0, 4).map((topic) => (
              <span
                key={topic}
                className="px-2 py-0.5 rounded-md text-[11px] font-mono bg-indigo-500/10 text-indigo-600 dark:text-indigo-400"
              >
                {topic}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Footer Meta */}
      <div className="mt-5 pt-3.5 border-t border-slate-100 dark:border-zinc-800/80 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-500 dark:text-zinc-400">
        <div className="flex items-center gap-3.5">
          {repo.language && (
            <span className="inline-flex items-center gap-1.5 font-medium text-slate-700 dark:text-zinc-300">
              <span
                className="w-2.5 h-2.5 rounded-full shrink-0"
                style={{ backgroundColor: repo.languageColor || "#6366f1" }}
              />
              <span>{repo.language}</span>
            </span>
          )}

          {repo.stars > 0 && (
            <span className="inline-flex items-center gap-1" title="Yıldız">
              <Star className="w-3.5 h-3.5 text-amber-500" />
              <span>{repo.stars}</span>
            </span>
          )}

          {repo.forks > 0 && (
            <span className="inline-flex items-center gap-1" title="Fork">
              <GitFork className="w-3.5 h-3.5" />
              <span>{repo.forks}</span>
            </span>
          )}

          {repo.updatedAt && repo.stars === 0 && repo.forks === 0 && (
            <span className="text-[11px] text-slate-400 dark:text-zinc-500">
              {formatDateTR(repo.updatedAt)}
            </span>
          )}
        </div>

        <div className="flex items-center gap-2.5 ml-auto">
          {repo.homepageUrl && (
            <a
              href={repo.homepageUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 font-medium text-slate-600 dark:text-zinc-300 hover:text-indigo-500 transition-colors"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span>Canlı</span>
            </a>
          )}
          <a
            href={repo.repoUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-0.5 font-semibold text-indigo-600 dark:text-indigo-400 hover:underline"
          >
            <span>GitHub</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </a>
        </div>
      </div>
    </div>
  );
}
