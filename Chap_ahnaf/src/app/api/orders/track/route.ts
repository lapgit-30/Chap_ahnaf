import { NextResponse } from "next/server";
import { and, eq } from "drizzle-orm";
import { z } from "zod";
import { db } from "@/db";
import { orders, users } from "@/db/schema";
import { normalizeMobile } from "@/lib/security";

const schema = z.object({
  trackingCode: z.string().min(5),
  mobile: z.string().min(11).max(20),
});

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const parsed = schema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: "ورودی نامعتبر" }, { status: 400 });
  }

  const mobile = normalizeMobile(parsed.data.mobile);

  const rows = await db
    .select({
      trackingCode: orders.trackingCode,
      status: orders.status,
      serviceTitle: orders.serviceTitle,
      createdAt: orders.createdAt,
      depositAmount: orders.depositAmount,
      filePath: orders.filePath,
    })
    .from(orders)
    .innerJoin(users, eq(users.id, orders.userId))
    .where(and(eq(orders.trackingCode, parsed.data.trackingCode.trim()), eq(users.mobile, mobile)))
    .limit(1);

  const order = rows[0];
  if (!order) {
    return NextResponse.json({ error: "سفارشی با این مشخصات پیدا نشد" }, { status: 404 });
  }

  return NextResponse.json({ ok: true, order });
}
