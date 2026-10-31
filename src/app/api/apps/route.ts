import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { createApp, getApps } from "@/lib/db";
import { isAuthenticated } from "@/lib/auth";
import { slugify } from "@/lib/utils";
import {
  checkMutationRateLimit,
  cleanStringArray,
  cleanText,
  sanitizeHttpUrl,
  sanitizeImageUrl,
  verifySameOrigin,
} from "@/lib/security";
import { AppStatus } from "@/types";

const ALLOWED_STATUSES: AppStatus[] = [
  "live",
  "beta",
  "in-progress",
  "open-source",
];

export async function GET() {
  const apps = await getApps();
  return NextResponse.json(apps);
}

export async function POST(request: Request) {
  const csrfErr = verifySameOrigin(request);
  if (csrfErr) return csrfErr;

  const rateErr = checkMutationRateLimit(request);
  if (rateErr) return rateErr;

  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: "Yetkisiz erişim." }, { status: 401 });
  }

  try {
    const body = await request.json();
    const title = cleanText(body.title, 160);
    const tagline = cleanText(body.tagline, 300);

    if (!title || !tagline) {
      return NextResponse.json(
        { error: "Uygulama adı ve kısa açıklama zorunludur." },
        { status: 400 }
      );
    }

    const slug = slugify(cleanText(body.slug, 160) || title);
    const status: AppStatus = ALLOWED_STATUSES.includes(body.status)
      ? body.status
      : "live";

    const created = await createApp({
      title,
      slug: slug || `app-${Date.now()}`,
      tagline,
      description: cleanText(body.description, 50000),
      coverImage: sanitizeImageUrl(body.coverImage),
      category: cleanText(body.category, 60) || "Genel",
      techStack: cleanStringArray(body.techStack, 20, 40),
      demoUrl: sanitizeHttpUrl(body.demoUrl),
      repoUrl: sanitizeHttpUrl(body.repoUrl),
      downloadUrl: sanitizeHttpUrl(body.downloadUrl),
      version: cleanText(body.version, 32),
      status,
      featured: Boolean(body.featured),
    });

    revalidatePath("/");
    revalidatePath("/apps");
    return NextResponse.json(created, { status: 201 });
  } catch {
    return NextResponse.json(
      { error: "Uygulama kaydedilirken bir hata oluştu." },
      { status: 500 }
    );
  }
}
