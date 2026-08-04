import { randomUUID } from "node:crypto";
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { users, otpCodes, loginAttempts } from "@/db/schema";
import { hashPassword, generateToken } from "@/lib/auth";
import { cleanText, getClientIp } from "@/lib/security";
import { eq, and, gte, count, or } from "drizzle-orm";

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as Record<string, unknown>;
    const fullName = cleanText(body.fullName, 100);
    const username = cleanText(body.username, 20).toLowerCase();
    const mobile = cleanText(body.mobile, 11);
    const otp = cleanText(body.otp, 6);

    if (fullName.length < 3 || !/^[a-z0-9_]{4,20}$/.test(username) || !/^09\d{9}$/.test(mobile) || !/^\d{6}$/.test(otp)) {
      return NextResponse.json({ error: "اطلاعات ثبت‌نام نامعتبر است" }, { status: 400 });
    }

    const attempts = await db
      .select({ count: count() })
      .from(loginAttempts)
      .where(and(eq(loginAttempts.mobile, mobile), gte(loginAttempts.createdAt, new Date(Date.now() - 15 * 60 * 1000))));
    if ((attempts[0]?.count ?? 0) >= 5) {
      return NextResponse.json({ error: "تعداد تلاش‌ها بیش از حد مجاز است" }, { status: 429 });
    }

    const existing = await db
      .select({ id: users.id })
      .from(users)
      .where(or(eq(users.username, username), eq(users.mobile, mobile)))
      .limit(1);
    if (existing.length) {
      return NextResponse.json({ error: "نام کاربری یا شماره موبایل قبلاً ثبت شده است" }, { status: 409 });
    }

    const validOtp = await db
      .select()
      .from(otpCodes)
      .where(and(
        eq(otpCodes.mobile, mobile),
        eq(otpCodes.code, otp),
        eq(otpCodes.type, "register"),
        eq(otpCodes.used, false),
        gte(otpCodes.expiresAt, new Date())
      ))
      .limit(1);
    if (!validOtp.length) {
      await db.insert(loginAttempts).values({ mobile, success: false, ipAddress: getClientIp(request) });
      return NextResponse.json({ error: "کد تأیید نامعتبر یا منقضی شده است" }, { status: 400 });
    }

    const passwordHash = await hashPassword(randomUUID());
    const created = await db.transaction(async (tx) => {
      const consumed = await tx
        .update(otpCodes)
        .set({ used: true })
        .where(and(eq(otpCodes.id, validOtp[0].id), eq(otpCodes.used, false)))
        .returning({ id: otpCodes.id });
      if (!consumed.length) throw new Error("OTP_ALREADY_USED");
      const [user] = await tx
        .insert(users)
        .values({ fullName, username, mobile, passwordHash, role: "customer" })
        .returning({ id: users.id, fullName: users.fullName, username: users.username, mobile: users.mobile, role: users.role });
      await tx.insert(loginAttempts).values({ mobile, success: true, ipAddress: getClientIp(request) });
      return user;
    });

    return NextResponse.json({
      success: true,
      message: "ثبت‌نام با موفقیت انجام شد",
      token: generateToken({ userId: created.id, role: created.role }),
      user: created,
    });
  } catch (error) {
    console.error("Registration error:", error);
    return NextResponse.json({ error: "ثبت‌نام انجام نشد؛ دوباره تلاش کنید" }, { status: 500 });
  }
}
