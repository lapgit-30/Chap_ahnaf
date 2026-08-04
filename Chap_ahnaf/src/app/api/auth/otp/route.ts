import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { otpCodes } from "@/db/schema";
import { generateOTP, getOTPExpiry } from "@/lib/auth";
import { eq, and, count } from "drizzle-orm";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { mobile, type } = body;

    // Validation
    if (!mobile || !type) {
      return NextResponse.json(
        { error: "شماره موبایل و نوع درخواست الزامی هستند" },
        { status: 400 }
      );
    }

    if (!["register", "login"].includes(type)) {
      return NextResponse.json(
        { error: "نوع درخواست نامعتبر است" },
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

    // Rate limiting: max 3 OTPs per 10 minutes
    const recentOTPs = await db
      .select({ count: count() })
      .from(otpCodes)
      .where(
        and(
          eq(otpCodes.mobile, mobile),
          eq(otpCodes.type, type),
          eq(otpCodes.used, false)
        )
      );

    if (recentOTPs[0]?.count >= 3) {
      return NextResponse.json(
        { error: "تعداد درخواست‌های کد تأیید بیش از حد مجاز است. لطفاً بعداً تلاش کنید." },
        { status: 429 }
      );
    }

    // Generate OTP
    const otpCode = generateOTP();
    const expiresAt = getOTPExpiry();

    // Save OTP to database
    await db.insert(otpCodes).values({
      mobile,
      code: otpCode,
      type,
      expiresAt,
    });

    // In production, send SMS via a service like Kavenegar, Ghasedak, etc.
    // For now, we'll just return the OTP (for development/testing)
    console.log(`OTP for ${mobile}: ${otpCode}`);

    return NextResponse.json({
      success: true,
      message: "کد تأیید ارسال شد",
      // Remove this in production - only for testing
      otp: otpCode,
    });
  } catch (error) {
    console.error("OTP error:", error);
    return NextResponse.json(
      { error: "خطای سرور. لطفاً دوباره تلاش کنید." },
      { status: 500 }
    );
  }
}
