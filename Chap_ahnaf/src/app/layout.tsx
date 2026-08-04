import type { Metadata } from "next";
import type { ReactNode } from "react";
import "./globals.css";
import { SiteHeader } from "@/components/site-header";

export const metadata: Metadata = {
  title: "چاپ دیجیتال احناف | سفارش آنلاین چاپ و کافی‌نت",
  description: "سامانه حرفه‌ای سفارش آنلاین چاپخانه و کافی‌نت با ثبت سفارش، آپلود فایل، بیعانه آنلاین و تحویل حضوری.",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="fa" dir="rtl">
      <body className="min-h-screen bg-slate-50 text-slate-900 antialiased">
        <SiteHeader />
        {children}
      </body>
    </html>
  );
}
