"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { Locale, SiteProfile } from "@/types";
import { getDictionary, resolveClientLocale } from "@/lib/i18n";
import { SocialLinks } from "./SocialLinks";

export function Footer({
  profile,
  locale = "tr",
}: {
  profile: SiteProfile;
  locale?: Locale;
}) {
  const pathname = usePathname() || "/";
  const effectiveLocale = resolveClientLocale(pathname, locale);
  const dict = getDictionary(effectiveLocale);

  return (
    <footer className="border-t border-slate-200 dark:border-zinc-800/80 bg-white/60 dark:bg-zinc-950/60 mt-20">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3 text-center sm:text-left">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/logo-mark.png"
            alt={profile.siteName}
            width={32}
            height={32}
            className="w-8 h-8 rounded-lg ring-1 ring-indigo-500/20 hidden sm:block"
          />
          <div>
            <p className="font-semibold text-slate-900 dark:text-zinc-100">
              {profile.siteName}
            </p>
            <p className="text-xs text-slate-500 dark:text-zinc-500 mt-0.5">
              © {new Date().getFullYear()} {profile.ownerName}. {dict.footer.rights}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-3">
          <SocialLinks profile={profile} locale={effectiveLocale} variant="footer" />
          <span className="h-4 w-px bg-slate-200 dark:bg-zinc-800 mx-1" />
          <Link
            href="/admin"
            prefetch={false}
            className="text-xs text-slate-500 dark:text-zinc-500 hover:text-indigo-500 transition-colors"
          >
            {dict.footer.admin}
          </Link>
        </div>
      </div>
    </footer>
  );
}
