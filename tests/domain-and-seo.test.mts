import test from "node:test";
import assert from "node:assert/strict";
import {
  calculateReadingTime,
  ensureUniqueSlug,
  formatDate,
  getStatusInfo,
  slugify,
} from "../src/lib/utils.ts";
import {
  extractSafeGitHubUsername,
  parsePinnedReposHtml,
} from "../src/lib/github.ts";
import { normalizeDbOnRead } from "../src/lib/db.ts";
import { getGitHubStorageConfig } from "../src/lib/github-storage.ts";
import {
  buildAutoExcerpt,
  sanitizeAboutInput,
  sanitizeAppCreateInput,
  sanitizeAppUpdateInput,
  sanitizeArticleCreateInput,
  sanitizeArticleUpdateInput,
  sanitizeProfileInput,
} from "../src/lib/validators.ts";
import {
  buildAboutProfileJsonLd,
  buildArticleJsonLd,
  buildSoftwareAppJsonLd,
  buildWebsiteAndPersonJsonLd,
} from "../src/lib/seo.ts";

test("11. Slugify Turkish transliteration, unique slug generator, reading time & status labels", () => {
  assert.equal(
    slugify("Çağdaş Öğrenci İşleri & Şifre Çözücü!"),
    "cagdas-ogrenci-isleri-sifre-cozucu"
  );
  assert.equal(slugify("  ---Spring Boot 3.4---  "), "spring-boot-34");

  assert.equal(ensureUniqueSlug("focus-app", []), "focus-app");
  assert.equal(
    ensureUniqueSlug("focus-app", ["focus-app", "focus-app-2"]),
    "focus-app-3"
  );

  assert.equal(calculateReadingTime("kısa metin"), 1);
  assert.equal(calculateReadingTime(new Array(405).fill("kelime").join(" ")), 3);

  assert.ok(formatDate("2026-05-15T10:00:00.000Z", "en").includes("2026"));
  assert.ok(formatDate("2026-05-15T10:00:00.000Z", "tr").includes("2026"));

  assert.equal(getStatusInfo("in-progress", "tr").label, "Geliştiriliyor");
  assert.equal(getStatusInfo("in-progress", "en").label, "In Progress");
  assert.equal(getStatusInfo("unknown-status", "en").label, "Live");
});

test("12. GitHub username extractor & pinned repository HTML parser", () => {
  assert.equal(
    extractSafeGitHubUsername("https://github.com/suleymanibis"),
    "suleymanibis"
  );
  assert.equal(
    extractSafeGitHubUsername("https://evil.example.com/attacker"),
    "suleymanibis"
  );
  assert.equal(
    extractSafeGitHubUsername("https://github.com/-invalid-start"),
    "suleymanibis"
  );

  const sampleHtml = `
    <ol class="d-flex flex-wrap list-style-none gutter-condensed mb-4">
      <li class="mb-3 d-flex flex-content-stretch col-12 col-md-6">
        <div class="Box pinned-item-list-item-content p-3">
          <a href="/suleymanibis/e-commerce-backend">
            <span class="repo">e-commerce-backend</span>
          </a>
          <p class="pinned-item-desc">Spring Boot <b>REST API</b> &amp; Hibernate service</p>
          <span class="repo-language-color" style="background-color: #b07219"></span>
          <span itemprop="programmingLanguage">Java</span>
          <a href="/suleymanibis/e-commerce-backend/stargazers"> 12 </a>
          <a href="/suleymanibis/e-commerce-backend/forks"> 3 </a>
        </div>
      </li>
    </ol>
  `;

  const parsed = parsePinnedReposHtml(sampleHtml, "suleymanibis");
  assert.equal(parsed.length, 1);
  assert.equal(parsed[0].name, "e-commerce-backend");
  assert.equal(parsed[0].owner, "suleymanibis");
  assert.equal(parsed[0].description, "Spring Boot REST API & Hibernate service");
  assert.equal(parsed[0].language, "Java");
  assert.equal(parsed[0].languageColor, "#b07219");
  assert.equal(parsed[0].stars, 12);
  assert.equal(parsed[0].forks, 3);
  assert.equal(
    parsed[0].repoUrl,
    "https://github.com/suleymanibis/e-commerce-backend"
  );
});

