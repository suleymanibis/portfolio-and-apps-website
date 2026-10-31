import type { Metadata } from "next";
import Link from "next/link";
import {
  BookOpen,
  Compass,
  Cpu,
  FileDown,
  FolderGit2,
  GraduationCap,
  Layers,
  MapPin,
  User,
} from "lucide-react";
import { getAbout, getProfile } from "@/lib/db";
import { getDictionary, getLocale } from "@/lib/i18n";
import { localizeAbout, localizeProfile } from "@/lib/translator";
import { MarkdownRenderer } from "@/components/MarkdownRenderer";
import { SocialLinks } from "@/components/SocialLinks";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  const [locale, rawAbout] = await Promise.all([getLocale(), getAbout()]);
  const dict = getDictionary(locale);
  const about = await localizeAbout(rawAbout, locale);
  return {
    title: dict.about.metaTitle,
    description: about.subheadline || dict.about.metaDesc,
  };
}

function getInitials(name: string): string {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() || "")
    .join("");
}

export default async function AboutPage() {
  const [locale, rawAbout, rawProfile] = await Promise.all([
    getLocale(),
    getAbout(),
    getProfile(),
  ]);
  const dict = getDictionary(locale);
  const [about, profile] = await Promise.all([
    localizeAbout(rawAbout, locale),
    localizeProfile(rawProfile, locale),
  ]);

  const photoSrc = about.photoUrl || profile.avatarUrl;
  const initials = getInitials(profile.ownerName || "Sİ");

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-12 sm:py-16 space-y-12">
      {/* Hero / Intro Card */}
      <section className="relative rounded-3xl border border-slate-200 dark:border-zinc-800/90 bg-white/85 dark:bg-zinc-900/65 backdrop-blur-sm p-7 sm:p-10 overflow-hidden shadow-xs">
        <div className="absolute -top-24 -right-24 w-72 h-72 bg-indigo-500/15 dark:bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative flex flex-col md:flex-row items-start md:items-center gap-7">
          {/* Profile Photo or Stylish Monogram Avatar */}
          <div className="shrink-0">
            {photoSrc ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={photoSrc}
                alt={profile.ownerName}
                className="w-28 h-28 sm:w-36 sm:h-36 rounded-3xl object-cover border-2 border-indigo-500/30 shadow-md"
              />
            ) : (
              <div className="w-28 h-28 sm:w-36 sm:h-36 rounded-3xl bg-gradient-to-br from-indigo-600 via-violet-600 to-sky-500 p-[2px] shadow-md">
                <div className="w-full h-full rounded-[22px] bg-white dark:bg-zinc-950 flex flex-col items-center justify-center gap-1">
                  <span className="text-3xl sm:text-4xl font-extrabold bg-gradient-to-r from-indigo-500 via-violet-500 to-sky-400 bg-clip-text text-transparent">
                    {initials}
                  </span>
                  <span className="text-[10px] font-mono uppercase tracking-widest text-slate-400 dark:text-zinc-500">
                    {profile.siteName}
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Intro Text & Actions */}
          <div className="flex-1 space-y-4">
            <div className="flex flex-wrap items-center gap-3">
              <span className="inline-flex items-center gap-1.5 text-xs font-mono uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
                <User className="w-3.5 h-3.5" />
                <span>{dict.about.badge}</span>
              </span>
              {profile.location && (
                <span className="inline-flex items-center gap-1 text-xs text-slate-500 dark:text-zinc-400">
                  <MapPin className="w-3.5 h-3.5" />
                  {profile.location}
                </span>
              )}
            </div>

            <div className="space-y-2">
              <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                {about.headline}
              </h1>
              {about.subheadline && (
                <p className="text-base sm:text-lg text-slate-600 dark:text-zinc-300 leading-relaxed">
                  {about.subheadline}
                </p>
              )}
            </div>

            <div className="flex flex-wrap items-center gap-3 pt-1">
              {about.cvUrl && (
                <a
                  href={about.cvUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-sm bg-indigo-600 hover:bg-indigo-500 text-white shadow-sm transition-colors"
                >
                  <FileDown className="w-4 h-4" />
                  <span>{dict.about.downloadCv}</span>
                </a>
              )}
              <SocialLinks profile={profile} locale={locale} variant="hero" />
            </div>
          </div>
        </div>
      </section>

      {/* Current Focus Banner */}
      {about.currentFocus && (
        <section className="rounded-2xl border border-indigo-500/25 bg-indigo-500/5 dark:bg-indigo-500/10 p-6 flex items-start gap-4">
          <div className="p-2.5 rounded-xl bg-indigo-600 text-white shrink-0 mt-0.5">
            <Compass className="w-5 h-5" />
          </div>
          <div className="space-y-1">
            <h2 className="text-sm font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
              {dict.about.focusTitle}
            </h2>
            <p className="text-sm sm:text-base text-slate-700 dark:text-zinc-200 leading-relaxed">
              {about.currentFocus}
            </p>
          </div>
        </section>
      )}

      {/* Story & Engineering Approach (Markdown) */}
      {about.storyMarkdown && (
        <section className="rounded-3xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/55 p-6 sm:p-10 space-y-4 shadow-xs">
          <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
            <BookOpen className="w-4 h-4" />
            <span>{dict.about.storyTitle}</span>
          </div>
          <MarkdownRenderer content={about.storyMarkdown} locale={locale} />
        </section>
      )}

      {/* Education & Skills Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Education Timeline */}
        {about.education.length > 0 && (
          <section className="lg:col-span-5 space-y-5">
            <div className="flex items-center gap-2">
              <GraduationCap className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
              <h2 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">
                {dict.about.educationTitle}
              </h2>
            </div>

            <div className="space-y-4">
              {about.education.map((edu, index) => (
                <div
                  key={`${edu.institution}-${index}`}
                  className="rounded-2xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/60 p-5 space-y-2 shadow-2xs"
                >
                  {edu.period && (
                    <span className="inline-block px-2.5 py-0.5 rounded-full text-xs font-mono font-medium bg-indigo-500/10 text-indigo-600 dark:text-indigo-400">
                      {edu.period}
                    </span>
                  )}
                  <h3 className="font-bold text-base text-slate-900 dark:text-white">
                    {edu.title}
                  </h3>
                  <p className="text-xs font-semibold text-slate-500 dark:text-zinc-400">
                    {edu.institution}
                  </p>
                  {edu.description && (
                    <p className="text-sm text-slate-600 dark:text-zinc-400 leading-relaxed pt-1">
                      {edu.description}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Skills & Development Environments */}
        {about.skillGroups.length > 0 && (
          <section
            className={`${
              about.education.length > 0 ? "lg:col-span-7" : "lg:col-span-12"
            } space-y-5`}
          >
            <div className="flex items-center gap-2">
              <Cpu className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
              <h2 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">
                {dict.about.skillsTitle}
              </h2>
            </div>

            <div className="space-y-4">
              {about.skillGroups.map((group, index) => (
                <div
                  key={`${group.category}-${index}`}
                  className="rounded-2xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/60 p-5 space-y-3 shadow-2xs"
                >
                  <h3 className="text-sm font-bold text-slate-900 dark:text-zinc-100">
                    {group.category}
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {group.items.map((skill) => (
                      <span
                        key={skill}
                        className="px-3 py-1 rounded-xl text-xs font-mono font-medium bg-slate-100 dark:bg-zinc-800/90 text-slate-700 dark:text-zinc-200 border border-slate-200/70 dark:border-zinc-700/70"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}
      </div>

      {/* Bottom Connect & Explore Card */}
      <section className="rounded-3xl border border-slate-200 dark:border-zinc-800 bg-white/80 dark:bg-zinc-900/60 p-6 sm:p-8 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div className="space-y-2 max-w-xl">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white">
            {dict.about.connectTitle}
          </h2>
          <p className="text-sm text-slate-600 dark:text-zinc-400">
            {dict.about.connectDesc}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3 shrink-0">
          <Link
            href="/repos"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white transition-colors"
          >
            <FolderGit2 className="w-4 h-4" />
            <span>{dict.about.exploreRepos}</span>
          </Link>
          <Link
            href="/apps"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold border border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-slate-800 dark:text-zinc-200 hover:border-indigo-500/50 transition-colors"
          >
            <Layers className="w-4 h-4" />
            <span>{dict.about.exploreApps}</span>
          </Link>
        </div>
      </section>
    </div>
  );
}
