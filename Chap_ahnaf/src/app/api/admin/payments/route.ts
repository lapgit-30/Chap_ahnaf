import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { payments, orders, users } from "@/db/schema";
import { getBearerUser } from "@/lib/security";
import { desc, eq } from "drizzle-orm";

export async function GET(request: NextRequest) {
  try {
    const auth = getBearerUser(request);
    if (!auth || auth.role !== "super_admin") return NextResponse.json({ error: "دسترسی غیرمجاز" }, { status: 403 });
    const rows = await db
      .select({
        id: payments.id,
        amount: payments.amount,
        status: payments.status,
        authority: payments.authority,
        transactionId: payments.transactionId,
        paymentMethod: payments.paymentMethod,
        paidAt: payments.paidAt,
        createdAt: payments.createdAt,
        orderId: orders.id,
        trackingCode: orders.trackingCode,
        customerName: users.fullName,
        customerMobile: users.mobile,
      })
      .from(payments)
      .innerJoin(orders, eq(payments.orderId, orders.id))
      .innerJoin(users, eq(orders.userId, users.id))
      .orderBy(desc(payments.createdAt))
      .limit(200);
    return NextResponse.json({ success: true, payments: rows });
  } catch (error) {
    console.error("Admin payments error:", error);
    return NextResponse.json({ error: "خطا در دریافت پرداخت‌ها" }, { status: 500 });
  }
}
