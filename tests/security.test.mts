import test from "node:test";
import assert from "node:assert/strict";
import {
  checkLoginRateLimit,
  clearLoginAttempts,
  detectSafeImageExtension,
  getClientIp,
  isValidEntityId,
  readBoundedJson,
  recordFailedLogin,
  resetRateLimitStateForTests,
  sanitizeHttpUrl,
  sanitizeImageUrl,
  sanitizeMarkdownHref,
  sanitizeSocialValue,
  verifySameOrigin,
} from "../src/lib/security.ts";
import {
  createSessionToken,
  isAuthConfiguredProperly,
  verifyPassword,
  verifySessionToken,
} from "../src/lib/auth.ts";

test("1. Password scrypt verification & production fail-closed checks", () => {
  process.env.ADMIN_PASSWORD = "SuperStrongPassword!2026";
  process.env.SESSION_SECRET =
    "0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef";

  assert.equal(verifyPassword("SuperStrongPassword!2026"), true);
  assert.equal(verifyPassword("WrongPassword!2026"), false);
  assert.equal(verifyPassword(""), false);
  assert.equal(verifyPassword("a".repeat(300)), false);

  // Verify production fail-closed protection against default or weak credentials
  const prevEnv = process.env.NODE_ENV;
  (process.env as Record<string, string | undefined>).NODE_ENV = "production";
  try {
    process.env.ADMIN_PASSWORD = "admin123";
    assert.equal(isAuthConfiguredProperly().valid, false);
    assert.equal(verifyPassword("admin123"), false);

    process.env.ADMIN_PASSWORD = "SuperStrongPassword!2026";
    process.env.SESSION_SECRET = "too-short";
    assert.equal(isAuthConfiguredProperly().valid, false);

    process.env.SESSION_SECRET =
      "0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef";
    assert.equal(isAuthConfiguredProperly().valid, true);
    assert.equal(verifyPassword("SuperStrongPassword!2026"), true);
  } finally {
    (process.env as Record<string, string | undefined>).NODE_ENV = prevEnv;
  }
});

test("2. Session token HMAC signature & expiration tamper resistance", () => {
  process.env.ADMIN_PASSWORD = "SuperStrongPassword!2026";
  process.env.SESSION_SECRET =
    "0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef";

  const validToken = createSessionToken();
  assert.equal(verifySessionToken(validToken), true);

  // Tamper signature
  const [payloadB64, sig] = validToken.split(".");
  const flippedSig =
    (sig[0] === "a" ? "b" : "a") + sig.slice(1);
  assert.equal(verifySessionToken(`${payloadB64}.${flippedSig}`), false);

  // Tamper payload (extend exp)
  const forgedPayload = Buffer.from(
    JSON.stringify({
      v: 1,
      iat: Date.now(),
      exp: Date.now() + 999999999,
      jti: "forged",
    })
  ).toString("base64url");
  assert.equal(verifySessionToken(`${forgedPayload}.${sig}`), false);
});

test("3. Multi-layer CSRF protection blocks missing Origin, cross-site & Sec-Fetch-Site", () => {
  // Valid same-origin request
  const validReq = new Request("https://suleymanibis.dev/api/apps", {
    method: "POST",
    headers: {
      host: "suleymanibis.dev",
      origin: "https://suleymanibis.dev",
      "sec-fetch-site": "same-origin",
    },
  });
  assert.equal(verifySameOrigin(validReq), null);

  // Cross-origin Origin header -> 403
  const evilOriginReq = new Request("https://suleymanibis.dev/api/apps", {
    method: "POST",
    headers: {
      host: "suleymanibis.dev",
      origin: "https://attacker.example",
    },
  });
  assert.equal(verifySameOrigin(evilOriginReq)?.status, 403);

  // Missing BOTH Origin and Referer -> 403 (closes missing-origin bypass)
  const missingHeadersReq = new Request("https://suleymanibis.dev/api/apps", {
    method: "POST",
    headers: {
      host: "suleymanibis.dev",
    },
  });
  assert.equal(verifySameOrigin(missingHeadersReq)?.status, 403);

  // Sec-Fetch-Site: cross-site -> 403
  const crossFetchSiteReq = new Request("https://suleymanibis.dev/api/apps", {
    method: "POST",
    headers: {
      host: "suleymanibis.dev",
      origin: "https://suleymanibis.dev",
      "sec-fetch-site": "cross-site",
    },
  });
  assert.equal(verifySameOrigin(crossFetchSiteReq)?.status, 403);
});

test("4. Spoof-resistant IP extraction & brute-force login lockout", () => {
  resetRateLimitStateForTests();

  // Spoofed leftmost X-Forwarded-For must NOT override rightmost proxy hop
  const spoofedXffReq = new Request("https://suleymanibis.dev/api/auth", {
    headers: {
      "x-forwarded-for": "1.1.1.1, 203.0.113.99",
    },
  });
  assert.equal(getClientIp(spoofedXffReq), "203.0.113.99");

  // Vercel trusted header takes priority
  const vercelReq = new Request("https://suleymanibis.dev/api/auth", {
    headers: {
      "x-vercel-forwarded-for": "198.51.100.42",
      "x-forwarded-for": "9.9.9.9",
    },
  });
  assert.equal(getClientIp(vercelReq), "198.51.100.42");

  // 5 failed logins lock out the IP
  for (let i = 0; i < 5; i++) {
    assert.equal(checkLoginRateLimit(vercelReq).allowed, true);
    recordFailedLogin(vercelReq);
  }
  const locked = checkLoginRateLimit(vercelReq);
  assert.equal(locked.allowed, false);
  assert.ok((locked.retryAfterSeconds || 0) > 0);

  clearLoginAttempts(vercelReq);
  assert.equal(checkLoginRateLimit(vercelReq).allowed, true);
});

