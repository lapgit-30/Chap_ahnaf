import { promises as fs } from "fs";
import path from "path";
import { NextResponse } from "next/server";
import { requireCustomer } from "@/lib/auth";

const MAX_FILE_SIZE = 10 * 1024 * 1024;
const ALLOWED_EXT = new Set([".pdf", ".jpg", ".jpeg", ".png", ".doc", ".docx", ".zip"]);

export async function POST(request: Request) {
  const user = await requireCustomer();
  if (!user) {
    return NextResponse.json({ error: "ابتدا وارد حساب کاربری شوید" }, { status: 401 });
  }

  const formData = await request.formData();
  const file = formData.get("file");

  if (!(file instanceof File)) {
    return NextResponse.json({ error: "فایل ارسال نشده است" }, { status: 400 });
  }

  if (file.size > MAX_FILE_SIZE) {
    return NextResponse.json({ error: "حداکثر حجم فایل ۱۰ مگابایت است" }, { status: 400 });
  }

  const ext = path.extname(file.name).toLowerCase();
  if (!ALLOWED_EXT.has(ext)) {
    return NextResponse.json({ error: "فرمت فایل مجاز نیست" }, { status: 400 });
  }

  const bytes = await file.arrayBuffer();
  const uploadDir = path.join(process.cwd(), "public", "uploads");
  await fs.mkdir(uploadDir, { recursive: true });

  const safeName = `${Date.now()}_${Math.random().toString(36).slice(2, 10)}${ext}`;
  const fullPath = path.join(uploadDir, safeName);

  await fs.writeFile(fullPath, Buffer.from(bytes));

  return NextResponse.json({ ok: true, filePath: `/uploads/${safeName}` });
}
