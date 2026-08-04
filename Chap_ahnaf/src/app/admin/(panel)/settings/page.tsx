"use client";

import { useEffect, useState } from "react";

function getCookie(name: string) {
  return document.cookie
    .split("; ")
    .find((row) => row.startsWith(`${name}=`))
    ?.split("=")[1];
}

export default function AdminSettingsPage() {
  const [shopName, setShopName] = useState("چاپ دیجیتال احناف");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    fetch("/api/admin/settings")
      .then((res) => res.json())
      .then((data) => {
        const settings = data.settings;
        if (settings) {
          setShopName(settings.shopName || "");
          setPhone(settings.phone || "");
          setAddress(settings.address || "");
        }
      });
  }, []);

  const save = async () => {
    const csrf = getCookie("ahnaf_csrf") || "";
    const response = await fetch("/api/admin/settings", {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        "x-csrf-token": csrf,
      },
      body: JSON.stringify({ shopName, phone, address }),
    });

    setMessage(response.ok ? "تنظیمات ذخیره شد" : "خطا در ذخیره‌سازی");
  };

  return (
    <div>
      <h2 className="text-xl font-extrabold">تنظیمات سایت</h2>
      <div className="mt-4 max-w-xl rounded-2xl border border-slate-200 bg-white p-5">
        <div className="grid gap-3">
          <input className="rounded-lg border border-slate-300 px-3 py-2 text-sm" value={shopName} onChange={(e) => setShopName(e.target.value)} placeholder="نام مجموعه" />
          <input className="rounded-lg border border-slate-300 px-3 py-2 text-sm" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="تلفن" />
          <textarea className="min-h-20 rounded-lg border border-slate-300 px-3 py-2 text-sm" value={address} onChange={(e) => setAddress(e.target.value)} placeholder="آدرس" />
          <button onClick={save} className="rounded-lg bg-cyan-700 px-4 py-2 text-sm text-white hover:bg-cyan-800">
            ذخیره تنظیمات
          </button>
          {message ? <p className="text-xs text-slate-600">{message}</p> : null}
        </div>
      </div>
    </div>
  );
}
