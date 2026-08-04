import { NextResponse } from "next/server";
import { and, desc, eq, ilike, sql } from "drizzle-orm";
import { z } from "zod";
import { db } from "@/db";
import { adminActivityLogs, orders, users } from "@/db/schema";
import { requireAdmin } from "@/lib/auth";
import { verifyCsrf } from "@/lib/csrf";

const patchSchema = z.object({
  orderId: z.number().int().positive(),
  status: z.enum(["pending_review", "approved", "in_progress", "ready_for_pickup", "delivered", "cancelled"]).optional(),
  depositAmount: z.number().int().min(0).max(10_000_000).optional(),
});

export async function GET(request: Request) {
  const admin = await requireAdmin();
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const q = searchParams.get("q")?.trim();
  const status = searchParams.get("status")?.trim();

  const filters = [];
  if (q) {
    filters.push(
      sql`(${orders.trackingCode} ILIKE ${`%${q}%`} OR ${orders.serviceTitle} ILIKE ${`%${q}%`} OR ${users.fullName} ILIKE ${`%${q}%`} OR ${users.mobile} ILIKE ${`%${q}%`})`,
    );
  }

  if (status && ["pending_review", "approved", "in_progress", "ready_for_pickup", "delivered", "cancelled"].includes(status)) {
    filters.push(eq(orders.status, status as typeof orders.$inferSelect.status));
  }

  const whereClause = filters.length > 0 ? and(...filters) : undefined;

  const rows = await db
    .select({
      id: orders.id,
      trackingCode: orders.trackingCode,
      serviceTitle: orders.serviceTitle,
      status: orders.status,
      depositAmount: orders.depositAmount,
      createdAt: orders.createdAt,
      details: orders.details,
      notes: orders.notes,
      filePath: orders.filePath,
      customerName: users.fullName,
      customerMobile: users.mobile,
    })
    .from(orders)
    .innerJoin(users, eq(users.id, orders.userId))
    .where(whereClause)
    .orderBy(desc(orders.createdAt));

  return NextResponse.json({ ok: true, orders: rows });
}

export async function PATCH(request: Request) {
  if (!(await verifyCsrf())) {
    return NextResponse.json({ error: "درخواست نامعتبر (CSRF)" }, { status: 403 });
  }

  const admin = await requireAdmin();
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  const parsed = patchSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: "ورودی نامعتبر" }, { status: 400 });
  }

  const payload: Partial<typeof orders.$inferInsert> = {
    updatedAt: new Date(),
  };

  if (parsed.data.status) payload.status = parsed.data.status;
  if (typeof parsed.data.depositAmount === "number") payload.depositAmount = parsed.data.depositAmount;

  const updated = await db.update(orders).set(payload).where(eq(orders.id, parsed.data.orderId)).returning();

  if (!updated[0]) {
    return NextResponse.json({ error: "سفارش یافت نشد" }, { status: 404 });
  }

  await db.insert(adminActivityLogs).values({
    adminUserId: admin.id,
    action: "order_updated",
    meta: { orderId: parsed.data.orderId, changes: parsed.data },
  });

  return NextResponse.json({ ok: true, order: updated[0] });
}
