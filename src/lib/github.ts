import type { PinnedRepoItem } from "@/types";
import { cleanText, sanitizeHttpUrl } from "./security";

const GITHUB_USERNAME_RE =
  /^[a-zA-Z0-9](?:[a-zA-Z0-9]|-(?=[a-zA-Z0-9])){0,38}$/;
const HEX_COLOR_RE = /^#[0-9a-fA-F]{3,6}$/;

const FALLBACK_LANG_COLORS: Record<string, string> = {
  Java: "#b07219",
  "C#": "#178600",
  Python: "#3572A5",
  TypeScript: "#3178c6",
  JavaScript: "#f1e05a",
  Go: "#00ADD8",
  Rust: "#dea584",
  HTML: "#e34c26",
  CSS: "#563d7c",
  "C++": "#f34b7d",
  C: "#555555",
};

export function extractSafeGitHubUsername(githubUrl?: string): string {
  if (githubUrl) {
    try {
      const parsed = new URL(githubUrl);
      if (
        parsed.hostname === "github.com" ||
        parsed.hostname === "www.github.com"
      ) {
        const seg = parsed.pathname.split("/").filter(Boolean)[0] || "";
        if (GITHUB_USERNAME_RE.test(seg)) {
          return seg;
        }
      }
    } catch {
      // Fallback below
    }
  }
  return "suleymanibis";
}

function decodeHtmlEntities(str: string): string {
  return str
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&#x27;/g, "'")
    .replace(/\s+/g, " ")
    .trim();
}

function stripTags(html: string): string {
  return decodeHtmlEntities(html.replace(/<[^>]*>/g, " "));
}

/**
 * Parses pinned repository items from a public GitHub profile HTML page.
 * Pure text extraction (never renders raw HTML).
 */
export function parsePinnedReposHtml(
  html: string,
  defaultOwner: string
): PinnedRepoItem[] {
  const results: PinnedRepoItem[] = [];
  const itemBlocks = html.split(/pinned-item-list-item-content/g).slice(1);

  for (const rawBlock of itemBlocks.slice(0, 6)) {
    // Bound block up to closing </li> to avoid bleeding into trailing sections
    const liEnd = rawBlock.indexOf("</li>");
    const block = liEnd !== -1 ? rawBlock.slice(0, liEnd) : rawBlock.slice(0, 4000);

    // Match repo link: href="/owner/repo" containing <span class="repo">
    const linkMatch =
      block.match(
        /href="\/([a-zA-Z0-9_.-]+)\/([a-zA-Z0-9_.-]+)"[^>]*>[\s\S]*?<span[^>]*class="[^"]*\brepo\b[^"]*"[^>]*>([\s\S]*?)<\/span>/i
      ) ||
      block.match(/href="\/([a-zA-Z0-9_.-]+)\/([a-zA-Z0-9_.-]+)"/i);

    if (!linkMatch) continue;

    const owner = cleanText(linkMatch[1] || defaultOwner, 40);
    const name = cleanText(
      linkMatch[3] ? stripTags(linkMatch[3]) : linkMatch[2],
      100
    );
    if (!owner || !name) continue;

    // Description
    const descMatch = block.match(
      /<p[^>]*class="[^"]*pinned-item-desc[^"]*"[^>]*>([\s\S]*?)<\/p>/i
    );
    const description = descMatch ? cleanText(stripTags(descMatch[1]), 400) : "";

    // Language & color
    const langMatch = block.match(
      /itemprop="programmingLanguage"[^>]*>([\s\S]*?)<\/span>/i
    );
    const language = langMatch ? cleanText(stripTags(langMatch[1]), 40) : "";

    const colorMatch = block.match(
      /repo-language-color"[^>]*style="background-color:\s*(#[0-9a-fA-F]{3,6})/i
    );
    const rawColor = colorMatch ? colorMatch[1] : FALLBACK_LANG_COLORS[language];
    const languageColor =
      rawColor && HEX_COLOR_RE.test(rawColor) ? rawColor : "#6366f1";

    // Stars & Forks from card if present
    const starMatch = block.match(
      /href="\/[^"]+\/stargazers"[^>]*>([\s\S]*?)<\/a>/i
    );
    const forkMatch = block.match(
      /href="\/[^"]+\/forks"[^>]*>([\s\S]*?)<\/a>/i
    );
    const stars = starMatch
      ? parseInt(stripTags(starMatch[1]).replace(/[^0-9]/g, ""), 10) || 0
      : 0;
    const forks = forkMatch
      ? parseInt(stripTags(forkMatch[1]).replace(/[^0-9]/g, ""), 10) || 0
      : 0;

    const repoUrl = sanitizeHttpUrl(
      `https://github.com/${encodeURIComponent(owner)}/${encodeURIComponent(name)}`
    );
    if (!repoUrl) continue;

    results.push({
      name,
      owner,
      description,
      repoUrl,
      language: language || undefined,
      languageColor,
      stars,
      forks,
      topics: [],
    });
  }

  return results;
}

