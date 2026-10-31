import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { deleteArticle, updateArticle } from "@/lib/db";
import { isAuthenticated } from "@/lib/auth";
import { calculateReadingTime, slugify } from "@/lib/utils";
import {
  checkMutationRateLimit,
  cleanStringArray,
  cleanText,
  isValidEntityId,
  readBoundedJson,
  sanitizeImageUrl,
  verifySameOrigin,
} from "@/lib/security";
import { ArticleItem } from "@/types";

export async function PUT(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  const csrfErr = verifySameOrigin(request);
  if (csrfErr) return csrfErr;

  const rateErr = checkMutationRateLimit(request);
  if (rateErr) return rateErr;

  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: "Yetkisiz erişim." }, { status: 401 });
  }

  const { id } = await context.params;
  if (!isValidEntityId(id)) {
    return NextResponse.json({ error: "Geçersiz makale kimliği." }, { status: 400 });
  }

  const parsedBody = await readBoundedJson(request, 262144);
  if (!parsedBody.ok) return parsedBody.response;

  try {
    const body = parsedBody.data;
    const sanitizedUpdates: Partial<ArticleItem> = {};
    if (body.title !== undefined)
      sanitizedUpdates.title = cleanText(body.title, 180);
    if (body.slug !== undefined) {
      sanitizedUpdates.slug = slugify(cleanText(body.slug, 180));
    } else if (sanitizedUpdates.title) {
      sanitizedUpdates.slug = slugify(sanitizedUpdates.title);
    }
    if (body.excerpt !== undefined)
      sanitizedUpdates.excerpt = cleanText(body.excerpt, 400);
    if (body.content !== undefined) {
      const content = cleanText(body.content, 100000);
      sanitizedUpdates.content = content;
      sanitizedUpdates.readingTimeMinutes = calculateReadingTime(content);
    }
    if (body.coverImage !== undefined)
      sanitizedUpdates.coverImage = sanitizeImageUrl(body.coverImage);
    if (body.category !== undefined)
      sanitizedUpdates.category = cleanText(body.category, 60) || "Genel";
    if (body.tags !== undefined)
      sanitizedUpdates.tags = cleanStringArray(body.tags, 20, 40);
    if (body.published !== undefined)
      sanitizedUpdates.published = Boolean(body.published);
    if (body.featured !== undefined)
      sanitizedUpdates.featured = Boolean(body.featured);

    const updated = await updateArticle(id, sanitizedUpdates);
    if (!updated) {
      return NextResponse.json({ error: "Makale bulunamadı." }, { status: 404 });
    }

    revalidatePath("/");
    revalidatePath("/articles");
    revalidatePath(`/articles/${updated.slug}`);
    return NextResponse.json(updated);
  } catch {
    return NextResponse.json(
      { error: "Makale güncellenemedi." },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  const csrfErr = verifySameOrigin(request);
  if (csrfErr) return csrfErr;

  const rateErr = checkMutationRateLimit(request);
  if (rateErr) return rateErr;

  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: "Yetkisiz erişim." }, { status: 401 });
  }

  const { id } = await context.params;
  if (!isValidEntityId(id)) {
    return NextResponse.json({ error: "Geçersiz makale kimliği." }, { status: 400 });
  }

  const ok = await deleteArticle(id);
  if (!ok) {
    return NextResponse.json({ error: "Makale bulunamadı." }, { status: 404 });
  }

  revalidatePath("/");
  revalidatePath("/articles");
  return NextResponse.json({ success: true });
}
