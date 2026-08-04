import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/db";
import { orders, siteSettings } from "@/db/schema";
import { requireCustomer } from "@/lib/auth";
import { SERVICE_BY_KEY } from "@/lib/services";
import { sanitizeText } from "@/lib/security";
import { verifyCsrf } from "@/lib/csrf";
import { eq } from "drizzle-orm";

const payloadSchema = z.object({
  serviceKey: z.string().min(2),
  details: z.record(z.string(), z.union([z.string(), z.number(), z.boolean()])),
  notes: z.string().max(1000).optional(),
  filePath: z.string().max(300).optional(),
});

function trackingCode() {
  const random = Math.random().toString(36).slice(2, 8).toUpperCase();
  return `AHN-${Date.now().toString().slice(-6)}-${random}`;
}

export async function POST(request: Request) {
  if (!(await verifyCsrf())) {
    return NextResponse.json({ error: "درخواست نامعتبر (CSRF)" }, { status: 403 });
  }

  const user = await requireCustomer();
  if (!user) {
    return NextResponse.json({ error: "ابتدا وارد حساب کاربری شوید" }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  const parsed = payloadSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "اطلاعات سفارش معتبر نیست" }, { status: 400 });
  }

  const service = SERVICE_BY_KEY[parsed.data.serviceKey];
  if (!service) {
    return NextResponse.json({ error: "سرویس انتخاب‌شده معتبر نیست" }, { status: 400 });
  }

  const settings = await db.select().from(siteSettings).where(eq(siteSettings.key, "services_config")).limit(1);
  const disabledRaw = (settings[0]?.value as { disabledKeys?: unknown })?.disabledKeys;
  const disabledKeys = Array.isArray(disabledRaw) ? (disabledRaw as string[]) : [];

  if (disabledKeys.includes(service.key)) {
    return NextResponse.json({ error: "این سرویس موقتاً غیرفعال است" }, { status: 400 });
  }

  const inserted = await db
    .insert(orders)
    .values({
      trackingCode: trackingCode(),
      userId: user.id,
      domain: service.domain,
      serviceKey: service.key,
      serviceTitle: service.title,
      details: parsed.data.details,
      notes: sanitizeText(parsed.data.notes ?? "", 1000),
      filePath: parsed.data.filePath,
      status: "pending_review",
    })
    .returning({ id: orders.id, trackingCode: orders.trackingCode, status: orders.status });

  return NextResponse.json({ ok: true, order: inserted[0] });
}
