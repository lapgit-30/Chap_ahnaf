import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { users, activityLogs } from "@/db/schema";
import { verifyToken } from "@/lib/auth";
import { getClientIp } from "@/lib/security";
import { eq, desc, count, ilike, or, and } from "drizzle-orm";

// GET - List all users (admin only)
export async function PATCH(request: NextRequest) {
  try {
    const token = request.headers.get("authorization")?.replace("Bearer ", "");
    const decoded = token ? verifyToken(token) : null;
    if (!decoded || decoded.role !== "super_admin") {
      return NextResponse.json({ error: "دسترسی غیرمجاز" }, { status: 403 });
    }
    const body = (await request.json()) as { id?: unknown; isActive?: unknown };
    const id = Number(body.id);
    if (!Number.isInteger(id) || typeof body.isActive !== "boolean") {
      return NextResponse.json({ error: "اطلاعات نامعتبر است" }, { status: 400 });
    }
    const changed = await db
      .update(users)
      .set({ isActive: body.isActive, updatedAt: new Date() })
      .where(and(eq(users.id, id), eq(users.role, "customer")))
      .returning({ id: users.id });
    if (!changed.length) return NextResponse.json({ error: "کاربر یافت نشد" }, { status: 404 });
    await db.insert(activityLogs).values({
      userId: decoded.userId,
      action: body.isActive ? "user.activated" : "user.deactivated",
      details: { customerId: id },
      ipAddress: getClientIp(request),
    });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Admin update user error:", error);
    return NextResponse.json({ error: "تغییر وضعیت کاربر انجام نشد" }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    const token = request.headers.get("authorization")?.replace("Bearer ", "");

    if (!token) {
      return NextResponse.json({ error: "غیرمجاز" }, { status: 401 });
    }

    const decoded = verifyToken(token);
    if (!decoded || decoded.role !== "super_admin") {
      return NextResponse.json({ error: "دسترسی غیرمجاز" }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search");
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");
    const offset = (page - 1) * limit;

    const conditions = [eq(users.role, "customer")];

    if (search) {
      conditions.push(
        or(
          ilike(users.fullName, `%${search}%`),
          ilike(users.username, `%${search}%`),
          ilike(users.mobile, `%${search}%`)
        )!
      );
    }

    const allUsers = await db
      .select({
        id: users.id,
        fullName: users.fullName,
        username: users.username,
        mobile: users.mobile,
        role: users.role,
        isActive: users.isActive,
        createdAt: users.createdAt,
      })
      .from(users)
      .where(and(...conditions))
      .orderBy(desc(users.createdAt))
      .limit(limit)
      .offset(offset);

    // Get total count
    const totalCount = await db
      .select({ count: count() })
      .from(users)
      .where(and(...conditions));

    return NextResponse.json({
      success: true,
      users: allUsers,
      pagination: {
        page,
        limit,
        total: totalCount[0].count,
        pages: Math.ceil(totalCount[0].count / limit),
      },
    });
  } catch (error) {
    console.error("Admin get users error:", error);
    return NextResponse.json(
      { error: "خطای سرور" },
      { status: 500 }
    );
  }
}
