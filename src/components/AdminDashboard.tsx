"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Check,
  FileText,
  Layers,
  LayoutDashboard,
  LogOut,
  Plus,
  Settings,
  User,
} from "lucide-react";
import type {
  AboutPageData,
  AppItem,
  ArticleItem,
  SiteProfile,
} from "@/types";
import { slugify } from "@/lib/utils";
import { AdminAboutTab } from "./admin/AdminAboutTab";
import { AdminAppsTab } from "./admin/AdminAppsTab";
import { AdminArticlesTab } from "./admin/AdminArticlesTab";
import { AdminLoginCard } from "./admin/AdminLoginCard";
import { AdminOverviewTab } from "./admin/AdminOverviewTab";
import { AdminProfileTab } from "./admin/AdminProfileTab";
import {
  type AdminTab,
  type SkillGroupInput,
  emptyAppForm,
  emptyArticleForm,
} from "./admin/types";

interface AdminDashboardProps {
  initialAuthenticated: boolean;
  initialProfile: SiteProfile;
  initialAbout: AboutPageData;
  initialApps: AppItem[];
  initialArticles: ArticleItem[];
}

function toSkillGroupInputs(about: AboutPageData): SkillGroupInput[] {
  return (about.skillGroups || []).map((g) => ({
    category: g.category,
    itemsText: g.items.join(", "),
  }));
}

