"use client";

import { useState } from "react";
import {
  Check,
  Github,
  Instagram,
  Linkedin,
  Mail,
  Mic,
  Twitter,
} from "lucide-react";
import type { Locale, SiteProfile } from "@/types";

function DiscordIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
      className={className}
    >
      <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028c.462-.63.874-1.295 1.226-1.994a.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.028ZM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418Zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418Z" />
    </svg>
  );
}

function isHttpUrl(val?: string): boolean {
  return Boolean(val && /^https?:\/\//i.test(val));
}

export function SocialLinks({
  profile,
  locale = "tr",
  variant = "hero",
}: {
  profile: SiteProfile;
  locale?: Locale;
  variant?: "hero" | "footer";
}) {
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const itemClass =
    variant === "hero"
      ? "p-2.5 rounded-xl border border-slate-200 dark:border-zinc-800 text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white hover:border-slate-300 dark:hover:border-zinc-700 transition-colors cursor-pointer"
      : "p-2 rounded-lg text-slate-500 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-zinc-900 transition-colors cursor-pointer";

  const copyHandle = async (key: string, handle: string) => {
    try {
      await navigator.clipboard.writeText(handle);
      setCopiedKey(`${key}:${handle}`);
      setTimeout(() => setCopiedKey(null), 2200);
    } catch {
      // Clipboard fallback ignored
    }
  };

  const copiedText = locale === "en" ? "Copied" : "Kopyalandı";

  return (
    <div className="relative inline-flex flex-wrap items-center gap-1.5">
      {profile.githubUrl && (
        <a
          href={profile.githubUrl}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="GitHub"
          title="GitHub"
          className={itemClass}
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
          title="X / Twitter"
          className={itemClass}
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
          title="LinkedIn"
          className={itemClass}
        >
          <Linkedin className="w-4 h-4" />
        </a>
      )}

      {profile.instagramUrl && (
        <a
          href={profile.instagramUrl}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Instagram"
          title="Instagram"
          className={itemClass}
        >
          <Instagram className="w-4 h-4" />
        </a>
      )}

      {profile.micupUrl &&
        (isHttpUrl(profile.micupUrl) ? (
          <a
            href={profile.micupUrl}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="MicUp"
            title="MicUp"
            className={itemClass}
          >
            <Mic className="w-4 h-4" />
          </a>
        ) : (
          <button
            type="button"
            onClick={() => copyHandle("MicUp", profile.micupUrl!)}
            aria-label={`MicUp: ${profile.micupUrl}`}
            title={`MicUp: ${profile.micupUrl}`}
            className={itemClass}
          >
            {copiedKey?.startsWith("MicUp:") ? (
              <Check className="w-4 h-4 text-emerald-500" />
            ) : (
              <Mic className="w-4 h-4" />
            )}
          </button>
        ))}

      {profile.discordUrl &&
        (isHttpUrl(profile.discordUrl) ? (
          <a
            href={profile.discordUrl}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Discord"
            title="Discord"
            className={itemClass}
          >
            <DiscordIcon className="w-4 h-4" />
          </a>
        ) : (
          <button
            type="button"
            onClick={() => copyHandle("Discord", profile.discordUrl!)}
            aria-label={`Discord: ${profile.discordUrl}`}
            title={`Discord: ${profile.discordUrl}`}
            className={itemClass}
          >
            {copiedKey?.startsWith("Discord:") ? (
              <Check className="w-4 h-4 text-emerald-500" />
            ) : (
              <DiscordIcon className="w-4 h-4" />
            )}
          </button>
        ))}

      {profile.email && (
        <a
          href={`mailto:${profile.email}`}
          aria-label="Email"
          title={profile.email}
          className={itemClass}
        >
          <Mail className="w-4 h-4" />
        </a>
      )}

      {copiedKey && (
        <span className="px-2.5 py-1 rounded-lg text-[11px] font-mono font-medium bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 animate-fade-in">
          {copiedKey.split(":")[0]} ({copiedKey.split(":")[1]}) — {copiedText}!
        </span>
      )}
    </div>
  );
}
