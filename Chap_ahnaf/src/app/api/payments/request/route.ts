import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { orders, payments, users } from "@/db/schema";
import { getBearerUser } from "@/lib/security";
import { requestPayment } from "@/lib/zarinpal";
import { and, eq } from "drizzle-orm";

function appOrigin(request: NextRequest): string {
  if (process.env.APP_URL) return process.env.APP_URL.replace(/\/$/, "");
  const host = request.headers.get("x-forwarded-host") || request.headers.get("host");
  const protocol = request.headers.get("x-forwarded-proto") || "https";
  return host ? `${protocol}://${host}` : request.nextUrl.origin;
}

export async function POST(request: NextRequest) {
  try {
    const auth = getBearerUser(request);
    if (!auth || auth.role !== "customer") return NextResponse.json({ error: "برای پرداخت وارد شوید" }, { status: 401 });
    const body = (await request.json()) as { orderId?: unknown };
    const orderId = Number(body.orderId);
    if (!Number.isInteger(orderId)) return NextResponse.json({ error: "سفارش نامعتبر است" }, { status: 400 });

    const [order] = await db
      .select({ id: orders.id, trackingCode: orders.trackingCode, userId: orders.userId, depositAmount: orders.depositAmount, status: orders.status, mobile: users.mobile })
      .from(orders)
      .innerJoin(users, eq(orders.userId, users.id))
      .where(and(eq(orders.id, orderId), eq(orders.userId, auth.userId)))
      .limit(1);
    if (!order) return NextResponse.json({ error: "سفارش یافت نشد" }, { status: 404 });
    if (["cancelled", "delivered"].includes(order.status)) return NextResponse.json({ error: "این سفارش قابل پرداخت نیست" }, { status: 400 });
    const amount = Number(order.depositAmount);
    if (!Number.isFinite(amount) || amount < 1000) return NextResponse.json({ error: "مبلغ بیعانه هنوز توسط مدیر تعیین نشده است" }, { status: 400 });

    const completed = await db.select({ id: payments.id }).from(payments).where(and(eq(payments.orderId, order.id), eq(payments.status, "completed"))).limit(1);
    if (completed.length) return NextResponse.json({ error: "بیعانه این سفارش قبلاً پرداخت شده است" }, { status: 409 });

    const callbackUrl = `${appOrigin(request)}/api/payments/callback?order=${order.id}`;
    const gateway = await requestPayment({
      amountToman: Math.round(amount),
      callbackUrl,
      description: `بیعانه سفارش ${order.trackingCode} چاپ احناف`,
      mobile: order.mobile,
    });
    await db.insert(payments).values({
      orderId: order.id,
      amount: amount.toFixed(2),
      authority: gateway.authority,
      paymentMethod: "zarinpal",
      status: "pending",
    });
    return NextResponse.json({ success: true, gatewayUrl: gateway.gatewayUrl });
  } catch (error) {
    console.error("Payment request error:", error);
    const message = error instanceof Error ? error.message : "ایجاد پرداخت انجام نشد";
    return NextResponse.json({ error: message }, { status: 502 });
  }
}
