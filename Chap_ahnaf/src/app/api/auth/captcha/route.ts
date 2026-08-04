import { NextResponse } from "next/server";
import { createCaptcha } from "@/lib/security";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const captcha = await createCaptcha();
    return NextResponse.json(
      { success: true, captcha },
      { headers: { "Cache-Control": "no-store" } }
    );
  } catch (error) {
    console.error("Captcha error:", error);
    return NextResponse.json({ error: "خطا در ایجاد سوال امنیتی" }, { status: 500 });
  }
}
