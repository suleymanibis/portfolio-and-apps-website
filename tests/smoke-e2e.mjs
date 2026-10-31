import { spawn } from "node:child_process";
import assert from "node:assert/strict";

const PORT = Number(process.env.SMOKE_PORT || 3105);
const BASE_URL = `http://127.0.0.1:${PORT}`;

const server = spawn(
  process.execPath,
  ["node_modules/next/dist/bin/next", "start", "-p", String(PORT)],
  {
    stdio: ["ignore", "pipe", "pipe"],
    env: { ...process.env, NODE_ENV: "production" },
  }
);

let serverLogs = "";
server.stdout.on("data", (chunk) => {
  serverLogs += chunk.toString();
});
server.stderr.on("data", (chunk) => {
  serverLogs += chunk.toString();
});

async function waitForServer(maxAttempts = 50) {
  for (let i = 0; i < maxAttempts; i++) {
    try {
      const res = await fetch(`${BASE_URL}/robots.txt`);
      if (res.ok) return;
    } catch {
      // Server still booting
    }
    await new Promise((r) => setTimeout(r, 300));
  }
  throw new Error(`Next.js server failed to start on port ${PORT}.\n${serverLogs}`);
}

try {
  await waitForServer();

  // 1. Core public & metadata routes return 200 OK
  const routes = [
    "/",
    "/en",
    "/about",
    "/en/about",
    "/apps",
    "/en/apps",
    "/articles",
    "/en/articles",
    "/admin",
    "/robots.txt",
    "/sitemap.xml",
    "/api/apps",
    "/api/articles",
    "/api/about",
    "/api/profile",
  ];

  for (const route of routes) {
    const res = await fetch(`${BASE_URL}${route}`);
    assert.equal(
      res.status,
      200,
      `Expected HTTP 200 on ${route}, received ${res.status}`
    );
  }

  // 2. Bilingual SSR, canonical, hreflang, and JSON-LD verification
  const trHome = await fetch(`${BASE_URL}/`);
  const trHtml = await trHome.text();
  assert.equal(trHome.headers.get("content-language"), "tr");
  assert.ok(trHtml.includes('lang="tr"'), "Missing lang=tr on /");
  assert.ok(trHtml.includes("application/ld+json"), "Missing JSON-LD on /");

  const enAbout = await fetch(`${BASE_URL}/en/about`);
  const enHtml = await enAbout.text();
  assert.equal(enAbout.headers.get("content-language"), "en");
  assert.ok(enHtml.includes('lang="en"'), "Missing lang=en on /en/about");
  assert.ok(
    enHtml.includes('rel="canonical" href="https://suleymanibis.dev/en/about"'),
    "Missing English canonical URL on /en/about"
  );

  // 3. Crawler indexing protections on /admin and /robots.txt
  const adminRes = await fetch(`${BASE_URL}/admin`);
  assert.ok(
    adminRes.headers.get("x-robots-tag")?.includes("noindex"),
    "Missing X-Robots-Tag: noindex on /admin"
  );

  const robotsTxt = await (await fetch(`${BASE_URL}/robots.txt`)).text();
  assert.ok(robotsTxt.includes("Disallow: /admin"));
  assert.ok(robotsTxt.includes("Sitemap: https://suleymanibis.dev/sitemap.xml"));

  const sitemapXml = await (await fetch(`${BASE_URL}/sitemap.xml`)).text();
  assert.ok(sitemapXml.includes("https://suleymanibis.dev/about"));
  assert.ok(sitemapXml.includes("https://suleymanibis.dev/en/about"));

  // 4. Security guards: unauthenticated 401 & cross-origin CSRF 403
  const unauthPost = await fetch(`${BASE_URL}/api/apps`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Origin: BASE_URL,
      Host: `127.0.0.1:${PORT}`,
    },
    body: JSON.stringify({ title: "CI Check", tagline: "Test" }),
  });
  assert.equal(unauthPost.status, 401, "Expected 401 for unauthenticated POST");

  const csrfPut = await fetch(`${BASE_URL}/api/about`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Origin: "https://attacker.example.com",
    },
    body: JSON.stringify({ headline: "CSRF Test" }),
  });
  assert.equal(csrfPut.status, 403, "Expected 403 for cross-origin PUT");

  console.log("✔ E2E production HTTP smoke suite passed (15 routes + SEO + security guards).");
} finally {
  server.kill();
}
