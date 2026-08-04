import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { orders, orderFiles, users, payments } from "@/db/schema";
import { verifyToken } from "@/lib/auth";
import { eq } from "drizzle-orm";

// GET - Get order details (admin only)
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const token = request.headers.get("authorization")?.replace("Bearer ", "");

    if (!token) {
      return NextResponse.json({ error: "غیرمجاز" }, { status: 401 });
    }

    const decoded = verifyToken(token);
    if (!decoded || decoded.role !== "super_admin") {
      return NextResponse.json({ error: "دسترسی غیرمجاز" }, { status: 403 });
    }

    const orderId = parseInt(id);

    const order = await db
      .select({
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
      .leftJoin(users, eq(orders.userId, users.id))
      .where(eq(orders.id, orderId))
      .limit(1);

    if (!order.length) {
      return NextResponse.json(
        { error: "سفارش یافت نشد" },
        { status: 404 }
      );
    }

    // Get files
    const files = await db
      .select()
      .from(orderFiles)
      .where(eq(orderFiles.orderId, orderId));

    // Get payments
    const orderPayments = await db
      .select()
      .from(payments)
      .where(eq(payments.orderId, orderId));

    return NextResponse.json({
      success: true,
      order: {
        ...order[0],
        files,
        payments: orderPayments,
      },
    });
  } catch (error) {
    console.error("Admin get order error:", error);
    return NextResponse.json(
      { error: "خطای سرور" },
      { status: 500 }
    );
  }
}

// PUT - Update order (admin only)
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const token = request.headers.get("authorization")?.replace("Bearer ", "");

    if (!token) {
      return NextResponse.json({ error: "غیرمجاز" }, { status: 401 });
    }

    const decoded = verifyToken(token);
    if (!decoded || decoded.role !== "super_admin") {
      return NextResponse.json({ error: "دسترسی غیرمجاز" }, { status: 403 });
    }

    const orderId = parseInt(id);
    const body = await request.json();
    const { status, totalAmount, depositAmount, estimatedDelivery, notes } = body;

    // Update order
    const updateData: Record<string, any> = {
      updatedAt: new Date(),
    };

    if (status) updateData.status = status;
    if (totalAmount) updateData.totalAmount = totalAmount;
    if (depositAmount) {
      updateData.depositAmount = depositAmount;
      if (totalAmount) {
        updateData.remainingAmount = (parseFloat(totalAmount) - parseFloat(depositAmount)).toString();
      }
    }
    if (estimatedDelivery) updateData.estimatedDelivery = new Date(estimatedDelivery);
    if (notes !== undefined) updateData.notes = notes;

    await db
      .update(orders)
      .set(updateData)
      .where(eq(orders.id, orderId));

    return NextResponse.json({
      success: true,
      message: "سفارش با موفقیت به‌روزرسانی شد",
    });
  } catch (error) {
    console.error("Admin update order error:", error);
    return NextResponse.json(
      { error: "خطای سرور" },
      { status: 500 }
    );
  }
}