interface GitHubRestRepo {
  name: string;
  description: string | null;
  html_url: string;
  homepage: string | null;
  language: string | null;
  stargazers_count: number;
  forks_count: number;
  topics?: string[];
  pushed_at?: string;
  updated_at?: string;
}

/**
 * Fetches the user's pinned repositories from GitHub and enriches them with
 * REST API metadata (topics, homepage URL, updated timestamp, exact star/fork counts).
 * Uses Next.js ISR cache (15 minutes) for instant page loads and rate-limit safety.
 */
export async function getPinnedRepos(
  githubUrl?: string
): Promise<PinnedRepoItem[]> {
  const username = extractSafeGitHubUsername(githubUrl);

  try {
    const [profileRes, apiRes] = await Promise.allSettled([
      fetch(`https://github.com/${username}`, {
        headers: {
          "User-Agent": "Mozilla/5.0 (compatible; suleymanibis-portfolio/1.0)",
          Accept: "text/html",
        },
        next: { revalidate: 900 },
        signal: AbortSignal.timeout(6000),
      }),
      fetch(
        `https://api.github.com/users/${username}/repos?per_page=100&sort=updated`,
        {
          headers: {
            Accept: "application/vnd.github+json",
            "User-Agent": "suleymanibis-portfolio/1.0",
          },
          next: { revalidate: 900 },
          signal: AbortSignal.timeout(6000),
        }
      ),
    ]);

    let pinned: PinnedRepoItem[] = [];
    if (profileRes.status === "fulfilled" && profileRes.value.ok) {
      const html = await profileRes.value.text();
      pinned = parsePinnedReposHtml(html, username);
    }

    let restMap = new Map<string, GitHubRestRepo>();
    if (apiRes.status === "fulfilled" && apiRes.value.ok) {
      const reposJson = (await apiRes.value.json()) as GitHubRestRepo[];
      if (Array.isArray(reposJson)) {
        restMap = new Map(
          reposJson.map((r) => [r.name.toLowerCase(), r])
        );

        // Fallback if GitHub profile HTML ever changes and returns 0 pinned items:
        // show top 6 non-fork public repos
        if (pinned.length === 0) {
          pinned = reposJson.slice(0, 6).map((r) => ({
            name: cleanText(r.name, 100),
            owner: username,
            description: cleanText(r.description || "", 400),
            repoUrl: sanitizeHttpUrl(r.html_url),
            homepageUrl: sanitizeHttpUrl(r.homepage || ""),
            language: r.language || undefined,
            languageColor: r.language
              ? FALLBACK_LANG_COLORS[r.language] || "#6366f1"
              : undefined,
            stars: Number(r.stargazers_count) || 0,
            forks: Number(r.forks_count) || 0,
            topics: Array.isArray(r.topics)
              ? r.topics.map((t) => cleanText(t, 40)).filter(Boolean).slice(0, 6)
              : [],
            updatedAt: r.pushed_at || r.updated_at,
          }));
        }
      }
    }

    // Enrich pinned items with REST API details (topics, homepage, stars, updatedAt)
    return pinned.map((item) => {
      const extra = restMap.get(item.name.toLowerCase());
      if (!extra) return item;

      return {
        ...item,
        description: item.description || cleanText(extra.description || "", 400),
        homepageUrl: sanitizeHttpUrl(extra.homepage || "") || undefined,
        language: item.language || extra.language || undefined,
        stars:
          typeof extra.stargazers_count === "number"
            ? extra.stargazers_count
            : item.stars,
        forks:
          typeof extra.forks_count === "number" ? extra.forks_count : item.forks,
        topics: Array.isArray(extra.topics)
          ? extra.topics.map((t) => cleanText(t, 40)).filter(Boolean).slice(0, 6)
          : item.topics,
        updatedAt: extra.pushed_at || extra.updated_at,
      };
    });
  } catch {
    return [];
  }
}
