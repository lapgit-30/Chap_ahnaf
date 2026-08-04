import { NextResponse } from "next/server";
import { and, desc, eq, isNull } from "drizzle-orm";
import { z } from "zod";
import { db } from "@/db";
import { captchaChallenges, otpCodes, users } from "@/db/schema";
import {
  compareSecret,
  generateOtpCode,
  hashSecret,
  isValidIranMobile,
  isValidUsername,
  normalizeMobile,
} from "@/lib/security";
import { otpAttemptsInWindow } from "@/lib/rate-limit";
import { verifyCsrf } from "@/lib/csrf";

const payloadSchema = z.object({
  mode: z.enum(["register", "login"]),
  username: z.string().min(3).max(30),
  mobile: z.string().min(11).max(20),
  captchaToken: z.string().min(10),
  captchaAnswer: z.string().min(1).max(10),
});

export async function POST(request: Request) {
  if (!(await verifyCsrf())) {
    return NextResponse.json({ error: "درخواست نامعتبر (CSRF)" }, { status: 403 });
  }

  const body = await request.json().catch(() => null);
  const parsed = payloadSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "ورودی نامعتبر است" }, { status: 400 });
  }

  const mobile = normalizeMobile(parsed.data.mobile);
  const username = parsed.data.username.trim();

  if (!isValidIranMobile(mobile) || !isValidUsername(username)) {
    return NextResponse.json({ error: "نام کاربری یا موبایل نامعتبر است" }, { status: 400 });
  }

  const requestCount = await otpAttemptsInWindow(mobile, 15);
  if (requestCount >= 5) {
    return NextResponse.json({ error: "تعداد تلاش زیاد است. ۱۵ دقیقه بعد دوباره تلاش کنید." }, { status: 429 });
  }

  const captchaRow = await db
    .select()
    .from(captchaChallenges)
    .where(and(eq(captchaChallenges.token, parsed.data.captchaToken), isNull(captchaChallenges.usedAt)))
    .orderBy(desc(captchaChallenges.createdAt))
    .limit(1);

  const captcha = captchaRow[0];
  if (!captcha || captcha.expiresAt < new Date()) {
    return NextResponse.json({ error: "کپچا منقضی شده است" }, { status: 400 });
  }

  const captchaOk = await compareSecret(parsed.data.captchaAnswer.trim(), captcha.answerHash);
  if (!captchaOk) {
    return NextResponse.json({ error: "پاسخ کپچا نادرست است" }, { status: 400 });
  }

  await db
    .update(captchaChallenges)
    .set({ usedAt: new Date() })
    .where(eq(captchaChallenges.id, captcha.id));

  const matchedUser = await db.select().from(users).where(eq(users.username, username)).limit(1);
  const existing = matchedUser[0];

  if (parsed.data.mode === "register" && existing) {
    return NextResponse.json({ error: "این نام کاربری قبلاً ثبت شده است" }, { status: 409 });
  }

  if (parsed.data.mode === "login") {
    if (!existing || existing.mobile !== mobile || existing.role !== "customer") {
      return NextResponse.json({ error: "اطلاعات کاربر برای ورود یافت نشد" }, { status: 404 });
    }
  }

  const code = generateOtpCode();
  await db.insert(otpCodes).values({
    mobile,
    username,
    purpose: parsed.data.mode,
    codeHash: await hashSecret(code),
    expiresAt: new Date(Date.now() + 2 * 60 * 1000),
  });

  const canReturnCode = process.env.NODE_ENV !== "production" || process.env.OTP_EXPOSE_CODE === "true";

  return NextResponse.json({
    ok: true,
    message: "کد تأیید ارسال شد",
    ...(canReturnCode ? { otp: code } : {}),
  });
}
