export type Locale = "tr" | "en";

export type AppStatus = "live" | "beta" | "in-progress" | "open-source";

export interface AppTranslation {
  title: string;
  tagline: string;
  description: string;
  category: string;
}

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
  en?: AppTranslation;
}

export interface ArticleTranslation {
  title: string;
  excerpt: string;
  content: string;
  category: string;
  tags: string[];
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
  en?: ArticleTranslation;
}

export interface ProfileTranslation {
  roleTitle: string;
  heroGreeting: string;
  bio: string;
  location?: string;
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
  instagramUrl?: string;
  micupUrl?: string;
  discordUrl?: string;
  email?: string;
  en?: ProfileTranslation;
}

export interface AboutEducationItem {
  period: string;
  institution: string;
  title: string;
  description: string;
}

export interface AboutSkillGroup {
  category: string;
  items: string[];
}

export interface AboutTranslation {
  headline: string;
  subheadline: string;
  storyMarkdown: string;
  currentFocus: string;
  education: AboutEducationItem[];
  skillGroups: AboutSkillGroup[];
}

export interface AboutPageData {
  headline: string;
  subheadline: string;
  photoUrl?: string;
  cvUrl?: string;
  storyMarkdown: string;
  currentFocus: string;
  education: AboutEducationItem[];
  skillGroups: AboutSkillGroup[];
  updatedAt?: string;
  en?: AboutTranslation;
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
  about?: AboutPageData;
  apps: AppItem[];
  articles: ArticleItem[];
}
