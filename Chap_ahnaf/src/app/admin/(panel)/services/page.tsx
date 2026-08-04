"use client";

import { useEffect, useState } from "react";

type ServiceItem = {
  key: string;
  title: string;
  domain: "printshop" | "cafenet";
};

function getCookie(name: string) {
  return document.cookie
    .split("; ")
    .find((row) => row.startsWith(`${name}=`))
    ?.split("=")[1];
}

export default function AdminServicesPage() {
  const [services, setServices] = useState<ServiceItem[]>([]);
  const [disabledKeys, setDisabledKeys] = useState<string[]>([]);
  const [message, setMessage] = useState("");

  useEffect(() => {
    fetch("/api/admin/services")
      .then((res) => res.json())
      .then((data) => {
        setServices(data.allServices || []);
        setDisabledKeys(data.disabledKeys || []);
      });
  }, []);

  const toggle = (key: string) => {
    setDisabledKeys((prev) => (prev.includes(key) ? prev.filter((x) => x !== key) : [...prev, key]));
  };

  const save = async () => {
    const csrf = getCookie("ahnaf_csrf") || "";
    const response = await fetch("/api/admin/services", {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        "x-csrf-token": csrf,
      },
      body: JSON.stringify({ disabledKeys }),
    });

    setMessage(response.ok ? "تنظیمات خدمات ذخیره شد" : "خطا در ذخیره‌سازی");
  };

  return (
    <div>
      <h2 className="text-xl font-extrabold">مدیریت خدمات</h2>
      <p className="mt-1 text-sm text-slate-600">سرویس‌های غیرفعال در فرم ثبت سفارش نمایش داده نخواهند شد (پس از رفرش فرم).</p>

      <div className="mt-4 grid gap-2 rounded-2xl border border-slate-200 bg-white p-4 md:grid-cols-2">
        {services.map((service) => {
          const disabled = disabledKeys.includes(service.key);
          return (
            <label key={service.key} className="flex items-center justify-between rounded-lg border border-slate-200 px-3 py-2 text-sm">
              <span>
                {service.domain === "printshop" ? "چاپخانه" : "کافی‌نت"} - {service.title}
              </span>
              <input type="checkbox" checked={!disabled} onChange={() => toggle(service.key)} />
            </label>
          );
        })}
      </div>

      <button onClick={save} className="mt-3 rounded-lg bg-cyan-700 px-4 py-2 text-sm text-white hover:bg-cyan-800">
        ذخیره
      </button>
      {message ? <p className="mt-2 text-xs text-slate-600">{message}</p> : null}
    </div>
  );
}
