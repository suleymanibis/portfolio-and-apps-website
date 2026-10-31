"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { Globe } from "lucide-react";
import type { Locale } from "@/types";

export function LanguageToggle({ locale }: { locale: Locale }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const selectLanguage = (nextLocale: Locale) => {
    if (nextLocale === locale) return;
    document.cookie = `site_lang=${nextLocale}; path=/; max-age=31536000; samesite=lax`;
    startTransition(() => {
      router.refresh();
    });
  };

  return (
    <div
      role="group"
      aria-label="Language selector"
      className={`inline-flex items-center h-9 p-0.5 rounded-lg border border-slate-200 dark:border-zinc-800 bg-white/80 dark:bg-zinc-900/80 text-xs font-semibold transition-opacity ${
        isPending ? "opacity-60" : "opacity-100"
      }`}
    >
      <Globe className="w-3.5 h-3.5 text-slate-400 dark:text-zinc-500 ml-1.5 mr-1 shrink-0" />
      <button
        type="button"
        onClick={() => selectLanguage("tr")}
        disabled={isPending}
        title="Türkçe"
        className={`px-2 py-1 rounded-md transition-colors cursor-pointer ${
          locale === "tr"
            ? "bg-indigo-600 text-white shadow-2xs"
            : "text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white"
        }`}
      >
        TR
      </button>
      <button
        type="button"
        onClick={() => selectLanguage("en")}
        disabled={isPending}
        title="English"
        className={`px-2 py-1 rounded-md transition-colors cursor-pointer ${
          locale === "en"
            ? "bg-indigo-600 text-white shadow-2xs"
            : "text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white"
        }`}
      >
        EN
      </button>
    </div>
  );
}
