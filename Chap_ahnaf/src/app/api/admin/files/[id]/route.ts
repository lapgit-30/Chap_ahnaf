import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { orderFiles } from "@/db/schema";
import { getBearerUser } from "@/lib/security";
import { loadPrivateFile } from "@/lib/storage";
import { eq } from "drizzle-orm";

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const auth = getBearerUser(request);
    if (!auth || auth.role !== "super_admin") {
      return NextResponse.json({ error: "دسترسی غیرمجاز" }, { status: 403 });
    }
    const id = Number((await params).id);
    if (!Number.isInteger(id) || id < 1) {
      return NextResponse.json({ error: "شناسه فایل نامعتبر است" }, { status: 400 });
    }
    const [file] = await db.select().from(orderFiles).where(eq(orderFiles.id, id)).limit(1);
    if (!file) return NextResponse.json({ error: "فایل یافت نشد" }, { status: 404 });

    const content = await loadPrivateFile(file.fileName);
    const safeDownloadName = encodeURIComponent(file.fileOriginalName);
    return new NextResponse(new Uint8Array(content), {
      headers: {
        "Content-Type": file.mimeType || "application/octet-stream",
        "Content-Length": String(content.length),
        "Content-Disposition": `attachment; filename*=UTF-8''${safeDownloadName}`,
        "Cache-Control": "private, no-store",
        "X-Content-Type-Options": "nosniff",
      },
    });
  } catch (error) {
    console.error("Download file error:", error);
    return NextResponse.json({ error: "دریافت فایل ناموفق بود" }, { status: 500 });
  }
}
