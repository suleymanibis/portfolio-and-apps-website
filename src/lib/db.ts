import fs from "fs/promises";
import path from "path";
import {
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

const DATA_DIR = path.join(process.cwd(), "data");
const DB_FILE = path.join(DATA_DIR, "db.json");

export const defaultAboutData: AboutPageData = {
  headline: "Merhaba, ben Süleyman İbiş.",
  subheadline:
    "Akdeniz Üniversitesi Bilgisayar Mühendisliği 1. sınıf öğrencisiyim. Backend sistemleri araştırmaya, öğrenmeye ve uçtan uca çalışan yazılımlar geliştirmeye odaklanıyorum.",
  photoUrl: "",
  cvUrl: "",
  currentFocus:
    "Şu sıralar backend sistemlerinin mimarisini araştırıp öğreniyor; Java (Spring Boot & Hibernate), PostgreSQL ve bu servislerle haberleşen Python CLI ile C# (.NET) istemci uygulamaları geliştiriyorum.",
  storyMarkdown: `## Yazılım Yolculuğum Nasıl Başladı?

Bilgisayarlara ve yazılıma olan merakım ortaokul **5. sınıftaki bilgisayar dersinde** başladı. Ekranda gördüğüm programların arka planda nasıl çalıştığını kurcalama isteği, zamanla kendi araçlarımı ve projelerimi üretme tutkusuna dönüştü.

Antalya'da **Akdeniz Üniversitesi**'nde **B2** seviyesinde İngilizce hazırlık eğitimimi tamamladıktan sonra şu an **Bilgisayar Mühendisliği 1. sınıf** öğrencisi olarak akademik eğitimime devam ediyorum.

## Nasıl Üretiyor ve Neye Odaklanıyorum?

Bir yazılımı yalnızca tek bir katmandan ibaret görmek yerine, arka uçtan istemciye kadar **uçtan uca nasıl haberleştiğini** deneyimleyerek öğrenmeyi seviyorum. Örneğin Java ile geliştirdiğim bir e-ticaret REST API servisini hem **Python** tabanlı bir komut satırı (CLI) istemcisiyle hem de **C# (.NET WinForms)** ile yazdığım masaüstü arayüzüyle entegre ederek çok katmanlı sistem pratikleri yapıyorum.

Farklı disiplinleri tanımak adına zaman zaman *Unity* ve *Godot* gibi oyun motorlarıyla da kişisel denemeler yaptım; ancak asıl enerjimi ve mühendislik odağımı **backend sistemleri, API tasarımı ve veritabanı mimarisi** üzerine kurdum.`,
  education: [
    {
      period: "2026 — Günümüz",
      institution: "Akdeniz Üniversitesi",
      title: "Bilgisayar Mühendisliği Lisans (1. Sınıf)",
      description:
        "Antalya'da bilgisayar bilimleri temelleri, algoritmalar ve yazılım mühendisliği üzerine lisans eğitimime devam ediyorum.",
    },
    {
      period: "2025 — 2026",
      institution: "Akdeniz Üniversitesi Yabancı Diller Yüksekokulu",
      title: "İngilizce Hazırlık Eğitimi (B2 Seviyesi)",
      description:
        "Global teknik dokümantasyonları ve yazılım kaynaklarını doğrudan takip edebilecek yetkinlikte B2 seviye İngilizce hazırlık eğitimini tamamladım.",
    },
  ],
  skillGroups: [
    {
      category: "Diller & Backend Teknolojileri",
      items: [
        "Java",
        "Spring Boot",
        "Hibernate",
        "Python",
        "C#",
        ".NET (WinForms)",
        "RESTful API",
        "PostgreSQL",
      ],
    },
    {
      category: "IDE & Geliştirme Ortamları",
      items: [
        "IntelliJ IDEA",
        "VS Code",
        "Visual Studio",
        "Eclipse",
        "Atom",
        "Git & GitHub",
      ],
    },
    {
      category: "Bulut, Dağıtım & Keşfettiklerim",
      items: [
        "Vercel",
        "Render",
        "CLI & Masaüstü İstemciler",
        "Unity & Godot (Kişisel Denemeler)",
      ],
    },
  ],
  en: {
    headline: "Hi there, I'm Süleyman İbiş.",
    subheadline:
      "First-year Computer Engineering student at Akdeniz University, focused on researching, learning, and building reliable backend systems and end-to-end software.",
    currentFocus:
      "Currently researching and learning backend system architectures while building practical services with Java (Spring Boot & Hibernate), PostgreSQL, and multi-client tools in Python CLI and C# (.NET).",
    storyMarkdown: `## How My Software Journey Started

My curiosity for computers and software sparked back in **5th-grade computer class**. Wanting to understand how the programs on my screen actually worked behind the scenes gradually evolved into a passion for building software of my own.

After completing my **B2-level** English preparatory year at **Akdeniz University** in Antalya, I am currently pursuing my **first year in Computer Engineering**.

## How I Build & What I Focus On

Rather than viewing software through a single layer, I enjoy learning how systems communicate **end to end**—from database and API design all the way to client applications. For example, I built a Java e-commerce REST API and paired it with both a **Python CLI** client and a **C# (.NET WinForms)** desktop interface to practice multi-client architecture firsthand.

Out of curiosity for different domains, I have also experimented locally with game engines like *Unity* and *Godot*, while dedicating my main engineering focus to **backend systems, RESTful APIs, and database architecture**.`,
    education: [
      {
        period: "2026 — Present",
        institution: "Akdeniz University",
        title: "B.Sc. in Computer Engineering (Freshman / Year 1)",
        description:
          "Pursuing undergraduate studies in computer science fundamentals, algorithms, and software engineering in Antalya, Türkiye.",
      },
      {
        period: "2025 — 2026",
        institution: "Akdeniz University School of Foreign Languages",
        title: "English Preparatory Program (B2 Level)",
        description:
          "Completed intensive B2-level English preparatory education, enabling fluent engagement with technical documentation and engineering literature.",
      },
    ],
    skillGroups: [
      {
        category: "Languages & Backend Stack",
        items: [
          "Java",
          "Spring Boot",
          "Hibernate",
          "Python",
          "C#",
          ".NET (WinForms)",
          "RESTful API",
          "PostgreSQL",
        ],
      },
      {
        category: "IDEs & Development Environments",
        items: [
          "IntelliJ IDEA",
          "VS Code",
          "Visual Studio",
          "Eclipse",
          "Atom",
          "Git & GitHub",
        ],
      },
      {
        category: "Deployment & Explored Tools",
        items: [
          "Vercel",
          "Render",
          "CLI & Desktop Clients",
          "Unity & Godot (Personal Exploration)",
        ],
      },
    ],
  },
};

const initialSeedData: DatabaseSchema = {
  profile: {
    siteName: "suleymanibis.dev",
    ownerName: "Süleyman İbiş",
    roleTitle: "Yazılım Geliştirici & Bilgisayar Mühendisliği Öğrencisi",
    heroGreeting:
      "Geliştirdiğim uygulamaları ve teknik makalelerimi paylaştığım dijital çalışma alanım.",
    bio: "Backend sistemleri, modern web uygulamaları ve geliştirici araçları üzerine projeler üretiyorum. Burada yayına aldığım yazılımları inceleyebilir ve yazılım mühendisliği süreçlerine dair yazdığım makaleleri okuyabilirsiniz.",
    location: "Antalya, Türkiye",
    availableForWork: false,
    githubUrl: "https://github.com/suleymanibis",
    twitterUrl: "",
    linkedinUrl: "",
    instagramUrl: "",
    micupUrl: "",
    discordUrl: "",
    email: "",
  },
  about: defaultAboutData,
  apps: [],
  articles: [],
};

function getGitHubStorageConfig() {
  const token = process.env.GITHUB_TOKEN?.trim();
  const repo = process.env.GITHUB_REPO?.trim();
  const branch = process.env.GITHUB_BRANCH?.trim() || "main";
  if (token && repo && /^[\w.-]+\/[\w.-]+$/.test(repo)) {
    return { token, repo, branch };
  }
  return null;
}

async function readDbFromGitHub(cfg: {
  token: string;
  repo: string;
  branch: string;
}): Promise<{ data: DatabaseSchema; sha?: string } | null> {
  const url = `https://api.github.com/repos/${cfg.repo}/contents/data/db.json?ref=${encodeURIComponent(
    cfg.branch
  )}`;
  const res = await fetch(url, {
    headers: {
      Authorization: `Bearer ${cfg.token}`,
      Accept: "application/vnd.github+json",
      "X-GitHub-Api-Version": "2022-11-28",
    },
    cache: "no-store",
  });

  if (res.status === 404) return null;
  if (!res.ok) {
    throw new Error(`GitHub okuma hatası: ${res.status}`);
  }

  const json = (await res.json()) as { content: string; sha: string };
  const decoded = Buffer.from(json.content, "base64").toString("utf-8");
  return { data: JSON.parse(decoded) as DatabaseSchema, sha: json.sha };
}

async function writeDbToGitHub(
  cfg: { token: string; repo: string; branch: string },
  data: DatabaseSchema,
  commitMessage = "chore(content): update db.json via admin panel"
): Promise<void> {
  const existing = await readDbFromGitHub(cfg);
  const url = `https://api.github.com/repos/${cfg.repo}/contents/data/db.json`;
  const contentB64 = Buffer.from(
    JSON.stringify(data, null, 2),
    "utf-8"
  ).toString("base64");

  const res = await fetch(url, {
    method: "PUT",
    headers: {
      Authorization: `Bearer ${cfg.token}`,
      Accept: "application/vnd.github+json",
      "Content-Type": "application/json",
      "X-GitHub-Api-Version": "2022-11-28",
    },
    body: JSON.stringify({
      message: commitMessage,
      content: contentB64,
      branch: cfg.branch,
      ...(existing?.sha ? { sha: existing.sha } : {}),
    }),
  });

  if (!res.ok) {
    throw new Error(`GitHub yazma hatası: ${res.status}`);
  }
}

function normalizeDbOnRead(rawDb: DatabaseSchema): DatabaseSchema {
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
      const remote = await readDbFromGitHub(ghCfg);
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
    await writeDbToGitHub(ghCfg, data);
    return;
  }

  await fs.mkdir(DATA_DIR, { recursive: true });
  const tempFile = `${DB_FILE}.tmp`;
  await fs.writeFile(tempFile, JSON.stringify(data, null, 2), "utf-8");
  await fs.rename(tempFile, DB_FILE);
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
  return [...db.apps].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
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
  let uniqueSlug = item.slug;
  let counter = 2;
  while (db.apps.some((a) => a.slug === uniqueSlug)) {
    uniqueSlug = `${item.slug}-${counter++}`;
  }
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

  if (updates.slug && updates.slug !== db.apps[index].slug) {
    let candidate = updates.slug;
    let counter = 2;
    while (db.apps.some((a, i) => i !== index && a.slug === candidate)) {
      candidate = `${updates.slug}-${counter++}`;
    }
    updates.slug = candidate;
  }

  db.apps[index] = {
    ...db.apps[index],
    ...updates,
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
  return [...filtered].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
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
  let uniqueSlug = item.slug;
  let counter = 2;
  while (db.articles.some((a) => a.slug === uniqueSlug)) {
    uniqueSlug = `${item.slug}-${counter++}`;
  }
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

  if (updates.slug && updates.slug !== db.articles[index].slug) {
    let candidate = updates.slug;
    let counter = 2;
    while (db.articles.some((a, i) => i !== index && a.slug === candidate)) {
      candidate = `${updates.slug}-${counter++}`;
    }
    updates.slug = candidate;
  }

  db.articles[index] = {
    ...db.articles[index],
    ...updates,
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
