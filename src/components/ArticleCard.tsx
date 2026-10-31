import Link from "next/link";
import { ArrowRight, Calendar, Clock } from "lucide-react";
import { ArticleItem } from "@/types";
import { formatDateTR } from "@/lib/utils";

export function ArticleCard({ article }: { article: ArticleItem }) {
  return (
    <article className="group flex flex-col sm:flex-row gap-5 p-5 rounded-2xl border border-slate-200 dark:border-zinc-800/90 bg-white dark:bg-zinc-900/60 hover:border-indigo-500/50 dark:hover:border-indigo-500/50 transition-all duration-200 shadow-xs hover:shadow-md">
      {article.coverImage && (
        <Link
          href={`/articles/${article.slug}`}
          className="sm:w-48 h-40 sm:h-auto shrink-0 rounded-xl overflow-hidden bg-slate-100 dark:bg-zinc-800"
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={article.coverImage}
            alt={article.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        </Link>
      )}

      <div className="flex flex-col flex-1 justify-between">
        <div>
          <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 dark:text-zinc-400 mb-2">
            <span className="px-2.5 py-0.5 rounded-full font-medium bg-indigo-500/10 text-indigo-600 dark:text-indigo-400">
              {article.category}
            </span>
            <span className="inline-flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5" />
              {formatDateTR(article.createdAt)}
            </span>
            <span className="inline-flex items-center gap-1">
              <Clock className="w-3.5 h-3.5" />
              {article.readingTimeMinutes} dk okuma
            </span>
          </div>

          <Link href={`/articles/${article.slug}`}>
            <h3 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-zinc-100 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
              {article.title}
            </h3>
          </Link>

          <p className="text-sm text-slate-600 dark:text-zinc-400 mt-2 line-clamp-2 leading-relaxed">
            {article.excerpt}
          </p>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-2 mt-4 pt-3 border-t border-slate-100 dark:border-zinc-800/70">
          <div className="flex flex-wrap gap-1.5">
            {article.tags.slice(0, 4).map((tag) => (
              <span
                key={tag}
                className="text-xs font-mono text-slate-500 dark:text-zinc-400 bg-slate-100 dark:bg-zinc-800/80 px-2 py-0.5 rounded"
              >
                #{tag}
              </span>
            ))}
          </div>

          <Link
            href={`/articles/${article.slug}`}
            className="inline-flex items-center gap-1 text-xs font-semibold text-indigo-600 dark:text-indigo-400 group-hover:translate-x-0.5 transition-transform"
          >
            <span>Yazıyı Oku</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>
    </article>
  );
}
