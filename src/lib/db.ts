import fs from "fs/promises";
import path from "path";
import { AppItem, ArticleItem, DatabaseSchema, SiteProfile } from "@/types";
import { sanitizeHttpUrl, sanitizeImageUrl } from "@/lib/security";

const DATA_DIR = path.join(process.cwd(), "data");
const DB_FILE = path.join(DATA_DIR, "db.json");

const initialSeedData: DatabaseSchema = {
  profile: {
    siteName: "suleymanibis.dev",
    ownerName: "Süleyman İbiş",
    roleTitle: "Yazılım Geliştirici & Bilgisayar Mühendisliği Öğrencisi",
    heroGreeting: "Geliştirdiğim uygulamaları ve teknik makalelerimi paylaştığım dijital çalışma alanım.",
    bio: "Backend sistemleri, modern web uygulamaları ve geliştirici araçları üzerine projeler üretiyorum. Burada yayına aldığım yazılımları inceleyebilir ve yazılım mühendisliği süreçlerine dair yazdığım makaleleri okuyabilirsiniz.",
    location: "Türkiye",
    availableForWork: true,
    githubUrl: "https://github.com/suleymanibis",
    twitterUrl: "",
    linkedinUrl: "",
    email: "",
  },
  apps: [
    {
      id: "app-1",
      title: "FocusFlow Pomodoro & Görev Yöneticisi",
      slug: "focusflow-pomodoro-gorev-yoneticisi",
      tagline: "Derin çalışma seanslarınızı takip eden minimalist masaüstü ve web üretkenlik aracı.",
      description: `## Proje Hakkında

**FocusFlow**, dikkat dağıtıcı unsurları en aza indirerek günlük görevlerinizi Pomodoro tekniğiyle birleştiren modern bir üretkenlik uygulamasıdır.

### Öne Çıkan Özellikler
- **Akıllı Zamanlayıcı:** Özelleştirilebilir çalışma ve mola periyotları.
- **Klavye Kısayolları:** Fareye dokunmadan görev ekleme ve zamanlayıcı başlatma.
- **Haftalık İstatistikler:** Hangi projeye ne kadar vakit ayırdığınızı gösteren grafikler.
- **Çevrimdışı Çalışma:** Yerel depolama desteği ile internet olmadan da kesintisiz kullanım.`,
      category: "Üretkenlik",
      techStack: ["Next.js", "TypeScript", "Tailwind CSS", "IndexedDB"],
      demoUrl: "https://suleymanibis.dev",
      repoUrl: "https://github.com/suleymanibis",
      version: "v1.4.0",
      status: "live",
      featured: true,
      createdAt: "2026-09-15T10:00:00.000Z",
      updatedAt: "2026-10-20T14:30:00.000Z",
    },
    {
      id: "app-2",
      title: "Commerce Cart Backend & İstemci Araçları",
      slug: "commerce-cart-backend-ve-istemci-araclari",
      tagline: "E-ticaret sepet ve sipariş akışlarını simüle eden REST API ve çoklu istemci mimarisi.",
      description: `## Mimari Genel Bakış

Modern e-ticaret sistemlerindeki sepet, stok ve sipariş doğrulama süreçlerini simüle eden uçtan uca bir yazılım ailesidir.

### Bileşenler
1. **REST API Sunucusu:** Katmanlı mimari ve veritabanı bütünlüğü odaklı arka uç servisi.
2. **Masaüstü Arayüzü (.NET WinForms):** API uç noktalarıyla etkileşim kuran görsel istemci.
3. **Python CLI İstemcisi:** Terminal üzerinden hızlı test ve otomasyon aracı.`,
      category: "Backend & Sistem",
      techStack: ["Java", "Spring Boot", "C# .NET", "Python", "PostgreSQL"],
      repoUrl: "https://github.com/suleymanibis",
      version: "v2.0.0",
      status: "open-source",
      featured: true,
      createdAt: "2026-08-10T09:00:00.000Z",
      updatedAt: "2026-10-05T11:15:00.000Z",
    },
  ],
  articles: [
    {
      id: "art-1",
      title: "Vibe Coding ile Fikirden Ürüne: Hızlı Prototipleme Rehberi",
      slug: "vibe-coding-ile-fikirden-urune-hizli-prototipleme-rehberi",
      excerpt: "Yapay zeka destekli geliştirme araçlarıyla yazılım üretirken kod kalitesini, güvenliği ve mimari bütünlüğü korumanın pratik yolları.",
      content: `Yazılım geliştirme dünyası son yıllarda büyük bir dönüşüm geçiriyor. Artık bir fikri çalışan bir prototipe dönüştürmek haftalar değil, saatler sürüyor. Ancak hız kazandıkça **mimari disiplin** ve **güvenlik** her zamankinden daha önemli hale geliyor.

## 1. Önce Veri Modelini Netleştirin

Kod yazmaya başlamadan önce uygulamanızın temel veri tiplerini belirlemek, ileride yaşanacak karmaşayı önler:

\`\`\`typescript
interface Project {
  id: string;
  name: string;
  status: "draft" | "published";
  tags: string[];
}
\`\`\`

## 2. Güvenliği Sonraya Bırakmayın

Ürünü canlıya almadan önce kimlik doğrulama, hız sınırlandırma (rate limiting), girdi doğrulama ve HTTP güvenlik başlıklarını mutlaka devreye alın.

> İyi bir ürün, karmaşık özelliklerin yığını değil; tek bir problemi güvenli ve pürüzsüzce çözen sade bir sistemdir.`,
      category: "Yazılım Geliştirme",
      tags: ["Vibe Coding", "Mimari", "Güvenlik", "TypeScript"],
      published: true,
      featured: true,
      readingTimeMinutes: 3,
      createdAt: "2026-10-25T12:00:00.000Z",
      updatedAt: "2026-10-25T12:00:00.000Z",
    },
  ],
};

function getGitHubStorageConfig() {
  const token = process.env.GITHUB_TOKEN?.trim();
  const repo = process.env.GITHUB_REPO?.trim(); // e.g. "suleymanibis/portfolio-hub"
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
  const contentB64 = Buffer.from(JSON.stringify(data, null, 2), "utf-8").toString(
    "base64"
  );

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
  return {
    profile: {
      ...rawDb.profile,
      avatarUrl: sanitizeImageUrl(rawDb.profile?.avatarUrl),
      githubUrl: sanitizeHttpUrl(rawDb.profile?.githubUrl),
      twitterUrl: sanitizeHttpUrl(rawDb.profile?.twitterUrl),
      linkedinUrl: sanitizeHttpUrl(rawDb.profile?.linkedinUrl),
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
