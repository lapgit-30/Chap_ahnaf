import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { orders, orderFiles, users, payments, activityLogs } from "@/db/schema";
import { cleanText, getBearerUser, getClientIp } from "@/lib/security";
import { eq } from "drizzle-orm";

const statuses = ["pending_review", "confirmed", "in_progress", "ready_for_delivery", "delivered", "cancelled"] as const;
type OrderStatus = (typeof statuses)[number];

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const auth = getBearerUser(request);
    if (!auth || auth.role !== "super_admin") return NextResponse.json({ error: "دسترسی غیرمجاز" }, { status: 403 });
    const orderId = Number((await params).id);
    if (!Number.isInteger(orderId)) return NextResponse.json({ error: "شناسه نامعتبر است" }, { status: 400 });

    const [order] = await db
      .select({
        id: orders.id, trackingCode: orders.trackingCode, userId: orders.userId,
        serviceId: orders.serviceId, status: orders.status, serviceName: orders.serviceName,
        options: orders.options, notes: orders.notes, totalAmount: orders.totalAmount,
        depositAmount: orders.depositAmount, remainingAmount: orders.remainingAmount,
        estimatedDelivery: orders.estimatedDelivery, createdAt: orders.createdAt,
        updatedAt: orders.updatedAt, userFullName: users.fullName,
        userMobile: users.mobile, userUsername: users.username,
      })
      .from(orders)
      .leftJoin(users, eq(orders.userId, users.id))
      .where(eq(orders.id, orderId))
      .limit(1);
    if (!order) return NextResponse.json({ error: "سفارش یافت نشد" }, { status: 404 });

    const files = await db.select().from(orderFiles).where(eq(orderFiles.orderId, orderId));
    const orderPayments = await db.select().from(payments).where(eq(payments.orderId, orderId));
    return NextResponse.json({ success: true, order: { ...order, files, payments: orderPayments } });
  } catch (error) {
    console.error("Admin get order error:", error);
    return NextResponse.json({ error: "خطا در دریافت سفارش" }, { status: 500 });
  }
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const auth = getBearerUser(request);
    if (!auth || auth.role !== "super_admin") return NextResponse.json({ error: "دسترسی غیرمجاز" }, { status: 403 });
    const orderId = Number((await params).id);
    if (!Number.isInteger(orderId)) return NextResponse.json({ error: "شناسه نامعتبر است" }, { status: 400 });
    const body = (await request.json()) as Record<string, unknown>;
    const status = cleanText(body.status, 30) as OrderStatus;
    if (!statuses.includes(status)) return NextResponse.json({ error: "وضعیت نامعتبر است" }, { status: 400 });

    const total = Number(body.totalAmount);
    const deposit = Number(body.depositAmount);
    if (!Number.isFinite(total) || !Number.isFinite(deposit) || total < 0 || deposit < 0 || deposit > total) {
      return NextResponse.json({ error: "مبلغ کل یا بیعانه نامعتبر است" }, { status: 400 });
    }
    const estimatedDelivery = body.estimatedDelivery ? new Date(String(body.estimatedDelivery)) : null;
    if (estimatedDelivery && Number.isNaN(estimatedDelivery.getTime())) {
      return NextResponse.json({ error: "تاریخ تحویل نامعتبر است" }, { status: 400 });
    }
    const notes = cleanText(body.notes, 2000);

    const [existing] = await db.select().from(orders).where(eq(orders.id, orderId)).limit(1);
    if (!existing) return NextResponse.json({ error: "سفارش یافت نشد" }, { status: 404 });

    await db.transaction(async (tx) => {
      await tx.update(orders).set({
        status,
        totalAmount: total.toFixed(2),
        depositAmount: deposit.toFixed(2),
        remainingAmount: (total - deposit).toFixed(2),
        estimatedDelivery,
        notes: notes || null,
        updatedAt: new Date(),
      }).where(eq(orders.id, orderId));
      await tx.insert(activityLogs).values({
        userId: auth.userId,
        action: "order.updated",
        details: { orderId, beforeStatus: existing.status, afterStatus: status, total, deposit },
        ipAddress: getClientIp(request),
      });
    });

    return NextResponse.json({ success: true, message: "سفارش به‌روزرسانی شد" });
  } catch (error) {
    console.error("Admin update order error:", error);
    return NextResponse.json({ error: "به‌روزرسانی سفارش انجام نشد" }, { status: 500 });
  }
}
