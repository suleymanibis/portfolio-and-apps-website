import { NextResponse } from "next/server";
import { deleteApp, getApps, updateApp } from "@/lib/db";
import {
  requireAdminJsonMutation,
  requireAdminMutation,
  revalidateContentPaths,
} from "@/lib/api-guards";
import { isValidEntityId } from "@/lib/security";
import { buildAppEnTranslation } from "@/lib/translator";
import { sanitizeAppUpdateInput } from "@/lib/validators";

export async function PUT(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  const parsedBody = await requireAdminJsonMutation(request, 262144);
  if (!parsedBody.ok) return parsedBody.response;

  const { id } = await context.params;
  if (!isValidEntityId(id)) {
    return NextResponse.json(
      { error: "Geçersiz uygulama kimliği." },
      { status: 400 }
    );
  }

  try {
    const existing = (await getApps()).find((a) => a.id === id);
    if (!existing) {
      return NextResponse.json(
        { error: "Uygulama bulunamadı." },
        { status: 404 }
      );
    }

    const sanitizedUpdates = sanitizeAppUpdateInput(parsedBody.data);
    sanitizedUpdates.en = await buildAppEnTranslation({
      title: sanitizedUpdates.title ?? existing.title,
      tagline: sanitizedUpdates.tagline ?? existing.tagline,
      description: sanitizedUpdates.description ?? existing.description,
      category: sanitizedUpdates.category ?? existing.category,
    });

    const updated = await updateApp(id, sanitizedUpdates);
    if (!updated) {
      return NextResponse.json(
        { error: "Uygulama bulunamadı." },
        { status: 404 }
      );
    }

    revalidateContentPaths(["/", "/apps", `/apps/${updated.slug}`]);
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
  const guardErr = await requireAdminMutation(request);
  if (guardErr) return guardErr;

  const { id } = await context.params;
  if (!isValidEntityId(id)) {
    return NextResponse.json(
      { error: "Geçersiz uygulama kimliği." },
      { status: 400 }
    );
  }

  const ok = await deleteApp(id);
  if (!ok) {
    return NextResponse.json(
      { error: "Uygulama bulunamadı." },
      { status: 404 }
    );
  }

  revalidateContentPaths(["/", "/apps"]);
  return NextResponse.json({ success: true });
}
