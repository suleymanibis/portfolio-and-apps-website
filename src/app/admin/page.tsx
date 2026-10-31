import type { Metadata } from "next";
import { isAuthenticated } from "@/lib/auth";
import { getApps, getArticles, getProfile } from "@/lib/db";
import { AdminDashboard } from "@/components/AdminDashboard";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Yönetim Paneli",
};

export default async function AdminPage() {
  const authenticated = await isAuthenticated();
  const [profile, apps, articles] = await Promise.all([
    getProfile(),
    getApps(),
    getArticles(authenticated),
  ]);

  return (
    <AdminDashboard
      initialAuthenticated={authenticated}
      initialProfile={profile}
      initialApps={apps}
      initialArticles={articles}
    />
  );
}
