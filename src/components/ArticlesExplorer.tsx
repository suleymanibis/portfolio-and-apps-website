"use client";

import { useMemo, useState } from "react";
import { Search } from "lucide-react";
import type { ArticleItem, Locale } from "@/types";
import { dictionaries } from "@/lib/i18n";
import { ArticleCard } from "./ArticleCard";

const ALL_SENTINEL = "__ALL__";

export function ArticlesExplorer({
  articles,
  locale = "tr",
}: {
  articles: ArticleItem[];
  locale?: Locale;
}) {
  const [query, setQuery] = useState("");
  const [selectedTag, setSelectedTag] = useState(ALL_SENTINEL);
  const t = dictionaries[locale]?.articles ?? dictionaries.tr.articles;

  const tags = useMemo(() => {
    const allTags = articles
      .flatMap((a) => [a.category, ...a.tags])
      .filter(Boolean);
    return [ALL_SENTINEL, ...Array.from(new Set(allTags)).slice(0, 10)];
  }, [articles]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return articles.filter((art) => {
      const matchesTag =
        selectedTag === ALL_SENTINEL ||
        !tags.includes(selectedTag) ||
        art.category === selectedTag ||
        art.tags.includes(selectedTag);
      const matchesQuery =
        !q ||
        art.title.toLowerCase().includes(q) ||
        art.excerpt.toLowerCase().includes(q) ||
        art.tags.some((tag) => tag.toLowerCase().includes(q));
      return matchesTag && matchesQuery;
    });
  }, [articles, tags, query, selectedTag]);

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row gap-4 items-stretch sm:items-center justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={t.searchPlaceholder}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-sm text-slate-900 dark:text-zinc-100 placeholder:text-slate-400 focus:outline-none focus:border-indigo-500"
          />
        </div>

        <div className="flex flex-wrap gap-2">
          {tags.map((tag) => {
            const isSelected =
              selectedTag === tag ||
              (tag === ALL_SENTINEL && !tags.includes(selectedTag));
            return (
              <button
                key={tag}
                type="button"
                onClick={() => setSelectedTag(tag)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors cursor-pointer ${
                  isSelected
                    ? "bg-indigo-600 text-white"
                    : "bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 text-slate-600 dark:text-zinc-400 hover:border-indigo-500/40"
                }`}
              >
                {tag === ALL_SENTINEL ? t.allTag : tag}
              </button>
            );
          })}
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-300 dark:border-zinc-800 p-12 text-center text-slate-500 dark:text-zinc-400">
          {t.emptySearch}
        </div>
      ) : (
        <div className="space-y-4">
          {filtered.map((article) => (
            <ArticleCard key={article.id} article={article} locale={locale} />
          ))}
        </div>
      )}
    </div>
  );
}
