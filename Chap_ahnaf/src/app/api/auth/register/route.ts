import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { users, otpCodes, loginAttempts } from "@/db/schema";
import { hashPassword, generateOTP, getOTPExpiry } from "@/lib/auth";
import { eq, and, gte, count } from "drizzle-orm";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { fullName, username, mobile, otp, captchaToken } = body;

    // Validation
    if (!fullName || !username || !mobile || !otp) {
      return NextResponse.json(
        { error: "تمام فیلدها الزامی هستند" },
        { status: 400 }
      );
    }

    // Validate mobile format (Iranian)
    if (!/^09\d{9}$/.test(mobile)) {
      return NextResponse.json(
        { error: "شماره موبایل نامعتبر است" },
        { status: 400 }
      );
    }

    // Validate username
    if (!/^[a-zA-Z0-9_]{4,20}$/.test(username)) {
      return NextResponse.json(
        { error: "نام کاربری باید 4 تا 20 کاراکتر باشد (فقط حروف انگلیسی، اعداد و _)" },
        { status: 400 }
      );
    }

    // Check rate limiting
    const recentAttempts = await db
      .select({ count: count() })
      .from(loginAttempts)
      .where(
        and(
          eq(loginAttempts.mobile, mobile),
          gte(loginAttempts.createdAt, new Date(Date.now() - 15 * 60 * 1000))
        )
      );

    if (recentAttempts[0]?.count >= 5) {
      return NextResponse.json(
        { error: "تعداد تلاش‌های شما بیش از حد مجاز است. لطفاً 15 دقیقه صبر کنید." },
        { status: 429 }
      );
    }

    // Verify OTP
    const validOTP = await db
      .select()
      .from(otpCodes)
      .where(
        and(
          eq(otpCodes.mobile, mobile),
          eq(otpCodes.code, otp),
          eq(otpCodes.type, "register"),
          eq(otpCodes.used, false),
          gte(otpCodes.expiresAt, new Date())
        )
      )
      .limit(1);

    if (!validOTP.length) {
      return NextResponse.json(
        { error: "کد تأیید نامعتبر یا منقضی شده است" },
        { status: 400 }
      );
    }

    // Check if username exists
    const existingUser = await db
      .select()
      .from(users)
      .where(eq(users.username, username))
      .limit(1);

    if (existingUser.length) {
      return NextResponse.json(
        { error: "نام کاربری قبلاً استفاده شده است" },
        { status: 400 }
      );
    }

    // Check if mobile exists
    const existingMobile = await db
      .select()
      .from(users)
      .where(eq(users.mobile, mobile))
      .limit(1);

    if (existingMobile.length) {
      return NextResponse.json(
        { error: "شماره موبایل قبلاً ثبت شده است" },
        { status: 400 }
      );
    }

    // Create user
    const passwordHash = await hashPassword(mobile); // Default password is mobile
    const newUser = await db
      .insert(users)
      .values({
        fullName,
        username,
        mobile,
        passwordHash,
        role: "customer",
      })
      .returning({ id: users.id });

    // Mark OTP as used
    await db
      .update(otpCodes)
      .set({ used: true })
      .where(eq(otpCodes.id, validOTP[0].id));

    return NextResponse.json({
      success: true,
      message: "ثبت‌نام با موفقیت انجام شد",
      userId: newUser[0].id,
    });
  } catch (error) {
    console.error("Registration error:", error);
    return NextResponse.json(
      { error: "خطای سرور. لطفاً دوباره تلاش کنید." },
      { status: 500 }
    );
  }
}
