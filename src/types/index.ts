export type AppStatus = "live" | "beta" | "in-progress" | "open-source";

export interface AppItem {
  id: string;
  title: string;
  slug: string;
  tagline: string;
  description: string; // Markdown supported
  coverImage?: string;
  category: string;
  techStack: string[];
  demoUrl?: string;
  repoUrl?: string;
  downloadUrl?: string;
  version?: string;
  status: AppStatus;
  featured: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ArticleItem {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string; // Markdown
  coverImage?: string;
  category: string;
  tags: string[];
  published: boolean;
  featured: boolean;
  readingTimeMinutes: number;
  createdAt: string;
  updatedAt: string;
}

export interface SiteProfile {
  siteName: string;
  ownerName: string;
  roleTitle: string;
  heroGreeting: string;
  bio: string;
  avatarUrl?: string;
  location?: string;
  availableForWork: boolean;
  githubUrl?: string;
  twitterUrl?: string;
  linkedinUrl?: string;
  email?: string;
}

export interface PinnedRepoItem {
  name: string;
  owner: string;
  description: string;
  repoUrl: string;
  homepageUrl?: string;
  language?: string;
  languageColor?: string;
  stars: number;
  forks: number;
  topics: string[];
  updatedAt?: string;
}

export interface DatabaseSchema {
  profile: SiteProfile;
  apps: AppItem[];
  articles: ArticleItem[];
}
