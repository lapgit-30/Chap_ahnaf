import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { services, serviceCategories } from "@/db/schema";
import { eq, asc, and, SQL } from "drizzle-orm";

function normalizeOptions(value: unknown): Record<string, string[]> | null {
  if (!value) return null;
  if (typeof value === "string") {
    try {
      const parsed = JSON.parse(value) as unknown;
      return parsed && typeof parsed === "object" && !Array.isArray(parsed)
        ? (parsed as Record<string, string[]>)
        : null;
    } catch {
      return null;
    }
  }
  return typeof value === "object" && !Array.isArray(value)
    ? (value as Record<string, string[]>)
    : null;
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const categoryParam = searchParams.get("categoryId");
    const typeParam = searchParams.get("type");
    const categoryId = categoryParam ? Number(categoryParam) : null;
    const type = typeParam === "printing" || typeParam === "cafe" ? typeParam : null;

    if (categoryParam && (!Number.isInteger(categoryId) || Number(categoryId) < 1)) {
      return NextResponse.json({ error: "دسته‌بندی نامعتبر است" }, { status: 400 });
    }

    const categoryConditions: SQL[] = [eq(serviceCategories.isActive, true)];
    if (type) categoryConditions.push(eq(serviceCategories.type, type));
    const categories = await db
      .select()
      .from(serviceCategories)
      .where(and(...categoryConditions))
      .orderBy(asc(serviceCategories.sortOrder));

    const serviceConditions: SQL[] = [eq(services.isActive, true)];
    if (categoryId) serviceConditions.push(eq(services.categoryId, categoryId));
    const rows = await db
      .select()
      .from(services)
      .where(and(...serviceConditions))
      .orderBy(asc(services.sortOrder));

    const allowedCategoryIds = new Set(categories.map((category) => category.id));
    const visibleRows = type ? rows.filter((row) => allowedCategoryIds.has(row.categoryId)) : rows;

    return NextResponse.json({
      success: true,
      categories,
      services: visibleRows.map((service) => ({
        ...service,
        options: normalizeOptions(service.options),
      })),
    });
  } catch (error) {
    console.error("Get services error:", error);
    return NextResponse.json({ error: "خطا در دریافت خدمات" }, { status: 500 });
  }
}
