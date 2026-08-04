import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { orders, users, payments } from "@/db/schema";
import { verifyToken } from "@/lib/auth";
import { eq, count, sql, desc, and, gte } from "drizzle-orm";

// GET - Dashboard stats (admin only)
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

    // Get total orders
    const totalOrders = await db.select({ count: count() }).from(orders);

    // Get orders by status
    const pendingOrders = await db
      .select({ count: count() })
      .from(orders)
      .where(eq(orders.status, "pending_review"));

    const confirmedOrders = await db
      .select({ count: count() })
      .from(orders)
      .where(eq(orders.status, "confirmed"));

    const inProgressOrders = await db
      .select({ count: count() })
      .from(orders)
      .where(eq(orders.status, "in_progress"));

    const readyOrders = await db
      .select({ count: count() })
      .from(orders)
      .where(eq(orders.status, "ready_for_delivery"));

    const deliveredOrders = await db
      .select({ count: count() })
      .from(orders)
      .where(eq(orders.status, "delivered"));

    // Get total users
    const totalUsers = await db
      .select({ count: count() })
      .from(users)
      .where(eq(users.role, "customer"));

    // Get today's orders
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayOrders = await db
      .select({ count: count() })
      .from(orders)
      .where(gte(orders.createdAt, today));

    // Get recent orders
    const recentOrders = await db
      .select({
        id: orders.id,
        trackingCode: orders.trackingCode,
        status: orders.status,
        serviceName: orders.serviceName,
        createdAt: orders.createdAt,
        userFullName: users.fullName,
        userMobile: users.mobile,
      })
      .from(orders)
      .leftJoin(users, eq(orders.userId, users.id))
      .orderBy(desc(orders.createdAt))
      .limit(10);

    return NextResponse.json({
      success: true,
      stats: {
        totalOrders: totalOrders[0].count,
        pendingOrders: pendingOrders[0].count,
        confirmedOrders: confirmedOrders[0].count,
        inProgressOrders: inProgressOrders[0].count,
        readyOrders: readyOrders[0].count,
        deliveredOrders: deliveredOrders[0].count,
        totalUsers: totalUsers[0].count,
        todayOrders: todayOrders[0].count,
      },
      recentOrders,
    });
  } catch (error) {
    console.error("Admin dashboard error:", error);
    return NextResponse.json(
      { error: "خطای سرور" },
      { status: 500 }
    );
  }
}
