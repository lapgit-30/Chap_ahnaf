"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ORDER_STATUS_LABELS } from "@/lib/services";

function getCookie(name: string) {
  return document.cookie
    .split("; ")
    .find((row) => row.startsWith(`${name}=`))
    ?.split("=")[1];
}

type OrderRow = {
  id: number;
  trackingCode: string;
  serviceTitle: string;
  status: string;
  depositAmount: number | null;
  createdAt: string;
};

export default function AccountPage() {
  const [orders, setOrders] = useState<OrderRow[]>([]);
  const [error, setError] = useState("");
  const router = useRouter();

  const load = async () => {
    const response = await fetch("/api/orders/mine");
    const data = await response.json();
    if (!response.ok) {
      setError("برای مشاهده این صفحه ابتدا وارد شوید.");
      return;
    }
    setOrders(data.orders || []);
  };

  useEffect(() => {
    load();
  }, []);

  const payDeposit = async (orderId: number) => {
    const csrf = getCookie("ahnaf_csrf") || "";
    const response = await fetch("/api/payments/deposit", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-csrf-token": csrf,
      },
      body: JSON.stringify({ orderId }),
    });

    const data = await response.json();
    if (!response.ok) {
      alert(data.error || "خطا در پرداخت بیعانه");
      return;
    }

    alert(`پرداخت با موفقیت ثبت شد. کد مرجع: ${data.payment.refCode}`);
    router.refresh();
  };

  return (
    <main className="mx-auto w-full max-w-5xl px-4 py-10">
      <h1 className="text-2xl font-extrabold">حساب من</h1>
      <p className="mt-2 text-sm text-slate-600">پیگیری وضعیت سفارش‌ها و پرداخت بیعانه آنلاین</p>

      {error ? <p className="mt-4 text-sm text-rose-700">{error}</p> : null}

      <div className="mt-6 overflow-hidden rounded-2xl border border-slate-200 bg-white">
        <table className="w-full text-right text-sm">
          <thead className="bg-slate-100 text-slate-700">
            <tr>
              <th className="px-4 py-3">کد رهگیری</th>
              <th className="px-4 py-3">خدمت</th>
              <th className="px-4 py-3">وضعیت</th>
              <th className="px-4 py-3">بیعانه</th>
              <th className="px-4 py-3">اقدام</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((order) => (
              <tr key={order.id} className="border-t border-slate-100">
                <td className="px-4 py-3 font-mono text-xs">{order.trackingCode}</td>
                <td className="px-4 py-3">{order.serviceTitle}</td>
                <td className="px-4 py-3">{ORDER_STATUS_LABELS[order.status] ?? order.status}</td>
                <td className="px-4 py-3">
                  {order.depositAmount ? `${order.depositAmount.toLocaleString("fa-IR")} تومان` : "تعیین نشده"}
                </td>
                <td className="px-4 py-3">
                  {order.depositAmount ? (
                    <button
                      type="button"
                      onClick={() => payDeposit(order.id)}
                      className="rounded-md bg-emerald-600 px-3 py-1.5 text-xs text-white hover:bg-emerald-700"
                    >
                      پرداخت بیعانه
                    </button>
                  ) : (
                    <span className="text-xs text-slate-500">—</span>
                  )}
                </td>
              </tr>
            ))}
            {orders.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-4 py-6 text-center text-slate-500">
                  هنوز سفارشی ثبت نشده است.
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>
    </main>
  );
}
