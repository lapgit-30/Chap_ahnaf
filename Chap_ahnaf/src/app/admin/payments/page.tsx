"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

type Payment = {
  id: number; amount: string; status: string; authority: string | null;
  transactionId: string | null; paymentMethod: string | null; paidAt: string | null;
  createdAt: string; orderId: number; trackingCode: string;
  customerName: string; customerMobile: string;
};

const labels: Record<string, string> = { pending: "در انتظار پرداخت", partial: "پرداخت ناقص", completed: "موفق", refunded: "بازگشت وجه" };
const colors: Record<string, string> = { pending: "bg-yellow-100 text-yellow-800", partial: "bg-orange-100 text-orange-800", completed: "bg-green-100 text-green-800", refunded: "bg-gray-100 text-gray-700" };

export default function AdminPaymentsPage() {
  const [rows, setRows] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const load = async () => {
      try {
        const token = localStorage.getItem("admin_token");
        const response = await fetch("/api/admin/payments", { headers: { Authorization: `Bearer ${token}` } });
        const data = await response.json();
        if (!response.ok) throw new Error(data.error);
        setRows(data.payments);
      } catch (e) {
        setError(e instanceof Error ? e.message : "دریافت پرداخت‌ها انجام نشد");
      } finally {
        setLoading(false);
      }
    };
    void load();
  }, []);

  if (loading) return <div className="flex justify-center py-16"><div className="h-12 w-12 animate-spin rounded-full border-4 border-[#d4a853] border-t-transparent" /></div>;

  return (
    <div className="space-y-6">
      <div><h1 className="text-xl font-bold text-[#1a2744]">پرداخت‌های بیعانه</h1><p className="mt-1 text-sm text-gray-500">آخرین ۲۰۰ درخواست پرداخت و تراکنش تأییدشده</p></div>
      {error && <div className="rounded-xl bg-red-50 p-4 text-red-700">{error}</div>}
      <div className="overflow-hidden rounded-xl bg-white shadow-lg">
        {rows.length === 0 ? <div className="py-16 text-center text-gray-500"><i className="fas fa-receipt mb-3 block text-4xl text-gray-300" />پرداختی ثبت نشده است</div> : (
          <div className="overflow-x-auto"><table className="w-full min-w-[900px]">
            <thead className="bg-gray-50 text-sm text-gray-600"><tr><th className="p-4 text-right">سفارش</th><th className="p-4 text-right">مشتری</th><th className="p-4 text-right">مبلغ</th><th className="p-4 text-right">وضعیت</th><th className="p-4 text-right">شماره مرجع</th><th className="p-4 text-right">تاریخ</th></tr></thead>
            <tbody>{rows.map((row) => <tr key={row.id} className="border-t border-gray-100 text-sm hover:bg-gray-50">
              <td className="p-4"><Link href={`/admin/orders/${row.orderId}`} className="font-mono font-bold text-[#b3893f]" dir="ltr">{row.trackingCode}</Link></td>
              <td className="p-4"><strong className="block">{row.customerName}</strong><span className="text-xs text-gray-500" dir="ltr">{row.customerMobile}</span></td>
              <td className="p-4 font-bold">{new Intl.NumberFormat("fa-IR").format(Number(row.amount))} تومان</td>
              <td className="p-4"><span className={`rounded-full px-3 py-1 text-xs font-bold ${colors[row.status]}`}>{labels[row.status]}</span></td>
              <td className="p-4 font-mono text-xs" dir="ltr">{row.transactionId || "—"}</td>
              <td className="p-4 text-gray-500">{new Date(row.paidAt || row.createdAt).toLocaleString("fa-IR")}</td>
            </tr>)}</tbody>
          </table></div>
        )}
      </div>
    </div>
  );
}
