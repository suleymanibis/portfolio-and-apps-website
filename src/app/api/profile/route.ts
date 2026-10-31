import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { getProfile, updateProfile } from "@/lib/db";
import { isAuthenticated } from "@/lib/auth";
import {
  checkMutationRateLimit,
  cleanText,
  readBoundedJson,
  sanitizeHttpUrl,
  sanitizeImageUrl,
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

    const safeProfile: Partial<SiteProfile> = {
      siteName: cleanText(body.siteName, 60) || "suleymanibis.dev",
      ownerName: cleanText(body.ownerName, 80) || "Süleyman İbiş",
      roleTitle: cleanText(body.roleTitle, 120),
      heroGreeting: cleanText(body.heroGreeting, 240),
      bio: cleanText(body.bio, 1000),
      avatarUrl: sanitizeImageUrl(body.avatarUrl),
      location: cleanText(body.location, 80),
      availableForWork: Boolean(body.availableForWork),
      githubUrl: sanitizeHttpUrl(body.githubUrl),
      twitterUrl: sanitizeHttpUrl(body.twitterUrl),
      linkedinUrl: sanitizeHttpUrl(body.linkedinUrl),
      email: validEmail,
    };

    const updated = await updateProfile(safeProfile);
    revalidatePath("/");
    revalidatePath("/apps");
    revalidatePath("/articles");
    return NextResponse.json(updated);
  } catch {
    return NextResponse.json(
      { error: "Profil güncellenirken hata oluştu." },
      { status: 500 }
    );
  }
}
