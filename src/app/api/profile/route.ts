import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { getProfile, updateProfile } from "@/lib/db";
import { isAuthenticated } from "@/lib/auth";
import { buildProfileEnTranslation } from "@/lib/translator";
import {
  checkMutationRateLimit,
  cleanText,
  readBoundedJson,
  sanitizeHttpUrl,
  sanitizeImageUrl,
  sanitizeSocialValue,
  verifySameOrigin,
} from "@/lib/security";
import { SiteProfile } from "@/types";

export async function GET() {
  const profile = await getProfile();
  return NextResponse.json(profile);
}

export async function PUT(request: Request) {
  const csrfErr = verifySameOrigin(request);
  if (csrfErr) return csrfErr;

  const rateErr = checkMutationRateLimit(request);
  if (rateErr) return rateErr;

  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: "Yetkisiz erişim." }, { status: 401 });
  }

  const parsedBody = await readBoundedJson(request, 16384); // 16 KB max
  if (!parsedBody.ok) return parsedBody.response;

  try {
    const body = parsedBody.data;
    const emailRaw = cleanText(body.email, 120);
    const validEmail =
      !emailRaw || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailRaw) ? emailRaw : "";

    const roleTitle = cleanText(body.roleTitle, 120);
    const heroGreeting = cleanText(body.heroGreeting, 240);
    const bio = cleanText(body.bio, 1000);
    const location = cleanText(body.location, 80);

    const en = await buildProfileEnTranslation({
      roleTitle,
      heroGreeting,
      bio,
      location,
    });

    const safeProfile: Partial<SiteProfile> = {
      siteName: cleanText(body.siteName, 60) || "suleymanibis.dev",
      ownerName: cleanText(body.ownerName, 80) || "Süleyman İbiş",
      roleTitle,
      heroGreeting,
      bio,
      avatarUrl: sanitizeImageUrl(body.avatarUrl),
      location,
      availableForWork: Boolean(body.availableForWork),
      githubUrl: sanitizeHttpUrl(body.githubUrl),
      twitterUrl: sanitizeHttpUrl(body.twitterUrl),
      linkedinUrl: sanitizeHttpUrl(body.linkedinUrl),
      instagramUrl: sanitizeSocialValue(
        body.instagramUrl,
        "https://instagram.com/"
      ),
      micupUrl: sanitizeSocialValue(body.micupUrl),
      discordUrl: sanitizeSocialValue(body.discordUrl),
      email: validEmail,
      en,
    };

    const updated = await updateProfile(safeProfile);
    revalidatePath("/");
    revalidatePath("/apps");
    revalidatePath("/repos");
    revalidatePath("/articles");
    return NextResponse.json(updated);
  } catch {
    return NextResponse.json(
      { error: "Profil güncellenirken hata oluştu." },
      { status: 500 }
    );
  }
}
