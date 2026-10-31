import type { Metadata } from "next";
import { ExternalLink, Github, Pin } from "lucide-react";
import { getProfile } from "@/lib/db";
import { extractSafeGitHubUsername, getPinnedRepos } from "@/lib/github";
import { ReposExplorer } from "@/components/ReposExplorer";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "GitHub Repoları",
  description:
    "GitHub profilimde sabitlediğim açık kaynak projeler, API mimarileri ve yazılım çalışmaları.",
};

export default async function ReposPage() {
  const profile = await getProfile();
  const pinnedRepos = await getPinnedRepos(profile.githubUrl);
  const username = extractSafeGitHubUsername(profile.githubUrl);
  const githubProfileUrl =
    profile.githubUrl || `https://github.com/${username}`;

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-12 space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-1.5 text-xs font-mono uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
            <Pin className="w-3.5 h-3.5" />
            <span>GitHub • @{username}</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Sabitlenen GitHub Repolarım
          </h1>
          <p className="text-slate-600 dark:text-zinc-400 max-w-2xl">
            GitHub profilimde öne çıkardığım açık kaynak projeler otomatik olarak senkronize edilir. GitHub üzerinde sabitlediğim repolar değiştikçe bu sayfa da güncellenir.
          </p>
        </div>

        <a
          href={githubProfileUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-slate-800 dark:text-zinc-200 hover:border-indigo-500/50 transition-colors shrink-0 self-start sm:self-auto"
        >
          <Github className="w-4 h-4" />
          <span>GitHub Profilini Aç</span>
          <ExternalLink className="w-3.5 h-3.5 opacity-70" />
        </a>
      </div>

      <ReposExplorer repos={pinnedRepos} />
    </div>
  );
}
