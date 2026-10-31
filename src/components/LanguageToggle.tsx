"use client";

import { useEffect, useState, type MouseEvent } from "react";
import { usePathname } from "next/navigation";
import { Globe } from "lucide-react";
import type { Locale } from "@/types";
import {
  localePath,
  resolveClientLocale,
  stripLocalePrefix,
} from "@/lib/i18n";

export function LanguageToggle({ locale }: { locale: Locale }) {
  const pathname = usePathname() || "/";
  const isAdmin = pathname.startsWith("/admin");
  const currentLocale = resolveClientLocale(pathname, locale);
  const [pendingLocale, setPendingLocale] = useState<Locale | null>(null);

  useEffect(() => {
    setPendingLocale(null);
  }, [pathname]);

  useEffect(() => {
    const handlePageShow = () => setPendingLocale(null);
    window.addEventListener("pageshow", handlePageShow);
    return () => window.removeEventListener("pageshow", handlePageShow);
  }, []);

  const activeLocale = pendingLocale ?? currentLocale;

  useEffect(() => {
    document.documentElement.lang = activeLocale;
  }, [activeLocale]);

  const cleanBase = isAdmin ? "/admin" : stripLocalePrefix(pathname);
  const trHref = isAdmin ? "/admin" : localePath(cleanBase, "tr");
  const enHref = isAdmin ? "/admin" : localePath(cleanBase, "en");

  const handleSelect = (
    event: MouseEvent<HTMLAnchorElement>,
    nextLocale: Locale
  ) => {
    document.cookie = `site_lang=${nextLocale}; path=/; max-age=31536000; samesite=lax`;

    if (currentLocale === nextLocale) {
      event.preventDefault();
      return;
    }

    setPendingLocale(nextLocale);

    if (isAdmin) {
      event.preventDefault();
      window.location.reload();
    }
    // For public pages, let the native <a> navigation proceed cleanly so
    // RootLayout, Navbar, Footer, metadata, and Next.js Router Cache all
    // initialize deterministically in the target language on the first click.
  };

  return (
    <div
      role="group"
      aria-label="Language selector"
      className="inline-flex items-center h-9 p-0.5 rounded-lg border border-slate-200 dark:border-zinc-800 bg-white/80 dark:bg-zinc-900/80 text-xs font-semibold"
    >
      <Globe className="w-3.5 h-3.5 text-slate-400 dark:text-zinc-500 ml-1.5 mr-1 shrink-0" />
      <a
        href={trHref}
        onClick={(e) => handleSelect(e, "tr")}
        hrefLang="tr"
        aria-current={activeLocale === "tr" ? "true" : undefined}
        title="Türkçe"
        className={`px-2 py-1 rounded-md transition-colors ${
          activeLocale === "tr"
            ? "bg-indigo-600 text-white shadow-2xs"
            : "text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white"
        }`}
      >
        TR
      </a>
      <a
        href={enHref}
        onClick={(e) => handleSelect(e, "en")}
        hrefLang="en"
        aria-current={activeLocale === "en" ? "true" : undefined}
        title="English"
        className={`px-2 py-1 rounded-md transition-colors ${
          activeLocale === "en"
            ? "bg-indigo-600 text-white shadow-2xs"
            : "text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white"
        }`}
      >
        EN
      </a>
    </div>
  );
}
