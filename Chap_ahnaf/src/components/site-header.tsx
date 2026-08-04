"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { LogoutButton } from "@/components/logout-button";

type MeResponse = {
  authenticated: boolean;
  user?: {
    fullName: string;
    role: "customer" | "admin";
  };
};

export function SiteHeader() {
  const pathname = usePathname();
  const router = useRouter();
  const [me, setMe] = useState<MeResponse>({ authenticated: false });

  useEffect(() => {
    fetch("/api/auth/me")
      .then((res) => res.json())
      .then((data) => setMe(data))
      .catch(() => setMe({ authenticated: false }));
  }, [pathname]);

  if (pathname.startsWith("/admin")) {
    return null;
  }

  return (
    <header className="border-b border-slate-200 bg-white/90 backdrop-blur">
      <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-4 py-4">
        <Link href="/" className="text-lg font-extrabold text-cyan-700">
          چاپ دیجیتال احناف
        </Link>
        <nav className="flex flex-wrap items-center gap-3 text-sm text-slate-700">
          <Link href="/services" className="hover:text-cyan-700">
            خدمات
          </Link>
          <Link href="/order/new" className="hover:text-cyan-700">
            ثبت سفارش
          </Link>
          <Link href="/order/track" className="hover:text-cyan-700">
            پیگیری سفارش
          </Link>
          <Link href="/contact" className="hover:text-cyan-700">
            تماس با ما
          </Link>
          {!me.authenticated || me.user?.role !== "customer" ? (
            <Link href="/auth" className="rounded-lg border border-cyan-700 px-3 py-1.5 text-cyan-700 hover:bg-cyan-50">
              ورود / ثبت‌نام
            </Link>
          ) : (
            <>
              <span className="text-slate-500">{me.user.fullName}</span>
              <Link href="/account" className="rounded-lg border border-slate-300 px-3 py-1.5 hover:bg-slate-50">
                حساب من
              </Link>
              <LogoutButton />
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
