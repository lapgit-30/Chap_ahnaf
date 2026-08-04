import { cookies, headers } from "next/headers";
import { CSRF_COOKIE, ensureCsrfToken } from "@/lib/security";

export async function getOrSetCsrfToken() {
  const cookieStore = await cookies();
  const current = cookieStore.get(CSRF_COOKIE)?.value;
  const token = ensureCsrfToken(current);

  if (!current) {
    cookieStore.set(CSRF_COOKIE, token, {
      httpOnly: false,
      sameSite: "strict",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 60 * 60 * 24,
    });
  }

  return token;
}

export async function verifyCsrf() {
  const cookieStore = await cookies();
  const csrfCookie = cookieStore.get(CSRF_COOKIE)?.value;
  const headerStore = await headers();
  const csrfHeader = headerStore.get("x-csrf-token");

  return !!csrfCookie && !!csrfHeader && csrfCookie === csrfHeader;
}
