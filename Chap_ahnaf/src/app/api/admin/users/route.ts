import { NextResponse } from "next/server";
import { desc, eq } from "drizzle-orm";
import { db } from "@/db";
import { users } from "@/db/schema";
import { requireAdmin } from "@/lib/auth";

export async function GET() {
  const admin = await requireAdmin();
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const list = await db
    .select({
      id: users.id,
      fullName: users.fullName,
      username: users.username,
      mobile: users.mobile,
      role: users.role,
      createdAt: users.createdAt,
      isActive: users.isActive,
    })
    .from(users)
    .where(eq(users.role, "customer"))
    .orderBy(desc(users.createdAt));

  return NextResponse.json({ ok: true, users: list });
}
