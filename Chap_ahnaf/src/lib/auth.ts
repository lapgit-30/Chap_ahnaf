import { cookies } from "next/headers";
import { and, eq, gt } from "drizzle-orm";
import { db } from "@/db";
import { sessions, users } from "@/db/schema";
import { SESSION_COOKIE, sha256 } from "@/lib/security";

export type AuthUser = {
  id: number;
  fullName: string;
  username: string;
  mobile: string;
  role: "customer" | "admin";
};

export async function getCurrentUser(): Promise<AuthUser | null> {
  const cookieStore = await cookies();
  const rawToken = cookieStore.get(SESSION_COOKIE)?.value;
  if (!rawToken) return null;

  const tokenHash = sha256(rawToken);
  const now = new Date();

  const sessionRow = await db
    .select({
      userId: sessions.userId,
      expiresAt: sessions.expiresAt,
      fullName: users.fullName,
      username: users.username,
      mobile: users.mobile,
      role: users.role,
      active: users.isActive,
    })
    .from(sessions)
    .innerJoin(users, eq(users.id, sessions.userId))
    .where(and(eq(sessions.tokenHash, tokenHash), gt(sessions.expiresAt, now)))
    .limit(1);

  const first = sessionRow[0];
  if (!first || !first.active) return null;

  return {
    id: first.userId,
    fullName: first.fullName,
    username: first.username,
    mobile: first.mobile,
    role: first.role,
  };
}

export async function requireCustomer() {
  const user = await getCurrentUser();
  if (!user || user.role !== "customer") {
    return null;
  }
  return user;
}

export async function requireAdmin() {
  const user = await getCurrentUser();
  if (!user || user.role !== "admin") {
    return null;
  }
  return user;
}
