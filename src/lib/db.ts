import fs from "fs/promises";
import path from "path";
import type {
  AboutPageData,
  AppItem,
  ArticleItem,
  DatabaseSchema,
  SiteProfile,
} from "@/types";
import {
  sanitizeHttpUrl,
  sanitizeImageUrl,
  sanitizeSocialValue,
} from "@/lib/security";
import {
  getGitHubStorageConfig,
  readGitHubFile,
  writeGitHubJsonFile,
} from "@/lib/github-storage";
import { defaultAboutData, initialSeedData } from "@/lib/seed-data";
import { ensureUniqueSlug } from "@/lib/utils";

export { defaultAboutData };

const DATA_DIR = path.join(process.cwd(), "data");
const DB_FILE = path.join(DATA_DIR, "db.json");
const GITHUB_DB_PATH = "data/db.json";

export function normalizeDbOnRead(rawDb: DatabaseSchema): DatabaseSchema {
  const rawAbout = rawDb.about || structuredClone(defaultAboutData);
  return {
    profile: {
      ...rawDb.profile,
      avatarUrl: sanitizeImageUrl(rawDb.profile?.avatarUrl),
      githubUrl: sanitizeHttpUrl(rawDb.profile?.githubUrl),
      twitterUrl: sanitizeHttpUrl(rawDb.profile?.twitterUrl),
      linkedinUrl: sanitizeHttpUrl(rawDb.profile?.linkedinUrl),
      instagramUrl: sanitizeSocialValue(
        rawDb.profile?.instagramUrl,
        "https://instagram.com/"
      ),
      micupUrl: sanitizeSocialValue(rawDb.profile?.micupUrl),
      discordUrl: sanitizeSocialValue(rawDb.profile?.discordUrl),
    },
    about: {
      ...rawAbout,
      photoUrl: sanitizeImageUrl(rawAbout.photoUrl),
      cvUrl: sanitizeHttpUrl(rawAbout.cvUrl),
      education: Array.isArray(rawAbout.education) ? rawAbout.education : [],
      skillGroups: Array.isArray(rawAbout.skillGroups)
        ? rawAbout.skillGroups
        : [],
    },
    apps: Array.isArray(rawDb.apps)
      ? rawDb.apps.map((app) => ({
          ...app,
          coverImage: sanitizeImageUrl(app.coverImage),
          demoUrl: sanitizeHttpUrl(app.demoUrl),
          repoUrl: sanitizeHttpUrl(app.repoUrl),
          downloadUrl: sanitizeHttpUrl(app.downloadUrl),
        }))
      : [],
    articles: Array.isArray(rawDb.articles)
      ? rawDb.articles.map((art) => ({
          ...art,
          coverImage: sanitizeImageUrl(art.coverImage),
        }))
      : [],
  };
}

async function ensureDb(): Promise<DatabaseSchema> {
  const ghCfg = getGitHubStorageConfig();
  if (ghCfg) {
    try {
      const remote = await readGitHubFile<DatabaseSchema>(ghCfg, GITHUB_DB_PATH);
      if (remote) return normalizeDbOnRead(remote.data);
    } catch {
      // Fallback to bundled file if GitHub temporarily unreachable on read
    }
  }

  try {
    const raw = await fs.readFile(DB_FILE, "utf-8");
    return normalizeDbOnRead(JSON.parse(raw) as DatabaseSchema);
  } catch {
    try {
      await fs.mkdir(DATA_DIR, { recursive: true });
      await fs.writeFile(
        DB_FILE,
        JSON.stringify(initialSeedData, null, 2),
        "utf-8"
      );
    } catch {
      // Read-only serverless filesystem without GitHub config
    }
    return structuredClone(initialSeedData);
  }
}

async function saveDb(data: DatabaseSchema): Promise<void> {
  const ghCfg = getGitHubStorageConfig();
  if (ghCfg) {
    await writeGitHubJsonFile(
      ghCfg,
      GITHUB_DB_PATH,
      data,
      "chore(content): update db.json via admin panel"
    );
    return;
  }

  await fs.mkdir(DATA_DIR, { recursive: true });
  const tempFile = `${DB_FILE}.tmp`;
  await fs.writeFile(tempFile, JSON.stringify(data, null, 2), "utf-8");
  await fs.rename(tempFile, DB_FILE);
}

function sortByNewest<T extends { createdAt: string }>(items: T[]): T[] {
  return [...items].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
}

export async function getDb(): Promise<DatabaseSchema> {
  return ensureDb();
}

export async function getProfile(): Promise<SiteProfile> {
  const db = await ensureDb();
  return db.profile;
}

