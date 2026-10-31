"use client";

import { useMemo, useState } from "react";
import { Search } from "lucide-react";
import type { Locale, PinnedRepoItem } from "@/types";
import { dictionaries } from "@/lib/i18n";
import { PinnedRepoCard } from "./PinnedRepoCard";

const ALL_SENTINEL = "__ALL__";

export function ReposExplorer({
  repos,
  locale = "tr",
}: {
  repos: PinnedRepoItem[];
  locale?: Locale;
}) {
  const [query, setQuery] = useState("");
  const [selectedLang, setSelectedLang] = useState(ALL_SENTINEL);
  const t = dictionaries[locale]?.repos ?? dictionaries.tr.repos;

  const languages = useMemo(() => {
    const langs = Array.from(
      new Set(repos.map((r) => r.language).filter(Boolean) as string[])
    );
    return [ALL_SENTINEL, ...langs];
  }, [repos]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return repos.filter((repo) => {
      const matchesLang =
        selectedLang === ALL_SENTINEL ||
        !languages.includes(selectedLang) ||
        repo.language === selectedLang;
      const matchesQuery =
        !q ||
        repo.name.toLowerCase().includes(q) ||
        repo.description.toLowerCase().includes(q) ||
        (repo.language && repo.language.toLowerCase().includes(q)) ||
        repo.topics.some((topic) => topic.toLowerCase().includes(q));
      return matchesLang && matchesQuery;
    });
  }, [languages, repos, query, selectedLang]);

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
          {languages.map((lang) => {
            const isSelected =
              selectedLang === lang ||
              (lang === ALL_SENTINEL && !languages.includes(selectedLang));
            return (
              <button
                key={lang}
                type="button"
                onClick={() => setSelectedLang(lang)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-colors cursor-pointer ${
                  isSelected
                    ? "bg-indigo-600 text-white"
                    : "bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 text-slate-600 dark:text-zinc-400 hover:border-indigo-500/40"
                }`}
              >
                {lang === ALL_SENTINEL ? t.allLang : lang}
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((repo) => (
            <PinnedRepoCard
              key={`${repo.owner}/${repo.name}`}
              repo={repo}
              locale={locale}
            />
          ))}
        </div>
      )}
    </div>
  );
}
