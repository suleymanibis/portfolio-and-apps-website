import type { MetadataRoute } from "next";
import { getAbout, getApps, getArticles } from "@/lib/db";
import { canonicalUrlFor } from "@/lib/seo";

export const dynamic = "force-dynamic";

function makeBilingualEntries(
  cleanPath: string,
  lastModified: Date,
  changeFrequency: MetadataRoute.Sitemap[number]["changeFrequency"],
  priority: number
): MetadataRoute.Sitemap {
  const trUrl = canonicalUrlFor(cleanPath, "tr");
  const enUrl = canonicalUrlFor(cleanPath, "en");
  const languages = {
    "tr-TR": trUrl,
    "en-US": enUrl,
  };

  return [
    {
      url: trUrl,
      lastModified,
      changeFrequency,
      priority,
      alternates: { languages },
    },
    {
      url: enUrl,
      lastModified,
      changeFrequency,
      priority: Math.max(0.5, Number((priority - 0.05).toFixed(2))),
      alternates: { languages },
    },
  ];
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [apps, articles, about] = await Promise.all([
    getApps(),
    getArticles(false),
    getAbout(),
  ]);

  const now = new Date();
  const aboutDate = about.updatedAt ? new Date(about.updatedAt) : now;

  const staticRoutes: MetadataRoute.Sitemap = [
    ...makeBilingualEntries("/", now, "daily", 1.0),
    ...makeBilingualEntries("/articles", now, "daily", 0.9),
    ...makeBilingualEntries("/apps", now, "weekly", 0.9),
    ...makeBilingualEntries("/repos", now, "daily", 0.85),
    ...makeBilingualEntries("/about", aboutDate, "monthly", 0.8),
  ];

  const articleRoutes: MetadataRoute.Sitemap = articles.flatMap((article) =>
    makeBilingualEntries(
      `/articles/${article.slug}`,
      new Date(article.updatedAt || article.createdAt),
      "weekly",
      0.85
    )
  );

  const appRoutes: MetadataRoute.Sitemap = apps.flatMap((app) =>
    makeBilingualEntries(
      `/apps/${app.slug}`,
      new Date(app.updatedAt || app.createdAt),
      "monthly",
      0.8
    )
  );

  return [...staticRoutes, ...articleRoutes, ...appRoutes];
}
