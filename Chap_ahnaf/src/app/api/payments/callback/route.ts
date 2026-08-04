import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { orders, payments } from "@/db/schema";
import { verifyPayment } from "@/lib/zarinpal";
import { and, eq } from "drizzle-orm";

function resultUrl(request: NextRequest, code: string, result: string, refId?: string) {
  const base = process.env.APP_URL || request.nextUrl.origin;
  const url = new URL("/track", base);
  url.searchParams.set("code", code);
  url.searchParams.set("payment", result);
  if (refId) url.searchParams.set("ref", refId);
  return url;
}

export async function GET(request: NextRequest) {
  const authority = request.nextUrl.searchParams.get("Authority") || "";
  const gatewayStatus = request.nextUrl.searchParams.get("Status") || "";
  const orderId = Number(request.nextUrl.searchParams.get("order"));
  try {
    const [order] = await db.select({ id: orders.id, trackingCode: orders.trackingCode }).from(orders).where(eq(orders.id, orderId)).limit(1);
    if (!order) return NextResponse.redirect(new URL("/track?payment=failed", process.env.APP_URL || request.nextUrl.origin));
    const [payment] = await db.select().from(payments).where(and(eq(payments.orderId, order.id), eq(payments.authority, authority))).limit(1);
    if (!payment) return NextResponse.redirect(resultUrl(request, order.trackingCode, "failed"));
    if (payment.status === "completed") return NextResponse.redirect(resultUrl(request, order.trackingCode, "success", payment.transactionId || undefined));
    if (gatewayStatus !== "OK") return NextResponse.redirect(resultUrl(request, order.trackingCode, "cancelled"));

    const verified = await verifyPayment(authority, Math.round(Number(payment.amount)));
    await db.update(payments).set({
      status: "completed",
      transactionId: verified.refId,
      paidAt: new Date(),
    }).where(and(eq(payments.id, payment.id), eq(payments.status, "pending")));
    return NextResponse.redirect(resultUrl(request, order.trackingCode, "success", verified.refId));
  } catch (error) {
    console.error("Payment callback error:", error);
    const [order] = Number.isInteger(orderId) ? await db.select({ trackingCode: orders.trackingCode }).from(orders).where(eq(orders.id, orderId)).limit(1) : [];
    return NextResponse.redirect(resultUrl(request, order?.trackingCode || "", "failed"));
  }
}
