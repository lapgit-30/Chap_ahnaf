import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { services, serviceCategories } from "@/db/schema";
import { eq, asc } from "drizzle-orm";

// GET - List all services
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const categoryId = searchParams.get("categoryId");
    const type = searchParams.get("type"); // 'printing' or 'cafe'

    // Get categories
    let categoriesQuery = db
      .select()
      .from(serviceCategories)
      .where(eq(serviceCategories.isActive, true))
      .orderBy(asc(serviceCategories.sortOrder));

    if (type) {
      categoriesQuery = db
        .select()
        .from(serviceCategories)
        .where(
          eq(serviceCategories.isActive, true) &&
            eq(serviceCategories.type, type as "printing" | "cafe")
        )
        .orderBy(asc(serviceCategories.sortOrder)) as typeof categoriesQuery;
    }

    const categories = await categoriesQuery;

    // Get services
    let servicesQuery = db
      .select()
      .from(services)
      .where(eq(services.isActive, true))
      .orderBy(asc(services.sortOrder));

    if (categoryId) {
      servicesQuery = db
        .select()
        .from(services)
        .where(
          eq(services.isActive, true) &&
            eq(services.categoryId, parseInt(categoryId))
        )
        .orderBy(asc(services.sortOrder)) as typeof servicesQuery;
    }

    const allServices = await servicesQuery;

    return NextResponse.json({
      success: true,
      categories,
      services: allServices,
    });
  } catch (error) {
    console.error("Get services error:", error);
    return NextResponse.json(
      { error: "خطای سرور" },
      { status: 500 }
    );
  }
}
