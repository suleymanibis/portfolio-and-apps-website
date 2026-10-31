interface RateRecord {
  count: number;
  resetAt: number;
  lockedUntil?: number;
}

const loginAttempts = new Map<string, RateRecord>();
const mutationBuckets = new Map<string, RateRecord>();
const MAX_TRACKED_IPS = 5000;

let globalLoginWindow: RateRecord = { count: 0, resetAt: 0 };

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

/**
 * Extracts client IP securely, prioritizing platform-verified headers (Vercel)
 * and taking the rightmost proxy hop on X-Forwarded-For to prevent header spoofing.
 */
export function getClientIp(request: Request): string {
  const vercelIp = request.headers.get("x-vercel-forwarded-for");
  if (vercelIp) {
    return vercelIp.split(",")[0].trim().slice(0, 64);
  }

  const realIp = request.headers.get("x-real-ip");
  if (realIp) {
    return realIp.trim().slice(0, 64);
  }

  const xff = request.headers.get("x-forwarded-for");
  if (xff) {
    const hops = xff
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);
    if (hops.length > 0) {
      return hops[hops.length - 1].slice(0, 64);
    }
  }

  return "local-ip";
}

/**
 * Brute-force login rate limiter:
 * - Max 5 failed attempts per 15 minutes per IP
 * - Max 20 failed attempts per 5 minutes globally (distributed botnet protection)
 */
export function checkLoginRateLimit(request: Request): {
  allowed: boolean;
  retryAfterSeconds?: number;
} {
  const now = Date.now();

  if (globalLoginWindow.lockedUntil && globalLoginWindow.lockedUntil > now) {
    return {
      allowed: false,
      retryAfterSeconds: Math.ceil((globalLoginWindow.lockedUntil - now) / 1000),
    };
  }

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

  // Per-IP tracking (5 failures / 15 min)
  const ip = getClientIp(request);
  const windowMs = 15 * 60 * 1000;
  const maxAttempts = 5;

  const existing = loginAttempts.get(ip);
  if (!existing || existing.resetAt <= now) {
    loginAttempts.set(ip, { count: 1, resetAt: now + windowMs });
  } else {
    existing.count += 1;
    if (existing.count >= maxAttempts) {
      existing.lockedUntil = now + windowMs;
    }
    loginAttempts.set(ip, existing);
  }

  // Global circuit breaker (20 failures / 5 min across all IPs)
  const globalWindowMs = 5 * 60 * 1000;
  if (globalLoginWindow.resetAt <= now) {
    globalLoginWindow = { count: 1, resetAt: now + globalWindowMs };
  } else {
    globalLoginWindow.count += 1;
    if (globalLoginWindow.count >= 20) {
      globalLoginWindow.lockedUntil = now + globalWindowMs;
    }
  }
}

export function clearLoginAttempts(request: Request): void {
  loginAttempts.delete(getClientIp(request));
}

export function resetRateLimitStateForTests(): void {
  loginAttempts.clear();
  mutationBuckets.clear();
  globalLoginWindow = { count: 0, resetAt: 0 };
}

/**
 * General API write rate limiter: max 30 write requests per minute per IP.
 */
