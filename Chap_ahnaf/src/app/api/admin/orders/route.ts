import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { orders, orderFiles, users, payments } from "@/db/schema";
import { verifyToken } from "@/lib/auth";
import { eq, desc, and, or, ilike, count, sql } from "drizzle-orm";

// GET - List all orders (admin only)
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
    const status = searchParams.get("status");
    const search = searchParams.get("search");
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");
    const offset = (page - 1) * limit;

    // Build query
    let query = db.select({
      id: orders.id,
      trackingCode: orders.trackingCode,
      userId: orders.userId,
      serviceId: orders.serviceId,
      status: orders.status,
      serviceName: orders.serviceName,
      options: orders.options,
      notes: orders.notes,
      totalAmount: orders.totalAmount,
      depositAmount: orders.depositAmount,
      remainingAmount: orders.remainingAmount,
      estimatedDelivery: orders.estimatedDelivery,
      createdAt: orders.createdAt,
      updatedAt: orders.updatedAt,
      userFullName: users.fullName,
      userMobile: users.mobile,
      userUsername: users.username,
    })
    .from(orders)
    .leftJoin(users, eq(orders.userId, users.id));

    if (status) {
      query = query.where(eq(orders.status, status as any)) as typeof query;
    }

    if (search) {
      query = query.where(
        or(
          ilike(orders.trackingCode, `%${search}%`),
          ilike(users.fullName, `%${search}%`),
          ilike(users.mobile, `%${search}%`)
        )
      ) as typeof query;
    }

    const allOrders = await query
      .orderBy(desc(orders.createdAt))
      .limit(limit)
      .offset(offset);

    // Get total count
    let countQuery = db
      .select({ count: count() })
      .from(orders)
      .leftJoin(users, eq(orders.userId, users.id));

    if (status) {
      countQuery = countQuery.where(eq(orders.status, status as any)) as typeof countQuery;
    }

    if (search) {
      countQuery = countQuery.where(
        or(
          ilike(orders.trackingCode, `%${search}%`),
          ilike(users.fullName, `%${search}%`),
          ilike(users.mobile, `%${search}%`)
        )
      ) as typeof countQuery;
    }

    const totalCount = await countQuery;

    return NextResponse.json({
      success: true,
      orders: allOrders,
      pagination: {
        page,
        limit,
        total: totalCount[0].count,
        pages: Math.ceil(totalCount[0].count / limit),
      },
    });
  } catch (error) {
    console.error("Admin get orders error:", error);
    return NextResponse.json(
      { error: "خطای سرور" },
      { status: 500 }
    );
  }
}
