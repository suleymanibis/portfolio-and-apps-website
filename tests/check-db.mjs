import fs from "node:fs";
import path from "node:path";
import assert from "node:assert/strict";

const dbPath = path.join(process.cwd(), "data", "db.json");
const raw = fs.readFileSync(dbPath, "utf8");
const parsed = JSON.parse(raw);

assert.equal(typeof parsed, "object", "db.json root must be an object");
assert.ok(parsed && parsed.profile, "db.json must contain a profile object");
assert.equal(typeof parsed.profile.siteName, "string", "profile.siteName must be a string");
assert.ok(Array.isArray(parsed.apps), "db.json apps must be an array");
assert.ok(Array.isArray(parsed.articles), "db.json articles must be an array");

console.log("✔ data/db.json schema & JSON integrity verified.");
