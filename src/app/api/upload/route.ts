import crypto from "crypto";
import fs from "fs/promises";
import path from "path";
import { NextResponse } from "next/server";
import { isAuthenticated } from "@/lib/auth";
import {
  checkMutationRateLimit,
  detectSafeImageExtension,
  verifySameOrigin,
} from "@/lib/security";

const MAX_UPLOAD_BYTES = 5 * 1024 * 1024; // 5 MB max

export async function POST(request: Request) {
  const csrfErr = verifySameOrigin(request);
  if (csrfErr) return csrfErr;

  const rateErr = checkMutationRateLimit(request);
  if (rateErr) return rateErr;

  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: "Yetkisiz erişim." }, { status: 401 });
  }

  try {
    const contentLength = Number(request.headers.get("content-length") || "0");
    if (contentLength > MAX_UPLOAD_BYTES + 65536) {
      return NextResponse.json(
        { error: "Dosya boyutu en fazla 5 MB olabilir." },
        { status: 413 }
      );
    }

    const formData = await request.formData();
    const file = formData.get("file") as File | null;
    if (!file || typeof file.arrayBuffer !== "function") {
      return NextResponse.json({ error: "Dosya seçilmedi." }, { status: 400 });
    }

    if (file.size <= 0 || file.size > MAX_UPLOAD_BYTES) {
      return NextResponse.json(
        { error: "Dosya boyutu 0 ile 5 MB arasında olmalıdır." },
        { status: 413 }
      );
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    if (buffer.byteLength <= 0 || buffer.byteLength > MAX_UPLOAD_BYTES) {
      return NextResponse.json(
        { error: "Dosya boyutu en fazla 5 MB olabilir." },
        { status: 413 }
      );
    }

    // Verify binary magic bytes (prevents SVG XSS and MIME spoofing)
    const safeExt = detectSafeImageExtension(buffer);
    if (!safeExt) {
      return NextResponse.json(
        {
          error:
            "Güvenlik nedeniyle yalnızca gerçek PNG, JPG, WEBP ve GIF görselleri yüklenebilir (SVG kabul edilmez).",
        },
        { status: 400 }
      );
    }

    const fileName = `${crypto.randomUUID()}${safeExt}`;

    // If GitHub cloud storage is configured (e.g. on Vercel), commit image to repo
    const ghToken = process.env.GITHUB_TOKEN?.trim();
    const ghRepo = process.env.GITHUB_REPO?.trim();
    const ghBranch = process.env.GITHUB_BRANCH?.trim() || "main";

    if (ghToken && ghRepo && /^[\w.-]+\/[\w.-]+$/.test(ghRepo)) {
      const ghUrl = `https://api.github.com/repos/${ghRepo}/contents/public/uploads/${fileName}`;
      const ghRes = await fetch(ghUrl, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${ghToken}`,
          Accept: "application/vnd.github+json",
          "Content-Type": "application/json",
          "X-GitHub-Api-Version": "2022-11-28",
        },
        body: JSON.stringify({
          message: `chore(uploads): add ${fileName}`,
          content: buffer.toString("base64"),
          branch: ghBranch,
        }),
      });

      if (!ghRes.ok) {
        return NextResponse.json(
          { error: "Görsel bulut depoya yüklenemedi." },
          { status: 500 }
        );
      }

      return NextResponse.json({
        url: `https://raw.githubusercontent.com/${ghRepo}/${ghBranch}/public/uploads/${fileName}`,
      });
    }

    // Local filesystem storage
    const uploadDir = path.join(process.cwd(), "public", "uploads");
    await fs.mkdir(uploadDir, { recursive: true });
    await fs.writeFile(path.join(uploadDir, fileName), buffer);

    return NextResponse.json({ url: `/uploads/${fileName}` });
  } catch {
    return NextResponse.json(
      { error: "Dosya yüklenirken hata oluştu." },
      { status: 500 }
    );
  }
}
