import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { orders, orderFiles, payments } from "@/db/schema";
import { cleanText } from "@/lib/security";
import { and, count, eq } from "drizzle-orm";

export async function GET(request: NextRequest) {
  try {
    const trackingCode = cleanText(request.nextUrl.searchParams.get("code"), 20).toUpperCase();
    if (!/^AH[A-Z0-9]{8,18}$/.test(trackingCode)) {
      return NextResponse.json({ error: "کد رهگیری نامعتبر است" }, { status: 400 });
    }
    const [order] = await db
      .select({
        id: orders.id, trackingCode: orders.trackingCode, status: orders.status,
        serviceName: orders.serviceName, options: orders.options, notes: orders.notes,
        totalAmount: orders.totalAmount, depositAmount: orders.depositAmount,
        remainingAmount: orders.remainingAmount, estimatedDelivery: orders.estimatedDelivery,
        createdAt: orders.createdAt, updatedAt: orders.updatedAt,
      })
      .from(orders)
      .where(eq(orders.trackingCode, trackingCode))
      .limit(1);
    if (!order) return NextResponse.json({ error: "سفارشی با این کد رهگیری یافت نشد" }, { status: 404 });

    const [fileResult] = await db.select({ count: count() }).from(orderFiles).where(eq(orderFiles.orderId, order.id));
    const [completedPayment] = await db
      .select({ transactionId: payments.transactionId, paidAt: payments.paidAt })
      .from(payments)
      .where(and(eq(payments.orderId, order.id), eq(payments.status, "completed")))
      .limit(1);

    return NextResponse.json({
      success: true,
      order: {
        ...order,
        filesCount: fileResult?.count ?? 0,
        paymentCompleted: Boolean(completedPayment),
        paymentReference: completedPayment?.transactionId || null,
        paidAt: completedPayment?.paidAt || null,
      },
    });
  } catch (error) {
    console.error("Track order error:", error);
    return NextResponse.json({ error: "خطا در رهگیری سفارش" }, { status: 500 });
  }
}
