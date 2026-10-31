import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { isAuthenticated } from "@/lib/auth";
import {
  checkMutationRateLimit,
  readBoundedJson,
  verifySameOrigin,
} from "@/lib/security";

/**
 * Enforces CSRF same-origin verification, mutation rate limiting, and admin session authentication.
 * Returns a NextResponse error if blocked, or null when authorized to proceed.
 */
export async function requireAdminMutation(
  request: Request
): Promise<Response | null> {
  const csrfErr = verifySameOrigin(request);
  if (csrfErr) return csrfErr;

  const rateErr = checkMutationRateLimit(request);
  if (rateErr) return rateErr;

  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: "Yetkisiz erişim." }, { status: 401 });
  }

  return null;
}

/**
 * Enforces admin mutation guards and parses a size-bounded, prototype-safe JSON body.
 */
export async function requireAdminJsonMutation(
  request: Request,
  maxBytes: number
): Promise<
  | { ok: true; data: Record<string, unknown> }
  | { ok: false; response: Response }
> {
  const guardErr = await requireAdminMutation(request);
  if (guardErr) return { ok: false, response: guardErr };

  return readBoundedJson(request, maxBytes);
}

/**
 * Revalidates public Next.js routes along with the dynamic bilingual sitemap.
 */
export function revalidateContentPaths(paths: string[]): void {
  const unique = new Set([...paths, "/sitemap.xml"]);
  for (const p of unique) {
    revalidatePath(p);
  }
}
