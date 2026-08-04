"use client";

import { useEffect, useState } from "react";
import { ORDER_STATUS_LABELS } from "@/lib/services";

function getCookie(name: string) {
  return document.cookie
    .split("; ")
    .find((row) => row.startsWith(`${name}=`))
    ?.split("=")[1];
}

const statusOptions = [
  "pending_review",
  "approved",
  "in_progress",
  "ready_for_pickup",
  "delivered",
  "cancelled",
] as const;

type OrderRow = {
  id: number;
  trackingCode: string;
  serviceTitle: string;
  status: (typeof statusOptions)[number];
  depositAmount: number | null;
  customerName: string;
  customerMobile: string;
  filePath: string | null;
  notes: string | null;
};

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<OrderRow[]>([]);
  const [q, setQ] = useState("");
  const [status, setStatus] = useState("");

  const load = async () => {
    const params = new URLSearchParams();
    if (q) params.set("q", q);
    if (status) params.set("status", status);

    const response = await fetch(`/api/admin/orders?${params.toString()}`);
    const data = await response.json();
    if (response.ok) setOrders(data.orders || []);
  };

  useEffect(() => {
    load();
  }, []);

  const updateOrder = async (orderId: number, payload: { status?: string; depositAmount?: number }) => {
    const csrf = getCookie("ahnaf_csrf") || "";
    const response = await fetch("/api/admin/orders", {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        "x-csrf-token": csrf,
      },
      body: JSON.stringify({ orderId, ...payload }),
    });

    if (response.ok) {
      await load();
    }
  };

  return (
    <div>
      <h2 className="text-xl font-extrabold">مدیریت سفارش‌ها</h2>
      <div className="mt-4 grid gap-2 rounded-xl border border-slate-200 bg-white p-4 md:grid-cols-3">
        <input
          className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
          placeholder="جستجو: کد رهگیری / مشتری / خدمت"
          value={q}
          onChange={(e) => setQ(e.target.value)}
        />
        <select className="rounded-lg border border-slate-300 px-3 py-2 text-sm" value={status} onChange={(e) => setStatus(e.target.value)}>
          <option value="">همه وضعیت‌ها</option>
          {statusOptions.map((s) => (
            <option key={s} value={s}>
              {ORDER_STATUS_LABELS[s]}
            </option>
          ))}
        </select>
        <button className="rounded-lg bg-cyan-700 px-3 py-2 text-sm text-white" onClick={load}>
          اعمال فیلتر
        </button>
      </div>

      <div className="mt-4 space-y-3">
        {orders.map((order) => (
          <article key={order.id} className="rounded-xl border border-slate-200 bg-white p-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="font-mono text-xs text-slate-500">{order.trackingCode}</p>
                <h3 className="font-bold text-slate-900">{order.serviceTitle}</h3>
                <p className="text-xs text-slate-600">
                  {order.customerName} - {order.customerMobile}
                </p>
              </div>
              <div className="text-xs text-slate-600">
                وضعیت فعلی: <strong>{ORDER_STATUS_LABELS[order.status]}</strong>
              </div>
            </div>

            <div className="mt-3 grid gap-2 md:grid-cols-3">
              <select
                defaultValue={order.status}
                className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
                onChange={(e) => updateOrder(order.id, { status: e.target.value })}
              >
                {statusOptions.map((s) => (
                  <option key={s} value={s}>
                    {ORDER_STATUS_LABELS[s]}
                  </option>
                ))}
              </select>

              <input
                type="number"
                defaultValue={order.depositAmount ?? 0}
                className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
                onBlur={(e) => updateOrder(order.id, { depositAmount: Number(e.target.value) })}
                placeholder="بیعانه (تومان)"
              />

              {order.filePath ? (
                <a href={order.filePath} target="_blank" className="rounded-lg border border-slate-300 px-3 py-2 text-center text-sm hover:bg-slate-50">
                  مشاهده فایل
                </a>
              ) : (
                <span className="rounded-lg border border-slate-200 px-3 py-2 text-center text-sm text-slate-400">بدون فایل</span>
              )}
            </div>

            {order.notes ? <p className="mt-3 rounded-lg bg-slate-50 p-2 text-xs text-slate-600">{order.notes}</p> : null}
          </article>
        ))}
      </div>
    </div>
  );
}