export function checkMutationRateLimit(request: Request): Response | null {
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
    return Response.json(
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
 * Multi-layer CSRF protection:
 * 1. Validates Fetch Metadata (`Sec-Fetch-Site`) when sent by modern browsers.
 * 2. Requires either `Origin` or `Referer` to be present and strictly match `Host`.
 */
export function verifySameOrigin(request: Request): Response | null {
  const rawHost =
    request.headers.get("x-forwarded-host") || request.headers.get("host");
  const host = rawHost ? rawHost.split(",")[0].trim().toLowerCase() : "";

  if (!host) {
    return Response.json(
      { error: "Geçersiz istek başlığı (Host eksik)." },
      { status: 403 }
    );
  }

  const secFetchSite = request.headers.get("sec-fetch-site");
  if (
    secFetchSite &&
    secFetchSite !== "same-origin" &&
    secFetchSite !== "none"
  ) {
    return Response.json(
      { error: "CSRF doğrulaması başarısız (Cross-Site istek engellendi)." },
      { status: 403 }
    );
  }

  const origin = request.headers.get("origin");
  if (origin) {
    try {
      const originHost = new URL(origin).host.toLowerCase();
      if (originHost !== host) {
        return Response.json(
          { error: "CSRF doğrulaması başarısız (Origin uyuşmuyor)." },
          { status: 403 }
        );
      }
      return null;
    } catch {
      return Response.json(
        { error: "Geçersiz Origin başlığı." },
        { status: 403 }
      );
    }
  }

  const referer = request.headers.get("referer");
  if (referer) {
    try {
      const refererHost = new URL(referer).host.toLowerCase();
      if (refererHost !== host) {
        return Response.json(
          { error: "CSRF doğrulaması başarısız (Referer uyuşmuyor)." },
          { status: 403 }
        );
      }
      return null;
    } catch {
      return Response.json(
        { error: "Geçersiz Referer başlığı." },
        { status: 403 }
      );
    }
  }

  // Neither Origin nor Referer present on a mutating request -> reject
  return Response.json(
    { error: "CSRF doğrulaması başarısız (Kaynak başlığı eksik)." },
    { status: 403 }
  );
}

/**
 * Safely reads and parses JSON with a strict byte limit and Prototype Pollution stripping.
 */
export async function readBoundedJson(
  request: Request,
  maxBytes = 262144 // 256 KB default
): Promise<
  | { ok: true; data: Record<string, unknown> }
  | { ok: false; response: Response }
> {
  const contentLength = Number(request.headers.get("content-length") || "0");
  if (contentLength > maxBytes) {
    return {
      ok: false,
      response: Response.json(
        { error: "İstek gövdesi izin verilen boyutu aşıyor." },
        { status: 413 }
      ),
    };
  }

  try {
    const rawText = await request.text();
    if (Buffer.byteLength(rawText, "utf-8") > maxBytes) {
      return {
        ok: false,
        response: Response.json(
          { error: "İstek gövdesi izin verilen boyutu aşıyor." },
          { status: 413 }
        ),
      };
    }

    const parsed = JSON.parse(rawText, (key, value) => {
      if (key === "__proto__" || key === "constructor" || key === "prototype") {
        return undefined;
      }
      return value;
    });

    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
      return {
        ok: false,
        response: Response.json(
          { error: "Geçersiz JSON nesnesi." },
          { status: 400 }
        ),
      };
    }

    return { ok: true, data: parsed as Record<string, unknown> };
  } catch {
    return {
      ok: false,
      response: Response.json(
        { error: "Geçersiz JSON formatı." },
        { status: 400 }
      ),
    };
  }
}

export function isValidEntityId(id: string): boolean {
  return /^[a-zA-Z0-9_-]{1,64}$/.test(id);
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
 * Sanitizes a social profile link OR username/handle.
 * - Valid http(s):// URLs are returned normalized.
 * - Bare known social domains (e.g. instagram.com/user, discord.gg/abc, micup.gg/abc) get https:// prepended.
 * - Safe handles (@user, user_name, user#1234) either map to `autoUrlPrefix + handle` (e.g. Instagram)
 *   or are kept as a clean handle string (for Discord / MicUp copy-on-click).
 * - Dangerous schemes (javascript:, data:, etc.) or HTML characters are rejected.
 */
export function sanitizeSocialValue(
  value: unknown,
  autoUrlPrefix?: string
): string {
  const raw = cleanText(value, 300);
  if (!raw) return "";

  if (/^https?:\/\//i.test(raw)) {
    return sanitizeHttpUrl(raw);
  }

  if (
    /^(?:www\.)?(?:instagram\.com|discord\.gg|discord\.com|discordapp\.com|micup\.gg|micup\.app|x\.com|twitter\.com|linkedin\.com|github\.com)\/.+/i.test(
      raw
    )
  ) {
    return sanitizeHttpUrl(`https://${raw}`);
  }

  // Block any other colon/scheme or HTML/path characters
  if (/[:<>/"'\\`\s]/.test(raw)) {
    return "";
  }

  if (/^@?[a-zA-Z0-9._#-]{1,64}$/.test(raw)) {
    const cleanHandle = raw.replace(/^@/, "");
    if (!cleanHandle) return "";
    return autoUrlPrefix ? `${autoUrlPrefix}${cleanHandle}` : raw;
  }

  return "";
}

/**
 * Sanitizes links inside Markdown content.
 * Blocks protocol-relative URLs (//evil.com, /\evil.com) and dangerous schemes.
 */
export function sanitizeMarkdownHref(href: string | undefined): string {
  if (!href) return "#";
  const trimmed = href.replace(/[\u0000-\u001F\u007F\s]+/g, "").trim();
  if (!trimmed) return "#";

  // Allow anchor links
  if (trimmed.startsWith("#")) {
    return trimmed.slice(0, 200);
  }

  // Allow strictly internal paths starting with single '/' (not '//' or '/\')
  if (/^\/(?![\/\\])/.test(trimmed) && !trimmed.includes("..")) {
    return trimmed.slice(0, 500);
  }

  try {
    const parsed = new URL(trimmed);
    if (
      parsed.protocol === "https:" ||
      parsed.protocol === "http:" ||
      parsed.protocol === "mailto:"
    ) {
      return parsed.toString();
    }
    return "#";
  } catch {
    return "#";
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

  // JPEG: FF D8 FF (fourth byte must be valid JPEG marker 0xC0..0xFE)
  if (
    buffer[0] === 0xff &&
    buffer[1] === 0xd8 &&
    buffer[2] === 0xff &&
    buffer[3] >= 0xc0 &&
    buffer[3] <= 0xfe
  ) {
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