export function AdminDashboard({
  initialAuthenticated,
  initialProfile,
  initialAbout,
  initialApps,
  initialArticles,
}: AdminDashboardProps) {
  const router = useRouter();
  const [authenticated, setAuthenticated] = useState(initialAuthenticated);
  const [password, setPassword] = useState("");
  const [authError, setAuthError] = useState("");
  const [authLoading, setAuthLoading] = useState(false);

  useEffect(() => {
    setAuthenticated(initialAuthenticated);
  }, [initialAuthenticated]);

  const [activeTab, setActiveTab] = useState<AdminTab>("overview");
  const [apps, setApps] = useState<AppItem[]>(initialApps);
  const [articles, setArticles] = useState<ArticleItem[]>(initialArticles);
  const [profile, setProfile] = useState<SiteProfile>(initialProfile);
  const [about, setAbout] = useState<AboutPageData>(initialAbout);
  const [aboutPreview, setAboutPreview] = useState(false);
  const [skillGroupInputs, setSkillGroupInputs] = useState<SkillGroupInput[]>(
    () => toSkillGroupInputs(initialAbout)
  );

  const [toast, setToast] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  const [editingApp, setEditingApp] = useState(false);
  const [appForm, setAppForm] = useState(emptyAppForm);
  const [appPreview, setAppPreview] = useState(false);

  const [editingArticle, setEditingArticle] = useState(false);
  const [articleForm, setArticleForm] = useState(emptyArticleForm);
  const [editorMode, setEditorMode] = useState<"write" | "split" | "preview">(
    "split"
  );

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError("");
    setAuthLoading(true);
    try {
      const res = await fetch("/api/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      const data = await res.json();
      if (!res.ok) {
        setAuthError(data.error || "Giriş başarısız.");
        return;
      }
      setAuthenticated(true);
      setPassword("");
      const artRes = await fetch("/api/articles?all=1");
      if (artRes.ok) {
        setArticles(await artRes.json());
      }
      router.refresh();
    } catch {
      setAuthError("Sunucuya bağlanılamadı.");
    } finally {
      setAuthLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await fetch("/api/auth", {
        method: "DELETE",
        cache: "no-store",
        credentials: "same-origin",
      });
    } finally {
      setAuthenticated(false);
      setEditingApp(false);
      setEditingArticle(false);
      window.location.replace("/admin");
    }
  };

  const uploadImageFile = async (file: File): Promise<string | null> => {
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch("/api/upload", {
        method: "POST",
        body: fd,
      });
      const data = await res.json();
      if (!res.ok) {
        alert(data.error || "Görsel yüklenemedi.");
        return null;
      }
      showToast("Görsel başarıyla yüklendi.");
      return data.url as string;
    } catch {
      alert("Görsel yüklenirken hata oluştu.");
      return null;
    } finally {
      setUploading(false);
    }
  };

  const openNewApp = () => {
    setAppForm(emptyAppForm);
    setAppPreview(false);
    setActiveTab("apps");
    setEditingApp(true);
  };

  const openEditApp = (app: AppItem) => {
    setAppForm({
      id: app.id,
      title: app.title,
      slug: app.slug,
      tagline: app.tagline,
      description: app.description,
      coverImage: app.coverImage || "",
      category: app.category,
      techStackInput: app.techStack.join(", "),
      demoUrl: app.demoUrl || "",
      repoUrl: app.repoUrl || "",
      downloadUrl: app.downloadUrl || "",
      version: app.version || "",
      status: app.status,
      featured: app.featured,
    });
    setAppPreview(false);
    setActiveTab("apps");
    setEditingApp(true);
  };

  const handleSaveApp = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = {
        title: appForm.title,
        slug: appForm.slug || slugify(appForm.title),
        tagline: appForm.tagline,
        description: appForm.description,
        coverImage: appForm.coverImage,
        category: appForm.category,
        techStack: appForm.techStackInput
          .split(",")
          .map((t) => t.trim())
          .filter(Boolean),
        demoUrl: appForm.demoUrl,
        repoUrl: appForm.repoUrl,
        downloadUrl: appForm.downloadUrl,
        version: appForm.version,
        status: appForm.status,
        featured: appForm.featured,
      };

      const isUpdate = Boolean(appForm.id);
      const res = await fetch(
        isUpdate ? `/api/apps/${appForm.id}` : "/api/apps",
        {
          method: isUpdate ? "PUT" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        }
      );
      const saved = await res.json();
      if (!res.ok) {
        alert(saved.error || "Kaydedilemedi.");
        return;
      }

      if (isUpdate) {
        setApps((prev) => prev.map((a) => (a.id === saved.id ? saved : a)));
        showToast("Uygulama güncellendi.");
      } else {
        setApps((prev) => [saved, ...prev]);
        showToast("Yeni uygulama yayınlandı!");
      }
      setEditingApp(false);
      router.refresh();
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteApp = async (id: string, title: string) => {
    if (!confirm(`"${title}" uygulamasını silmek istediğinize emin misiniz?`)) {
      return;
    }
    const res = await fetch(`/api/apps/${id}`, { method: "DELETE" });
    if (res.ok) {
      setApps((prev) => prev.filter((a) => a.id !== id));
      showToast("Uygulama silindi.");
      router.refresh();
    }
  };

  const openNewArticle = () => {
    setArticleForm(emptyArticleForm);
    setActiveTab("articles");
    setEditingArticle(true);
  };

  const openEditArticle = (article: ArticleItem) => {
    setArticleForm({
      id: article.id,
      title: article.title,
      slug: article.slug,
      excerpt: article.excerpt,
      content: article.content,
      coverImage: article.coverImage || "",
      category: article.category,
      tagsInput: article.tags.join(", "),
      published: article.published,
      featured: article.featured,
    });
    setActiveTab("articles");
    setEditingArticle(true);
  };

  const handleSaveArticle = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = {
        title: articleForm.title,
        slug: articleForm.slug || slugify(articleForm.title),
        excerpt: articleForm.excerpt,
        content: articleForm.content,
        coverImage: articleForm.coverImage,
        category: articleForm.category,
        tags: articleForm.tagsInput
          .split(",")
          .map((t) => t.trim())
          .filter(Boolean),
        published: articleForm.published,
        featured: articleForm.featured,
      };

      const isUpdate = Boolean(articleForm.id);
      const res = await fetch(
        isUpdate ? `/api/articles/${articleForm.id}` : "/api/articles",
        {
          method: isUpdate ? "PUT" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        }
      );
      const saved = await res.json();
      if (!res.ok) {
        alert(saved.error || "Makale kaydedilemedi.");
        return;
      }

      if (isUpdate) {
        setArticles((prev) => prev.map((a) => (a.id === saved.id ? saved : a)));
        showToast("Makale güncellendi.");
      } else {
        setArticles((prev) => [saved, ...prev]);
        showToast(
          saved.published
            ? "Makale yayınlandı!"
            : "Makale taslak olarak kaydedildi."
        );
      }
      setEditingArticle(false);
      router.refresh();
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteArticle = async (id: string, title: string) => {
    if (
      !confirm(`"${title}" başlıklı makaleyi silmek istediğinize emin misiniz?`)
    ) {
      return;
    }
    const res = await fetch(`/api/articles/${id}`, { method: "DELETE" });
    if (res.ok) {
      setArticles((prev) => prev.filter((a) => a.id !== id));
      showToast("Makale silindi.");
      router.refresh();
    }
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch("/api/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(profile),
      });
      if (res.ok) {
        const updated = await res.json();
        setProfile(updated);
        showToast("Site ve profil bilgileri güncellendi!");
        router.refresh();
      }
    } finally {
      setSaving(false);
    }
  };

  const handleSaveAbout = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload: AboutPageData = {
        ...about,
        skillGroups: skillGroupInputs
          .map((g) => ({
            category: g.category.trim(),
            items: g.itemsText
              .split(",")
              .map((s) => s.trim())
              .filter(Boolean),
          }))
          .filter((g) => g.category || g.items.length > 0),
      };

      const res = await fetch("/api/about", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) {
        alert(data.error || "Hakkımda sayfası kaydedilemedi.");
        return;
      }
      setAbout(data);
      setSkillGroupInputs(toSkillGroupInputs(data));
      showToast("Hakkımda sayfası (TR & EN) güncellendi!");
      router.refresh();
    } finally {
      setSaving(false);
    }
  };

  if (!authenticated) {
    return (
      <AdminLoginCard
        password={password}
        authError={authError}
        authLoading={authLoading}
        onPasswordChange={setPassword}
        onSubmit={handleLogin}
      />
    );
  }

  const publishedCount = articles.filter((a) => a.published).length;
  const draftCount = articles.length - publishedCount;

  const tabs: Array<{ id: AdminTab; label: string; icon: typeof LayoutDashboard }> = [
    { id: "overview", label: "Genel Bakış", icon: LayoutDashboard },
    { id: "apps", label: `Uygulamalar (${apps.length})`, icon: Layers },
    {
      id: "articles",
      label: `Makaleler (${articles.length})`,
      icon: FileText,
    },
    { id: "about", label: "Hakkımda Sayfası", icon: User },
    { id: "profile", label: "Profil & Site Ayarları", icon: Settings },
  ];

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10 space-y-8">
      {toast && (
        <div className="fixed bottom-5 right-5 z-50 flex items-center gap-2 px-4 py-3 rounded-xl bg-emerald-600 text-white text-sm font-medium shadow-lg">
          <Check className="w-4 h-4" />
          <span>{toast}</span>
        </div>
      )}

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-200 dark:border-zinc-800">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            İçerik & Uygulama Yönetimi
          </h1>
          <p className="text-sm text-slate-500 dark:text-zinc-400 mt-1">
            Uygulamalarınızı, teknik makalelerinizi ve site ayarlarınızı buradan yönetebilirsiniz.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            type="button"
            onClick={openNewApp}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white transition-colors cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Yeni Uygulama</span>
          </button>
          <button
            type="button"
            onClick={openNewArticle}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold border border-indigo-500/40 bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-500/20 transition-colors cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Yeni Makale</span>
          </button>
          <button
            type="button"
            onClick={handleLogout}
            title="Çıkış Yap"
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium border border-slate-200 dark:border-zinc-800 text-slate-600 dark:text-zinc-400 hover:text-rose-500 transition-colors cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Çıkış</span>
          </button>
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const active = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => {
                setActiveTab(tab.id);
                setEditingApp(false);
                setEditingArticle(false);
              }}
              className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-colors cursor-pointer ${
                active
                  ? "bg-indigo-600 text-white shadow-xs"
                  : "bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white"
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {activeTab === "overview" && (
        <AdminOverviewTab
          apps={apps}
          articles={articles}
          publishedCount={publishedCount}
          draftCount={draftCount}
          onNewApp={openNewApp}
          onEditApp={openEditApp}
          onNewArticle={openNewArticle}
          onEditArticle={openEditArticle}
        />
      )}

      {activeTab === "apps" && (
        <AdminAppsTab
          apps={apps}
          editingApp={editingApp}
          setEditingApp={setEditingApp}
          appForm={appForm}
          setAppForm={setAppForm}
          appPreview={appPreview}
          setAppPreview={setAppPreview}
          saving={saving}
          uploading={uploading}
          onOpenNew={openNewApp}
          onOpenEdit={openEditApp}
          onSave={handleSaveApp}
          onDelete={handleDeleteApp}
          onUploadImage={uploadImageFile}
        />
      )}

      {activeTab === "articles" && (
        <AdminArticlesTab
          articles={articles}
          publishedCount={publishedCount}
          draftCount={draftCount}
          editingArticle={editingArticle}
          setEditingArticle={setEditingArticle}
          articleForm={articleForm}
          setArticleForm={setArticleForm}
          editorMode={editorMode}
          setEditorMode={setEditorMode}
          saving={saving}
          uploading={uploading}
          onOpenNew={openNewArticle}
          onOpenEdit={openEditArticle}
          onSave={handleSaveArticle}
          onDelete={handleDeleteArticle}
          onUploadImage={uploadImageFile}
        />
      )}

      {activeTab === "about" && (
        <AdminAboutTab
          about={about}
          setAbout={setAbout}
          skillGroupInputs={skillGroupInputs}
          setSkillGroupInputs={setSkillGroupInputs}
          aboutPreview={aboutPreview}
          setAboutPreview={setAboutPreview}
          saving={saving}
          uploading={uploading}
          onSubmit={handleSaveAbout}
          onUploadImage={uploadImageFile}
        />
      )}

      {activeTab === "profile" && (
        <AdminProfileTab
          profile={profile}
          setProfile={setProfile}
          saving={saving}
          onSubmit={handleSaveProfile}
        />
      )}
    </div>
  );
}
