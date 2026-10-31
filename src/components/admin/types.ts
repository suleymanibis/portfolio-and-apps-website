import type { AppStatus } from "@/types";

export type AdminTab = "overview" | "apps" | "articles" | "about" | "profile";

export interface AppFormState {
  id: string;
  title: string;
  slug: string;
  tagline: string;
  description: string;
  coverImage: string;
  category: string;
  techStackInput: string;
  demoUrl: string;
  repoUrl: string;
  downloadUrl: string;
  version: string;
  status: AppStatus;
  featured: boolean;
}

export interface ArticleFormState {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  coverImage: string;
  category: string;
  tagsInput: string;
  published: boolean;
  featured: boolean;
}

export interface SkillGroupInput {
  category: string;
  itemsText: string;
}

export const emptyAppForm: AppFormState = {
  id: "",
  title: "",
  slug: "",
  tagline: "",
  description: "",
  coverImage: "",
  category: "Web Uygulaması",
  techStackInput: "",
  demoUrl: "",
  repoUrl: "",
  downloadUrl: "",
  version: "v1.0.0",
  status: "live",
  featured: true,
};

export const emptyArticleForm: ArticleFormState = {
  id: "",
  title: "",
  slug: "",
  excerpt: "",
  content: "",
  coverImage: "",
  category: "Yazılım Geliştirme",
  tagsInput: "",
  published: true,
  featured: false,
};
