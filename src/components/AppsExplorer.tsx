"use client";

import { useMemo, useState } from "react";
import { Search } from "lucide-react";
import type { AppItem, Locale } from "@/types";
import { dictionaries } from "@/lib/i18n";
import { AppCard } from "./AppCard";

const ALL_SENTINEL = "__ALL__";

export function AppsExplorer({
  apps,
  locale = "tr",
}: {
  apps: AppItem[];
  locale?: Locale;
}) {
  const [query, setQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState(ALL_SENTINEL);
  const t = dictionaries[locale]?.apps ?? dictionaries.tr.apps;

  const categories = useMemo(() => {
    const unique = Array.from(
      new Set(apps.map((a) => a.category).filter(Boolean))
    );
    return [ALL_SENTINEL, ...unique];
  }, [apps]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return apps.filter((app) => {
      const matchesCat =
        selectedCategory === ALL_SENTINEL ||
        !categories.includes(selectedCategory) ||
        app.category === selectedCategory;
      const matchesQuery =
        !q ||
        app.title.toLowerCase().includes(q) ||
        app.tagline.toLowerCase().includes(q) ||
        app.techStack.some((tech) => tech.toLowerCase().includes(q));
      return matchesCat && matchesQuery;
    });
  }, [apps, categories, query, selectedCategory]);

  return (
    <div className="space-y-8">
      {/* Search & Filter Controls */}
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
          {categories.map((cat) => {
            const isSelected =
              selectedCategory === cat ||
              (cat === ALL_SENTINEL && !categories.includes(selectedCategory));
            return (
              <button
                key={cat}
                type="button"
                onClick={() => setSelectedCategory(cat)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-colors cursor-pointer ${
                  isSelected
                    ? "bg-indigo-600 text-white"
                    : "bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 text-slate-600 dark:text-zinc-400 hover:border-indigo-500/40"
                }`}
              >
                {cat === ALL_SENTINEL ? t.allCategory : cat}
              </button>
            );
          })}
        </div>
      </div>

      {/* Results Grid */}
      {filtered.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-300 dark:border-zinc-800 p-12 text-center text-slate-500 dark:text-zinc-400">
          {t.emptySearch}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((app) => (
            <AppCard key={app.id} app={app} locale={locale} />
          ))}
        </div>
      )}
    </div>
  );
}
