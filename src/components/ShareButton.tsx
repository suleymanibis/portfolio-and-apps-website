"use client";

import { useState } from "react";
import { Check, Share2 } from "lucide-react";
import type { Locale } from "@/types";
import { dictionaries } from "@/lib/i18n";

export function ShareButton({
  title,
  locale = "tr",
}: {
  title: string;
  locale?: Locale;
}) {
  const [copied, setCopied] = useState(false);
  const t = dictionaries[locale]?.articles ?? dictionaries.tr.articles;

  const handleShare = async () => {
    const url = window.location.href;
    if (navigator.share) {
      try {
        await navigator.share({ title, url });
        return;
      } catch {
        // Fallback to clipboard
      }
    }
    await navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <button
      type="button"
      onClick={handleShare}
      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-zinc-800 text-xs font-medium text-slate-600 dark:text-zinc-300 hover:border-indigo-500/50 transition-colors cursor-pointer"
    >
      {copied ? (
        <>
          <Check className="w-3.5 h-3.5 text-emerald-500" />
          <span>{t.copiedLink}</span>
        </>
      ) : (
        <>
          <Share2 className="w-3.5 h-3.5" />
          <span>{t.share}</span>
        </>
      )}
    </button>
  );
}
