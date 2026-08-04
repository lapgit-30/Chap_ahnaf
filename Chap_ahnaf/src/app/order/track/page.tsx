"use client";

import { useState } from "react";
import { ORDER_STATUS_LABELS } from "@/lib/services";

export default function TrackOrderPage() {
  const [trackingCode, setTrackingCode] = useState("");
  const [mobile, setMobile] = useState("");
  const [result, setResult] = useState<Record<string, unknown> | null>(null);
  const [error, setError] = useState("");

  const onTrack = async () => {
    setError("");
    setResult(null);

    const response = await fetch("/api/orders/track", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ trackingCode, mobile }),
    });

    const data = await response.json();
    if (!response.ok) {
      setError(data.error || "خطا در پیگیری سفارش");
      return;
    }

    setResult(data.order);
  };

  return (
    <main className="mx-auto w-full max-w-xl px-4 py-10">
      <h1 className="text-2xl font-extrabold">پیگیری سفارش</h1>
      <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-6">
        <div className="grid gap-3">
          <input
            className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
            placeholder="کد رهگیری"
            value={trackingCode}
            onChange={(e) => setTrackingCode(e.target.value)}
          />
          <input
            className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
            placeholder="شماره موبایل"
            value={mobile}
            onChange={(e) => setMobile(e.target.value)}
          />
          <button onClick={onTrack} className="rounded-lg bg-cyan-700 px-4 py-2 text-sm font-medium text-white hover:bg-cyan-800">
            پیگیری
          </button>
        </div>

        {error ? <p className="mt-4 text-sm text-rose-700">{error}</p> : null}

        {result ? (
          <div className="mt-4 rounded-lg bg-slate-50 p-4 text-sm text-slate-700">
            <p>
              خدمت: <strong>{String(result.serviceTitle)}</strong>
            </p>
            <p>
              وضعیت: <strong>{ORDER_STATUS_LABELS[String(result.status)] ?? String(result.status)}</strong>
            </p>
            <p>
              بیعانه: <strong>{result.depositAmount ? `${Number(result.depositAmount).toLocaleString("fa-IR")} تومان` : "تعیین نشده"}</strong>
            </p>
          </div>
        ) : null}
      </div>
    </main>
  );
}