test("5. Bounded JSON reader blocks oversized payloads & prototype pollution", async () => {
  const bigBody = JSON.stringify({ data: "x".repeat(5000) });
  const bigReq = new Request("https://suleymanibis.dev/api/auth", {
    method: "POST",
    body: bigBody,
  });
  const bigRes = await readBoundedJson(bigReq, 1024);
  assert.equal(bigRes.ok, false);
  if (!bigRes.ok) {
    assert.equal(bigRes.response.status, 413);
  }

  const protoReq = new Request("https://suleymanibis.dev/api/apps", {
    method: "POST",
    body: '{"title":"Safe","__proto__":{"polluted":true},"constructor":{"bad":1}}',
  });
  const protoRes = await readBoundedJson(protoReq, 4096);
  assert.equal(protoRes.ok, true);
  if (protoRes.ok) {
    assert.equal(protoRes.data.title, "Safe");
    assert.equal(
      ({} as Record<string, unknown>).polluted,
      undefined
    );
  }
});

test("6. URL & Markdown link sanitizers block XSS, protocol-relative URLs & traversal", () => {
  assert.equal(sanitizeHttpUrl("javascript:alert(1)"), "");
  assert.equal(sanitizeHttpUrl("data:text/html,<script>alert(1)</script>"), "");
  assert.equal(sanitizeHttpUrl("https://github.com/suleymanibis"), "https://github.com/suleymanibis");

  // Protocol-relative & control-char obfuscation blocked in Markdown
  assert.equal(sanitizeMarkdownHref("//evil.com/phish"), "#");
  assert.equal(sanitizeMarkdownHref("/\\evil.com"), "#");
  assert.equal(sanitizeMarkdownHref("java\tscript:alert(1)"), "#");
  assert.equal(sanitizeMarkdownHref("/apps/focusflow"), "/apps/focusflow");
  assert.equal(sanitizeMarkdownHref("#bolum-1"), "#bolum-1");

  // Image path traversal blocked
  assert.equal(sanitizeImageUrl("/uploads/../../etc/passwd"), "");
  assert.equal(sanitizeImageUrl("/uploads/a1b2c3d4.png"), "/uploads/a1b2c3d4.png");

  // Entity ID validation
  assert.equal(isValidEntityId("app-1730000000"), true);
  assert.equal(isValidEntityId("../db.json"), false);

  // Social links & handles (Instagram, MicUp, Discord)
  assert.equal(
    sanitizeSocialValue("@suleymanibis", "https://instagram.com/"),
    "https://instagram.com/suleymanibis"
  );
  assert.equal(
    sanitizeSocialValue("https://micup.gg/suleyman"),
    "https://micup.gg/suleyman"
  );
  assert.equal(sanitizeSocialValue("suleymanibis"), "suleymanibis");
  assert.equal(sanitizeSocialValue("javascript:alert(1)"), "");
  assert.equal(sanitizeSocialValue("<script>alert(1)</script>"), "");
});

test("7. Binary magic-byte image validator accepts real raster images & blocks SVG/HTML/EXE", () => {
  const validPng = Buffer.from([
    0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0x00, 0x00, 0x00, 0x0d,
  ]);
  const validJpg = Buffer.from([
    0xff, 0xd8, 0xff, 0xe0, 0x00, 0x10, 0x4a, 0x46, 0x49, 0x46, 0x00, 0x01,
  ]);
  const fakeJpg = Buffer.from([
    0xff, 0xd8, 0xff, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
  ]);
  const svgXss = Buffer.from('<svg xmlns="http://www.w3.org/2000/svg" onload="alert(1)"/>');
  const htmlFile = Buffer.from("<!DOCTYPE html><html><script>alert(1)</script></html>");

  assert.equal(detectSafeImageExtension(validPng), ".png");
  assert.equal(detectSafeImageExtension(validJpg), ".jpg");
  assert.equal(detectSafeImageExtension(fakeJpg), null);
  assert.equal(detectSafeImageExtension(svgXss), null);
  assert.equal(detectSafeImageExtension(htmlFile), null);
});

test("8. Bilingual i18n dictionary & Markdown translator preserve code blocks and URLs", async () => {
  const { getDictionary } = await import("../src/lib/i18n.ts");
  const { getStatusInfo } = await import("../src/lib/utils.ts");
  const { translateMarkdownTrToEn } = await import("../src/lib/translator.ts");

  assert.equal(getDictionary("tr").nav.articles, "Makaleler");
  assert.equal(getDictionary("en").nav.articles, "Articles");
  assert.equal(getStatusInfo("open-source", "tr").label, "Açık Kaynak");
  assert.equal(getStatusInfo("open-source", "en").label, "Open Source");

  const originalFetch = globalThis.fetch;
  globalThis.fetch = async (_input, init) => {
    const params = new URLSearchParams(String(init?.body || ""));
    const q = params.get("q") || "";
    const mocked = q
      .replace("Başlık", "Heading")
      .replace("Merhaba", "Hello")
      .replace("tıklayın", "click here");
    return Response.json([[[mocked, q]]]);
  };

  try {
    const md = [
      "## Başlık",
      "",
      "Merhaba `const x = 42;` ve [tıklayın](https://suleymanibis.dev/apps)",
      "",
      "```typescript",
      "const gizliKod = 'degismemeli';",
      "```",
    ].join("\n");

    const out = await translateMarkdownTrToEn(md);
    assert.ok(out.includes("## Heading"));
    assert.ok(out.includes("`const x = 42;`"));
    assert.ok(out.includes("[click here](https://suleymanibis.dev/apps)"));
    assert.ok(out.includes("const gizliKod = 'degismemeli';"));
  } finally {
    globalThis.fetch = originalFetch;
  }
});
