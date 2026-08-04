import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { services, serviceCategories } from "@/db/schema";
import { verifyToken } from "@/lib/auth";
import { eq, asc } from "drizzle-orm";

// GET - List all services with categories
export async function GET(request: NextRequest) {
  try {
    const token = request.headers.get("authorization")?.replace("Bearer ", "");

    if (!token) {
      return NextResponse.json({ error: "غیرمجاز" }, { status: 401 });
    }

    const decoded = verifyToken(token);
    if (!decoded || decoded.role !== "super_admin") {
      return NextResponse.json({ error: "دسترسی غیرمجاز" }, { status: 403 });
    }

    const categories = await db
      .select()
      .from(serviceCategories)
      .orderBy(asc(serviceCategories.sortOrder));

    const allServices = await db
      .select()
      .from(services)
      .orderBy(asc(services.sortOrder));

    return NextResponse.json({
      success: true,
      categories,
      services: allServices,
    });
  } catch (error) {
    console.error("Admin get services error:", error);
    return NextResponse.json(
      { error: "خطای سرور" },
      { status: 500 }
    );
  }
}

// POST - Create new service
export async function POST(request: NextRequest) {
  try {
    const token = request.headers.get("authorization")?.replace("Bearer ", "");

    if (!token) {
      return NextResponse.json({ error: "غیرمجاز" }, { status: 401 });
    }

    const decoded = verifyToken(token);
    if (!decoded || decoded.role !== "super_admin") {
      return NextResponse.json({ error: "دسترسی غیرمجاز" }, { status: 403 });
    }

    const body = await request.json();
    const { categoryId, name, nameEn, description, options, basePrice } = body;

    if (!categoryId || !name || !nameEn) {
      return NextResponse.json(
        { error: "فیلدهای الزامی را پر کنید" },
        { status: 400 }
      );
    }

    const newService = await db
      .insert(services)
      .values({
        categoryId,
        name,
        nameEn,
        description,
        options,
        basePrice,
      })
      .returning({ id: services.id });

    return NextResponse.json({
      success: true,
      message: "خدمت با موفقیت ایجاد شد",
      serviceId: newService[0].id,
    });
  } catch (error) {
    console.error("Admin create service error:", error);
    return NextResponse.json(
      { error: "خطای سرور" },
      { status: 500 }
    );
  }
}
