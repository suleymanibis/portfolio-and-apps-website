"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Globe } from "lucide-react";
import type { Locale } from "@/types";
import { localePath, stripLocalePrefix } from "@/lib/i18n";

export function LanguageToggle({ locale }: { locale: Locale }) {
  const pathname = usePathname() || "/";
  const isAdmin = pathname.startsWith("/admin");
  const cleanBase = isAdmin ? "/" : stripLocalePrefix(pathname);

  const trHref = localePath(cleanBase, "tr");
  const enHref = localePath(cleanBase, "en");

  const persistCookie = (nextLocale: Locale) => {
    document.cookie = `site_lang=${nextLocale}; path=/; max-age=31536000; samesite=lax`;
  };

  return (
    <div
      role="group"
      aria-label="Language selector"
      className="inline-flex items-center h-9 p-0.5 rounded-lg border border-slate-200 dark:border-zinc-800 bg-white/80 dark:bg-zinc-900/80 text-xs font-semibold"
    >
      <Globe className="w-3.5 h-3.5 text-slate-400 dark:text-zinc-500 ml-1.5 mr-1 shrink-0" />
      <Link
        href={trHref}
        onClick={() => persistCookie("tr")}
        hrefLang="tr"
        title="Türkçe"
        className={`px-2 py-1 rounded-md transition-colors ${
          locale === "tr"
            ? "bg-indigo-600 text-white shadow-2xs"
            : "text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white"
        }`}
      >
        TR
      </Link>
      <Link
        href={enHref}
        onClick={() => persistCookie("en")}
        hrefLang="en"
        title="English"
        className={`px-2 py-1 rounded-md transition-colors ${
          locale === "en"
            ? "bg-indigo-600 text-white shadow-2xs"
            : "text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white"
        }`}
      >
        EN
      </Link>
    </div>
  );
}
