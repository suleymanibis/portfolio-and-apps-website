import {
  cleanStringArray,
  cleanText,
  sanitizeHttpUrl,
  sanitizeImageUrl,
  sanitizeSocialValue,
} from "@/lib/security";
import { calculateReadingTime, slugify } from "@/lib/utils";
import type {
  AboutEducationItem,
  AboutPageData,
  AboutSkillGroup,
  AppItem,
  AppStatus,
  ArticleItem,
  SiteProfile,
} from "@/types";

export const ALLOWED_APP_STATUSES: readonly AppStatus[] = [
  "live",
  "beta",
  "in-progress",
  "open-source",
];

const SIMPLE_EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function isAllowedAppStatus(value: unknown): value is AppStatus {
  return (
    typeof value === "string" &&
    ALLOWED_APP_STATUSES.includes(value as AppStatus)
  );
}

export function sanitizeAppCreateInput(
  body: Record<string, unknown>
):
  | {
      ok: true;
      value: Omit<AppItem, "id" | "createdAt" | "updatedAt" | "en">;
    }
  | { ok: false; error: string } {
  const title = cleanText(body.title, 160);
  const tagline = cleanText(body.tagline, 300);

  if (!title || !tagline) {
    return {
      ok: false,
      error: "Uygulama adı ve kısa açıklama zorunludur.",
    };
  }

  const slug = slugify(cleanText(body.slug, 160) || title);
  const status: AppStatus = isAllowedAppStatus(body.status)
    ? body.status
    : "live";

  return {
    ok: true,
    value: {
      title,
      slug: slug || `app-${Date.now()}`,
      tagline,
      description: cleanText(body.description, 50000),
      coverImage: sanitizeImageUrl(body.coverImage),
      category: cleanText(body.category, 60) || "Genel",
      techStack: cleanStringArray(body.techStack, 20, 40),
      demoUrl: sanitizeHttpUrl(body.demoUrl),
      repoUrl: sanitizeHttpUrl(body.repoUrl),
      downloadUrl: sanitizeHttpUrl(body.downloadUrl),
      version: cleanText(body.version, 32),
      status,
      featured: Boolean(body.featured),
    },
  };
}

export function sanitizeAppUpdateInput(
  body: Record<string, unknown>
): Partial<AppItem> {
  const updates: Partial<AppItem> = {};

  if (body.title !== undefined) updates.title = cleanText(body.title, 160);
  if (body.slug !== undefined) {
    updates.slug = slugify(cleanText(body.slug, 160));
  } else if (updates.title) {
    updates.slug = slugify(updates.title);
  }
  if (body.tagline !== undefined)
    updates.tagline = cleanText(body.tagline, 300);
  if (body.description !== undefined)
    updates.description = cleanText(body.description, 50000);
  if (body.coverImage !== undefined)
    updates.coverImage = sanitizeImageUrl(body.coverImage);
  if (body.category !== undefined)
    updates.category = cleanText(body.category, 60) || "Genel";
  if (body.techStack !== undefined)
    updates.techStack = cleanStringArray(body.techStack, 20, 40);
  if (body.demoUrl !== undefined)
    updates.demoUrl = sanitizeHttpUrl(body.demoUrl);
  if (body.repoUrl !== undefined)
    updates.repoUrl = sanitizeHttpUrl(body.repoUrl);
  if (body.downloadUrl !== undefined)
    updates.downloadUrl = sanitizeHttpUrl(body.downloadUrl);
  if (body.version !== undefined)
    updates.version = cleanText(body.version, 32);
  if (body.status !== undefined && isAllowedAppStatus(body.status))
    updates.status = body.status;
  if (body.featured !== undefined) updates.featured = Boolean(body.featured);

  return updates;
}

