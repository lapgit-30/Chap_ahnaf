import { NextResponse } from "next/server";
import { and, count, eq, gt } from "drizzle-orm";
import { z } from "zod";
import { db } from "@/db";
import { adminActivityLogs, captchaChallenges, sessions, users } from "@/db/schema";
import { compareSecret, generateToken, hashSecret, SESSION_COOKIE, sha256 } from "@/lib/security";
import { verifyCsrf } from "@/lib/csrf";

const payloadSchema = z.object({
  username: z.string().min(3).max(30),
  password: z.string().min(8).max(120),
  captchaToken: z.string().min(10),
  captchaAnswer: z.string().min(1).max(10),
});

async function failedLoginCount() {
  const since = new Date(Date.now() - 15 * 60 * 1000);
  const result = await db
    .select({ total: count() })
    .from(adminActivityLogs)
    .where(and(eq(adminActivityLogs.action, "admin_login_failed"), gt(adminActivityLogs.createdAt, since)));

  return result[0]?.total ?? 0;
}

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
  const envUsername = process.env.SUPERADMIN_USERNAME?.trim();
  const envPassword = process.env.SUPERADMIN_PASSWORD?.trim();

  if (!envUsername || !envPassword) {
    return NextResponse.json(
      { error: "تنظیمات مدیر کامل نیست. SUPERADMIN_USERNAME و SUPERADMIN_PASSWORD را تنظیم کنید." },
      { status: 500 },
    );
  }

  const failures = await failedLoginCount().catch(() => 0);
  if (failures >= 5) {
    return NextResponse.json({ error: "تلاش بیش‌ازحد. ۱۵ دقیقه بعد تلاش کنید." }, { status: 429 });
  }

  const captchaRow = await db.select().from(captchaChallenges).where(eq(captchaChallenges.token, parsed.data.captchaToken)).limit(1);
  const captcha = captchaRow[0];
  if (!captcha || captcha.usedAt || captcha.expiresAt < new Date()) {
    return NextResponse.json({ error: "کپچا نامعتبر است" }, { status: 400 });
  }

  const captchaOk = await compareSecret(parsed.data.captchaAnswer.trim(), captcha.answerHash);
  if (!captchaOk) {
    return NextResponse.json({ error: "پاسخ کپچا اشتباه است" }, { status: 400 });
  }

  await db.update(captchaChallenges).set({ usedAt: new Date() }).where(eq(captchaChallenges.id, captcha.id));

  if (username !== envUsername || parsed.data.password !== envPassword) {
    await db.insert(adminActivityLogs).values({ action: "admin_login_failed", meta: { username } });
    return NextResponse.json({ error: "نام کاربری یا رمز عبور اشتباه است" }, { status: 401 });
  }

  let admin = (await db.select().from(users).where(eq(users.username, envUsername)).limit(1))[0];

  if (!admin) {
    const created = await db
      .insert(users)
      .values({
        fullName: "Super Admin",
        username: envUsername,
        mobile: "09000000000",
        passwordHash: await hashSecret(envPassword),
        role: "admin",
      })
      .returning();
    admin = created[0];
  }

  if (admin.role !== "admin") {
    return NextResponse.json({ error: "این کاربر دسترسی مدیریت ندارد" }, { status: 403 });
  }

  const rawToken = generateToken(32);
  await db.insert(sessions).values({
    userId: admin.id,
    tokenHash: sha256(rawToken),
    expiresAt: new Date(Date.now() + 12 * 60 * 60 * 1000),
  });

  await db.insert(adminActivityLogs).values({
    adminUserId: admin.id,
    action: "admin_login_success",
    meta: { username: admin.username },
  });

  const response = NextResponse.json({ ok: true });
  response.cookies.set(SESSION_COOKIE, rawToken, {
    httpOnly: true,
    sameSite: "strict",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 12 * 60 * 60,
  });

  return response;
}
