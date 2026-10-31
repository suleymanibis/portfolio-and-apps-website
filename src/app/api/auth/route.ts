import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import {
  AUTH_COOKIE_NAME,
  createSessionToken,
  isAuthConfiguredProperly,
  isAuthenticated,
  verifyPassword,
} from "@/lib/auth";
import {
  checkLoginRateLimit,
  clearLoginAttempts,
  readBoundedJson,
  recordFailedLogin,
  verifySameOrigin,
} from "@/lib/security";

export async function GET() {
  const authenticated = await isAuthenticated();
  return NextResponse.json({ authenticated });
}

export async function POST(request: Request) {
  const csrfErr = verifySameOrigin(request);
  if (csrfErr) return csrfErr;

  const configCheck = isAuthConfiguredProperly();
  if (!configCheck.valid) {
    console.error("[Security] Auth configuration error:", configCheck.reason);
    return NextResponse.json(
      { error: "Yönetim paneli şu anda kullanılamıyor." },
      { status: 503 }
    );
  }

  const rateCheck = checkLoginRateLimit(request);
  if (!rateCheck.allowed) {
    return NextResponse.json(
      {
        error: `Çok fazla hatalı giriş denemesi. Lütfen ${Math.ceil(
          (rateCheck.retryAfterSeconds || 900) / 60
        )} dakika sonra tekrar deneyin.`,
      },
      {
        status: 429,
        headers: {
          "Retry-After": String(rateCheck.retryAfterSeconds || 900),
        },
      }
    );
  }

  const parsedBody = await readBoundedJson(request, 4096);
  if (!parsedBody.ok) return parsedBody.response;

  try {
    const body = parsedBody.data;
    const password =
      typeof body.password === "string" ? body.password.slice(0, 256) : "";

    if (!verifyPassword(password)) {
      recordFailedLogin(request);
      // Artificial jittered delay (350-500ms) to slow down automated attacks
      await new Promise((r) => setTimeout(r, 350 + Math.random() * 150));
      return NextResponse.json(
        { error: "Hatalı yönetici şifresi." },
        { status: 401 }
      );
    }

    clearLoginAttempts(request);
    const token = createSessionToken();
    const cookieStore = await cookies();
    cookieStore.set(AUTH_COOKIE_NAME, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      path: "/",
      maxAge: 60 * 60 * 12, // 12 hours
    });

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json(
      { error: "İstek işlenirken hata oluştu." },
      { status: 400 }
    );
  }
}

export async function DELETE(request: Request) {
  const csrfErr = verifySameOrigin(request);
  if (csrfErr) return csrfErr;

  const cookieStore = await cookies();
  // __Host- prefixed cookies strictly require Secure + Path=/ even when expiring/deleting
  cookieStore.set(AUTH_COOKIE_NAME, "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    path: "/",
    maxAge: 0,
    expires: new Date(0),
  });

  const response = NextResponse.json({ success: true });
  response.headers.set("Cache-Control", "no-store, max-age=0");
  return response;
}
