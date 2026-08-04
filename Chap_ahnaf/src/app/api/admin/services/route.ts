import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { services, serviceCategories, activityLogs } from "@/db/schema";
import { cleanText, getBearerUser, getClientIp } from "@/lib/security";
import { eq, asc } from "drizzle-orm";

function parseOptions(value: unknown): Record<string, string[]> | null {
  if (value === null || value === "" || value === undefined) return null;
  const parsed: unknown = typeof value === "string" ? JSON.parse(value) : value;
  if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) throw new Error("OPTIONS_INVALID");
  const output: Record<string, string[]> = {};
  for (const [key, values] of Object.entries(parsed)) {
    if (!Array.isArray(values) || !values.length || values.some((item) => typeof item !== "string")) throw new Error("OPTIONS_INVALID");
    output[cleanText(key, 50)] = values.map((item) => cleanText(item, 100)).filter(Boolean);
  }
  return output;
}

async function payload(body: Record<string, unknown>) {
  const categoryId = Number(body.categoryId);
  const name = cleanText(body.name, 100);
  const nameEn = cleanText(body.nameEn, 100).toLowerCase();
  const description = cleanText(body.description, 1000);
  const basePrice = Number(body.basePrice || 0);
  if (!Number.isInteger(categoryId) || categoryId < 1 || name.length < 2 || !/^[a-z0-9_]{2,100}$/.test(nameEn)) throw new Error("FIELDS_INVALID");
  if (!Number.isFinite(basePrice) || basePrice < 0 || basePrice > 99999999) throw new Error("PRICE_INVALID");
  const [category] = await db.select({ id: serviceCategories.id }).from(serviceCategories).where(eq(serviceCategories.id, categoryId)).limit(1);
  if (!category) throw new Error("CATEGORY_INVALID");
  return { categoryId, name, nameEn, description: description || null, basePrice: basePrice.toFixed(2), options: parseOptions(body.options), isActive: body.isActive !== false };
}

export async function GET(request: NextRequest) {
  try {
    const auth = getBearerUser(request);
    if (!auth || auth.role !== "super_admin") return NextResponse.json({ error: "دسترسی غیرمجاز" }, { status: 403 });
    const categories = await db.select().from(serviceCategories).orderBy(asc(serviceCategories.sortOrder));
    const rows = await db.select().from(services).orderBy(asc(services.sortOrder));
    return NextResponse.json({ success: true, categories, services: rows.map((row) => ({
      ...row,
      options: typeof row.options === "string" ? JSON.parse(row.options) : row.options,
    })) });
  } catch (error) {
    console.error("Admin get services error:", error);
    return NextResponse.json({ error: "خطا در دریافت خدمات" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const auth = getBearerUser(request);
    if (!auth || auth.role !== "super_admin") return NextResponse.json({ error: "دسترسی غیرمجاز" }, { status: 403 });
    const values = await payload((await request.json()) as Record<string, unknown>);
    const [created] = await db.insert(services).values(values).returning({ id: services.id });
    await db.insert(activityLogs).values({ userId: auth.userId, action: "service.created", details: { serviceId: created.id }, ipAddress: getClientIp(request) });
    return NextResponse.json({ success: true, message: "خدمت ایجاد شد", serviceId: created.id }, { status: 201 });
  } catch (error) {
    console.error("Admin create service error:", error);
    const message = error instanceof Error && error.message === "OPTIONS_INVALID" ? "ساختار گزینه‌ها معتبر نیست" : "اطلاعات خدمت نامعتبر است";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const auth = getBearerUser(request);
    if (!auth || auth.role !== "super_admin") return NextResponse.json({ error: "دسترسی غیرمجاز" }, { status: 403 });
    const body = (await request.json()) as Record<string, unknown>;
    const id = Number(body.id);
    if (!Number.isInteger(id) || id < 1) return NextResponse.json({ error: "شناسه نامعتبر است" }, { status: 400 });
    const values = await payload(body);
    const updated = await db.update(services).set(values).where(eq(services.id, id)).returning({ id: services.id });
    if (!updated.length) return NextResponse.json({ error: "خدمت یافت نشد" }, { status: 404 });
    await db.insert(activityLogs).values({ userId: auth.userId, action: "service.updated", details: { serviceId: id }, ipAddress: getClientIp(request) });
    return NextResponse.json({ success: true, message: "خدمت ویرایش شد" });
  } catch (error) {
    console.error("Admin update service error:", error);
    const message = error instanceof Error && error.message === "OPTIONS_INVALID" ? "ساختار گزینه‌ها معتبر نیست" : "اطلاعات خدمت نامعتبر است";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
