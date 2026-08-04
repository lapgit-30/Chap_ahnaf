import { NextResponse } from "next/server";
import { desc, eq } from "drizzle-orm";
import { db } from "@/db";
import { orders } from "@/db/schema";
import { requireCustomer } from "@/lib/auth";

export async function GET() {
  const user = await requireCustomer();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const list = await db
    .select({
      id: orders.id,
      trackingCode: orders.trackingCode,
      serviceTitle: orders.serviceTitle,
      status: orders.status,
      depositAmount: orders.depositAmount,
      createdAt: orders.createdAt,
    })
    .from(orders)
    .where(eq(orders.userId, user.id))
    .orderBy(desc(orders.createdAt));

  return NextResponse.json({ ok: true, orders: list });
}
