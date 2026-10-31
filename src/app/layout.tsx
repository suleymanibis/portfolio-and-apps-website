import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { getProfile } from "@/lib/db";
import { getDictionary, getLocale } from "@/lib/i18n";
import { SITE_URL, buildAlternates, canonicalUrlFor } from "@/lib/seo";
import { localizeProfile } from "@/lib/translator";

const inter = Inter({
  subsets: ["latin", "latin-ext"],
  variable: "--font-sans",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin", "latin-ext"],
  variable: "--font-mono",
});

export async function generateMetadata(): Promise<Metadata> {
  const [locale, rawProfile] = await Promise.all([getLocale(), getProfile()]);
  const dict = getDictionary(locale);
  const profile = await localizeProfile(rawProfile, locale);
  const fullTitle = `${profile.siteName} — ${dict.metaDefaultSuffix}`;

  return {
    metadataBase: new URL(SITE_URL),
    title: {
      default: fullTitle,
      template: `%s | ${profile.siteName}`,
    },
    description: profile.heroGreeting,
    authors: [{ name: profile.ownerName, url: canonicalUrlFor("/about", locale) }],
    creator: profile.ownerName,
    publisher: profile.ownerName,
    alternates: buildAlternates("/", locale),
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        "max-image-preview": "large",
        "max-snippet": -1,
      },
    },
    icons: {
      icon: [
        { url: "/logo-mark.png?v=2", type: "image/png", sizes: "256x256" },
        { url: "/favicon.ico?v=2", sizes: "48x48" },
      ],
      shortcut: "/favicon.ico?v=2",
      apple: [{ url: "/logo-mark.png?v=2", sizes: "180x180", type: "image/png" }],
    },
    openGraph: {
      title: fullTitle,
      description: profile.heroGreeting,
      url: canonicalUrlFor("/", locale),
      siteName: profile.siteName,
      images: [
        {
          url: "/logo.jpg",
          width: 800,
          height: 800,
          alt: profile.siteName,
        },
      ],
      locale: locale === "en" ? "en_US" : "tr_TR",
      alternateLocale: locale === "en" ? ["tr_TR"] : ["en_US"],
      type: "website",
    },
    twitter: {
      card: "summary",
      title: fullTitle,
      description: profile.heroGreeting,
      images: ["/logo.jpg"],
    },
  };
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const [locale, rawProfile] = await Promise.all([getLocale(), getProfile()]);
  const profile = await localizeProfile(rawProfile, locale);

  const themeInitScript = `
    (function() {
      try {
        var saved = localStorage.getItem('theme');
        if (saved === 'light') {
          document.documentElement.classList.remove('dark');
        } else {
          document.documentElement.classList.add('dark');
        }
      } catch (e) {
        document.documentElement.classList.add('dark');
      }
    })();
  `;

  return (
    <html lang={locale} className="dark" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
      </head>
      <body
        className={`${inter.variable} ${jetbrainsMono.variable} font-sans min-h-screen flex flex-col bg-dev-grid`}
      >
        <Navbar siteName={profile.siteName} locale={locale} />
        <main className="flex-1">{children}</main>
        <Footer profile={profile} locale={locale} />
      </body>
    </html>
  );
}
