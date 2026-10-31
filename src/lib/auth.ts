import crypto from "crypto";

export const AUTH_COOKIE_NAME =
  process.env.NODE_ENV === "production"
    ? "__Host-portfolio_admin"
    : "portfolio_admin_session";

const SESSION_DURATION_MS = 12 * 60 * 60 * 1000; // 12 hours
const SCRYPT_PARAMS = { N: 16384, r: 8, p: 1 };

function isProduction(): boolean {
  return process.env.NODE_ENV === "production";
}

export function isAuthConfiguredProperly(): {
  valid: boolean;
  reason?: string;
} {
  const pwd = process.env.ADMIN_PASSWORD || "";
  const secret = process.env.SESSION_SECRET || "";

  if (isProduction()) {
    if (!pwd || pwd === "admin123" || pwd.length < 10) {
      return {
        valid: false,
        reason: "ADMIN_PASSWORD missing or below minimum length in production",
      };
    }
    if (!secret || secret.length < 32) {
      return {
        valid: false,
        reason: "SESSION_SECRET missing or below minimum length in production",
      };
    }
  }
  return { valid: true };
}

function getSigningSecret(): string {
  if (isProduction()) {
    return process.env.SESSION_SECRET || "";
  }
  return (
    process.env.SESSION_SECRET ||
    "dev-only-fallback-session-secret-do-not-use-in-prod"
  );
}

function getExpectedPassword(): string {
  if (isProduction()) {
    return process.env.ADMIN_PASSWORD || "";
  }
  return process.env.ADMIN_PASSWORD || "admin123";
}

/**
 * Memory-hard (scrypt) + constant-time password verification immune to timing attacks.
 */
export function verifyPassword(input: string): boolean {
  const config = isAuthConfiguredProperly();
  if (!config.valid) return false;

  const expected = getExpectedPassword();
  if (!expected || !input || input.length > 256) return false;

  const salt = crypto
    .createHash("sha256")
    .update(`portfolio-auth-salt:${getSigningSecret()}`)
    .digest();

  const inputDerived = crypto.scryptSync(input, salt, 64, SCRYPT_PARAMS);
  const expectedDerived = crypto.scryptSync(expected, salt, 64, SCRYPT_PARAMS);
  return crypto.timingSafeEqual(inputDerived, expectedDerived);
}

/**
 * Creates an HMAC-SHA256 signed session token with expiration and random nonce.
 */
export function createSessionToken(): string {
  const secret = getSigningSecret();
  const now = Date.now();
  const payloadObj = {
    v: 1,
    iat: now,
    exp: now + SESSION_DURATION_MS,
    jti: crypto.randomBytes(16).toString("hex"),
  };
  const payloadB64 = Buffer.from(JSON.stringify(payloadObj)).toString(
    "base64url"
  );
  const sig = crypto
    .createHmac("sha256", secret)
    .update(payloadB64)
    .digest("base64url");
  return `${payloadB64}.${sig}`;
}

export function verifySessionToken(token: string): boolean {
  const config = isAuthConfiguredProperly();
  if (!config.valid) return false;

  const secret = getSigningSecret();
  if (!secret || !token || token.length > 1024) return false;

  const parts = token.split(".");
  if (parts.length !== 2) return false;

  const [payloadB64, providedSig] = parts;
  if (!payloadB64 || !providedSig) return false;

  const expectedSig = crypto
    .createHmac("sha256", secret)
    .update(payloadB64)
    .digest("base64url");

  const bufA = Buffer.from(providedSig);
  const bufB = Buffer.from(expectedSig);
  if (bufA.length !== bufB.length || !crypto.timingSafeEqual(bufA, bufB)) {
    return false;
  }

  try {
    const payload = JSON.parse(
      Buffer.from(payloadB64, "base64url").toString("utf-8")
    ) as { exp?: number; iat?: number };
    const now = Date.now();
    if (
      typeof payload.exp !== "number" ||
      typeof payload.iat !== "number" ||
      now >= payload.exp ||
      payload.iat > now + 60_000
    ) {
      return false;
    }
    return true;
  } catch {
    return false;
  }
}

export async function isAuthenticated(): Promise<boolean> {
  const { cookies } = await import("next/headers");
  const cookieStore = await cookies();
  const session = cookieStore.get(AUTH_COOKIE_NAME)?.value;
  if (!session) return false;
  return verifySessionToken(session);
}
