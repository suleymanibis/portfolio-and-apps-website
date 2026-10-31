import { NextResponse } from "next/server";
import { deleteArticle, getArticles, updateArticle } from "@/lib/db";
import {
  requireAdminJsonMutation,
  requireAdminMutation,
  revalidateContentPaths,
} from "@/lib/api-guards";
import { isValidEntityId } from "@/lib/security";
import { buildArticleEnTranslation } from "@/lib/translator";
import { sanitizeArticleUpdateInput } from "@/lib/validators";

export async function PUT(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  const parsedBody = await requireAdminJsonMutation(request, 262144);
  if (!parsedBody.ok) return parsedBody.response;

  const { id } = await context.params;
  if (!isValidEntityId(id)) {
    return NextResponse.json(
      { error: "Geçersiz makale kimliği." },
      { status: 400 }
    );
  }

  try {
    const existing = (await getArticles(true)).find((a) => a.id === id);
    if (!existing) {
      return NextResponse.json(
        { error: "Makale bulunamadı." },
        { status: 404 }
      );
    }

    const sanitizedUpdates = sanitizeArticleUpdateInput(parsedBody.data);
    sanitizedUpdates.en = await buildArticleEnTranslation({
      title: sanitizedUpdates.title ?? existing.title,
      excerpt: sanitizedUpdates.excerpt ?? existing.excerpt,
      content: sanitizedUpdates.content ?? existing.content,
      category: sanitizedUpdates.category ?? existing.category,
      tags: sanitizedUpdates.tags ?? existing.tags,
    });

    const updated = await updateArticle(id, sanitizedUpdates);
    if (!updated) {
      return NextResponse.json(
        { error: "Makale bulunamadı." },
        { status: 404 }
      );
    }

    revalidateContentPaths(["/", "/articles", `/articles/${updated.slug}`]);
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
  const guardErr = await requireAdminMutation(request);
  if (guardErr) return guardErr;

  const { id } = await context.params;
  if (!isValidEntityId(id)) {
    return NextResponse.json(
      { error: "Geçersiz makale kimliği." },
      { status: 400 }
    );
  }

  const ok = await deleteArticle(id);
  if (!ok) {
    return NextResponse.json(
      { error: "Makale bulunamadı." },
      { status: 404 }
    );
  }

  revalidateContentPaths(["/", "/articles"]);
  return NextResponse.json({ success: true });
}
