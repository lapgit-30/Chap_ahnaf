import Link from "next/link";
import { redirect } from "next/navigation";
import { OrderForm } from "@/components/order-form";
import { getCurrentUser } from "@/lib/auth";

export default async function NewOrderPage() {
  const user = await getCurrentUser();
  if (!user || user.role !== "customer") {
    redirect("/auth");
  }

  return (
    <main className="mx-auto w-full max-w-4xl px-4 py-10">
      <h1 className="text-2xl font-extrabold">ثبت سفارش جدید</h1>
      <p className="mt-2 text-sm text-slate-600">
        خدمت مورد نظر را انتخاب کنید، جزئیات را وارد کنید و در صورت نیاز فایل را بارگذاری نمایید.
      </p>
      <div className="mt-5">
        <OrderForm />
      </div>
      <p className="mt-4 text-xs text-slate-500">
        پس از ثبت سفارش، وضعیت اولیه «در انتظار بررسی» خواهد بود و نتیجه بررسی در حساب شما قابل مشاهده است.
      </p>
      <Link href="/account" className="mt-4 inline-block text-sm text-cyan-700 hover:underline">
        مشاهده سفارش‌های من
      </Link>
    </main>
  );
}
