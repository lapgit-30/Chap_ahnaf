import { and, count, eq, gt } from "drizzle-orm";
import { db } from "@/db";
import { otpCodes } from "@/db/schema";

export async function otpAttemptsInWindow(mobile: string, minutes = 15) {
  const from = new Date(Date.now() - minutes * 60 * 1000);
  const result = await db
    .select({ total: count() })
    .from(otpCodes)
    .where(and(eq(otpCodes.mobile, mobile), gt(otpCodes.createdAt, from)));

  return result[0]?.total ?? 0;
}
