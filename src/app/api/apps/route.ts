import { NextResponse } from "next/server";
import { createApp, getApps } from "@/lib/db";
import {
  requireAdminJsonMutation,
  revalidateContentPaths,
} from "@/lib/api-guards";
import { buildAppEnTranslation } from "@/lib/translator";
import { sanitizeAppCreateInput } from "@/lib/validators";

export async function GET() {
  const apps = await getApps();
  return NextResponse.json(apps);
}

export async function POST(request: Request) {
  const parsedBody = await requireAdminJsonMutation(request, 262144); // 256 KB max
  if (!parsedBody.ok) return parsedBody.response;

  try {
    const validated = sanitizeAppCreateInput(parsedBody.data);
    if (!validated.ok) {
      return NextResponse.json({ error: validated.error }, { status: 400 });
    }

    const { value } = validated;
    const en = await buildAppEnTranslation({
      title: value.title,
      tagline: value.tagline,
      description: value.description,
      category: value.category,
    });

    const created = await createApp({
      ...value,
      en,
    });

    revalidateContentPaths(["/", "/apps"]);
    return NextResponse.json(created, { status: 201 });
  } catch {
    return NextResponse.json(
      { error: "Uygulama kaydedilirken bir hata oluştu." },
      { status: 500 }
    );
  }
}
