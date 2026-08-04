import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { siteSettings } from "@/db/schema";
import { ALL_SERVICES } from "@/lib/services";

const SETTINGS_KEY = "services_config";

export async function GET() {
  const row = await db.select().from(siteSettings).where(eq(siteSettings.key, SETTINGS_KEY)).limit(1);
  const disabledRaw = (row[0]?.value as { disabledKeys?: unknown })?.disabledKeys;
  const disabledKeys = Array.isArray(disabledRaw) ? (disabledRaw as string[]) : [];

  const services = ALL_SERVICES.filter((item) => !disabledKeys.includes(item.key));

  return NextResponse.json({ ok: true, services });
}
