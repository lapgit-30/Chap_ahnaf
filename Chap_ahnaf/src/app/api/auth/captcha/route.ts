import { NextResponse } from "next/server";
import { db } from "@/db";
import { captchaChallenges } from "@/db/schema";
import { generateToken, hashSecret } from "@/lib/security";

export async function GET() {
  const left = Math.floor(Math.random() * 8) + 1;
  const right = Math.floor(Math.random() * 8) + 1;
  const answer = `${left + right}`;
  const token = generateToken(18);

  await db.insert(captchaChallenges).values({
    token,
    answerHash: await hashSecret(answer),
    expiresAt: new Date(Date.now() + 5 * 60 * 1000),
  });

  return NextResponse.json({
    token,
    question: `${left} + ${right} = ؟`,
  });
}
