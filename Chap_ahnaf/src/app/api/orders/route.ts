import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { orders, orderFiles, services, users } from "@/db/schema";
import { generateTrackingCode } from "@/lib/auth";
import { cleanText, getBearerUser, safeJsonObject } from "@/lib/security";
import { savePrivateFile, validateFileBatch } from "@/lib/storage";
import { eq, desc, and } from "drizzle-orm";

function serviceOptions(value: unknown): Record<string, string[]> {
  if (!value) return {};
  const parsed = typeof value === "string" ? JSON.parse(value) : value;
  return parsed && typeof parsed === "object" && !Array.isArray(parsed)
    ? (parsed as Record<string, string[]>)
    : {};
}

export async function GET(request: NextRequest) {
  try {
    const auth = getBearerUser(request);
    if (!auth || auth.role !== "customer") {
      return NextResponse.json({ error: "برای مشاهده سفارش‌ها وارد شوید" }, { status: 401 });
    }
    const trackingCode = cleanText(new URL(request.url).searchParams.get("trackingCode"), 20);
    if (trackingCode) {
      const [order] = await db
        .select()
        .from(orders)
        .where(and(eq(orders.trackingCode, trackingCode), eq(orders.userId, auth.userId)))
        .limit(1);
      if (!order) return NextResponse.json({ error: "سفارش یافت نشد" }, { status: 404 });
      const files = await db.select({ id: orderFiles.id, fileOriginalName: orderFiles.fileOriginalName, fileSize: orderFiles.fileSize, mimeType: orderFiles.mimeType }).from(orderFiles).where(eq(orderFiles.orderId, order.id));
      return NextResponse.json({ success: true, order: { ...order, files } });
    }
    const userOrders = await db.select().from(orders).where(eq(orders.userId, auth.userId)).orderBy(desc(orders.createdAt));
    return NextResponse.json({ success: true, orders: userOrders });
  } catch (error) {
    console.error("Get orders error:", error);
    return NextResponse.json({ error: "خطا در دریافت سفارش‌ها" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const auth = getBearerUser(request);
    if (!auth || auth.role !== "customer") {
      return NextResponse.json({ error: "برای ثبت سفارش وارد شوید" }, { status: 401 });
    }

    const [user] = await db.select({ active: users.isActive }).from(users).where(eq(users.id, auth.userId)).limit(1);
    if (!user?.active) return NextResponse.json({ error: "حساب کاربری غیرفعال است" }, { status: 403 });

    const formData = await request.formData();
    const serviceId = Number(formData.get("serviceId"));
    const notes = cleanText(formData.get("notes"), 2000);
    const files = formData.getAll("files").filter((item): item is File => item instanceof File && item.size > 0);
    if (!Number.isInteger(serviceId) || serviceId < 1) {
      return NextResponse.json({ error: "خدمت انتخاب نشده است" }, { status: 400 });
    }

    const [service] = await db.select().from(services).where(and(eq(services.id, serviceId), eq(services.isActive, true))).limit(1);
    if (!service) return NextResponse.json({ error: "خدمت انتخابی فعال نیست" }, { status: 400 });

    let selected: Record<string, string>;
    try {
      selected = safeJsonObject(String(formData.get("options") || "{}"));
    } catch {
      return NextResponse.json({ error: "گزینه‌های سفارش نامعتبر است" }, { status: 400 });
    }
    const allowed = serviceOptions(service.options);
    for (const [key, values] of Object.entries(allowed)) {
      if (!selected[key] || !values.includes(selected[key])) {
        return NextResponse.json({ error: `گزینه «${key}» را انتخاب کنید` }, { status: 400 });
      }
    }
    if (selected.quantity && (!/^\d{1,6}$/.test(selected.quantity) || Number(selected.quantity) < 1)) {
      return NextResponse.json({ error: "تعداد سفارش نامعتبر است" }, { status: 400 });
    }

    validateFileBatch(files);
    const savedFiles: Array<{
      storedName: string;
      originalName: string;
      fileSize: number;
      mimeType: string;
    }> = [];
    for (const file of files) {
      const saved = await savePrivateFile(file);
      savedFiles.push({ ...saved, fileSize: file.size, mimeType: file.type });
    }

    const trackingCode = generateTrackingCode();
    const created = await db.transaction(async (tx) => {
      const [order] = await tx.insert(orders).values({
        trackingCode,
        userId: auth.userId,
        serviceId: service.id,
        serviceName: service.name,
        options: selected,
        notes: notes || null,
        status: "pending_review",
      }).returning({ id: orders.id });
      if (savedFiles.length) {
        await tx.insert(orderFiles).values(savedFiles.map((file) => ({
          orderId: order.id,
          fileName: file.storedName,
          fileOriginalName: file.originalName,
          fileSize: file.fileSize,
          mimeType: file.mimeType,
        })));
      }
      return order;
    });

    return NextResponse.json({ success: true, message: "سفارش ثبت شد", trackingCode, orderId: created.id }, { status: 201 });
  } catch (error) {
    console.error("Create order error:", error);
    const message = error instanceof Error && /فایل|مگابایت/.test(error.message) ? error.message : "ثبت سفارش انجام نشد";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
