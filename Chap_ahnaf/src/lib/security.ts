import { createHash, randomUUID, timingSafeEqual } from "node:crypto";
import { NextRequest } from "next/server";
import { db } from "@/db";
import { captchaChallenges } from "@/db/schema";
import { and, eq, gte } from "drizzle-orm";
import { verifyToken } from "@/lib/auth";

export type AuthUser = { userId: number; role: string };

export function getBearerUser(request: NextRequest): AuthUser | null {
  const header = request.headers.get("authorization");
  if (!header?.startsWith("Bearer ")) return null;
  return verifyToken(header.slice(7));
}

export function getClientIp(request: NextRequest): string {
  return (
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    request.headers.get("x-real-ip") ||
    "unknown"
  ).slice(0, 45);
}

export function cleanText(value: unknown, maxLength: number): string {
  if (typeof value !== "string") return "";
  return value.replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F]/g, "").trim().slice(0, maxLength);
}

function captchaHash(id: string, answer: string): string {
  const secret = process.env.CAPTCHA_SECRET || process.env.JWT_SECRET;
  if (!secret) throw new Error("CAPTCHA_SECRET or JWT_SECRET is required");
  return createHash("sha256").update(`${id}:${answer}:${secret}`).digest("hex");
}

export async function createCaptcha() {
  const id = randomUUID();
  const a = Math.floor(Math.random() * 9) + 1;
  const b = Math.floor(Math.random() * 9) + 1;
  const expiresAt = new Date(Date.now() + 5 * 60 * 1000);
  await db.insert(captchaChallenges).values({
    id,
    answerHash: captchaHash(id, String(a + b)),
    expiresAt,
  });
  return { id, question: `${a} + ${b} = ؟`, expiresAt };
}

export async function consumeCaptcha(id: unknown, answer: unknown): Promise<boolean> {
  if (typeof id !== "string" || typeof answer !== "string") return false;
  const rows = await db
    .select()
    .from(captchaChallenges)
    .where(
      and(
        eq(captchaChallenges.id, id),
        eq(captchaChallenges.used, false),
        gte(captchaChallenges.expiresAt, new Date())
      )
    )
    .limit(1);
  if (!rows.length) return false;

  await db
    .update(captchaChallenges)
    .set({ used: true })
    .where(eq(captchaChallenges.id, id));

  const expected = Buffer.from(rows[0].answerHash, "hex");
  const actual = Buffer.from(captchaHash(id, answer.trim()), "hex");
  return expected.length === actual.length && timingSafeEqual(expected, actual);
}

export function safeJsonObject(value: string | null): Record<string, string> {
  if (!value) return {};
  const parsed: unknown = JSON.parse(value);
  if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
    throw new Error("Invalid options");
  }
  const output: Record<string, string> = {};
  for (const [key, item] of Object.entries(parsed)) {
    if (typeof item !== "string") throw new Error("Invalid option value");
    output[cleanText(key, 80)] = cleanText(item, 200);
  }
  return output;
}
