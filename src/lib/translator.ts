import type {
  AppItem,
  AppTranslation,
  ArticleItem,
  ArticleTranslation,
  Locale,
  PinnedRepoItem,
  ProfileTranslation,
  SiteProfile,
} from "@/types";

// In-memory LRU-style cache for legacy items without persisted `.en` field
const runtimeAppCache = new Map<string, AppTranslation>();
const runtimeArticleCache = new Map<string, ArticleTranslation>();
const runtimeProfileCache = new Map<string, ProfileTranslation>();
const runtimeRepoDescCache = new Map<string, string>();

function boundCache<T>(map: Map<string, T>, max = 200) {
  if (map.size >= max) {
    const first = map.keys().next().value;
    if (first) map.delete(first);
  }
}

/**
 * Translates plain Turkish text (possibly multiline) into English via GTX endpoint.
 * Gracefully falls back to original string on timeout or network error.
 */
export async function translateTextTrToEn(
  text: string,
  sourceLang: "tr" | "auto" = "tr"
): Promise<string> {
  const trimmed = text.trim();
  if (!trimmed) return text;

  // Chunk into <= 3500 chars on newline boundaries for safety on long texts
  const lines = text.split("\n");
  const chunks: string[] = [];
  let current = "";

  for (const line of lines) {
    if (current.length + line.length + 1 > 3500 && current.length > 0) {
      chunks.push(current);
      current = line;
    } else {
      current = current ? `${current}\n${line}` : line;
    }
  }
  if (current) chunks.push(current);

  const translatedChunks: string[] = [];
  for (const chunk of chunks) {
    try {
      const body = new URLSearchParams({
        client: "gtx",
        sl: sourceLang,
        tl: "en",
        dt: "t",
        q: chunk,
      });
      const res = await fetch(
        "https://translate.googleapis.com/translate_a/single",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/x-www-form-urlencoded;charset=UTF-8",
            "User-Agent": "Mozilla/5.0",
          },
          body: body.toString(),
          signal: AbortSignal.timeout(7000),
          cache: "no-store",
        }
      );

      if (!res.ok) {
        translatedChunks.push(chunk);
        continue;
      }

      const json = (await res.json()) as unknown[];
      if (Array.isArray(json) && Array.isArray(json[0])) {
        const out = (json[0] as unknown[][])
          .map((seg) => (typeof seg?.[0] === "string" ? seg[0] : ""))
          .join("");
        translatedChunks.push(out || chunk);
      } else {
        translatedChunks.push(chunk);
      }
    } catch {
      translatedChunks.push(chunk);
    }
  }

  return translatedChunks.join("\n");
}

/**
 * Translates Markdown from Turkish to English while preserving:
 * - Fenced code blocks (```lang ... ```) 100% untouched
 * - Inline code spans (`code`) 100% untouched
 * - Markdown link/image target URLs 100% untouched
 * - Headings (#, ##, ###), blockquotes (>), lists (-, *, 1.) structure intact
 */
