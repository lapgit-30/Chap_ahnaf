import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { contactMessages } from "@/db/schema";
import { cleanText, getClientIp } from "@/lib/security";
import { and, count, eq, gte } from "drizzle-orm";

const subjects = new Set(["order", "consultation", "complaint", "suggestion", "other"]);

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as Record<string, unknown>;
    if (body.website) return NextResponse.json({ success: true });
    const fullName = cleanText(body.fullName, 100);
    const mobile = cleanText(body.mobile, 11);
    const subject = cleanText(body.subject, 40);
    const message = cleanText(body.message, 2000);
    if (fullName.length < 3 || !/^09\d{9}$/.test(mobile) || !subjects.has(subject) || message.length < 10) {
      return NextResponse.json({ error: "لطفاً اطلاعات فرم را کامل و صحیح وارد کنید" }, { status: 400 });
    }

    const ipAddress = getClientIp(request);
    const recent = await db
      .select({ count: count() })
      .from(contactMessages)
      .where(and(eq(contactMessages.ipAddress, ipAddress), gte(contactMessages.createdAt, new Date(Date.now() - 60 * 60 * 1000))));
    if ((recent[0]?.count ?? 0) >= 5) {
      return NextResponse.json({ error: "تعداد پیام‌های ارسالی بیش از حد مجاز است" }, { status: 429 });
    }

    await db.insert(contactMessages).values({ fullName, mobile, subject, message, ipAddress });
    return NextResponse.json({ success: true, message: "پیام شما ثبت شد؛ به‌زودی با شما تماس می‌گیریم" }, { status: 201 });
  } catch (error) {
    console.error("Contact message error:", error);
    return NextResponse.json({ error: "ثبت پیام انجام نشد" }, { status: 500 });
  }
}
