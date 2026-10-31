import Link from "next/link";
import {
  ArrowRight,
  FileText,
  FolderGit2,
  Layers,
  MapPin,
  Pin,
  Sparkles,
} from "lucide-react";
import { getApps, getArticles, getProfile } from "@/lib/db";
import { getPinnedRepos } from "@/lib/github";
import { getDictionary, getLocale } from "@/lib/i18n";
import {
  localizeApps,
  localizeArticles,
  localizePinnedRepos,
  localizeProfile,
} from "@/lib/translator";
import { AppCard } from "@/components/AppCard";
import { ArticleCard } from "@/components/ArticleCard";
import { PinnedRepoCard } from "@/components/PinnedRepoCard";
import { SocialLinks } from "@/components/SocialLinks";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const [locale, rawProfile] = await Promise.all([getLocale(), getProfile()]);
  const dict = getDictionary(locale);

  const [rawApps, rawArticles, rawPinnedRepos] = await Promise.all([
    getApps(),
    getArticles(false),
    getPinnedRepos(rawProfile.githubUrl),
  ]);

  const rawFeaturedApps = rawApps.filter((a) => a.featured).slice(0, 3);
  const selectedRawApps =
    rawFeaturedApps.length > 0 ? rawFeaturedApps : rawApps.slice(0, 3);
  const selectedRawArticles = rawArticles.slice(0, 4);

  const [profile, displayApps, latestArticles, pinnedRepos] = await Promise.all([
    localizeProfile(rawProfile, locale),
    localizeApps(selectedRawApps, locale),
    localizeArticles(selectedRawArticles, locale),
    localizePinnedRepos(rawPinnedRepos.slice(0, 6), locale),
  ]);

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
                {dict.hero.available}
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
              <span>{dict.hero.exploreApps}</span>
            </Link>
            <Link
              href="/repos"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-sm border border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 hover:border-indigo-500/50 text-slate-800 dark:text-zinc-200 transition-colors"
            >
              <FolderGit2 className="w-4 h-4" />
              <span>{dict.hero.githubRepos}</span>
            </Link>
            <Link
              href="/articles"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-sm border border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 hover:border-indigo-500/50 text-slate-800 dark:text-zinc-200 transition-colors"
            >
              <FileText className="w-4 h-4" />
              <span>{dict.hero.readArticles}</span>
            </Link>

            <div className="sm:ml-1">
              <SocialLinks profile={profile} locale={locale} variant="hero" />
            </div>
          </div>
        </div>

        {/* Quick Metrics */}
        <div className="relative grid grid-cols-3 gap-4 mt-10 pt-8 border-t border-slate-200/70 dark:border-zinc-800/80">
          <div>
            <p className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
              {rawApps.length}
            </p>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-zinc-400">
              {dict.hero.statApps}
            </p>
          </div>
          <div>
            <p className="text-2xl sm:text-3xl font-extrabold text-indigo-600 dark:text-indigo-400">
              {rawPinnedRepos.length}
            </p>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-zinc-400">
              {dict.hero.statRepos}
            </p>
          </div>
          <div>
            <p className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
              {rawArticles.length}
            </p>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-zinc-400">
              {dict.hero.statArticles}
            </p>
          </div>
        </div>
      </section>

      {/* Pinned GitHub Repositories Section */}
      {pinnedRepos.length > 0 && (
        <section className="space-y-6">
          <div className="flex items-end justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-1.5 text-xs font-mono uppercase tracking-wider text-indigo-600 dark:text-indigo-400 mb-1">
                <Pin className="w-3.5 h-3.5" />
                <span>{dict.home.pinnedBadge}</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white tracking-tight">
                {dict.home.pinnedTitle}
              </h2>
            </div>
            <Link
              href="/repos"
              className="inline-flex items-center gap-1.5 text-sm font-semibold text-indigo-600 dark:text-indigo-400 hover:underline shrink-0"
            >
              <span>
                {dict.home.viewAll} ({rawPinnedRepos.length})
              </span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {pinnedRepos.map((repo) => (
              <PinnedRepoCard
                key={`${repo.owner}/${repo.name}`}
                repo={repo}
                locale={locale}
              />
            ))}
          </div>
        </section>
      )}

      {/* Featured Apps Section */}
      <section className="space-y-6">
        <div className="flex items-end justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 text-xs font-mono uppercase tracking-wider text-indigo-600 dark:text-indigo-400 mb-1">
              <Sparkles className="w-3.5 h-3.5" />
              <span>{dict.home.appsBadge}</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white tracking-tight">
              {dict.home.appsTitle}
            </h2>
          </div>
          <Link
            href="/apps"
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-indigo-600 dark:text-indigo-400 hover:underline shrink-0"
          >
            <span>
              {dict.home.viewAll} ({rawApps.length})
            </span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {displayApps.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-300 dark:border-zinc-800 p-10 text-center text-slate-500 dark:text-zinc-400">
            {dict.home.noApps}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {displayApps.map((app) => (
              <AppCard key={app.id} app={app} locale={locale} />
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
              <span>{dict.home.articlesBadge}</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white tracking-tight">
              {dict.home.articlesTitle}
            </h2>
          </div>
          <Link
            href="/articles"
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-indigo-600 dark:text-indigo-400 hover:underline shrink-0"
          >
            <span>
              {dict.home.allArticles} ({rawArticles.length})
            </span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {latestArticles.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-300 dark:border-zinc-800 p-10 text-center text-slate-500 dark:text-zinc-400">
            {dict.home.noArticles}
          </div>
        ) : (
          <div className="space-y-4">
            {latestArticles.map((article) => (
              <ArticleCard key={article.id} article={article} locale={locale} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
