import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { serviceCategories, activityLogs } from "@/db/schema";
import { cleanText, getBearerUser, getClientIp } from "@/lib/security";
import { eq } from "drizzle-orm";

function values(body: Record<string, unknown>) {
  const name = cleanText(body.name, 100);
  const nameEn = cleanText(body.nameEn, 100).toLowerCase();
  const description = cleanText(body.description, 500);
  const icon = cleanText(body.icon, 50) || "cog";
  const type = cleanText(body.type, 20);
  const sortOrder = Number(body.sortOrder || 0);
  if (name.length < 2 || !/^[a-z0-9_]{2,100}$/.test(nameEn) || !["printing", "cafe"].includes(type) || !Number.isInteger(sortOrder)) throw new Error("INVALID");
  return { name, nameEn, description: description || null, icon, type: type as "printing" | "cafe", sortOrder, isActive: body.isActive !== false };
}

export async function POST(request: NextRequest) {
  try {
    const auth = getBearerUser(request);
    if (!auth || auth.role !== "super_admin") return NextResponse.json({ error: "دسترسی غیرمجاز" }, { status: 403 });
    const [created] = await db.insert(serviceCategories).values(values((await request.json()) as Record<string, unknown>)).returning({ id: serviceCategories.id });
    await db.insert(activityLogs).values({ userId: auth.userId, action: "category.created", details: { categoryId: created.id }, ipAddress: getClientIp(request) });
    return NextResponse.json({ success: true, message: "دسته‌بندی ایجاد شد" }, { status: 201 });
  } catch (error) {
    console.error("Create category error:", error);
    return NextResponse.json({ error: "اطلاعات دسته‌بندی نامعتبر است" }, { status: 400 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const auth = getBearerUser(request);
    if (!auth || auth.role !== "super_admin") return NextResponse.json({ error: "دسترسی غیرمجاز" }, { status: 403 });
    const body = (await request.json()) as Record<string, unknown>;
    const id = Number(body.id);
    if (!Number.isInteger(id)) return NextResponse.json({ error: "شناسه نامعتبر است" }, { status: 400 });
    const updated = await db.update(serviceCategories).set(values(body)).where(eq(serviceCategories.id, id)).returning({ id: serviceCategories.id });
    if (!updated.length) return NextResponse.json({ error: "دسته‌بندی یافت نشد" }, { status: 404 });
    await db.insert(activityLogs).values({ userId: auth.userId, action: "category.updated", details: { categoryId: id }, ipAddress: getClientIp(request) });
    return NextResponse.json({ success: true, message: "دسته‌بندی ویرایش شد" });
  } catch (error) {
    console.error("Update category error:", error);
    return NextResponse.json({ error: "اطلاعات دسته‌بندی نامعتبر است" }, { status: 400 });
  }
}
