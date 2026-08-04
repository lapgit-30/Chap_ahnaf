"use client";

import { useEffect, useState } from "react";

type Stats = {
  totalOrders: number;
  totalUsers: number;
  paidPayments: number;
  paidAmount: number;
};

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<Stats | null>(null);

  useEffect(() => {
    fetch("/api/admin/dashboard")
      .then((res) => res.json())
      .then((data) => setStats(data.stats ?? null));
  }, []);

  return (
    <div>
      <h2 className="text-xl font-extrabold">داشبورد</h2>
      <div className="mt-5 grid gap-4 md:grid-cols-4">
        {[
          ["کل سفارش‌ها", stats?.totalOrders ?? 0],
          ["کل مشتریان", stats?.totalUsers ?? 0],
          ["پرداخت‌های موفق", stats?.paidPayments ?? 0],
          ["مجموع بیعانه (تومان)", (stats?.paidAmount ?? 0).toLocaleString("fa-IR")],
        ].map(([title, value]) => (
          <div key={String(title)} className="rounded-xl border border-slate-200 bg-white p-4">
            <p className="text-xs text-slate-500">{title}</p>
            <p className="mt-2 text-2xl font-bold text-slate-900">{String(value)}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
