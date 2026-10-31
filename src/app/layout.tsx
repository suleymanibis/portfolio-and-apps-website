import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { getProfile } from "@/lib/db";

const inter = Inter({
  subsets: ["latin", "latin-ext"],
  variable: "--font-sans",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin", "latin-ext"],
  variable: "--font-mono",
});

export async function generateMetadata(): Promise<Metadata> {
  const profile = await getProfile();
  return {
    metadataBase: new URL("https://suleymanibis.dev"),
    title: {
      default: `${profile.siteName} — Uygulamalar & Makaleler`,
      template: `%s | ${profile.siteName}`,
    },
    description: profile.heroGreeting,
    icons: {
      icon: [
        { url: "/logo-mark.png?v=2", type: "image/png", sizes: "256x256" },
        { url: "/favicon.ico?v=2", sizes: "48x48" },
      ],
      shortcut: "/favicon.ico?v=2",
      apple: [{ url: "/logo-mark.png?v=2", sizes: "180x180", type: "image/png" }],
    },
    openGraph: {
      title: `${profile.siteName} — Uygulamalar & Makaleler`,
      description: profile.heroGreeting,
      url: "https://suleymanibis.dev",
      siteName: profile.siteName,
      images: [
        {
          url: "/logo.jpg",
          width: 800,
          height: 800,
          alt: profile.siteName,
        },
      ],
      locale: "tr_TR",
      type: "website",
    },
    twitter: {
      card: "summary",
      title: `${profile.siteName} — Uygulamalar & Makaleler`,
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
  const profile = await getProfile();

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
    <html lang="tr" className="dark" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
      </head>
      <body
        className={`${inter.variable} ${jetbrainsMono.variable} font-sans min-h-screen flex flex-col bg-dev-grid`}
      >
        <Navbar siteName={profile.siteName} />
        <main className="flex-1">{children}</main>
        <Footer profile={profile} />
      </body>
    </html>
  );
}
