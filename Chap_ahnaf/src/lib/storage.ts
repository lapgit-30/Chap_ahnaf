import { mkdir, writeFile, readFile } from "node:fs/promises";
import path from "node:path";
import { randomUUID } from "node:crypto";

const MAX_FILE_SIZE = 20 * 1024 * 1024;
const MAX_TOTAL_SIZE = 50 * 1024 * 1024;
const ALLOWED_EXTENSIONS = new Set([".pdf", ".jpg", ".jpeg", ".png", ".doc", ".docx", ".zip"]);
const ALLOWED_MIME_TYPES = new Set([
  "application/pdf",
  "image/jpeg",
  "image/png",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/zip",
  "application/x-zip-compressed",
  "application/octet-stream",
]);

function storageRoot(): string {
  return process.env.UPLOAD_DIR || path.join(/* turbopackIgnore: true */ process.cwd(), "storage", "uploads");
}

function hasValidSignature(buffer: Buffer, extension: string): boolean {
  if (extension === ".pdf") return buffer.subarray(0, 5).toString() === "%PDF-";
  if ([".jpg", ".jpeg"].includes(extension)) return buffer[0] === 0xff && buffer[1] === 0xd8;
  if (extension === ".png") return buffer.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]));
  if ([".zip", ".docx"].includes(extension)) return buffer[0] === 0x50 && buffer[1] === 0x4b;
  if (extension === ".doc") return buffer.subarray(0, 8).equals(Buffer.from([0xd0, 0xcf, 0x11, 0xe0, 0xa1, 0xb1, 0x1a, 0xe1]));
  return false;
}

export function validateFileBatch(files: File[]): void {
  if (files.length > 5) throw new Error("حداکثر ۵ فایل قابل ارسال است");
  const total = files.reduce((sum, file) => sum + file.size, 0);
  if (total > MAX_TOTAL_SIZE) throw new Error("حجم مجموع فایل‌ها نباید بیشتر از ۵۰ مگابایت باشد");
  for (const file of files) {
    const extension = path.extname(file.name).toLowerCase();
    if (!ALLOWED_EXTENSIONS.has(extension) || !ALLOWED_MIME_TYPES.has(file.type)) {
      throw new Error(`فرمت فایل «${file.name}» مجاز نیست`);
    }
    if (file.size < 1 || file.size > MAX_FILE_SIZE) {
      throw new Error(`حجم فایل «${file.name}» نامعتبر است`);
    }
  }
}

export async function savePrivateFile(file: File): Promise<{ storedName: string; originalName: string }> {
  const extension = path.extname(file.name).toLowerCase();
  const buffer = Buffer.from(await file.arrayBuffer());
  if (!hasValidSignature(buffer, extension)) {
    throw new Error(`محتوای فایل «${file.name}» با پسوند آن سازگار نیست`);
  }
  const storedName = `${randomUUID()}${extension}`;
  await mkdir(storageRoot(), { recursive: true, mode: 0o750 });
  await writeFile(path.join(storageRoot(), storedName), buffer, { mode: 0o640, flag: "wx" });
  return { storedName, originalName: path.basename(file.name).slice(0, 255) };
}

export async function loadPrivateFile(storedName: string): Promise<Buffer> {
  if (!/^[a-f0-9-]{36}\.(pdf|jpe?g|png|docx?|zip)$/i.test(storedName)) {
    throw new Error("Invalid file name");
  }
  return readFile(path.join(storageRoot(), storedName));
}
