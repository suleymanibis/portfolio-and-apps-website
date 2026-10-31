import type { Metadata } from "next";
import { isAuthenticated } from "@/lib/auth";
import { getAbout, getApps, getArticles, getProfile } from "@/lib/db";
import { AdminDashboard } from "@/components/AdminDashboard";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Yönetim Paneli",
};

export default async function AdminPage() {
  const authenticated = await isAuthenticated();
  const [profile, about, apps, articles] = await Promise.all([
    getProfile(),
    getAbout(),
    getApps(),
    getArticles(authenticated),
  ]);

  return (
    <AdminDashboard
      initialAuthenticated={authenticated}
      initialProfile={profile}
      initialAbout={about}
      initialApps={apps}
      initialArticles={articles}
    />
  );
}
