import type {
  AboutPageData,
  AppItem,
  ArticleItem,
  Locale,
  SiteProfile,
} from "@/types";

export const SITE_URL = "https://suleymanibis.dev";

export function absoluteUrl(pathOrUrl?: string): string {
  if (!pathOrUrl) return `${SITE_URL}/logo.jpg`;
  if (/^https?:\/\//i.test(pathOrUrl)) return pathOrUrl;
  const clean = pathOrUrl.startsWith("/") ? pathOrUrl : `/${pathOrUrl}`;
  return `${SITE_URL}${clean}`;
}

export function canonicalUrlFor(cleanPath: string, locale: Locale): string {
  const normalized = cleanPath.startsWith("/") ? cleanPath : `/${cleanPath}`;
  if (locale === "en") {
    return normalized === "/" ? `${SITE_URL}/en` : `${SITE_URL}/en${normalized}`;
  }
  return normalized === "/" ? SITE_URL : `${SITE_URL}${normalized}`;
}

export function buildAlternates(cleanPath: string, locale: Locale) {
  const trUrl = canonicalUrlFor(cleanPath, "tr");
  const enUrl = canonicalUrlFor(cleanPath, "en");
  return {
    canonical: locale === "en" ? enUrl : trUrl,
    languages: {
      "tr-TR": trUrl,
      "en-US": enUrl,
      "x-default": trUrl,
    },
  };
}

/**
 * Safely serializes JSON-LD into a string suitable for <script type="application/ld+json">,
 * escaping `<`, `>`, and `&` to prevent script-breakout XSS.
 */
export function serializeSafeJsonLd(data: unknown): string {
  return JSON.stringify(data)
    .replace(/</g, "\\u003c")
    .replace(/>/g, "\\u003e")
    .replace(/&/g, "\\u0026");
}

function collectSocialSameAs(profile: SiteProfile): string[] {
  const candidates = [
    profile.githubUrl,
    profile.linkedinUrl,
    profile.twitterUrl,
    profile.instagramUrl,
    profile.micupUrl,
    profile.discordUrl,
  ];
  return candidates.filter((u): u is string =>
    Boolean(u && /^https?:\/\//i.test(u))
  );
}

export function buildPersonEntity(profile: SiteProfile, locale: Locale) {
  return {
    "@type": "Person",
    "@id": `${SITE_URL}/#person`,
    name: profile.ownerName,
    url: canonicalUrlFor("/about", locale),
    image: absoluteUrl(profile.avatarUrl || "/logo.jpg"),
    jobTitle: profile.roleTitle,
    ...(profile.location
      ? {
          homeLocation: {
            "@type": "Place",
            name: profile.location,
          },
        }
      : {}),
    sameAs: collectSocialSameAs(profile),
  };
}

export function buildWebsiteAndPersonJsonLd(
  profile: SiteProfile,
  locale: Locale
) {
  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebSite",
        "@id": `${SITE_URL}/#website`,
        url: canonicalUrlFor("/", locale),
        name: profile.siteName,
        description: profile.heroGreeting,
        inLanguage: locale === "en" ? "en-US" : "tr-TR",
        publisher: { "@id": `${SITE_URL}/#person` },
      },
      buildPersonEntity(profile, locale),
    ],
  };
}

export function buildAboutProfileJsonLd(
  profile: SiteProfile,
  about: AboutPageData,
  locale: Locale
) {
  const allSkills = about.skillGroups.flatMap((g) => g.items);
  return {
    "@context": "https://schema.org",
    "@type": "ProfilePage",
    url: canonicalUrlFor("/about", locale),
    name: about.headline,
    description: about.subheadline,
    inLanguage: locale === "en" ? "en-US" : "tr-TR",
    mainEntity: {
      ...buildPersonEntity(profile, locale),
      description: about.subheadline || profile.bio,
      ...(about.photoUrl ? { image: absoluteUrl(about.photoUrl) } : {}),
      ...(allSkills.length > 0 ? { knowsAbout: allSkills } : {}),
      ...(about.education.length > 0
        ? {
            alumniOf: about.education.map((ed) => ({
              "@type": "CollegeOrUniversity",
              name: ed.institution,
            })),
          }
        : {}),
    },
  };
}

export function buildArticleJsonLd(
  article: ArticleItem,
  profile: SiteProfile,
  locale: Locale
) {
  const url = canonicalUrlFor(`/articles/${article.slug}`, locale);
  const articlesIndexUrl = canonicalUrlFor("/articles", locale);
  const homeUrl = canonicalUrlFor("/", locale);

  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "TechArticle",
        "@id": `${url}#article`,
        url,
        mainEntityOfPage: {
          "@type": "WebPage",
          "@id": url,
        },
        headline: article.title,
        description: article.excerpt,
        image: [absoluteUrl(article.coverImage)],
        datePublished: article.createdAt,
        dateModified: article.updatedAt || article.createdAt,
        inLanguage: locale === "en" ? "en-US" : "tr-TR",
        articleSection: article.category,
        keywords: article.tags.join(", "),
        timeRequired: `PT${Math.max(1, article.readingTimeMinutes)}M`,
        author: buildPersonEntity(profile, locale),
        publisher: buildPersonEntity(profile, locale),
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          {
            "@type": "ListItem",
            position: 1,
            name: locale === "en" ? "Home" : "Ana Sayfa",
            item: homeUrl,
          },
          {
            "@type": "ListItem",
            position: 2,
            name: locale === "en" ? "Articles" : "Makaleler",
            item: articlesIndexUrl,
          },
          {
            "@type": "ListItem",
            position: 3,
            name: article.title,
            item: url,
          },
        ],
      },
    ],
  };
}

export function buildSoftwareAppJsonLd(
  app: AppItem,
  profile: SiteProfile,
  locale: Locale
) {
  const url = canonicalUrlFor(`/apps/${app.slug}`, locale);
  const appsIndexUrl = canonicalUrlFor("/apps", locale);
  const homeUrl = canonicalUrlFor("/", locale);

  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "SoftwareApplication",
        name: app.title,
        description: app.tagline,
        url: app.demoUrl || url,
        image: absoluteUrl(app.coverImage),
        applicationCategory: "DeveloperApplication",
        operatingSystem: "Web, Windows, Cross-platform",
        inLanguage: locale === "en" ? "en-US" : "tr-TR",
        datePublished: app.createdAt,
        dateModified: app.updatedAt || app.createdAt,
        ...(app.version ? { softwareVersion: app.version } : {}),
        ...(app.downloadUrl ? { downloadUrl: app.downloadUrl } : {}),
        author: buildPersonEntity(profile, locale),
        offers: {
          "@type": "Offer",
          price: "0",
          priceCurrency: "USD",
        },
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          {
            "@type": "ListItem",
            position: 1,
            name: locale === "en" ? "Home" : "Ana Sayfa",
            item: homeUrl,
          },
          {
            "@type": "ListItem",
            position: 2,
            name: locale === "en" ? "Applications" : "Uygulamalar",
            item: appsIndexUrl,
          },
          {
            "@type": "ListItem",
            position: 3,
            name: app.title,
            item: url,
          },
        ],
      },
    ],
  };
}
