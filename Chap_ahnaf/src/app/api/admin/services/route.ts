import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { db } from "@/db";
import { siteSettings } from "@/db/schema";
import { ALL_SERVICES } from "@/lib/services";
import { requireAdmin } from "@/lib/auth";
import { verifyCsrf } from "@/lib/csrf";

const schema = z.object({
  disabledKeys: z.array(z.string()).default([]),
});

const SETTINGS_KEY = "services_config";

export async function GET() {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const row = await db.select().from(siteSettings).where(eq(siteSettings.key, SETTINGS_KEY)).limit(1);
  const disabledKeys = Array.isArray((row[0]?.value as { disabledKeys?: unknown })?.disabledKeys)
    ? ((row[0]?.value as { disabledKeys?: string[] }).disabledKeys ?? [])
    : [];

  return NextResponse.json({ ok: true, allServices: ALL_SERVICES, disabledKeys });
}

export async function PUT(request: Request) {
  if (!(await verifyCsrf())) {
    return NextResponse.json({ error: "CSRF" }, { status: 403 });
  }

  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Invalid" }, { status: 400 });

  const existing = await db.select().from(siteSettings).where(eq(siteSettings.key, SETTINGS_KEY)).limit(1);

  if (!existing[0]) {
    await db.insert(siteSettings).values({ key: SETTINGS_KEY, value: parsed.data, updatedAt: new Date() });
  } else {
    await db.update(siteSettings).set({ value: parsed.data, updatedAt: new Date() }).where(eq(siteSettings.key, SETTINGS_KEY));
  }

  return NextResponse.json({ ok: true });
}
