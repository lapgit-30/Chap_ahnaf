import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { users, otpCodes, loginAttempts } from "@/db/schema";
import { generateToken } from "@/lib/auth";
import { eq, and, gte, count } from "drizzle-orm";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { username, mobile, otp, captchaToken } = body;

    // Validation
    if (!username || !mobile || !otp) {
      return NextResponse.json(
        { error: "تمام فیلدها الزامی هستند" },
        { status: 400 }
      );
    }

    // Validate mobile format
    if (!/^09\d{9}$/.test(mobile)) {
      return NextResponse.json(
        { error: "شماره موبایل نامعتبر است" },
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
          eq(loginAttempts.success, false),
          gte(loginAttempts.createdAt, new Date(Date.now() - 15 * 60 * 1000))
        )
      );

    if (recentAttempts[0]?.count >= 5) {
      return NextResponse.json(
        { error: "تعداد تلاش‌های شما بیش از حد مجاز است. لطفاً 15 دقیقه صبر کنید." },
        { status: 429 }
      );
    }

    // Find user
    const user = await db
      .select()
      .from(users)
      .where(
        and(
          eq(users.username, String(username).toLowerCase()),
          eq(users.mobile, mobile),
          eq(users.role, "customer"),
          eq(users.isActive, true)
        )
      )
      .limit(1);

    if (!user.length) {
      // Log failed attempt
      await db.insert(loginAttempts).values({
        mobile,
        success: false,
        ipAddress: request.headers.get("x-forwarded-for") || "unknown",
      });

      return NextResponse.json(
        { error: "نام کاربری یا شماره موبایل نادرست است" },
        { status: 401 }
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
          eq(otpCodes.type, "login"),
          eq(otpCodes.used, false),
          gte(otpCodes.expiresAt, new Date())
        )
      )
      .limit(1);

    if (!validOTP.length) {
      // Log failed attempt
      await db.insert(loginAttempts).values({
        mobile,
        success: false,
        ipAddress: request.headers.get("x-forwarded-for") || "unknown",
      });

      return NextResponse.json(
        { error: "کد تأیید نامعتبر یا منقضی شده است" },
        { status: 401 }
      );
    }

    // Mark OTP as used
    await db
      .update(otpCodes)
      .set({ used: true })
      .where(eq(otpCodes.id, validOTP[0].id));

    // Log successful login
    await db.insert(loginAttempts).values({
      mobile,
      success: true,
      ipAddress: request.headers.get("x-forwarded-for") || "unknown",
    });

    // Generate token
    const token = generateToken({
      userId: user[0].id,
      role: user[0].role,
    });

    return NextResponse.json({
      success: true,
      token,
      user: {
        id: user[0].id,
        fullName: user[0].fullName,
        username: user[0].username,
        mobile: user[0].mobile,
        role: user[0].role,
      },
    });
  } catch (error) {
    console.error("Login error:", error);
    return NextResponse.json(
      { error: "خطای سرور. لطفاً دوباره تلاش کنید." },
      { status: 500 }
    );
  }
}