export async function updateProfile(
  profile: Partial<SiteProfile>
): Promise<SiteProfile> {
  const db = await ensureDb();
  db.profile = { ...db.profile, ...profile };
  await saveDb(db);
  return db.profile;
}

export async function getAbout(): Promise<AboutPageData> {
  const db = await ensureDb();
  return db.about || structuredClone(defaultAboutData);
}

export async function updateAbout(
  about: AboutPageData
): Promise<AboutPageData> {
  const db = await ensureDb();
  db.about = {
    ...about,
    updatedAt: new Date().toISOString(),
  };
  await saveDb(db);
  return db.about;
}

export async function getApps(): Promise<AppItem[]> {
  const db = await ensureDb();
  return sortByNewest(db.apps);
}

export async function getAppBySlug(slug: string): Promise<AppItem | undefined> {
  const db = await ensureDb();
  return db.apps.find((a) => a.slug === slug);
}

export async function createApp(
  item: Omit<AppItem, "id" | "createdAt" | "updatedAt">
): Promise<AppItem> {
  const db = await ensureDb();
  const now = new Date().toISOString();
  const uniqueSlug = ensureUniqueSlug(
    item.slug,
    db.apps.map((a) => a.slug)
  );
  const newApp: AppItem = {
    ...item,
    slug: uniqueSlug,
    id: `app-${Date.now()}`,
    createdAt: now,
    updatedAt: now,
  };
  db.apps.unshift(newApp);
  await saveDb(db);
  return newApp;
}

export async function updateApp(
  id: string,
  updates: Partial<AppItem>
): Promise<AppItem | null> {
  const db = await ensureDb();
  const index = db.apps.findIndex((a) => a.id === id);
  if (index === -1) return null;

  const normalizedUpdates = { ...updates };
  if (
    normalizedUpdates.slug &&
    normalizedUpdates.slug !== db.apps[index].slug
  ) {
    normalizedUpdates.slug = ensureUniqueSlug(
      normalizedUpdates.slug,
      db.apps.filter((_, i) => i !== index).map((a) => a.slug)
    );
  }

  db.apps[index] = {
    ...db.apps[index],
    ...normalizedUpdates,
    id: db.apps[index].id,
    updatedAt: new Date().toISOString(),
  };
  await saveDb(db);
  return db.apps[index];
}

export async function deleteApp(id: string): Promise<boolean> {
  const db = await ensureDb();
  const prevLen = db.apps.length;
  db.apps = db.apps.filter((a) => a.id !== id);
  if (db.apps.length === prevLen) return false;
  await saveDb(db);
  return true;
}

export async function getArticles(includeDrafts = false): Promise<ArticleItem[]> {
  const db = await ensureDb();
  const filtered = includeDrafts
    ? db.articles
    : db.articles.filter((a) => a.published);
  return sortByNewest(filtered);
}

export async function getArticleBySlug(
  slug: string,
  includeDrafts = false
): Promise<ArticleItem | undefined> {
  const db = await ensureDb();
  return db.articles.find(
    (a) => a.slug === slug && (includeDrafts || a.published)
  );
}

export async function createArticle(
  item: Omit<ArticleItem, "id" | "createdAt" | "updatedAt">
): Promise<ArticleItem> {
  const db = await ensureDb();
  const now = new Date().toISOString();
  const uniqueSlug = ensureUniqueSlug(
    item.slug,
    db.articles.map((a) => a.slug)
  );
  const newArticle: ArticleItem = {
    ...item,
    slug: uniqueSlug,
    id: `art-${Date.now()}`,
    createdAt: now,
    updatedAt: now,
  };
  db.articles.unshift(newArticle);
  await saveDb(db);
  return newArticle;
}

export async function updateArticle(
  id: string,
  updates: Partial<ArticleItem>
): Promise<ArticleItem | null> {
  const db = await ensureDb();
  const index = db.articles.findIndex((a) => a.id === id);
  if (index === -1) return null;

  const normalizedUpdates = { ...updates };
  if (
    normalizedUpdates.slug &&
    normalizedUpdates.slug !== db.articles[index].slug
  ) {
    normalizedUpdates.slug = ensureUniqueSlug(
      normalizedUpdates.slug,
      db.articles.filter((_, i) => i !== index).map((a) => a.slug)
    );
  }

  db.articles[index] = {
    ...db.articles[index],
    ...normalizedUpdates,
    id: db.articles[index].id,
    updatedAt: new Date().toISOString(),
  };
  await saveDb(db);
  return db.articles[index];
}

export async function deleteArticle(id: string): Promise<boolean> {
  const db = await ensureDb();
  const prevLen = db.articles.length;
  db.articles = db.articles.filter((a) => a.id !== id);
  if (db.articles.length === prevLen) return false;
  await saveDb(db);
  return true;
}
