import { NextResponse } from "next/server";
import { desc, eq } from "drizzle-orm";
import { db } from "@/db";
import { orders, payments, users } from "@/db/schema";
import { requireAdmin } from "@/lib/auth";

export async function GET() {
  const admin = await requireAdmin();
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const rows = await db
    .select({
      id: payments.id,
      amount: payments.amount,
      status: payments.status,
      refCode: payments.refCode,
      paidAt: payments.paidAt,
      createdAt: payments.createdAt,
      trackingCode: orders.trackingCode,
      customer: users.fullName,
    })
    .from(payments)
    .innerJoin(orders, eq(orders.id, payments.orderId))
    .innerJoin(users, eq(users.id, orders.userId))
    .orderBy(desc(payments.createdAt));

  return NextResponse.json({ ok: true, payments: rows });
}
