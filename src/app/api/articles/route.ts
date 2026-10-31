import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { createArticle, getArticles } from "@/lib/db";
import { isAuthenticated } from "@/lib/auth";
import { calculateReadingTime, slugify } from "@/lib/utils";
import {
  checkMutationRateLimit,
  cleanStringArray,
  cleanText,
  sanitizeImageUrl,
  verifySameOrigin,
} from "@/lib/security";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const wantAll = searchParams.get("all") === "1";
  const admin = wantAll ? await isAuthenticated() : false;
  const articles = await getArticles(admin);
  return NextResponse.json(articles);
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
    const title = cleanText(body.title, 180);
    const content = cleanText(body.content, 100000);

    if (!title || !content) {
      return NextResponse.json(
        { error: "Makale başlığı ve içeriği zorunludur." },
        { status: 400 }
      );
    }

    const slug = slugify(cleanText(body.slug, 180) || title);
    const excerpt =
      cleanText(body.excerpt, 400) ||
      content.replace(/[#>*_`~\-\[\]()]/g, "").slice(0, 180).trim() + "...";

    const created = await createArticle({
      title,
      slug: slug || `makale-${Date.now()}`,
      excerpt,
      content,
      coverImage: sanitizeImageUrl(body.coverImage),
      category: cleanText(body.category, 60) || "Genel",
      tags: cleanStringArray(body.tags, 20, 40),
      published: body.published !== undefined ? Boolean(body.published) : true,
      featured: Boolean(body.featured),
      readingTimeMinutes: calculateReadingTime(content),
    });

    revalidatePath("/");
    revalidatePath("/articles");
    return NextResponse.json(created, { status: 201 });
  } catch {
    return NextResponse.json(
      { error: "Makale kaydedilirken bir hata oluştu." },
      { status: 500 }
    );
  }
}