export async function translateMarkdownTrToEn(markdown: string): Promise<string> {
  if (!markdown || !markdown.trim()) return markdown;

  // Split by fenced code blocks: odd indices are ```...``` blocks
  const segments = markdown.split(/(```[\s\S]*?```)/g);
  const outputSegments: string[] = [];

  for (let idx = 0; idx < segments.length; idx++) {
    const seg = segments[idx];
    if (idx % 2 === 1) {
      // Fenced code block -> keep verbatim
      outputSegments.push(seg);
      continue;
    }

    if (!seg.trim()) {
      outputSegments.push(seg);
      continue;
    }

    const inlineCodes: string[] = [];
    const linkUrls: string[] = [];

    const lines = seg.split("\n");
    const prefixes: string[] = [];
    const maskedBodies: string[] = [];

    for (const line of lines) {
      // Horizontal rules or empty lines stay empty/untouched
      if (!line.trim() || /^\s*([-*_])\1{2,}\s*$/.test(line)) {
        prefixes.push(line);
        maskedBodies.push("");
        continue;
      }

      const prefixMatch = line.match(
        /^(\s*(?:#{1,6}\s+|>\s+|[-*+]\s+|\d+\.\s+))(.*)$/
      );
      const prefix = prefixMatch ? prefixMatch[1] : "";
      let rest = prefixMatch ? prefixMatch[2] : line;

      // Mask inline code `...`
      rest = rest.replace(/`[^`]+`/g, (match) => {
        const i = inlineCodes.push(match) - 1;
        return `§c${i}§`;
      });

      // Mask link & image URLs ](url)
      rest = rest.replace(/\]\(([^)]+)\)/g, (_full, url: string) => {
        const i = linkUrls.push(url) - 1;
        return `](§u${i}§)`;
      });

      prefixes.push(prefix);
      maskedBodies.push(rest);
    }

    const translatedJoined = await translateTextTrToEn(maskedBodies.join("\n"));
    const translatedLines = translatedJoined.split("\n");

    const restoredLines = lines.map((_, lineIdx) => {
      const prefix = prefixes[lineIdx];
      const maskedOriginal = maskedBodies[lineIdx];
      if (!maskedOriginal) {
        return prefix; // empty line or horizontal rule
      }

      let tLine = translatedLines[lineIdx] ?? maskedOriginal;

      // Restore URLs and inline code spans (tolerant to whitespace/case variations)
      tLine = tLine.replace(/§\s*u(\d+)\s*§/gi, (_m, n) => {
        return linkUrls[Number(n)] ?? _m;
      });
      tLine = tLine.replace(/§\s*c(\d+)\s*§/gi, (_m, n) => {
        return inlineCodes[Number(n)] ?? _m;
      });

      return `${prefix}${tLine}`;
    });

    outputSegments.push(restoredLines.join("\n"));
  }

  return outputSegments.join("");
}

export async function buildAppEnTranslation(input: {
  title: string;
  tagline: string;
  description: string;
  category: string;
}): Promise<AppTranslation> {
  const [metaJoined, description] = await Promise.all([
    translateTextTrToEn(
      [input.title, input.tagline, input.category].join("\n")
    ),
    translateMarkdownTrToEn(input.description),
  ]);
  const [title, tagline, category] = metaJoined.split("\n");
  return {
    title: title?.trim() || input.title,
    tagline: tagline?.trim() || input.tagline,
    description: description || input.description,
    category: category?.trim() || input.category,
  };
}

export async function buildArticleEnTranslation(input: {
  title: string;
  excerpt: string;
  content: string;
  category: string;
  tags: string[];
}): Promise<ArticleTranslation> {
  const [metaJoined, content, tagsJoined] = await Promise.all([
    translateTextTrToEn(
      [input.title, input.excerpt, input.category].join("\n")
    ),
    translateMarkdownTrToEn(input.content),
    input.tags.length > 0
      ? translateTextTrToEn(input.tags.join("\n"))
      : Promise.resolve(""),
  ]);
  const [title, excerpt, category] = metaJoined.split("\n");
  const tags = tagsJoined
    ? tagsJoined
        .split("\n")
        .map((t) => t.trim())
        .filter(Boolean)
    : input.tags;

  return {
    title: title?.trim() || input.title,
    excerpt: excerpt?.trim() || input.excerpt,
    content: content || input.content,
    category: category?.trim() || input.category,
    tags: tags.length > 0 ? tags : input.tags,
  };
}

export async function buildProfileEnTranslation(input: {
  roleTitle: string;
  heroGreeting: string;
  bio: string;
  location?: string;
}): Promise<ProfileTranslation> {
  const joined = await translateTextTrToEn(
    [
      input.roleTitle,
      input.heroGreeting,
      input.bio.replace(/\n+/g, " "),
      input.location || "",
    ].join("\n")
  );
  const [roleTitle, heroGreeting, bio, location] = joined.split("\n");
  return {
    roleTitle: roleTitle?.trim() || input.roleTitle,
    heroGreeting: heroGreeting?.trim() || input.heroGreeting,
    bio: bio?.trim() || input.bio,
    location: location?.trim() || input.location,
  };
}

// --- Display Localization Helpers (instant if `.en` exists, lazy-cached fallback otherwise) ---

export async function localizeProfile(
  profile: SiteProfile,
  locale: Locale
): Promise<SiteProfile> {
  if (locale !== "en") return profile;
  if (profile.en) {
    return {
      ...profile,
      roleTitle: profile.en.roleTitle || profile.roleTitle,
      heroGreeting: profile.en.heroGreeting || profile.heroGreeting,
      bio: profile.en.bio || profile.bio,
      location: profile.en.location || profile.location,
    };
  }

  const cacheKey = `${profile.roleTitle}|${profile.heroGreeting}|${profile.bio}`;
  let cached = runtimeProfileCache.get(cacheKey);
  if (!cached) {
    cached = await buildProfileEnTranslation(profile);
    boundCache(runtimeProfileCache, 20);
    runtimeProfileCache.set(cacheKey, cached);
  }
  return {
    ...profile,
    roleTitle: cached.roleTitle,
    heroGreeting: cached.heroGreeting,
    bio: cached.bio,
    location: cached.location || profile.location,
  };
}

export async function localizeApp(
  app: AppItem,
  locale: Locale
): Promise<AppItem> {
  if (locale !== "en") return app;
  if (app.en) {
    return {
      ...app,
      title: app.en.title || app.title,
      tagline: app.en.tagline || app.tagline,
      description: app.en.description || app.description,
      category: app.en.category || app.category,
    };
  }

  const cacheKey = `${app.id}:${app.updatedAt}`;
  let cached = runtimeAppCache.get(cacheKey);
  if (!cached) {
    cached = await buildAppEnTranslation(app);
    boundCache(runtimeAppCache, 200);
    runtimeAppCache.set(cacheKey, cached);
  }
  return {
    ...app,
    title: cached.title,
    tagline: cached.tagline,
    description: cached.description,
    category: cached.category,
  };
}

export async function localizeApps(
  apps: AppItem[],
  locale: Locale
): Promise<AppItem[]> {
  if (locale !== "en") return apps;
  return Promise.all(apps.map((a) => localizeApp(a, locale)));
}

export async function localizeArticle(
  article: ArticleItem,
  locale: Locale
): Promise<ArticleItem> {
  if (locale !== "en") return article;
  if (article.en) {
    return {
      ...article,
      title: article.en.title || article.title,
      excerpt: article.en.excerpt || article.excerpt,
      content: article.en.content || article.content,
      category: article.en.category || article.category,
      tags: article.en.tags?.length ? article.en.tags : article.tags,
    };
  }

  const cacheKey = `${article.id}:${article.updatedAt}`;
  let cached = runtimeArticleCache.get(cacheKey);
  if (!cached) {
    cached = await buildArticleEnTranslation(article);
    boundCache(runtimeArticleCache, 200);
    runtimeArticleCache.set(cacheKey, cached);
  }
  return {
    ...article,
    title: cached.title,
    excerpt: cached.excerpt,
    content: cached.content,
    category: cached.category,
    tags: cached.tags,
  };
}

export async function localizeArticles(
  articles: ArticleItem[],
  locale: Locale
): Promise<ArticleItem[]> {
  if (locale !== "en") return articles;
  return Promise.all(articles.map((a) => localizeArticle(a, locale)));
}

export async function localizePinnedRepos(
  repos: PinnedRepoItem[],
  locale: Locale
): Promise<PinnedRepoItem[]> {
  if (locale !== "en") return repos;
  return Promise.all(
    repos.map(async (repo) => {
      if (!repo.description || !/[çğıöşüÇĞİÖŞÜ]/.test(repo.description)) {
        return repo;
      }
      let translated = runtimeRepoDescCache.get(repo.description);
      if (!translated) {
        translated = await translateTextTrToEn(repo.description, "auto");
        boundCache(runtimeRepoDescCache, 100);
        runtimeRepoDescCache.set(repo.description, translated);
      }
      return { ...repo, description: translated };
    })
  );
}
