export interface GitHubStorageConfig {
  token: string;
  repo: string;
  branch: string;
}

const GITHUB_REPO_SLUG_RE = /^[\w.-]+\/[\w.-]+$/;

export function getGitHubStorageConfig(): GitHubStorageConfig | null {
  const token = process.env.GITHUB_TOKEN?.trim();
  const repo = process.env.GITHUB_REPO?.trim();
  const branch = process.env.GITHUB_BRANCH?.trim() || "main";
  if (token && repo && GITHUB_REPO_SLUG_RE.test(repo)) {
    return { token, repo, branch };
  }
  return null;
}

function buildGitHubHeaders(token: string, jsonBody = false): HeadersInit {
  return {
    Authorization: `Bearer ${token}`,
    Accept: "application/vnd.github+json",
    "X-GitHub-Api-Version": "2022-11-28",
    ...(jsonBody ? { "Content-Type": "application/json" } : {}),
  };
}

export async function readGitHubFile<T>(
  cfg: GitHubStorageConfig,
  repoPath: string
): Promise<{ data: T; sha: string } | null> {
  const url = `https://api.github.com/repos/${cfg.repo}/contents/${repoPath}?ref=${encodeURIComponent(
    cfg.branch
  )}`;
  const res = await fetch(url, {
    headers: buildGitHubHeaders(cfg.token),
    cache: "no-store",
  });

  if (res.status === 404) return null;
  if (!res.ok) {
    throw new Error(`GitHub okuma hatası: ${res.status}`);
  }

  const json = (await res.json()) as { content: string; sha: string };
  const decoded = Buffer.from(json.content, "base64").toString("utf-8");
  return { data: JSON.parse(decoded) as T, sha: json.sha };
}

export async function writeGitHubJsonFile(
  cfg: GitHubStorageConfig,
  repoPath: string,
  data: unknown,
  commitMessage: string
): Promise<void> {
  const existing = await readGitHubFile<unknown>(cfg, repoPath);
  const url = `https://api.github.com/repos/${cfg.repo}/contents/${repoPath}`;
  const contentB64 = Buffer.from(
    JSON.stringify(data, null, 2),
    "utf-8"
  ).toString("base64");

  const res = await fetch(url, {
    method: "PUT",
    headers: buildGitHubHeaders(cfg.token, true),
    body: JSON.stringify({
      message: commitMessage,
      content: contentB64,
      branch: cfg.branch,
      ...(existing?.sha ? { sha: existing.sha } : {}),
    }),
  });

  if (!res.ok) {
    throw new Error(`GitHub yazma hatası: ${res.status}`);
  }
}

export async function uploadGitHubBinaryFile(
  cfg: GitHubStorageConfig,
  repoPath: string,
  buffer: Buffer,
  commitMessage: string
): Promise<string> {
  const url = `https://api.github.com/repos/${cfg.repo}/contents/${repoPath}`;
  const res = await fetch(url, {
    method: "PUT",
    headers: buildGitHubHeaders(cfg.token, true),
    body: JSON.stringify({
      message: commitMessage,
      content: buffer.toString("base64"),
      branch: cfg.branch,
    }),
  });

  if (!res.ok) {
    throw new Error(`GitHub görsel yükleme hatası: ${res.status}`);
  }

  return `https://raw.githubusercontent.com/${cfg.repo}/${cfg.branch}/${repoPath}`;
}
