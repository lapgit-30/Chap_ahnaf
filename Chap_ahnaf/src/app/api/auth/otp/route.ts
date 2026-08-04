import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { otpCodes, users } from "@/db/schema";
import { generateOTP, getOTPExpiry } from "@/lib/auth";
import { consumeCaptcha, cleanText } from "@/lib/security";
import { sendOtpSms } from "@/lib/sms";
import { eq, and, count, gte } from "drizzle-orm";

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as Record<string, unknown>;
    const mobile = cleanText(body.mobile, 11);
    const type = cleanText(body.type, 20);

    if (!mobile || !["register", "login"].includes(type)) {
      return NextResponse.json({ error: "اطلاعات درخواست نامعتبر است" }, { status: 400 });
    }
    if (!/^09\d{9}$/.test(mobile)) {
      return NextResponse.json({ error: "شماره موبایل نامعتبر است" }, { status: 400 });
    }
    if (!(await consumeCaptcha(body.captchaId, body.captchaAnswer))) {
      return NextResponse.json({ error: "پاسخ سوال امنیتی نادرست یا منقضی شده است" }, { status: 400 });
    }

    const user = await db
      .select({ id: users.id })
      .from(users)
      .where(
        type === "login"
          ? and(eq(users.mobile, mobile), eq(users.role, "customer"), eq(users.isActive, true))
          : eq(users.mobile, mobile)
      )
      .limit(1);
    if (type === "register" && user.length) {
      return NextResponse.json({ error: "این شماره موبایل قبلاً ثبت شده است" }, { status: 409 });
    }
    if (type === "login" && !user.length) {
      return NextResponse.json({ error: "کاربری با این شماره موبایل وجود ندارد" }, { status: 404 });
    }

    const recentOTPs = await db
      .select({ count: count() })
      .from(otpCodes)
      .where(
        and(
          eq(otpCodes.mobile, mobile),
          eq(otpCodes.type, type),
          gte(otpCodes.createdAt, new Date(Date.now() - 10 * 60 * 1000))
        )
      );
    if ((recentOTPs[0]?.count ?? 0) >= 3) {
      return NextResponse.json(
        { error: "حداکثر سه کد در ده دقیقه قابل ارسال است" },
        { status: 429 }
      );
    }

    const code = generateOTP();
    await sendOtpSms(mobile, code);
    await db.update(otpCodes).set({ used: true }).where(
      and(eq(otpCodes.mobile, mobile), eq(otpCodes.type, type), eq(otpCodes.used, false))
    );
    await db.insert(otpCodes).values({
      mobile,
      code,
      type,
      expiresAt: getOTPExpiry(),
    });

    const response: Record<string, unknown> = {
      success: true,
      message: "کد تأیید ارسال شد و پنج دقیقه اعتبار دارد",
    };
    if (process.env.OTP_DEBUG === "true" && process.env.NODE_ENV !== "production") {
      response.otp = code;
    }
    return NextResponse.json(response);
  } catch (error) {
    console.error("OTP error:", error);
    const message = error instanceof Error && error.message.includes("پیکربندی")
      ? error.message
      : "ارسال کد تأیید انجام نشد";
    return NextResponse.json({ error: message }, { status: 503 });
  }
}
