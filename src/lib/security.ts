import { NextResponse } from "next/server";

interface RateRecord {
  count: number;
  resetAt: number;
  lockedUntil?: number;
}

const loginAttempts = new Map<string, RateRecord>();
const mutationBuckets = new Map<string, RateRecord>();
const MAX_TRACKED_IPS = 5000;

function cleanupMap(map: Map<string, RateRecord>, now: number) {
  if (map.size < MAX_TRACKED_IPS) return;
  for (const [key, val] of map.entries()) {
    if (val.resetAt <= now && (!val.lockedUntil || val.lockedUntil <= now)) {
      map.delete(key);
    }
  }
  if (map.size >= MAX_TRACKED_IPS) {
    const oldestKey = map.keys().next().value;
    if (oldestKey) map.delete(oldestKey);
  }
}

export function getClientIp(request: Request): string {
  const xff = request.headers.get("x-forwarded-for");
  if (xff) {
    return xff.split(",")[0].trim().slice(0, 64);
  }
  const realIp = request.headers.get("x-real-ip");
  if (realIp) {
    return realIp.trim().slice(0, 64);
  }
  return "local-ip";
}

/**
 * Brute-force login rate limiter: max 5 failed attempts per 15 minutes per IP.
 */
export function checkLoginRateLimit(request: Request): {
  allowed: boolean;
  retryAfterSeconds?: number;
} {
  const now = Date.now();
  const ip = getClientIp(request);
  const record = loginAttempts.get(ip);

  if (!record) return { allowed: true };

  if (record.lockedUntil && record.lockedUntil > now) {
    return {
      allowed: false,
      retryAfterSeconds: Math.ceil((record.lockedUntil - now) / 1000),
    };
  }

  if (record.resetAt <= now) {
    loginAttempts.delete(ip);
    return { allowed: true };
  }

  return { allowed: true };
}

export function recordFailedLogin(request: Request): void {
  const now = Date.now();
  cleanupMap(loginAttempts, now);
  const ip = getClientIp(request);
  const windowMs = 15 * 60 * 1000; // 15 minutes
  const maxAttempts = 5;

  const existing = loginAttempts.get(ip);
  if (!existing || existing.resetAt <= now) {
    loginAttempts.set(ip, { count: 1, resetAt: now + windowMs });
    return;
  }

  existing.count += 1;
  if (existing.count >= maxAttempts) {
    existing.lockedUntil = now + windowMs;
  }
  loginAttempts.set(ip, existing);
}

export function clearLoginAttempts(request: Request): void {
  loginAttempts.delete(getClientIp(request));
}

/**
 * General API write rate limiter: max 30 write requests per minute per IP.
 */
export function checkMutationRateLimit(request: Request): NextResponse | null {
  const now = Date.now();
  cleanupMap(mutationBuckets, now);
  const ip = getClientIp(request);
  const windowMs = 60 * 1000;
  const maxRequests = 30;

  const record = mutationBuckets.get(ip);
  if (!record || record.resetAt <= now) {
    mutationBuckets.set(ip, { count: 1, resetAt: now + windowMs });
    return null;
  }

  record.count += 1;
  if (record.count > maxRequests) {
    const retryAfter = Math.ceil((record.resetAt - now) / 1000);
    return NextResponse.json(
      { error: "Çok fazla istek gönderildi. Lütfen biraz bekleyin." },
      {
        status: 429,
        headers: { "Retry-After": String(retryAfter) },
      }
    );
  }
  return null;
}

/**
 * CSRF protection: ensures mutating requests originate from the same host.
 */
export function verifySameOrigin(request: Request): NextResponse | null {
  const origin = request.headers.get("origin");
  const host =
    request.headers.get("x-forwarded-host") || request.headers.get("host");

  if (!host) {
    return NextResponse.json(
      { error: "Geçersiz istek başlığı (Host eksik)." },
      { status: 403 }
    );
  }

  if (origin) {
    try {
      const originHost = new URL(origin).host;
      if (originHost !== host) {
        return NextResponse.json(
          { error: "CSRF doğrulaması başarısız (Origin uyuşmuyor)." },
          { status: 403 }
        );
      }
    } catch {
      return NextResponse.json(
        { error: "Geçersiz Origin başlığı." },
        { status: 403 }
      );
    }
  }

  return null;
}

export function cleanText(value: unknown, maxLength: number): string {
  if (typeof value !== "string") return "";
  return value.replace(/\0/g, "").trim().slice(0, maxLength);
}

export function cleanStringArray(
  value: unknown,
  maxItems = 20,
  maxItemLength = 40
): string[] {
  if (!Array.isArray(value)) return [];
  return value
    .map((item) => cleanText(item, maxItemLength))
    .filter(Boolean)
    .slice(0, maxItems);
}

/**
 * Allows only safe http:// or https:// URLs. Blocks javascript:, data:, vbscript:, etc.
 */
export function sanitizeHttpUrl(value: unknown): string {
  const raw = cleanText(value, 500);
  if (!raw) return "";
  try {
    const parsed = new URL(raw);
    if (parsed.protocol === "https:" || parsed.protocol === "http:") {
      return parsed.toString();
    }
    return "";
  } catch {
    return "";
  }
}

/**
 * Allows safe local /uploads/<file> paths or external http(s) image URLs.
 */
export function sanitizeImageUrl(value: unknown): string {
  const raw = cleanText(value, 500);
  if (!raw) return "";
  if (/^\/uploads\/[a-zA-Z0-9._-]+$/.test(raw) && !raw.includes("..")) {
    return raw;
  }
  return sanitizeHttpUrl(raw);
}

/**
 * Inspects binary magic bytes to verify real raster image type (blocks SVG/HTML XSS & MIME spoofing).
 */
export function detectSafeImageExtension(buffer: Buffer): string | null {
  if (buffer.length < 12) return null;

  // PNG: 89 50 4E 47 0D 0A 1A 0A
  if (
    buffer[0] === 0x89 &&
    buffer[1] === 0x50 &&
    buffer[2] === 0x4e &&
    buffer[3] === 0x47 &&
    buffer[4] === 0x0d &&
    buffer[5] === 0x0a &&
    buffer[6] === 0x1a &&
    buffer[7] === 0x0a
  ) {
    return ".png";
  }

  // JPEG: FF D8 FF
  if (buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff) {
    return ".jpg";
  }

  // GIF87a / GIF89a: 47 49 46 38 (37|39) 61
  if (
    buffer[0] === 0x47 &&
    buffer[1] === 0x49 &&
    buffer[2] === 0x46 &&
    buffer[3] === 0x38 &&
    (buffer[4] === 0x37 || buffer[4] === 0x39) &&
    buffer[5] === 0x61
  ) {
    return ".gif";
  }

  // WEBP: "RIFF" .... "WEBP"
  if (
    buffer[0] === 0x52 &&
    buffer[1] === 0x49 &&
    buffer[2] === 0x46 &&
    buffer[3] === 0x46 &&
    buffer[8] === 0x57 &&
    buffer[9] === 0x45 &&
    buffer[10] === 0x42 &&
    buffer[11] === 0x50
  ) {
    return ".webp";
  }

  return null;
}
