"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Check,
  Code,
  Edit3,
  ExternalLink,
  Eye,
  FileText,
  ImagePlus,
  Layers,
  LayoutDashboard,
  Lock,
  LogOut,
  Plus,
  Quote,
  Save,
  Settings,
  Sparkles,
  Trash2,
  User,
  X,
} from "lucide-react";
import { AppItem, AppStatus, ArticleItem, SiteProfile } from "@/types";
import { formatDateTR, slugify, statusLabels } from "@/lib/utils";
import { MarkdownRenderer } from "./MarkdownRenderer";

interface AdminDashboardProps {
  initialAuthenticated: boolean;
  initialProfile: SiteProfile;
  initialApps: AppItem[];
  initialArticles: ArticleItem[];
}

type AdminTab = "overview" | "apps" | "articles" | "profile";

const emptyAppForm = {
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
  status: "live" as AppStatus,
  featured: true,
};

const emptyArticleForm = {
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

export function AdminDashboard({
  initialAuthenticated,
  initialProfile,
  initialApps,
  initialArticles,
}: AdminDashboardProps) {
  const router = useRouter();
  const [authenticated, setAuthenticated] = useState(initialAuthenticated);
  const [password, setPassword] = useState("");
  const [authError, setAuthError] = useState("");
  const [authLoading, setAuthLoading] = useState(false);

  const [activeTab, setActiveTab] = useState<AdminTab>("overview");
  const [apps, setApps] = useState<AppItem[]>(initialApps);
  const [articles, setArticles] = useState<ArticleItem[]>(initialArticles);
  const [profile, setProfile] = useState<SiteProfile>(initialProfile);

  const [toast, setToast] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  // App editor state
  const [editingApp, setEditingApp] = useState(false);
  const [appForm, setAppForm] = useState(emptyAppForm);
  const [appPreview, setAppPreview] = useState(false);

  // Article editor state
  const [editingArticle, setEditingArticle] = useState(false);
  const [articleForm, setArticleForm] = useState(emptyArticleForm);
  const [editorMode, setEditorMode] = useState<"write" | "split" | "preview">(
    "split"
  );

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  // --- Auth Handlers ---
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
      // Fetch all articles including drafts once logged in
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
    await fetch("/api/auth", { method: "DELETE" });
    setAuthenticated(false);
    router.refresh();
  };

  // --- Image Upload Helper ---
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

  // --- App CRUD ---
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

  // --- Article CRUD ---
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
    setEditingArticle(true);
  };

  const insertMarkdownSnippet = (snippet: string) => {
    setArticleForm((prev) => ({
      ...prev,
      content: prev.content
        ? `${prev.content}\n${snippet}`
        : snippet,
    }));
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
    if (!confirm(`"${title}" başlıklı makaleyi silmek istediğinize emin misiniz?`)) {
      return;
    }
    const res = await fetch(`/api/articles/${id}`, { method: "DELETE" });
    if (res.ok) {
      setArticles((prev) => prev.filter((a) => a.id !== id));
      showToast("Makale silindi.");
      router.refresh();
    }
  };

  // --- Profile Save ---
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

  // --- Login View ---
  if (!authenticated) {
    return (
      <div className="max-w-md mx-auto px-4 py-20">
        <div className="rounded-3xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/80 p-8 shadow-sm space-y-6">
          <div className="flex flex-col items-center text-center space-y-2">
            <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
              <Lock className="w-6 h-6" />
            </div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
              Yönetim Paneli Girişi
            </h1>
            <p className="text-sm text-slate-500 dark:text-zinc-400">
              Uygulama paylaşmak ve makale yayınlamak için yönetici şifrenizi girin.
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-zinc-300 mb-1.5">
                Yönetici Şifresi
              </label>
              <input
                type="password"
                required
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-950 text-sm focus:outline-none focus:border-indigo-500"
              />
            </div>

            {authError && (
              <p className="text-xs font-medium text-rose-500 bg-rose-500/10 px-3 py-2 rounded-lg">
                {authError}
              </p>
            )}

            <button
              type="submit"
              disabled={authLoading}
              className="w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-semibold text-sm transition-colors cursor-pointer"
            >
              {authLoading ? "Giriş Yapılıyor..." : "Panele Giriş Yap"}
            </button>
          </form>
        </div>
      </div>
    );
  }

  const publishedCount = articles.filter((a) => a.published).length;
  const draftCount = articles.length - publishedCount;

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10 space-y-8">
      {/* Toast Notification */}
      {toast && (
        <div className="fixed bottom-5 right-5 z-50 flex items-center gap-2 px-4 py-3 rounded-xl bg-emerald-600 text-white text-sm font-medium shadow-lg">
          <Check className="w-4 h-4" />
          <span>{toast}</span>
        </div>
      )}

      {/* Top Header */}
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

      {/* Navigation Tabs */}
      <div className="flex flex-wrap gap-2">
        {[
          { id: "overview", label: "Genel Bakış", icon: LayoutDashboard },
          { id: "apps", label: `Uygulamalar (${apps.length})`, icon: Layers },
          {
            id: "articles",
            label: `Makaleler (${articles.length})`,
            icon: FileText,
          },
          { id: "profile", label: "Profil & Site Ayarları", icon: Settings },
        ].map((tab) => {
          const Icon = tab.icon;
          const active = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => {
                setActiveTab(tab.id as AdminTab);
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

      {/* TAB 1: OVERVIEW */}
      {activeTab === "overview" && (
        <div className="space-y-8">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            <div className="rounded-2xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/70 p-6">
              <div className="flex items-center justify-between text-indigo-600 dark:text-indigo-400 mb-3">
                <Layers className="w-5 h-5" />
                <span className="text-xs font-mono">PORTFOLYO</span>
              </div>
              <p className="text-3xl font-extrabold text-slate-900 dark:text-white">
                {apps.length}
              </p>
              <p className="text-sm text-slate-500 dark:text-zinc-400 mt-1">
                Paylaşılan Uygulama
              </p>
            </div>

            <div className="rounded-2xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/70 p-6">
              <div className="flex items-center justify-between text-emerald-600 dark:text-emerald-400 mb-3">
                <FileText className="w-5 h-5" />
                <span className="text-xs font-mono">YAYINDA</span>
              </div>
              <p className="text-3xl font-extrabold text-slate-900 dark:text-white">
                {publishedCount}
              </p>
              <p className="text-sm text-slate-500 dark:text-zinc-400 mt-1">
                Yayınlanmış Makale
              </p>
            </div>

            <div className="rounded-2xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/70 p-6">
              <div className="flex items-center justify-between text-amber-600 dark:text-amber-400 mb-3">
                <Edit3 className="w-5 h-5" />
                <span className="text-xs font-mono">TASLAK</span>
              </div>
              <p className="text-3xl font-extrabold text-slate-900 dark:text-white">
                {draftCount}
              </p>
              <p className="text-sm text-slate-500 dark:text-zinc-400 mt-1">
                Taslak Yazı
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Recent Apps */}
            <div className="rounded-2xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/60 p-6 space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="font-bold text-slate-900 dark:text-white">
                  Son Eklenen Uygulamalar
                </h2>
                <button
                  type="button"
                  onClick={openNewApp}
                  className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline cursor-pointer"
                >
                  + Uygulama Ekle
                </button>
              </div>
              <div className="divide-y divide-slate-100 dark:divide-zinc-800">
                {apps.slice(0, 4).map((app) => (
                  <div
                    key={app.id}
                    className="py-3 flex items-center justify-between gap-3"
                  >
                    <div className="min-w-0">
                      <p className="font-semibold text-sm text-slate-900 dark:text-zinc-100 truncate">
                        {app.title}
                      </p>
                      <p className="text-xs text-slate-500 dark:text-zinc-400 truncate">
                        {app.category} • {formatDateTR(app.createdAt)}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setActiveTab("apps");
                        openEditApp(app);
                      }}
                      className="px-2.5 py-1 rounded-lg text-xs font-medium border border-slate-200 dark:border-zinc-800 hover:border-indigo-500/50 cursor-pointer shrink-0"
                    >
                      Düzenle
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Recent Articles */}
            <div className="rounded-2xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/60 p-6 space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="font-bold text-slate-900 dark:text-white">
                  Son Makaleler
                </h2>
                <button
                  type="button"
                  onClick={openNewArticle}
                  className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline cursor-pointer"
                >
                  + Makale Yaz
                </button>
              </div>
              <div className="divide-y divide-slate-100 dark:divide-zinc-800">
                {articles.slice(0, 4).map((art) => (
                  <div
                    key={art.id}
                    className="py-3 flex items-center justify-between gap-3"
                  >
                    <div className="min-w-0">
                      <p className="font-semibold text-sm text-slate-900 dark:text-zinc-100 truncate">
                        {art.title}
                      </p>
                      <p className="text-xs text-slate-500 dark:text-zinc-400">
                        {art.published ? "Yayında" : "Taslak"} •{" "}
                        {formatDateTR(art.createdAt)}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setActiveTab("articles");
                        openEditArticle(art);
                      }}
                      className="px-2.5 py-1 rounded-lg text-xs font-medium border border-slate-200 dark:border-zinc-800 hover:border-indigo-500/50 cursor-pointer shrink-0"
                    >
                      Düzenle
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: APPS MANAGEMENT */}
      {activeTab === "apps" && (
        <div>
          {editingApp ? (
            <form
              onSubmit={handleSaveApp}
              className="rounded-3xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/80 p-6 sm:p-8 space-y-6"
            >
              <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-zinc-800">
                <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                  {appForm.id ? "Uygulamayı Düzenle" : "Yeni Uygulama Paylaş"}
                </h2>
                <button
                  type="button"
                  onClick={() => setEditingApp(false)}
                  className="inline-flex items-center gap-1 text-xs font-medium text-slate-500 hover:text-slate-900 dark:hover:text-white cursor-pointer"
                >
                  <X className="w-4 h-4" />
                  <span>İptal</span>
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="block text-xs font-semibold mb-1.5">
                    Uygulama Adı *
                  </label>
                  <input
                    type="text"
                    required
                    value={appForm.title}
                    onChange={(e) =>
                      setAppForm({
                        ...appForm,
                        title: e.target.value,
                        slug: appForm.id ? appForm.slug : slugify(e.target.value),
                      })
                    }
                    placeholder="Örn: FocusFlow Görev Yöneticisi"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-950 text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold mb-1.5">
                    URL Uzantısı (Slug)
                  </label>
                  <input
                    type="text"
                    value={appForm.slug}
                    onChange={(e) =>
                      setAppForm({ ...appForm, slug: slugify(e.target.value) })
                    }
                    placeholder="focusflow-gorev-yoneticisi"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-950 text-sm font-mono"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-xs font-semibold mb-1.5">
                    Kısa Özet (Tagline) *
                  </label>
                  <input
                    type="text"
                    required
                    value={appForm.tagline}
                    onChange={(e) =>
                      setAppForm({ ...appForm, tagline: e.target.value })
                    }
                    placeholder="Uygulamanın ne işe yaradığını anlatan tek cümlelik özet"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-950 text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold mb-1.5">
                    Kategori
                  </label>
                  <input
                    type="text"
                    value={appForm.category}
                    onChange={(e) =>
                      setAppForm({ ...appForm, category: e.target.value })
                    }
                    placeholder="Örn: Üretkenlik, Yapay Zeka, Mobil, Oyun"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-950 text-sm"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold mb-1.5">
                      Durum
                    </label>
                    <select
                      value={appForm.status}
                      onChange={(e) =>
                        setAppForm({
                          ...appForm,
                          status: e.target.value as AppStatus,
                        })
                      }
                      className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-950 text-sm"
                    >
                      <option value="live">Yayında</option>
                      <option value="open-source">Açık Kaynak</option>
                      <option value="beta">Beta</option>
                      <option value="in-progress">Geliştiriliyor</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold mb-1.5">
                      Sürüm
                    </label>
                    <input
                      type="text"
                      value={appForm.version}
                      onChange={(e) =>
                        setAppForm({ ...appForm, version: e.target.value })
                      }
                      placeholder="v1.0.0"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-950 text-sm font-mono"
                    />
                  </div>
                </div>

                <div className="md:col-span-2">
                  <label className="block text-xs font-semibold mb-1.5">
                    Kullanılan Teknolojiler (Virgülle ayırın)
                  </label>
                  <input
                    type="text"
                    value={appForm.techStackInput}
                    onChange={(e) =>
                      setAppForm({ ...appForm, techStackInput: e.target.value })
                    }
                    placeholder="Next.js, TypeScript, Tailwind CSS, Electron, Python"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-950 text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold mb-1.5">
                    Canlı Demo Bağlantısı
                  </label>
                  <input
                    type="url"
                    value={appForm.demoUrl}
                    onChange={(e) =>
                      setAppForm({ ...appForm, demoUrl: e.target.value })
                    }
                    placeholder="https://uygulama.com"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-950 text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold mb-1.5">
                    GitHub / Kaynak Kod Bağlantısı
                  </label>
                  <input
                    type="url"
                    value={appForm.repoUrl}
                    onChange={(e) =>
                      setAppForm({ ...appForm, repoUrl: e.target.value })
                    }
                    placeholder="https://github.com/kullanici/proje"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-950 text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold mb-1.5">
                    İndirme Bağlantısı (Opsiyonel - APK / EXE / ZIP)
                  </label>
                  <input
                    type="url"
                    value={appForm.downloadUrl}
                    onChange={(e) =>
                      setAppForm({ ...appForm, downloadUrl: e.target.value })
                    }
                    placeholder="https://github.com/.../releases/latest"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-950 text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold mb-1.5">
                    Kapak Görseli (URL veya Dosya Yükle)
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={appForm.coverImage}
                      onChange={(e) =>
                        setAppForm({ ...appForm, coverImage: e.target.value })
                      }
                      placeholder="/uploads/... veya https://..."
                      className="flex-1 px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-950 text-sm"
                    />
                    <label className="inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-zinc-700 bg-slate-100 dark:bg-zinc-800 text-xs font-semibold cursor-pointer hover:border-indigo-500 shrink-0">
                      <ImagePlus className="w-4 h-4" />
                      <span>{uploading ? "..." : "Yükle"}</span>
                      <input
                        type="file"
                        accept="image/png,image/jpeg,image/webp,image/gif"
                        className="hidden"
                        onChange={async (e) => {
                          const file = e.target.files?.[0];
                          if (!file) return;
                          const url = await uploadImageFile(file);
                          if (url) {
                            setAppForm((prev) => ({ ...prev, coverImage: url }));
                          }
                        }}
                      />
                    </label>
                  </div>
                </div>
              </div>

              {/* Markdown Description */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold">
                    Detaylı Açıklama & Özellikler (Markdown destekli)
                  </label>
                  <button
                    type="button"
                    onClick={() => setAppPreview(!appPreview)}
                    className="inline-flex items-center gap-1 text-xs font-semibold text-indigo-600 dark:text-indigo-400 cursor-pointer"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>{appPreview ? "Düzenlemeye Dön" : "Önizleme"}</span>
                  </button>
                </div>

                {appPreview ? (
                  <div className="min-h-[220px] p-5 rounded-2xl border border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-950">
                    <MarkdownRenderer
                      content={appForm.description || "*Henüz içerik girilmedi.*"}
                    />
                  </div>
                ) : (
                  <textarea
                    rows={9}
                    value={appForm.description}
                    onChange={(e) =>
                      setAppForm({ ...appForm, description: e.target.value })
                    }
                    placeholder="## Uygulama Özellikleri&#10;- Özellik 1&#10;- Özellik 2"
                    className="w-full p-4 rounded-2xl border border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-950 text-sm font-mono leading-relaxed"
                  />
                )}
              </div>

              <div className="flex flex-wrap items-center justify-between gap-4 pt-4 border-t border-slate-200 dark:border-zinc-800">
                <label className="inline-flex items-center gap-2 text-sm font-medium cursor-pointer">
                  <input
                    type="checkbox"
                    checked={appForm.featured}
                    onChange={(e) =>
                      setAppForm({ ...appForm, featured: e.target.checked })
                    }
                    className="w-4 h-4 rounded accent-indigo-600"
                  />
                  <span>Ana sayfadaki vitrinde öne çıkar</span>
                </label>

                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => setEditingApp(false)}
                    className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-zinc-800 text-sm font-medium cursor-pointer"
                  >
                    Vazgeç
                  </button>
                  <button
                    type="submit"
                    disabled={saving}
                    className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold cursor-pointer"
                  >
                    <Save className="w-4 h-4" />
                    <span>{saving ? "Kaydediliyor..." : "Uygulamayı Kaydet"}</span>
                  </button>
                </div>
              </div>
            </form>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <p className="text-sm text-slate-500 dark:text-zinc-400">
                  Toplam {apps.length} uygulama listeleniyor.
                </p>
                <button
                  type="button"
                  onClick={openNewApp}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>Yeni Uygulama Ekle</span>
                </button>
              </div>

              <div className="rounded-2xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/60 divide-y divide-slate-100 dark:divide-zinc-800">
                {apps.length === 0 ? (
                  <div className="p-10 text-center text-sm text-slate-500">
                    Henüz uygulama eklenmemiş.
                  </div>
                ) : (
                  apps.map((app) => {
                    const st = statusLabels[app.status] || statusLabels.live;
                    return (
                      <div
                        key={app.id}
                        className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                      >
                        <div className="space-y-1 min-w-0">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="font-bold text-slate-900 dark:text-white">
                              {app.title}
                            </span>
                            <span
                              className={`px-2 py-0.5 rounded-full text-[11px] font-medium border ${st.colorClass}`}
                            >
                              {st.label}
                            </span>
                            {app.featured && (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium bg-indigo-500/10 text-indigo-600 dark:text-indigo-400">
                                <Sparkles className="w-3 h-3" />
                                Vitrin
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-slate-500 dark:text-zinc-400 line-clamp-1">
                            {app.tagline}
                          </p>
                        </div>

                        <div className="flex items-center gap-2 shrink-0">
                          <Link
                            href={`/apps/${app.slug}`}
                            target="_blank"
                            className="p-2 rounded-lg border border-slate-200 dark:border-zinc-800 text-slate-500 hover:text-indigo-500"
                            title="Sayfayı Görüntüle"
                          >
                            <ExternalLink className="w-4 h-4" />
                          </Link>
                          <button
                            type="button"
                            onClick={() => openEditApp(app)}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-zinc-800 text-xs font-semibold hover:border-indigo-500/50 cursor-pointer"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                            <span>Düzenle</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteApp(app.id, app.title)}
                            className="p-2 rounded-lg border border-slate-200 dark:border-zinc-800 text-slate-500 hover:text-rose-500 hover:border-rose-500/40 cursor-pointer"
                            title="Sil"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB 3: ARTICLES MANAGEMENT */}
      {activeTab === "articles" && (
        <div>
          {editingArticle ? (
            <form
              onSubmit={handleSaveArticle}
              className="rounded-3xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/80 p-6 sm:p-8 space-y-6"
            >
              <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-zinc-800">
                <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                  {articleForm.id ? "Makaleyi Düzenle" : "Yeni Makale Yaz"}
                </h2>
                <button
                  type="button"
                  onClick={() => setEditingArticle(false)}
                  className="inline-flex items-center gap-1 text-xs font-medium text-slate-500 hover:text-slate-900 dark:hover:text-white cursor-pointer"
                >
                  <X className="w-4 h-4" />
                  <span>İptal</span>
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="block text-xs font-semibold mb-1.5">
                    Makale Başlığı *
                  </label>
                  <input
                    type="text"
                    required
                    value={articleForm.title}
                    onChange={(e) =>
                      setArticleForm({
                        ...articleForm,
                        title: e.target.value,
                        slug: articleForm.id
                          ? articleForm.slug
                          : slugify(e.target.value),
                      })
                    }
                    placeholder="Örn: Modern Web Mimarisi Üzerine Notlar"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-950 text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold mb-1.5">
                    URL Uzantısı (Slug)
                  </label>
                  <input
                    type="text"
                    value={articleForm.slug}
                    onChange={(e) =>
                      setArticleForm({
                        ...articleForm,
                        slug: slugify(e.target.value),
                      })
                    }
                    placeholder="modern-web-mimarisi-uzerine-notlar"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-950 text-sm font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold mb-1.5">
                    Kategori
                  </label>
                  <input
                    type="text"
                    value={articleForm.category}
                    onChange={(e) =>
                      setArticleForm({
                        ...articleForm,
                        category: e.target.value,
                      })
                    }
                    placeholder="Örn: Yazılım Geliştirme, Yapay Zeka, Deneyim"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-950 text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold mb-1.5">
                    Etiketler (Virgülle ayırın)
                  </label>
                  <input
                    type="text"
                    value={articleForm.tagsInput}
                    onChange={(e) =>
                      setArticleForm({
                        ...articleForm,
                        tagsInput: e.target.value,
                      })
                    }
                    placeholder="Next.js, Mimari, Performans"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-950 text-sm"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-xs font-semibold mb-1.5">
                    Kısa Özet (Liste görünümünde ve SEO açıklamasında yer alır)
                  </label>
                  <textarea
                    rows={2}
                    value={articleForm.excerpt}
                    onChange={(e) =>
                      setArticleForm({
                        ...articleForm,
                        excerpt: e.target.value,
                      })
                    }
                    placeholder="Makalenin ana fikrini anlatan 1-2 cümlelik giriş..."
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-950 text-sm"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-xs font-semibold mb-1.5">
                    Kapak Görseli (Opsiyonel)
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={articleForm.coverImage}
                      onChange={(e) =>
                        setArticleForm({
                          ...articleForm,
                          coverImage: e.target.value,
                        })
                      }
                      placeholder="/uploads/... veya https://..."
                      className="flex-1 px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-950 text-sm"
                    />
                    <label className="inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-zinc-700 bg-slate-100 dark:bg-zinc-800 text-xs font-semibold cursor-pointer hover:border-indigo-500 shrink-0">
                      <ImagePlus className="w-4 h-4" />
                      <span>{uploading ? "..." : "Kapak Yükle"}</span>
                      <input
                        type="file"
                        accept="image/png,image/jpeg,image/webp,image/gif"
                        className="hidden"
                        onChange={async (e) => {
                          const file = e.target.files?.[0];
                          if (!file) return;
                          const url = await uploadImageFile(file);
                          if (url) {
                            setArticleForm((prev) => ({
                              ...prev,
                              coverImage: url,
                            }));
                          }
                        }}
                      />
                    </label>
                  </div>
                </div>
              </div>

              {/* Markdown Editor + Live Preview */}
              <div className="space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-2 bg-slate-100 dark:bg-zinc-950 p-2 rounded-xl border border-slate-200 dark:border-zinc-800">
                  <div className="flex flex-wrap items-center gap-1">
                    <button
                      type="button"
                      onClick={() => insertMarkdownSnippet("## Alt Başlık\n")}
                      className="px-2.5 py-1 rounded-lg text-xs font-semibold hover:bg-white dark:hover:bg-zinc-800 cursor-pointer"
                    >
                      H2
                    </button>
                    <button
                      type="button"
                      onClick={() => insertMarkdownSnippet("**kalın metin**")}
                      className="px-2.5 py-1 rounded-lg text-xs font-bold hover:bg-white dark:hover:bg-zinc-800 cursor-pointer"
                    >
                      B
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        insertMarkdownSnippet(
                          "```typescript\n// Kodunuzu buraya yazın\n```"
                        )
                      }
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium hover:bg-white dark:hover:bg-zinc-800 cursor-pointer"
                    >
                      <Code className="w-3.5 h-3.5" />
                      <span>Kod</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => insertMarkdownSnippet("> Önemli bir not veya alıntı")}
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium hover:bg-white dark:hover:bg-zinc-800 cursor-pointer"
                    >
                      <Quote className="w-3.5 h-3.5" />
                      <span>Alıntı</span>
                    </button>
                    <label className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium hover:bg-white dark:hover:bg-zinc-800 cursor-pointer">
                      <ImagePlus className="w-3.5 h-3.5" />
                      <span>İçeriğe Görsel Ekle</span>
                      <input
                        type="file"
                        accept="image/png,image/jpeg,image/webp,image/gif"
                        className="hidden"
                        onChange={async (e) => {
                          const file = e.target.files?.[0];
                          if (!file) return;
                          const url = await uploadImageFile(file);
                          if (url) {
                            insertMarkdownSnippet(`![Görsel Açıklaması](${url})`);
                          }
                        }}
                      />
                    </label>
                  </div>

                  <div className="flex items-center gap-1 bg-white dark:bg-zinc-900 p-1 rounded-lg border border-slate-200 dark:border-zinc-800 text-xs">
                    {(
                      [
                        { id: "write", label: "Yaz" },
                        { id: "split", label: "Yan Yana" },
                        { id: "preview", label: "Önizleme" },
                      ] as const
                    ).map((m) => (
                      <button
                        key={m.id}
                        type="button"
                        onClick={() => setEditorMode(m.id)}
                        className={`px-2.5 py-1 rounded-md font-medium cursor-pointer ${
                          editorMode === m.id
                            ? "bg-indigo-600 text-white"
                            : "text-slate-600 dark:text-zinc-400"
                        }`}
                      >
                        {m.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div
                  className={`grid gap-4 ${
                    editorMode === "split"
                      ? "grid-cols-1 lg:grid-cols-2"
                      : "grid-cols-1"
                  }`}
                >
                  {(editorMode === "write" || editorMode === "split") && (
                    <textarea
                      required
                      rows={16}
                      value={articleForm.content}
                      onChange={(e) =>
                        setArticleForm({
                          ...articleForm,
                          content: e.target.value,
                        })
                      }
                      placeholder="Makalenizi Markdown formatında buraya yazın..."
                      className="w-full p-4 rounded-2xl border border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-950 text-sm font-mono leading-relaxed focus:outline-none focus:border-indigo-500"
                    />
                  )}

                  {(editorMode === "preview" || editorMode === "split") && (
                    <div className="p-5 rounded-2xl border border-slate-200 dark:border-zinc-800 bg-slate-50/60 dark:bg-zinc-950/60 max-h-[460px] overflow-y-auto">
                      <MarkdownRenderer
                        content={
                          articleForm.content ||
                          "*Canlı önizleme burada görünecek...*"
                        }
                      />
                    </div>
                  )}
                </div>
              </div>

              <div className="flex flex-wrap items-center justify-between gap-4 pt-4 border-t border-slate-200 dark:border-zinc-800">
                <div className="flex flex-wrap items-center gap-6">
                  <label className="inline-flex items-center gap-2 text-sm font-medium cursor-pointer">
                    <input
                      type="checkbox"
                      checked={articleForm.published}
                      onChange={(e) =>
                        setArticleForm({
                          ...articleForm,
                          published: e.target.checked,
                        })
                      }
                      className="w-4 h-4 rounded accent-indigo-600"
                    />
                    <span>Hemen yayınla (işaret kaldırılırsa Taslak kalır)</span>
                  </label>
                </div>

                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => setEditingArticle(false)}
                    className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-zinc-800 text-sm font-medium cursor-pointer"
                  >
                    Vazgeç
                  </button>
                  <button
                    type="submit"
                    disabled={saving}
                    className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold cursor-pointer"
                  >
                    <Save className="w-4 h-4" />
                    <span>
                      {saving
                        ? "Kaydediliyor..."
                        : articleForm.published
                        ? "Makaleyi Yayınla"
                        : "Taslağı Kaydet"}
                    </span>
                  </button>
                </div>
              </div>
            </form>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <p className="text-sm text-slate-500 dark:text-zinc-400">
                  Toplam {articles.length} makale ({publishedCount} yayında,{" "}
                  {draftCount} taslak).
                </p>
                <button
                  type="button"
                  onClick={openNewArticle}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>Yeni Makale Yaz</span>
                </button>
              </div>

              <div className="rounded-2xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/60 divide-y divide-slate-100 dark:divide-zinc-800">
                {articles.length === 0 ? (
                  <div className="p-10 text-center text-sm text-slate-500">
                    Henüz makale bulunmuyor.
                  </div>
                ) : (
                  articles.map((art) => (
                    <div
                      key={art.id}
                      className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                    >
                      <div className="space-y-1 min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="font-bold text-slate-900 dark:text-white">
                            {art.title}
                          </span>
                          <span
                            className={`px-2 py-0.5 rounded-full text-[11px] font-semibold ${
                              art.published
                                ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400"
                                : "bg-amber-500/15 text-amber-600 dark:text-amber-400"
                            }`}
                          >
                            {art.published ? "Yayında" : "Taslak"}
                          </span>
                        </div>
                        <p className="text-xs text-slate-500 dark:text-zinc-400">
                          {art.category} • {art.readingTimeMinutes} dk okuma •{" "}
                          {formatDateTR(art.createdAt)}
                        </p>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <Link
                          href={`/articles/${art.slug}`}
                          target="_blank"
                          className="p-2 rounded-lg border border-slate-200 dark:border-zinc-800 text-slate-500 hover:text-indigo-500"
                          title="Yazıyı Görüntüle"
                        >
                          <ExternalLink className="w-4 h-4" />
                        </Link>
                        <button
                          type="button"
                          onClick={() => openEditArticle(art)}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-zinc-800 text-xs font-semibold hover:border-indigo-500/50 cursor-pointer"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                          <span>Düzenle</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteArticle(art.id, art.title)}
                          className="p-2 rounded-lg border border-slate-200 dark:border-zinc-800 text-slate-500 hover:text-rose-500 hover:border-rose-500/40 cursor-pointer"
                          title="Sil"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB 4: PROFILE & SITE SETTINGS */}
      {activeTab === "profile" && (
        <form
          onSubmit={handleSaveProfile}
          className="rounded-3xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/80 p-6 sm:p-8 space-y-6"
        >
          <div className="flex items-center gap-2.5 pb-4 border-b border-slate-200 dark:border-zinc-800">
            <User className="w-5 h-5 text-indigo-500" />
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">
              Profil & Site Kimliği Ayarları
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="block text-xs font-semibold mb-1.5">
                Site Adı (Üst menüde görünür)
              </label>
              <input
                type="text"
                required
                value={profile.siteName}
                onChange={(e) =>
                  setProfile({ ...profile, siteName: e.target.value })
                }
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-950 text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold mb-1.5">
                Adınız / Geliştirici Adı
              </label>
              <input
                type="text"
                required
                value={profile.ownerName}
                onChange={(e) =>
                  setProfile({ ...profile, ownerName: e.target.value })
                }
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-950 text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold mb-1.5">
                Ünvan / Rol
              </label>
              <input
                type="text"
                value={profile.roleTitle}
                onChange={(e) =>
                  setProfile({ ...profile, roleTitle: e.target.value })
                }
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-950 text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold mb-1.5">
                Konum
              </label>
              <input
                type="text"
                value={profile.location || ""}
                onChange={(e) =>
                  setProfile({ ...profile, location: e.target.value })
                }
                placeholder="İstanbul, Türkiye"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-950 text-sm"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-xs font-semibold mb-1.5">
                Ana Sayfa Büyük Başlık (Hero Sloganı)
              </label>
              <input
                type="text"
                value={profile.heroGreeting}
                onChange={(e) =>
                  setProfile({ ...profile, heroGreeting: e.target.value })
                }
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-950 text-sm"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-xs font-semibold mb-1.5">
                Hakkımda / Biyografi
              </label>
              <textarea
                rows={3}
                value={profile.bio}
                onChange={(e) =>
                  setProfile({ ...profile, bio: e.target.value })
                }
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-950 text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold mb-1.5">
                GitHub URL
              </label>
              <input
                type="url"
                value={profile.githubUrl || ""}
                onChange={(e) =>
                  setProfile({ ...profile, githubUrl: e.target.value })
                }
                placeholder="https://github.com/kullanici"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-950 text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold mb-1.5">
                X / Twitter URL
              </label>
              <input
                type="url"
                value={profile.twitterUrl || ""}
                onChange={(e) =>
                  setProfile({ ...profile, twitterUrl: e.target.value })
                }
                placeholder="https://x.com/kullanici"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-950 text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold mb-1.5">
                LinkedIn URL
              </label>
              <input
                type="url"
                value={profile.linkedinUrl || ""}
                onChange={(e) =>
                  setProfile({ ...profile, linkedinUrl: e.target.value })
                }
                placeholder="https://linkedin.com/in/kullanici"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-950 text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold mb-1.5">
                İletişim E-posta Adresi
              </label>
              <input
                type="email"
                value={profile.email || ""}
                onChange={(e) =>
                  setProfile({ ...profile, email: e.target.value })
                }
                placeholder="ornek@alanadi.com"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-950 text-sm"
              />
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-4 pt-4 border-t border-slate-200 dark:border-zinc-800">
            <label className="inline-flex items-center gap-2 text-sm font-medium cursor-pointer">
              <input
                type="checkbox"
                checked={profile.availableForWork}
                onChange={(e) =>
                  setProfile({
                    ...profile,
                    availableForWork: e.target.checked,
                  })
                }
                className="w-4 h-4 rounded accent-emerald-600"
              />
              <span>&ldquo;Yeni projelere & iş birliklerine açık&rdquo; rozetini göster</span>
            </label>

            <button
              type="submit"
              disabled={saving}
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold cursor-pointer"
            >
              <Save className="w-4 h-4" />
              <span>{saving ? "Kaydediliyor..." : "Ayarları Kaydet"}</span>
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
