import { NextResponse } from "next/server";
import { count, eq, sql } from "drizzle-orm";
import { db } from "@/db";
import { orders, payments, users } from "@/db/schema";
import { requireAdmin } from "@/lib/auth";

export async function GET() {
  const admin = await requireAdmin();
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const [orderCountRow] = await db.select({ total: count() }).from(orders);
  const [userCountRow] = await db.select({ total: count() }).from(users);
  const [paidCountRow] = await db.select({ total: count() }).from(payments).where(eq(payments.status, "paid"));
  const [paidSumRow] = await db.select({ total: sql<number>`coalesce(sum(${payments.amount}),0)` }).from(payments).where(eq(payments.status, "paid"));

  return NextResponse.json({
    ok: true,
    stats: {
      totalOrders: orderCountRow?.total ?? 0,
      totalUsers: userCountRow?.total ?? 0,
      paidPayments: paidCountRow?.total ?? 0,
      paidAmount: Number(paidSumRow?.total ?? 0),
    },
  });
}
