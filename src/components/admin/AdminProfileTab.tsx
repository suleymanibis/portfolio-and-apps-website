"use client";

import type { Dispatch, FormEvent, SetStateAction } from "react";
import { Save, User } from "lucide-react";
import type { SiteProfile } from "@/types";

interface AdminProfileTabProps {
  profile: SiteProfile;
  setProfile: Dispatch<SetStateAction<SiteProfile>>;
  saving: boolean;
  onSubmit: (e: FormEvent) => void;
}

export function AdminProfileTab({
  profile,
  setProfile,
  saving,
  onSubmit,
}: AdminProfileTabProps) {
  return (
    <form
      onSubmit={onSubmit}
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
            onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
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
            Instagram (URL veya @kullanici)
          </label>
          <input
            type="text"
            value={profile.instagramUrl || ""}
            onChange={(e) =>
              setProfile({ ...profile, instagramUrl: e.target.value })
            }
            placeholder="https://instagram.com/kullanici"
            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-950 text-sm"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold mb-1.5">
            MicUp (URL veya Kullanıcı Adı)
          </label>
          <input
            type="text"
            value={profile.micupUrl || ""}
            onChange={(e) =>
              setProfile({ ...profile, micupUrl: e.target.value })
            }
            placeholder="https://micup.gg/... veya kullaniciadi"
            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-950 text-sm"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold mb-1.5">
            Discord (URL veya Kullanıcı Adı)
          </label>
          <input
            type="text"
            value={profile.discordUrl || ""}
            onChange={(e) =>
              setProfile({ ...profile, discordUrl: e.target.value })
            }
            placeholder="https://discord.gg/... veya kullaniciadi"
            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-950 text-sm"
          />
        </div>

        <div className="md:col-span-2">
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
  );
}
