import Link from "next/link";
import { Github, Linkedin, Mail, Twitter } from "lucide-react";
import type { Locale, SiteProfile } from "@/types";
import { getDictionary } from "@/lib/i18n";

export function Footer({
  profile,
  locale = "tr",
}: {
  profile: SiteProfile;
  locale?: Locale;
}) {
  const dict = getDictionary(locale);

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

        <div className="flex items-center gap-3">
          {profile.githubUrl && (
            <a
              href={profile.githubUrl}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="GitHub"
              className="p-2 rounded-lg text-slate-500 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-zinc-900 transition-colors"
            >
              <Github className="w-4 h-4" />
            </a>
          )}
          {profile.twitterUrl && (
            <a
              href={profile.twitterUrl}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="X / Twitter"
              className="p-2 rounded-lg text-slate-500 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-zinc-900 transition-colors"
            >
              <Twitter className="w-4 h-4" />
            </a>
          )}
          {profile.linkedinUrl && (
            <a
              href={profile.linkedinUrl}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="LinkedIn"
              className="p-2 rounded-lg text-slate-500 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-zinc-900 transition-colors"
            >
              <Linkedin className="w-4 h-4" />
            </a>
          )}
          {profile.email && (
            <a
              href={`mailto:${profile.email}`}
              aria-label="Email"
              className="p-2 rounded-lg text-slate-500 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-zinc-900 transition-colors"
            >
              <Mail className="w-4 h-4" />
            </a>
          )}
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
