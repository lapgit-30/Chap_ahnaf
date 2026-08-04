import { NextResponse } from "next/server";
import { and, eq } from "drizzle-orm";
import { z } from "zod";
import { db } from "@/db";
import { orders, payments } from "@/db/schema";
import { requireCustomer } from "@/lib/auth";
import { verifyCsrf } from "@/lib/csrf";

const payloadSchema = z.object({
  orderId: z.number().int().positive(),
});

export async function POST(request: Request) {
  if (!(await verifyCsrf())) {
    return NextResponse.json({ error: "درخواست نامعتبر (CSRF)" }, { status: 403 });
  }

  const user = await requireCustomer();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  const parsed = payloadSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "ورودی نامعتبر" }, { status: 400 });
  }

  const order = (
    await db
      .select()
      .from(orders)
      .where(and(eq(orders.id, parsed.data.orderId), eq(orders.userId, user.id)))
      .limit(1)
  )[0];

  if (!order) {
    return NextResponse.json({ error: "سفارش یافت نشد" }, { status: 404 });
  }

  if (!order.depositAmount || order.depositAmount <= 0) {
    return NextResponse.json({ error: "برای این سفارش بیعانه تعیین نشده است" }, { status: 400 });
  }

  const refCode = `PAY-${Date.now()}`;
  const payment = await db
    .insert(payments)
    .values({
      orderId: order.id,
      amount: order.depositAmount,
      status: "paid",
      refCode,
      paidAt: new Date(),
    })
    .returning();

  return NextResponse.json({ ok: true, payment: payment[0] });
}