test("13. Domain validators normalize & guard App, Article, Profile, and About inputs", () => {
  const badApp = sanitizeAppCreateInput({ title: "Only Title", tagline: "   " });
  assert.equal(badApp.ok, false);

  const goodApp = sanitizeAppCreateInput({
    title: "Görev Yöneticisi",
    tagline: "Hızlı masaüstü aracı",
    status: "invalid-status",
    demoUrl: "javascript:alert(1)",
    repoUrl: "https://github.com/suleymanibis/task-tool",
    techStack: ["Java", "  Spring Boot  ", ""],
    featured: 1,
  });
  assert.equal(goodApp.ok, true);
  if (goodApp.ok) {
    assert.equal(goodApp.value.slug, "gorev-yoneticisi");
    assert.equal(goodApp.value.status, "live");
    assert.equal(goodApp.value.demoUrl, "");
    assert.deepEqual(goodApp.value.techStack, ["Java", "Spring Boot"]);
    assert.equal(goodApp.value.featured, true);
  }

  const appPatch = sanitizeAppUpdateInput({ title: "Yeni Başlık" });
  assert.equal(appPatch.slug, "yeni-baslik");
  assert.equal(appPatch.tagline, undefined);

  const badArticle = sanitizeArticleCreateInput({ title: "Başlık", content: "" });
  assert.equal(badArticle.ok, false);

  const goodArticle = sanitizeArticleCreateInput({
    title: "Backend Mimarisi Notları",
    content: "## Giriş\nSpring Boot ile katmanlı mimari kurulumu.",
    tags: ["Java", "Backend"],
  });
  assert.equal(goodArticle.ok, true);
  if (goodArticle.ok) {
    assert.equal(goodArticle.value.slug, "backend-mimarisi-notlari");
    assert.equal(
      goodArticle.value.excerpt,
      buildAutoExcerpt("## Giriş\nSpring Boot ile katmanlı mimari kurulumu.")
    );
    assert.equal(goodArticle.value.published, true);
  }

  const artPatch = sanitizeArticleUpdateInput({
    content: new Array(250).fill("word").join(" "),
    published: false,
  });
  assert.equal(artPatch.readingTimeMinutes, 2);
  assert.equal(artPatch.published, false);

  const profile = sanitizeProfileInput({
    siteName: "",
    ownerName: "",
    email: "not-an-email",
    instagramUrl: "@suleymanibis",
    discordUrl: "suleyman_handle",
    twitterUrl: "vbscript:msgbox(1)",
  });
  assert.equal(profile.siteName, "suleymanibis.dev");
  assert.equal(profile.ownerName, "Süleyman İbiş");
  assert.equal(profile.email, "");
  assert.equal(profile.instagramUrl, "https://instagram.com/suleymanibis");
  assert.equal(profile.discordUrl, "suleyman_handle");
  assert.equal(profile.twitterUrl, "");

  const about = sanitizeAboutInput({
    headline: "",
    cvUrl: "data:text/html,<script>alert(1)</script>",
    education: [
      { period: "2026", institution: "", title: "", description: "boş kart" },
      {
        period: "2026 — Günümüz",
        institution: "Akdeniz Üniversitesi",
        title: "Bilgisayar Mühendisliği",
        description: "1. Sınıf",
      },
    ],
    skillGroups: [
      { category: "", items: [] },
      { category: "IDE", items: ["IntelliJ IDEA", "VS Code"] },
    ],
  });
  assert.equal(about.headline, "Merhaba, ben Süleyman İbiş.");
  assert.equal(about.cvUrl, "");
  assert.equal(about.education.length, 1);
  assert.equal(about.skillGroups.length, 1);
});

test("14. Database read normalizer & GitHub storage config validator", () => {
  const normalized = normalizeDbOnRead({
    profile: {
      siteName: "suleymanibis.dev",
      ownerName: "Süleyman İbiş",
      roleTitle: "Dev",
      heroGreeting: "Selam",
      bio: "Bio",
      availableForWork: false,
      githubUrl: "https://github.com/suleymanibis",
      twitterUrl: "javascript:evil()",
      instagramUrl: "@suleyman",
      discordUrl: "my_discord",
    },
    apps: [
      {
        id: "app-1",
        title: "Demo",
        slug: "demo",
        tagline: "Tag",
        description: "Desc",
        coverImage: "//evil.com/x.png",
        category: "Web",
        techStack: [],
        demoUrl: "https://suleymanibis.dev",
        status: "live",
        featured: true,
        createdAt: "2026-01-01T00:00:00Z",
        updatedAt: "2026-01-01T00:00:00Z",
      },
    ],
    articles: [],
  });

  assert.equal(normalized.profile.twitterUrl, "");
  assert.equal(normalized.profile.instagramUrl, "https://instagram.com/suleyman");
  assert.equal(normalized.apps[0].coverImage, "");
  assert.ok(normalized.about?.headline);

  const prevToken = process.env.GITHUB_TOKEN;
  const prevRepo = process.env.GITHUB_REPO;
  try {
    process.env.GITHUB_TOKEN = "ghp_testtoken";
    process.env.GITHUB_REPO = "../traversal/bad";
    assert.equal(getGitHubStorageConfig(), null);

    process.env.GITHUB_REPO = "suleymanibis/potfolio-and-apps-website";
    const cfg = getGitHubStorageConfig();
    assert.equal(cfg?.repo, "suleymanibis/potfolio-and-apps-website");
    assert.equal(cfg?.branch, "main");
  } finally {
    if (prevToken === undefined) delete process.env.GITHUB_TOKEN;
    else process.env.GITHUB_TOKEN = prevToken;
    if (prevRepo === undefined) delete process.env.GITHUB_REPO;
    else process.env.GITHUB_REPO = prevRepo;
  }
});

