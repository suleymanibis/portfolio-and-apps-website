import type { Locale } from "@/types";

export const LANG_COOKIE_NAME = "site_lang";

export async function getLocale(): Promise<Locale> {
  try {
    const { cookies } = await import("next/headers");
    const cookieStore = await cookies();
    const val = cookieStore.get(LANG_COOKIE_NAME)?.value;
    return val === "en" ? "en" : "tr";
  } catch {
    return "tr";
  }
}

export const dictionaries = {
  tr: {
    metaDefaultSuffix: "Uygulamalar & Makaleler",
    nav: {
      home: "Ana Sayfa",
      apps: "Uygulamalar",
      repos: "GitHub Repoları",
      articles: "Makaleler",
      admin: "Yönetim",
      adminPanel: "Yönetim Paneli",
      toggleMenu: "Menüyü aç/kapat",
    },
    hero: {
      available: "Yeni projelere & iş birliklerine açık",
      exploreApps: "Uygulamaları Keşfet",
      githubRepos: "GitHub Repoları",
      readArticles: "Makaleleri Oku",
      statApps: "Yayınlanan Uygulama",
      statRepos: "Sabitli GitHub Reposu",
      statArticles: "Teknik Makale & Yazı",
    },
    home: {
      pinnedBadge: "GitHub • Sabitlenenler",
      pinnedTitle: "Sabitlenen GitHub Repolarım",
      appsBadge: "Uygulama Vitrini",
      appsTitle: "Geliştirdiğim Uygulamalar",
      articlesBadge: "Blog & Notlar",
      articlesTitle: "Son Yazılan Makaleler",
      viewAll: "Tümünü Gör",
      allArticles: "Tüm Yazılar",
      noApps: "Henüz uygulama eklenmemiş.",
      noArticles: "Henüz yayınlanmış makale bulunmuyor.",
    },
    apps: {
      metaTitle: "Uygulamalar",
      metaDesc: "Geliştirdiğim web, masaüstü ve açık kaynak uygulamaların tamamı.",
      notFoundTitle: "Uygulama Bulunamadı",
      badge: "Portfolyo & Ürünler",
      title: "Uygulamalarım",
      subtitle:
        "Geliştirdiğim ve yayına aldığım projeleri inceleyebilir, canlı demolarını test edebilir veya kaynak kodlarına göz atabilirsiniz.",
      searchPlaceholder: "Uygulama adı veya teknoloji ara...",
      allCategory: "Tümü",
      emptySearch: "Arama kriterlerinize uygun uygulama bulunamadı.",
      viewDetails: "Detayları İncele",
      code: "Kod",
      demo: "Demo",
      backToAll: "Tüm Uygulamalara Dön",
      openLive: "Canlı Uygulamayı Aç",
      download: "İndir",
      sourceCode: "Kaynak Kod (GitHub)",
      techStack: "Teknolojiler:",
    },
    repos: {
      metaTitle: "GitHub Repoları",
      metaDesc:
        "GitHub profilimde sabitlediğim açık kaynak projeler, API mimarileri ve yazılım çalışmaları.",
      badgePrefix: "GitHub",
      title: "Sabitlenen GitHub Repolarım",
      subtitle:
        "GitHub profilimde öne çıkardığım açık kaynak projeler otomatik olarak senkronize edilir. GitHub üzerinde sabitlediğim repolar değiştikçe bu sayfa da güncellenir.",
      openProfile: "GitHub Profilini Aç",
      searchPlaceholder: "Repo adı, açıklama veya dil ara...",
      allLang: "Tümü",
      emptySearch: "Arama kriterlerinize uygun GitHub reposu bulunamadı.",
      pinnedTag: "Sabitli",
      liveLink: "Canlı",
      defaultDesc: "GitHub üzerinde paylaşılan açık kaynak yazılım deposu.",
    },
    articles: {
      metaTitle: "Makaleler",
      metaDesc:
        "Yazılım geliştirme, mimari, üretkenlik ve teknoloji üzerine makaleler.",
      notFoundTitle: "Makale Bulunamadı",
      badge: "Teknik Blog & Notlar",
      title: "Makaleler",
      subtitle:
        "Uygulama geliştirirken edindiğim deneyimleri, mimari notları ve modern geliştirici araçları üzerine yazılarımı burada paylaşıyorum.",
      searchPlaceholder: "Makale başlığı, konu veya etiket ara...",
      allTag: "Tümü",
      emptySearch: "Aramanıza uygun makale bulunamadı.",
      minRead: "dk okuma",
      readMore: "Yazıyı Oku",
      backToAll: "Tüm Makaleler",
      draftPreview: "Taslak Önizleme",
      authorLabel: "Yazar",
      authorCta: "Geliştirdiğim Uygulamaları Gör",
      share: "Paylaş",
      copiedLink: "Bağlantı Kopyalandı",
      copyCode: "Kopyala",
      copiedCode: "Kopyalandı",
    },
    footer: {
      rights: "Tüm hakları saklıdır.",
      admin: "Yönetim",
    },
    notFound: {
      code: "404 — SAYFA BULUNAMADI",
      title: "Aradığınız sayfa mevcut değil",
      desc: "Bağlantı değişmiş veya içerik kaldırılmış olabilir.",
      backHome: "Ana Sayfaya Dön",
    },
  },
  en: {
    metaDefaultSuffix: "Apps & Articles",
    nav: {
      home: "Home",
      apps: "Apps",
      repos: "GitHub Repos",
      articles: "Articles",
      admin: "Admin",
      adminPanel: "Admin Panel",
      toggleMenu: "Toggle menu",
    },
    hero: {
      available: "Available for new projects & collaborations",
      exploreApps: "Explore Apps",
      githubRepos: "GitHub Repos",
      readArticles: "Read Articles",
      statApps: "Published Apps",
      statRepos: "Pinned GitHub Repos",
      statArticles: "Technical Articles",
    },
    home: {
      pinnedBadge: "GitHub • Pinned",
      pinnedTitle: "Pinned GitHub Repositories",
      appsBadge: "App Showcase",
      appsTitle: "Applications I Built",
      articlesBadge: "Blog & Notes",
      articlesTitle: "Latest Articles",
      viewAll: "View All",
      allArticles: "All Articles",
      noApps: "No applications published yet.",
      noArticles: "No articles published yet.",
    },
    apps: {
      metaTitle: "Applications",
      metaDesc:
        "All web, desktop, and open-source applications I have built and shipped.",
      notFoundTitle: "Application Not Found",
      badge: "Portfolio & Products",
      title: "My Applications",
      subtitle:
        "Browse the applications and developer tools I have built, try out live demos, or explore their source code.",
      searchPlaceholder: "Search app name or technology...",
      allCategory: "All",
      emptySearch: "No applications matched your search criteria.",
      viewDetails: "View Details",
      code: "Code",
      demo: "Demo",
      backToAll: "Back to All Apps",
      openLive: "Open Live App",
      download: "Download",
      sourceCode: "Source Code (GitHub)",
      techStack: "Tech Stack:",
    },
    repos: {
      metaTitle: "GitHub Repositories",
      metaDesc:
        "Pinned open-source projects, backend architectures, and engineering work from my GitHub profile.",
      badgePrefix: "GitHub",
      title: "Pinned GitHub Repositories",
      subtitle:
        "Open-source projects featured on my GitHub profile are synced automatically. Whenever my pinned repositories change on GitHub, this page updates accordingly.",
      openProfile: "Open GitHub Profile",
      searchPlaceholder: "Search repository name, description, or language...",
      allLang: "All",
      emptySearch: "No GitHub repositories matched your search.",
      pinnedTag: "Pinned",
      liveLink: "Live",
      defaultDesc: "Open-source software repository hosted on GitHub.",
    },
    articles: {
      metaTitle: "Articles",
      metaDesc:
        "Technical articles on software engineering, architecture, productivity, and modern developer tools.",
      notFoundTitle: "Article Not Found",
      badge: "Technical Blog & Notes",
      title: "Articles",
      subtitle:
        "Sharing engineering lessons, software architecture notes, and thoughts on modern developer workflows.",
      searchPlaceholder: "Search article title, topic, or tag...",
      allTag: "All",
      emptySearch: "No articles matched your search.",
      minRead: "min read",
      readMore: "Read Article",
      backToAll: "All Articles",
      draftPreview: "Draft Preview",
      authorLabel: "Author",
      authorCta: "Explore My Applications",
      share: "Share",
      copiedLink: "Link Copied",
      copyCode: "Copy",
      copiedCode: "Copied",
    },
    footer: {
      rights: "All rights reserved.",
      admin: "Admin",
    },
    notFound: {
      code: "404 — PAGE NOT FOUND",
      title: "The page you are looking for does not exist",
      desc: "The link may have changed or the content may have been removed.",
      backHome: "Back to Home",
    },
  },
} as const;

export type Dictionary = (typeof dictionaries)[Locale];

export function getDictionary(locale: Locale): Dictionary {
  return dictionaries[locale] ?? dictionaries.tr;
}
