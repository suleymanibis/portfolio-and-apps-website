import type { Locale } from "@/types";

const trMap: Record<string, string> = {
  ç: "c",
  Ç: "c",
  ğ: "g",
  Ğ: "g",
  ı: "i",
  I: "i",
  İ: "i",
  ö: "o",
  Ö: "o",
  ş: "s",
  Ş: "s",
  ü: "u",
  Ü: "u",
};

export function slugify(text: string): string {
  return text
    .split("")
    .map((ch) => trMap[ch] ?? ch)
    .join("")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

/**
 * Ensures a slug is unique among an existing list of slugs by appending -2, -3, etc.
 */
export function ensureUniqueSlug(
  desiredSlug: string,
  existingSlugs: Iterable<string>
): string {
  const taken = new Set(existingSlugs);
  let candidate = desiredSlug;
  let counter = 2;
  while (taken.has(candidate)) {
    candidate = `${desiredSlug}-${counter++}`;
  }
  return candidate;
}

export function calculateReadingTime(markdown: string): number {
  const words = markdown.trim().split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.ceil(words / 200));
}

export function formatDate(isoDate: string, locale: Locale = "tr"): string {
  try {
    return new Intl.DateTimeFormat(locale === "en" ? "en-US" : "tr-TR", {
      day: "numeric",
      month: "long",
      year: "numeric",
    }).format(new Date(isoDate));
  } catch {
    return isoDate;
  }
}

export function formatDateTR(isoDate: string): string {
  return formatDate(isoDate, "tr");
}

export const statusLabels: Record<string, { label: string; colorClass: string }> = {
  live: {
    label: "Yayında",
    colorClass:
      "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30",
  },
  beta: {
    label: "Beta",
    colorClass:
      "bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/30",
  },
  "in-progress": {
    label: "Geliştiriliyor",
    colorClass:
      "bg-sky-500/15 text-sky-600 dark:text-sky-400 border-sky-500/30",
  },
  "open-source": {
    label: "Açık Kaynak",
    colorClass:
      "bg-violet-500/15 text-violet-600 dark:text-violet-400 border-violet-500/30",
  },
};

const statusLabelsEn: Record<string, string> = {
  live: "Live",
  beta: "Beta",
  "in-progress": "In Progress",
  "open-source": "Open Source",
};

export function getStatusInfo(
  status: string,
  locale: Locale = "tr"
): { label: string; colorClass: string } {
  const base = statusLabels[status] || statusLabels.live;
  if (locale === "en") {
    return {
      label: statusLabelsEn[status] || statusLabelsEn.live,
      colorClass: base.colorClass,
    };
  }
  return base;
}