test("15. Schema.org JSON-LD builders emit valid localized graphs & filter non-URL handles", () => {
  const profile = {
    siteName: "suleymanibis.dev",
    ownerName: "Süleyman İbiş",
    roleTitle: "Software Developer",
    heroGreeting: "Workspace",
    bio: "Backend developer",
    location: "Antalya",
    availableForWork: true,
    githubUrl: "https://github.com/suleymanibis",
    instagramUrl: "https://instagram.com/suleymanibis",
    discordUrl: "plain_discord_username", // must NOT appear in sameAs URLs
  };

  const homeGraph = buildWebsiteAndPersonJsonLd(profile, "en") as {
    "@graph": Array<Record<string, unknown>>;
  };
  assert.equal(homeGraph["@graph"].length, 2);
  assert.equal(homeGraph["@graph"][0]["@type"], "WebSite");
  assert.equal(homeGraph["@graph"][0].url, "https://suleymanibis.dev/en");
  const personNode = homeGraph["@graph"][1];
  assert.deepEqual(personNode.sameAs, [
    "https://github.com/suleymanibis",
    "https://instagram.com/suleymanibis",
  ]);

  const aboutSchema = buildAboutProfileJsonLd(
    profile,
    {
      headline: "Hi",
      subheadline: "Sub",
      currentFocus: "Backend",
      storyMarkdown: "Story",
      education: [
        {
          period: "2026",
          institution: "Akdeniz University",
          title: "CE",
          description: "Desc",
        },
      ],
      skillGroups: [{ category: "Backend", items: ["Java", "Spring Boot"] }],
    },
    "en"
  );
  assert.equal(aboutSchema["@type"], "ProfilePage");
  assert.equal(aboutSchema.url, "https://suleymanibis.dev/en/about");
  assert.deepEqual(aboutSchema.mainEntity.knowsAbout, ["Java", "Spring Boot"]);
  assert.equal(aboutSchema.mainEntity.alumniOf?.[0]?.name, "Akdeniz University");

  const articleGraph = buildArticleJsonLd(
    {
      id: "art-1",
      title: "Spring Boot Guide",
      slug: "spring-boot-guide",
      excerpt: "Intro to Spring Boot",
      content: "Body",
      category: "Backend",
      tags: ["Java", "Spring"],
      published: true,
      featured: true,
      readingTimeMinutes: 4,
      createdAt: "2026-10-01T00:00:00Z",
      updatedAt: "2026-10-02T00:00:00Z",
    },
    profile,
    "en"
  ) as { "@graph": Array<Record<string, unknown>> };
  assert.equal(articleGraph["@graph"][0]["@type"], "TechArticle");
  assert.equal(
    articleGraph["@graph"][0].url,
    "https://suleymanibis.dev/en/articles/spring-boot-guide"
  );

  const appGraph = buildSoftwareAppJsonLd(
    {
      id: "app-1",
      title: "CLI Client",
      slug: "cli-client",
      tagline: "Fast CLI",
      description: "Desc",
      category: "Developer Tool",
      techStack: ["Python"],
      version: "v1.2.0",
      status: "open-source",
      featured: true,
      createdAt: "2026-10-01T00:00:00Z",
      updatedAt: "2026-10-02T00:00:00Z",
    },
    profile,
    "tr"
  ) as { "@graph": Array<Record<string, unknown>> };
  assert.equal(appGraph["@graph"][0]["@type"], "SoftwareApplication");
  assert.equal(
    appGraph["@graph"][0].url,
    "https://suleymanibis.dev/apps/cli-client"
  );
});
