import { NextResponse } from "next/server";
import { getProfile, updateProfile } from "@/lib/db";
import {
  requireAdminJsonMutation,
  revalidateContentPaths,
} from "@/lib/api-guards";
import { buildProfileEnTranslation } from "@/lib/translator";
import { sanitizeProfileInput } from "@/lib/validators";

export async function GET() {
  const profile = await getProfile();
  return NextResponse.json(profile);
}

export async function PUT(request: Request) {
  const parsedBody = await requireAdminJsonMutation(request, 16384); // 16 KB max
  if (!parsedBody.ok) return parsedBody.response;

  try {
    const cleanProfile = sanitizeProfileInput(parsedBody.data);
    const en = await buildProfileEnTranslation({
      roleTitle: cleanProfile.roleTitle,
      heroGreeting: cleanProfile.heroGreeting,
      bio: cleanProfile.bio,
      location: cleanProfile.location,
    });

    const updated = await updateProfile({
      ...cleanProfile,
      en,
    });

    revalidateContentPaths(["/", "/apps", "/repos", "/articles", "/about"]);
    return NextResponse.json(updated);
  } catch {
    return NextResponse.json(
      { error: "Profil güncellenirken hata oluştu." },
      { status: 500 }
    );
  }
}
