import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { db } from "@/db";
import { siteSettings } from "@/db/schema";
import { requireAdmin } from "@/lib/auth";
import { verifyCsrf } from "@/lib/csrf";

const schema = z.object({
  shopName: z.string().min(2).max(120),
  phone: z.string().min(7).max(30),
  address: z.string().min(5).max(300),
});

const SETTINGS_KEY = "general";

export async function GET() {
  const admin = await requireAdmin();
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const row = await db.select().from(siteSettings).where(eq(siteSettings.key, SETTINGS_KEY)).limit(1);
  return NextResponse.json({ ok: true, settings: row[0]?.value ?? null });
}

export async function PUT(request: Request) {
  if (!(await verifyCsrf())) {
    return NextResponse.json({ error: "درخواست نامعتبر (CSRF)" }, { status: 403 });
  }

  const admin = await requireAdmin();
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "ورودی نامعتبر" }, { status: 400 });
  }

  const existing = await db.select().from(siteSettings).where(eq(siteSettings.key, SETTINGS_KEY)).limit(1);

  if (!existing[0]) {
    await db.insert(siteSettings).values({ key: SETTINGS_KEY, value: parsed.data, updatedAt: new Date() });
  } else {
    await db.update(siteSettings).set({ value: parsed.data, updatedAt: new Date() }).where(eq(siteSettings.key, SETTINGS_KEY));
  }

  return NextResponse.json({ ok: true });
}
