import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { getAbout, updateAbout } from "@/lib/db";
import { isAuthenticated } from "@/lib/auth";
import { buildAboutEnTranslation } from "@/lib/translator";
import {
  checkMutationRateLimit,
  cleanStringArray,
  cleanText,
  readBoundedJson,
  sanitizeHttpUrl,
  sanitizeImageUrl,
  verifySameOrigin,
} from "@/lib/security";
import type {
  AboutEducationItem,
  AboutPageData,
  AboutSkillGroup,
} from "@/types";

export async function GET() {
  const about = await getAbout();
  return NextResponse.json(about);
}

export async function PUT(request: Request) {
  const csrfErr = verifySameOrigin(request);
  if (csrfErr) return csrfErr;

  const rateErr = checkMutationRateLimit(request);
  if (rateErr) return rateErr;

  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: "Yetkisiz erişim." }, { status: 401 });
  }

  const parsedBody = await readBoundedJson(request, 131072); // 128 KB max
  if (!parsedBody.ok) return parsedBody.response;

  try {
    const body = parsedBody.data;
    const headline = cleanText(body.headline, 180) || "Merhaba, ben Süleyman İbiş.";
    const subheadline = cleanText(body.subheadline, 400);
    const currentFocus = cleanText(body.currentFocus, 500);
    const storyMarkdown = cleanText(body.storyMarkdown, 50000);
    const photoUrl = sanitizeImageUrl(body.photoUrl);
    const cvUrl = sanitizeHttpUrl(body.cvUrl);

    const rawEducation = Array.isArray(body.education)
      ? body.education.slice(0, 12)
      : [];
    const education: AboutEducationItem[] = rawEducation
      .map((item) => {
        if (!item || typeof item !== "object") return null;
        const rec = item as Record<string, unknown>;
        const period = cleanText(rec.period, 60);
        const institution = cleanText(rec.institution, 120);
        const title = cleanText(rec.title, 140);
        const description = cleanText(rec.description, 400);
        if (!institution && !title) return null;
        return { period, institution, title, description };
      })
      .filter((x): x is AboutEducationItem => Boolean(x));

    const rawSkills = Array.isArray(body.skillGroups)
      ? body.skillGroups.slice(0, 10)
      : [];
    const skillGroups: AboutSkillGroup[] = rawSkills
      .map((grp) => {
        if (!grp || typeof grp !== "object") return null;
        const rec = grp as Record<string, unknown>;
        const category = cleanText(rec.category, 80);
        const items = cleanStringArray(rec.items, 30, 50);
        if (!category && items.length === 0) return null;
        return { category: category || "Teknolojiler", items };
      })
      .filter((x): x is AboutSkillGroup => Boolean(x));

    const en = await buildAboutEnTranslation({
      headline,
      subheadline,
      storyMarkdown,
      currentFocus,
      education,
      skillGroups,
    });

    const safeAbout: AboutPageData = {
      headline,
      subheadline,
      photoUrl,
      cvUrl,
      currentFocus,
      storyMarkdown,
      education,
      skillGroups,
      en,
    };

    const updated = await updateAbout(safeAbout);
    revalidatePath("/about");
    revalidatePath("/sitemap.xml");
    return NextResponse.json(updated);
  } catch {
    return NextResponse.json(
      { error: "Hakkımda sayfası güncellenirken hata oluştu." },
      { status: 500 }
    );
  }
}
