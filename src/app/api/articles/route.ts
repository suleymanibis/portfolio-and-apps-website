import { NextResponse } from "next/server";
import { createArticle, getArticles } from "@/lib/db";
import { isAuthenticated } from "@/lib/auth";
import {
  requireAdminJsonMutation,
  revalidateContentPaths,
} from "@/lib/api-guards";
import { buildArticleEnTranslation } from "@/lib/translator";
import { sanitizeArticleCreateInput } from "@/lib/validators";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const wantAll = searchParams.get("all") === "1";
  const admin = wantAll ? await isAuthenticated() : false;
  const articles = await getArticles(admin);
  return NextResponse.json(articles);
}

export async function POST(request: Request) {
  const parsedBody = await requireAdminJsonMutation(request, 262144);
  if (!parsedBody.ok) return parsedBody.response;

  try {
    const validated = sanitizeArticleCreateInput(parsedBody.data);
    if (!validated.ok) {
      return NextResponse.json({ error: validated.error }, { status: 400 });
    }

    const { value } = validated;
    const en = await buildArticleEnTranslation({
      title: value.title,
      excerpt: value.excerpt,
      content: value.content,
      category: value.category,
      tags: value.tags,
    });

    const created = await createArticle({
      ...value,
      en,
    });

    revalidateContentPaths(["/", "/articles"]);
    return NextResponse.json(created, { status: 201 });
  } catch {
    return NextResponse.json(
      { error: "Makale kaydedilirken bir hata oluştu." },
      { status: 500 }
    );
  }
}
