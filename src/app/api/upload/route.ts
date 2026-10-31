import crypto from "crypto";
import fs from "fs/promises";
import path from "path";
import { NextResponse } from "next/server";
import { requireAdminMutation } from "@/lib/api-guards";
import {
  getGitHubStorageConfig,
  uploadGitHubBinaryFile,
} from "@/lib/github-storage";
import { detectSafeImageExtension } from "@/lib/security";

const MAX_UPLOAD_BYTES = 5 * 1024 * 1024; // 5 MB max

export async function POST(request: Request) {
  const guardErr = await requireAdminMutation(request);
  if (guardErr) return guardErr;

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
    const ghCfg = getGitHubStorageConfig();
    if (ghCfg) {
      try {
        const rawUrl = await uploadGitHubBinaryFile(
          ghCfg,
          `public/uploads/${fileName}`,
          buffer,
          `chore(uploads): add ${fileName}`
        );
        return NextResponse.json({ url: rawUrl });
      } catch {
        return NextResponse.json(
          { error: "Görsel bulut depoya yüklenemedi." },
          { status: 500 }
        );
      }
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
