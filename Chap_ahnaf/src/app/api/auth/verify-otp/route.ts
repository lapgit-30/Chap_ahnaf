import { NextResponse } from "next/server";
import { and, desc, eq, gt, isNull } from "drizzle-orm";
import { z } from "zod";
import { db } from "@/db";
import { otpCodes, sessions, users } from "@/db/schema";
import {
  compareSecret,
  generateToken,
  isValidIranMobile,
  isValidUsername,
  normalizeMobile,
  sanitizeText,
  SESSION_COOKIE,
  sha256,
} from "@/lib/security";
import { verifyCsrf } from "@/lib/csrf";

const payloadSchema = z.object({
  mode: z.enum(["register", "login"]),
  fullName: z.string().min(3).max(180).optional(),
  username: z.string().min(3).max(30),
  mobile: z.string().min(11).max(20),
  otp: z.string().length(6),
});

export async function POST(request: Request) {
  if (!(await verifyCsrf())) {
    return NextResponse.json({ error: "درخواست نامعتبر (CSRF)" }, { status: 403 });
  }

  const body = await request.json().catch(() => null);
  const parsed = payloadSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "ورودی نامعتبر" }, { status: 400 });
  }

  const username = parsed.data.username.trim();
  const mobile = normalizeMobile(parsed.data.mobile);

  if (!isValidIranMobile(mobile) || !isValidUsername(username)) {
    return NextResponse.json({ error: "موبایل یا نام کاربری معتبر نیست" }, { status: 400 });
  }

  const otpRow = await db
    .select()
    .from(otpCodes)
    .where(
      and(
        eq(otpCodes.mobile, mobile),
        eq(otpCodes.username, username),
        eq(otpCodes.purpose, parsed.data.mode),
        isNull(otpCodes.usedAt),
        gt(otpCodes.expiresAt, new Date()),
      ),
    )
    .orderBy(desc(otpCodes.createdAt))
    .limit(1);

  const otpData = otpRow[0];
  if (!otpData) {
    return NextResponse.json({ error: "کد معتبر یافت نشد یا منقضی شده است" }, { status: 400 });
  }

  if (otpData.attempts >= 5) {
    return NextResponse.json({ error: "تعداد تلاش بیش از حد مجاز است" }, { status: 429 });
  }

  const otpOk = await compareSecret(parsed.data.otp, otpData.codeHash);

  if (!otpOk) {
    await db
      .update(otpCodes)
      .set({ attempts: otpData.attempts + 1 })
      .where(eq(otpCodes.id, otpData.id));

    return NextResponse.json({ error: "کد تأیید اشتباه است" }, { status: 400 });
  }

  await db.update(otpCodes).set({ usedAt: new Date() }).where(eq(otpCodes.id, otpData.id));

  let user = (await db.select().from(users).where(eq(users.username, username)).limit(1))[0];

  if (parsed.data.mode === "register") {
    if (user) {
      return NextResponse.json({ error: "نام کاربری قبلاً ثبت شده است" }, { status: 409 });
    }

    const inserted = await db
      .insert(users)
      .values({
        fullName: sanitizeText(parsed.data.fullName ?? "کاربر", 180),
        username,
        mobile,
        role: "customer",
      })
      .returning();

    user = inserted[0];
  }

  if (!user || user.mobile !== mobile) {
    return NextResponse.json({ error: "کاربر یافت نشد" }, { status: 404 });
  }

  const rawToken = generateToken(32);
  await db.insert(sessions).values({
    userId: user.id,
    tokenHash: sha256(rawToken),
    expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
  });

  const response = NextResponse.json({ ok: true, user: { fullName: user.fullName, username: user.username } });
  response.cookies.set(SESSION_COOKIE, rawToken, {
    httpOnly: true,
    sameSite: "strict",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 7 * 24 * 60 * 60,
  });

  return response;
}
