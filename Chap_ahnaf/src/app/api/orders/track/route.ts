import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { orders, orderFiles } from "@/db/schema";
import { eq } from "drizzle-orm";

// GET - Track order by tracking code (public)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const trackingCode = searchParams.get("code");

    if (!trackingCode) {
      return NextResponse.json(
        { error: "کد رهگیری الزامی است" },
        { status: 400 }
      );
    }

    const order = await db
      .select({
        id: orders.id,
        trackingCode: orders.trackingCode,
        status: orders.status,
        serviceName: orders.serviceName,
        options: orders.options,
        notes: orders.notes,
        totalAmount: orders.totalAmount,
        depositAmount: orders.depositAmount,
        remainingAmount: orders.remainingAmount,
        estimatedDelivery: orders.estimatedDelivery,
        createdAt: orders.createdAt,
        updatedAt: orders.updatedAt,
      })
      .from(orders)
      .where(eq(orders.trackingCode, trackingCode))
      .limit(1);

    if (!order.length) {
      return NextResponse.json(
        { error: "سفارشی با این کد رهگیری یافت نشد" },
        { status: 404 }
      );
    }

    // Get order files count (not the actual files for security)
    const filesCount = await db
      .select({ count: orderFiles.id })
      .from(orderFiles)
      .where(eq(orderFiles.orderId, order[0].id));

    return NextResponse.json({
      success: true,
      order: {
        ...order[0],
        filesCount: filesCount.length,
      },
    });
  } catch (error) {
    console.error("Track order error:", error);
    return NextResponse.json(
      { error: "خطای سرور" },
      { status: 500 }
    );
  }
}