export function buildAutoExcerpt(markdown: string): string {
  const plain = markdown
    .replace(/[#>*_`~\-\[\]()]/g, "")
    .slice(0, 180)
    .trim();
  return `${plain}...`;
}

export function sanitizeArticleCreateInput(
  body: Record<string, unknown>
):
  | {
      ok: true;
      value: Omit<ArticleItem, "id" | "createdAt" | "updatedAt" | "en">;
    }
  | { ok: false; error: string } {
  const title = cleanText(body.title, 180);
  const content = cleanText(body.content, 100000);

  if (!title || !content) {
    return {
      ok: false,
      error: "Makale başlığı ve içeriği zorunludur.",
    };
  }

  const slug = slugify(cleanText(body.slug, 180) || title);
  const excerpt = cleanText(body.excerpt, 400) || buildAutoExcerpt(content);

  return {
    ok: true,
    value: {
      title,
      slug: slug || `makale-${Date.now()}`,
      excerpt,
      content,
      coverImage: sanitizeImageUrl(body.coverImage),
      category: cleanText(body.category, 60) || "Genel",
      tags: cleanStringArray(body.tags, 20, 40),
      published: body.published !== undefined ? Boolean(body.published) : true,
      featured: Boolean(body.featured),
      readingTimeMinutes: calculateReadingTime(content),
    },
  };
}

export function sanitizeArticleUpdateInput(
  body: Record<string, unknown>
): Partial<ArticleItem> {
  const updates: Partial<ArticleItem> = {};

  if (body.title !== undefined) updates.title = cleanText(body.title, 180);
  if (body.slug !== undefined) {
    updates.slug = slugify(cleanText(body.slug, 180));
  } else if (updates.title) {
    updates.slug = slugify(updates.title);
  }
  if (body.excerpt !== undefined)
    updates.excerpt = cleanText(body.excerpt, 400);
  if (body.content !== undefined) {
    const content = cleanText(body.content, 100000);
    updates.content = content;
    updates.readingTimeMinutes = calculateReadingTime(content);
  }
  if (body.coverImage !== undefined)
    updates.coverImage = sanitizeImageUrl(body.coverImage);
  if (body.category !== undefined)
    updates.category = cleanText(body.category, 60) || "Genel";
  if (body.tags !== undefined)
    updates.tags = cleanStringArray(body.tags, 20, 40);
  if (body.published !== undefined)
    updates.published = Boolean(body.published);
  if (body.featured !== undefined) updates.featured = Boolean(body.featured);

  return updates;
}

export function sanitizeProfileInput(
  body: Record<string, unknown>
): Omit<SiteProfile, "en"> {
  const emailRaw = cleanText(body.email, 120);
  const validEmail =
    !emailRaw || SIMPLE_EMAIL_RE.test(emailRaw) ? emailRaw : "";

  return {
    siteName: cleanText(body.siteName, 60) || "suleymanibis.dev",
    ownerName: cleanText(body.ownerName, 80) || "Süleyman İbiş",
    roleTitle: cleanText(body.roleTitle, 120),
    heroGreeting: cleanText(body.heroGreeting, 240),
    bio: cleanText(body.bio, 1000),
    avatarUrl: sanitizeImageUrl(body.avatarUrl),
    location: cleanText(body.location, 80),
    availableForWork: Boolean(body.availableForWork),
    githubUrl: sanitizeHttpUrl(body.githubUrl),
    twitterUrl: sanitizeHttpUrl(body.twitterUrl),
    linkedinUrl: sanitizeHttpUrl(body.linkedinUrl),
    instagramUrl: sanitizeSocialValue(
      body.instagramUrl,
      "https://instagram.com/"
    ),
    micupUrl: sanitizeSocialValue(body.micupUrl),
    discordUrl: sanitizeSocialValue(body.discordUrl),
    email: validEmail,
  };
}

export function sanitizeAboutInput(
  body: Record<string, unknown>
): Omit<AboutPageData, "en" | "updatedAt"> {
  const headline =
    cleanText(body.headline, 180) || "Merhaba, ben Süleyman İbiş.";
  const subheadline = cleanText(body.subheadline, 400);
  const currentFocus = cleanText(body.currentFocus, 500);
  const storyMarkdown = cleanText(body.storyMarkdown, 50000);
  const photoUrl = sanitizeImageUrl(body.photoUrl);
  const cvUrl = sanitizeHttpUrl(body.cvUrl);

  const rawEducation = Array.isArray(body.education)
    ? body.education.slice(0, 12)
    : [];
  const education: AboutEducationItem[] = rawEducation
    .map((item) => {
      if (!item || typeof item !== "object") return null;
      const rec = item as Record<string, unknown>;
      const period = cleanText(rec.period, 60);
      const institution = cleanText(rec.institution, 120);
      const title = cleanText(rec.title, 140);
      const description = cleanText(rec.description, 400);
      if (!institution && !title) return null;
      return { period, institution, title, description };
    })
    .filter((x): x is AboutEducationItem => Boolean(x));

  const rawSkills = Array.isArray(body.skillGroups)
    ? body.skillGroups.slice(0, 10)
    : [];
  const skillGroups: AboutSkillGroup[] = rawSkills
    .map((grp) => {
      if (!grp || typeof grp !== "object") return null;
      const rec = grp as Record<string, unknown>;
      const category = cleanText(rec.category, 80);
      const items = cleanStringArray(rec.items, 30, 50);
      if (!category && items.length === 0) return null;
      return { category: category || "Teknolojiler", items };
    })
    .filter((x): x is AboutSkillGroup => Boolean(x));

  return {
    headline,
    subheadline,
    photoUrl,
    cvUrl,
    currentFocus,
    storyMarkdown,
    education,
    skillGroups,
  };
}
