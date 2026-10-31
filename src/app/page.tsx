import Link from "next/link";
import {
  ArrowRight,
  FileText,
  Github,
  Layers,
  Linkedin,
  Mail,
  MapPin,
  Sparkles,
  Twitter,
} from "lucide-react";
import { getApps, getArticles, getProfile } from "@/lib/db";
import { AppCard } from "@/components/AppCard";
import { ArticleCard } from "@/components/ArticleCard";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const [profile, apps, articles] = await Promise.all([
    getProfile(),
    getApps(),
    getArticles(false),
  ]);

  const featuredApps = apps.filter((a) => a.featured).slice(0, 3);
  const displayApps = featuredApps.length > 0 ? featuredApps : apps.slice(0, 3);
  const latestArticles = articles.slice(0, 4);

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-12 sm:py-16 space-y-20">
      {/* Hero Section */}
      <section className="relative rounded-3xl border border-slate-200 dark:border-zinc-800/90 bg-white/80 dark:bg-zinc-900/60 backdrop-blur-sm p-8 sm:p-12 overflow-hidden shadow-xs">
        <div className="absolute -top-24 -right-24 w-72 h-72 bg-indigo-500/15 dark:bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-72 h-72 bg-violet-500/15 dark:bg-violet-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative max-w-3xl space-y-6">
          <div className="flex flex-wrap items-center gap-3">
            {profile.availableForWork && (
              <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/25">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                Yeni projelere & iş birliklerine açık
              </span>
            )}
            {profile.location && (
              <span className="inline-flex items-center gap-1 text-xs text-slate-500 dark:text-zinc-400">
                <MapPin className="w-3.5 h-3.5" />
                {profile.location}
              </span>
            )}
          </div>

          <div className="space-y-3">
            <p className="text-sm font-mono font-medium text-indigo-600 dark:text-indigo-400">
              {profile.ownerName} • {profile.roleTitle}
            </p>
            <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-slate-900 dark:text-white leading-tight">
              {profile.heroGreeting}
            </h1>
            <p className="text-base sm:text-lg text-slate-600 dark:text-zinc-400 leading-relaxed">
              {profile.bio}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 pt-2">
            <Link
              href="/apps"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-sm bg-indigo-600 hover:bg-indigo-500 text-white shadow-sm transition-colors"
            >
              <Layers className="w-4 h-4" />
              <span>Uygulamaları Keşfet</span>
            </Link>
            <Link
              href="/articles"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-sm border border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 hover:border-indigo-500/50 text-slate-800 dark:text-zinc-200 transition-colors"
            >
              <FileText className="w-4 h-4" />
              <span>Makaleleri Oku</span>
            </Link>

            <div className="flex items-center gap-1.5 sm:ml-2">
              {profile.githubUrl && (
                <a
                  href={profile.githubUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="GitHub"
                  className="p-2.5 rounded-xl border border-slate-200 dark:border-zinc-800 text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white hover:border-slate-300 dark:hover:border-zinc-700 transition-colors"
                >
                  <Github className="w-4 h-4" />
                </a>
              )}
              {profile.twitterUrl && (
                <a
                  href={profile.twitterUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="X / Twitter"
                  className="p-2.5 rounded-xl border border-slate-200 dark:border-zinc-800 text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white hover:border-slate-300 dark:hover:border-zinc-700 transition-colors"
                >
                  <Twitter className="w-4 h-4" />
                </a>
              )}
              {profile.linkedinUrl && (
                <a
                  href={profile.linkedinUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="LinkedIn"
                  className="p-2.5 rounded-xl border border-slate-200 dark:border-zinc-800 text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white hover:border-slate-300 dark:hover:border-zinc-700 transition-colors"
                >
                  <Linkedin className="w-4 h-4" />
                </a>
              )}
              {profile.email && (
                <a
                  href={`mailto:${profile.email}`}
                  aria-label="E-posta"
                  className="p-2.5 rounded-xl border border-slate-200 dark:border-zinc-800 text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white hover:border-slate-300 dark:hover:border-zinc-700 transition-colors"
                >
                  <Mail className="w-4 h-4" />
                </a>
              )}
            </div>
          </div>
        </div>

        {/* Quick Metrics */}
        <div className="relative grid grid-cols-2 sm:grid-cols-3 gap-4 mt-10 pt-8 border-t border-slate-200/70 dark:border-zinc-800/80">
          <div>
            <p className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
              {apps.length}
            </p>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-zinc-400">
              Yayınlanan Uygulama
            </p>
          </div>
          <div>
            <p className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
              {articles.length}
            </p>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-zinc-400">
              Teknik Makale & Yazı
            </p>
          </div>
          <div className="col-span-2 sm:col-span-1">
            <p className="text-2xl sm:text-3xl font-extrabold text-indigo-600 dark:text-indigo-400">
              100%
            </p>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-zinc-400">
              Açık Paylaşım & Üretim
            </p>
          </div>
        </div>
      </section>

      {/* Featured Apps Section */}
      <section className="space-y-6">
        <div className="flex items-end justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 text-xs font-mono uppercase tracking-wider text-indigo-600 dark:text-indigo-400 mb-1">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Uygulama Vitrini</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white tracking-tight">
              Geliştirdiğim Uygulamalar
            </h2>
          </div>
          <Link
            href="/apps"
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-indigo-600 dark:text-indigo-400 hover:underline shrink-0"
          >
            <span>Tümünü Gör ({apps.length})</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {displayApps.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-300 dark:border-zinc-800 p-10 text-center text-slate-500 dark:text-zinc-400">
            Henüz uygulama eklenmemiş.{" "}
            <Link href="/admin" className="text-indigo-500 underline">
              Yönetim Panelinden
            </Link>{" "}
            ilk uygulamanızı paylaşabilirsiniz.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {displayApps.map((app) => (
              <AppCard key={app.id} app={app} />
            ))}
          </div>
        )}
      </section>

      {/* Latest Articles Section */}
      <section className="space-y-6">
        <div className="flex items-end justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 text-xs font-mono uppercase tracking-wider text-indigo-600 dark:text-indigo-400 mb-1">
              <FileText className="w-3.5 h-3.5" />
              <span>Blog & Notlar</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white tracking-tight">
              Son Yazılan Makaleler
            </h2>
          </div>
          <Link
            href="/articles"
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-indigo-600 dark:text-indigo-400 hover:underline shrink-0"
          >
            <span>Tüm Yazılar ({articles.length})</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {latestArticles.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-300 dark:border-zinc-800 p-10 text-center text-slate-500 dark:text-zinc-400">
            Henüz yayınlanmış makale bulunmuyor.{" "}
            <Link href="/admin" className="text-indigo-500 underline">
              Yönetim Panelinden
            </Link>{" "}
            yeni bir yazı oluşturabilirsiniz.
          </div>
        ) : (
          <div className="space-y-4">
            {latestArticles.map((article) => (
              <ArticleCard key={article.id} article={article} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
