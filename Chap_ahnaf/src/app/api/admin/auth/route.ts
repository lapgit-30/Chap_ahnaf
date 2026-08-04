import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { users, loginAttempts } from "@/db/schema";
import { comparePassword, generateToken } from "@/lib/auth";
import { eq, and, gte, count } from "drizzle-orm";

// POST - Admin login
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { username, password } = body;

    // Validation
    if (!username || !password) {
      return NextResponse.json(
        { error: "نام کاربری و رمز عبور الزامی هستند" },
        { status: 400 }
      );
    }

    // Check rate limiting
    const recentAttempts = await db
      .select({ count: count() })
      .from(loginAttempts)
      .where(
        and(
          eq(loginAttempts.mobile, username), // Using mobile field for admin username too
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

    // Find admin user
    const user = await db
      .select()
      .from(users)
      .where(
        and(eq(users.username, username), eq(users.role, "super_admin"))
      )
      .limit(1);

    if (!user.length) {
      // Log failed attempt
      await db.insert(loginAttempts).values({
        mobile: username,
        success: false,
        ipAddress: request.headers.get("x-forwarded-for") || "unknown",
      });

      return NextResponse.json(
        { error: "نام کاربری یا رمز عبور نادرست است" },
        { status: 401 }
      );
    }

    // Verify password
    const validPassword = await comparePassword(password, user[0].passwordHash);

    if (!validPassword) {
      // Log failed attempt
      await db.insert(loginAttempts).values({
        mobile: username,
        success: false,
        ipAddress: request.headers.get("x-forwarded-for") || "unknown",
      });

      return NextResponse.json(
        { error: "نام کاربری یا رمز عبور نادرست است" },
        { status: 401 }
      );
    }

    // Log successful login
    await db.insert(loginAttempts).values({
      mobile: username,
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
        role: user[0].role,
      },
    });
  } catch (error) {
    console.error("Admin login error:", error);
    return NextResponse.json(
      { error: "خطای سرور. لطفاً دوباره تلاش کنید." },
      { status: 500 }
    );
  }
}
