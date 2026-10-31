import { NextResponse } from "next/server";
import { getAbout, updateAbout } from "@/lib/db";
import {
  requireAdminJsonMutation,
  revalidateContentPaths,
} from "@/lib/api-guards";
import { buildAboutEnTranslation } from "@/lib/translator";
import { sanitizeAboutInput } from "@/lib/validators";

export async function GET() {
  const about = await getAbout();
  return NextResponse.json(about);
}

export async function PUT(request: Request) {
  const parsedBody = await requireAdminJsonMutation(request, 131072); // 128 KB max
  if (!parsedBody.ok) return parsedBody.response;

  try {
    const cleanAbout = sanitizeAboutInput(parsedBody.data);
    const en = await buildAboutEnTranslation({
      headline: cleanAbout.headline,
      subheadline: cleanAbout.subheadline,
      storyMarkdown: cleanAbout.storyMarkdown,
      currentFocus: cleanAbout.currentFocus,
      education: cleanAbout.education,
      skillGroups: cleanAbout.skillGroups,
    });

    const updated = await updateAbout({
      ...cleanAbout,
      en,
    });

    revalidateContentPaths(["/about"]);
    return NextResponse.json(updated);
  } catch {
    return NextResponse.json(
      { error: "Hakkımda sayfası güncellenirken hata oluştu." },
      { status: 500 }
    );
  }
}
