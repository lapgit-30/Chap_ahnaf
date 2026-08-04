import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { orders, orderFiles, services, users } from "@/db/schema";
import { verifyToken, generateTrackingCode } from "@/lib/auth";
import { eq, desc, and, count, ilike } from "drizzle-orm";

// GET - List user's orders
export async function GET(request: NextRequest) {
  try {
    const token = request.headers.get("authorization")?.replace("Bearer ", "");

    if (!token) {
      return NextResponse.json({ error: "غیرمجاز" }, { status: 401 });
    }

    const decoded = verifyToken(token);
    if (!decoded) {
      return NextResponse.json({ error: "توکن نامعتبر" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const trackingCode = searchParams.get("trackingCode");

    if (trackingCode) {
      // Track specific order
      const order = await db
        .select()
        .from(orders)
        .where(
          and(
            eq(orders.trackingCode, trackingCode),
            eq(orders.userId, decoded.userId)
          )
        )
        .limit(1);

      if (!order.length) {
        return NextResponse.json(
          { error: "سفارش یافت نشد" },
          { status: 404 }
        );
      }

      const files = await db
        .select()
        .from(orderFiles)
        .where(eq(orderFiles.orderId, order[0].id));

      return NextResponse.json({
        success: true,
        order: { ...order[0], files },
      });
    }

    // List all user orders
    const userOrders = await db
      .select()
      .from(orders)
      .where(eq(orders.userId, decoded.userId))
      .orderBy(desc(orders.createdAt));

    return NextResponse.json({
      success: true,
      orders: userOrders,
    });
  } catch (error) {
    console.error("Get orders error:", error);
    return NextResponse.json(
      { error: "خطای سرور" },
      { status: 500 }
    );
  }
}

// POST - Create new order
export async function POST(request: NextRequest) {
  try {
    const token = request.headers.get("authorization")?.replace("Bearer ", "");

    if (!token) {
      return NextResponse.json({ error: "غیرمجاز" }, { status: 401 });
    }

    const decoded = verifyToken(token);
    if (!decoded) {
      return NextResponse.json({ error: "توکن نامعتبر" }, { status: 401 });
    }

    const formData = await request.formData();
    const serviceId = parseInt(formData.get("serviceId") as string);
    const serviceName = formData.get("serviceName") as string;
    const optionsStr = formData.get("options") as string;
    const notes = formData.get("notes") as string;
    const files = formData.getAll("files") as File[];

    // Validation
    if (!serviceId || !serviceName) {
      return NextResponse.json(
        { error: "خدمت انتخاب نشده است" },
        { status: 400 }
      );
    }

    // Verify service exists
    const service = await db
      .select()
      .from(services)
      .where(eq(services.id, serviceId))
      .limit(1);

    if (!service.length) {
      return NextResponse.json(
        { error: "خدمت نامعتبر است" },
        { status: 400 }
      );
    }

    // Validate files
    const allowedTypes = [
      "application/pdf",
      "image/jpeg",
      "image/jpg",
      "image/png",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "application/zip",
      "application/x-zip-compressed",
    ];
    const maxSize = 20 * 1024 * 1024; // 20MB

    for (const file of files) {
      if (!allowedTypes.includes(file.type)) {
        return NextResponse.json(
          { error: `فرمت فایل ${file.name} مجاز نیست` },
          { status: 400 }
        );
      }
      if (file.size > maxSize) {
        return NextResponse.json(
          { error: `حجم فایل ${file.name} بیش از 20 مگابایت است` },
          { status: 400 }
        );
      }
    }

    const trackingCode = generateTrackingCode();
    const options = optionsStr ? JSON.parse(optionsStr) : null;

    // Create order
    const newOrder = await db
      .insert(orders)
      .values({
        trackingCode,
        userId: decoded.userId,
        serviceId,
        serviceName,
        options,
        notes,
        status: "pending_review",
      })
      .returning({ id: orders.id });

    // Save files (in production, use cloud storage)
    for (const file of files) {
      const fileName = `${Date.now()}-${file.name}`;
      const filePath = `public/uploads/${fileName}`;

      // In production, upload to cloud storage
      // For now, we'll save metadata only
      await db.insert(orderFiles).values({
        orderId: newOrder[0].id,
        fileName,
        fileOriginalName: file.name,
        fileSize: file.size,
        mimeType: file.type,
      });
    }

    return NextResponse.json({
      success: true,
      message: "سفارش با موفقیت ثبت شد",
      trackingCode,
      orderId: newOrder[0].id,
    });
  } catch (error) {
    console.error("Create order error:", error);
    return NextResponse.json(
      { error: "خطای سرور" },
      { status: 500 }
    );
  }
}
