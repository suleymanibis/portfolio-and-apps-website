import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { deleteApp, getApps, updateApp } from "@/lib/db";
import { isAuthenticated } from "@/lib/auth";
import { slugify } from "@/lib/utils";
import { buildAppEnTranslation } from "@/lib/translator";
import {
  checkMutationRateLimit,
  cleanStringArray,
  cleanText,
  isValidEntityId,
  readBoundedJson,
  sanitizeHttpUrl,
  sanitizeImageUrl,
  verifySameOrigin,
} from "@/lib/security";
import { AppItem, AppStatus } from "@/types";

const ALLOWED_STATUSES: AppStatus[] = [
  "live",
  "beta",
  "in-progress",
  "open-source",
];

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
    return NextResponse.json({ error: "Geçersiz uygulama kimliği." }, { status: 400 });
  }

  const parsedBody = await readBoundedJson(request, 262144);
  if (!parsedBody.ok) return parsedBody.response;

  try {
    const existing = (await getApps()).find((a) => a.id === id);
    if (!existing) {
      return NextResponse.json({ error: "Uygulama bulunamadı." }, { status: 404 });
    }

    const body = parsedBody.data;
    const sanitizedUpdates: Partial<AppItem> = {};
    if (body.title !== undefined)
      sanitizedUpdates.title = cleanText(body.title, 160);
    if (body.slug !== undefined) {
      sanitizedUpdates.slug = slugify(cleanText(body.slug, 160));
    } else if (sanitizedUpdates.title) {
      sanitizedUpdates.slug = slugify(sanitizedUpdates.title);
    }
    if (body.tagline !== undefined)
      sanitizedUpdates.tagline = cleanText(body.tagline, 300);
    if (body.description !== undefined)
      sanitizedUpdates.description = cleanText(body.description, 50000);
    if (body.coverImage !== undefined)
      sanitizedUpdates.coverImage = sanitizeImageUrl(body.coverImage);
    if (body.category !== undefined)
      sanitizedUpdates.category = cleanText(body.category, 60) || "Genel";
    if (body.techStack !== undefined)
      sanitizedUpdates.techStack = cleanStringArray(body.techStack, 20, 40);
    if (body.demoUrl !== undefined)
      sanitizedUpdates.demoUrl = sanitizeHttpUrl(body.demoUrl);
    if (body.repoUrl !== undefined)
      sanitizedUpdates.repoUrl = sanitizeHttpUrl(body.repoUrl);
    if (body.downloadUrl !== undefined)
      sanitizedUpdates.downloadUrl = sanitizeHttpUrl(body.downloadUrl);
    if (body.version !== undefined)
      sanitizedUpdates.version = cleanText(body.version, 32);
    if (
      body.status !== undefined &&
      ALLOWED_STATUSES.includes(body.status as AppStatus)
    )
      sanitizedUpdates.status = body.status as AppStatus;
    if (body.featured !== undefined)
      sanitizedUpdates.featured = Boolean(body.featured);

    sanitizedUpdates.en = await buildAppEnTranslation({
      title: sanitizedUpdates.title ?? existing.title,
      tagline: sanitizedUpdates.tagline ?? existing.tagline,
      description: sanitizedUpdates.description ?? existing.description,
      category: sanitizedUpdates.category ?? existing.category,
    });

    const updated = await updateApp(id, sanitizedUpdates);
    if (!updated) {
      return NextResponse.json({ error: "Uygulama bulunamadı." }, { status: 404 });
    }

    revalidatePath("/");
    revalidatePath("/apps");
    revalidatePath(`/apps/${updated.slug}`);
    return NextResponse.json(updated);
  } catch {
    return NextResponse.json(
      { error: "Uygulama güncellenemedi." },
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
    return NextResponse.json({ error: "Geçersiz uygulama kimliği." }, { status: 400 });
  }

  const ok = await deleteApp(id);
  if (!ok) {
    return NextResponse.json({ error: "Uygulama bulunamadı." }, { status: 404 });
  }

  revalidatePath("/");
  revalidatePath("/apps");
  return NextResponse.json({ success: true });
}
