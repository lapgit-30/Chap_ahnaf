"use client";

import { useEffect, useState } from "react";

type PaymentRow = {
  id: number;
  amount: number;
  status: string;
  refCode: string | null;
  paidAt: string | null;
  trackingCode: string;
  customer: string;
};

export default function AdminPaymentsPage() {
  const [rows, setRows] = useState<PaymentRow[]>([]);

  useEffect(() => {
    fetch("/api/admin/payments")
      .then((res) => res.json())
      .then((data) => setRows(data.payments || []));
  }, []);

  return (
    <div>
      <h2 className="text-xl font-extrabold">پرداخت‌ها</h2>
      <div className="mt-4 overflow-hidden rounded-2xl border border-slate-200 bg-white">
        <table className="w-full text-right text-sm">
          <thead className="bg-slate-100">
            <tr>
              <th className="px-4 py-3">کد سفارش</th>
              <th className="px-4 py-3">مشتری</th>
              <th className="px-4 py-3">مبلغ</th>
              <th className="px-4 py-3">وضعیت</th>
              <th className="px-4 py-3">مرجع</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.id} className="border-t border-slate-100">
                <td className="px-4 py-3 font-mono text-xs">{row.trackingCode}</td>
                <td className="px-4 py-3">{row.customer}</td>
                <td className="px-4 py-3">{row.amount.toLocaleString("fa-IR")} تومان</td>
                <td className="px-4 py-3">{row.status}</td>
                <td className="px-4 py-3">{row.refCode ?? "-"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
