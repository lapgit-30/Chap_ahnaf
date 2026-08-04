"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { type ServiceDefinition } from "@/lib/services";

function getCookie(name: string) {
  return document.cookie
    .split("; ")
    .find((row) => row.startsWith(`${name}=`))
    ?.split("=")[1];
}

export function OrderForm() {
  const [services, setServices] = useState<ServiceDefinition[]>([]);
  const [serviceKey, setServiceKey] = useState("");
  const [details, setDetails] = useState<Record<string, string>>({});
  const [notes, setNotes] = useState("");
  const [uploading, setUploading] = useState(false);
  const [filePath, setFilePath] = useState("");
  const [message, setMessage] = useState("");
  const [result, setResult] = useState<{ trackingCode: string; status: string } | null>(null);
  const router = useRouter();

  useEffect(() => {
    fetch("/api/services")
      .then((res) => res.json())
      .then((data) => {
        const list = (data.services || []) as ServiceDefinition[];
        setServices(list);
        setServiceKey(list[0]?.key ?? "");
      });
  }, []);

  const selectedService: ServiceDefinition | undefined = useMemo(
    () => services.find((s) => s.key === serviceKey),
    [serviceKey, services],
  );

  const onUpload = async (file?: File) => {
    if (!file) return;
    setUploading(true);
    setMessage("");

    const body = new FormData();
    body.append("file", file);

    const response = await fetch("/api/orders/upload", { method: "POST", body });
    const data = await response.json();
    if (!response.ok) {
      setMessage(data.error || "خطا در آپلود فایل");
      setUploading(false);
      return;
    }

    setFilePath(data.filePath);
    setUploading(false);
  };

  const submitOrder = async () => {
    if (!selectedService) return;
    setMessage("");
    const csrf = getCookie("ahnaf_csrf") || "";

    const normalizedDetails: Record<string, string | number | boolean> = {};
    selectedService.fields.forEach((field) => {
      const value = details[field.key];
      if (!value) return;
      if (field.type === "number") {
        normalizedDetails[field.key] = Number(value);
      } else if (field.type === "boolean") {
        normalizedDetails[field.key] = value === "true";
      } else {
        normalizedDetails[field.key] = value;
      }
    });

    const response = await fetch("/api/orders/create", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-csrf-token": csrf,
      },
      body: JSON.stringify({
        serviceKey,
        details: normalizedDetails,
        notes,
        filePath,
      }),
    });

    const data = await response.json();
    if (!response.ok) {
      setMessage(data.error || "خطا در ثبت سفارش");
      return;
    }

    setResult(data.order);
    setMessage("سفارش با موفقیت ثبت شد.");
    router.refresh();
  };

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6">
      <div className="grid gap-3 md:grid-cols-2">
        <div className="md:col-span-2">
          <label className="mb-1 block text-sm text-slate-700">انتخاب خدمت</label>
          <select
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
            value={serviceKey}
            onChange={(e) => {
              setServiceKey(e.target.value);
              setDetails({});
            }}
          >
            {services.map((item) => (
              <option key={item.key} value={item.key}>
                {item.domain === "printshop" ? "چاپخانه" : "کافی‌نت"} - {item.title}
              </option>
            ))}
          </select>
        </div>

        {selectedService?.fields.map((field) => (
          <div key={field.key}>
            <label className="mb-1 block text-sm text-slate-700">{field.label}</label>
            {field.type === "select" ? (
              <select
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
                value={details[field.key] ?? ""}
                onChange={(e) => setDetails((prev) => ({ ...prev, [field.key]: e.target.value }))}
              >
                <option value="">انتخاب کنید</option>
                {field.options?.map((opt) => (
                  <option key={opt} value={opt}>
                    {opt}
                  </option>
                ))}
              </select>
            ) : field.type === "boolean" ? (
              <select
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
                value={details[field.key] ?? "false"}
                onChange={(e) => setDetails((prev) => ({ ...prev, [field.key]: e.target.value }))}
              >
                <option value="false">خیر</option>
                <option value="true">بله</option>
              </select>
            ) : (
              <input
                type={field.type === "number" ? "number" : "text"}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
                value={details[field.key] ?? ""}
                onChange={(e) => setDetails((prev) => ({ ...prev, [field.key]: e.target.value }))}
              />
            )}
          </div>
        ))}

        <div className="md:col-span-2">
          <label className="mb-1 block text-sm text-slate-700">توضیحات سفارش</label>
          <textarea
            className="min-h-24 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="اگر گزینه مورد نیاز شما در فرم نبود اینجا بنویسید"
          />
        </div>

        <div className="md:col-span-2">
          <label className="mb-1 block text-sm text-slate-700">ارسال فایل (اختیاری)</label>
          <input type="file" onChange={(e) => onUpload(e.target.files?.[0] ?? undefined)} className="text-sm" />
          {uploading ? <p className="mt-1 text-xs text-slate-500">در حال آپلود...</p> : null}
          {filePath ? <p className="mt-1 text-xs text-emerald-700">فایل با موفقیت بارگذاری شد.</p> : null}
        </div>
      </div>

      <button
        type="button"
        onClick={submitOrder}
        className="mt-5 rounded-lg bg-cyan-700 px-4 py-2 text-sm font-medium text-white hover:bg-cyan-800"
      >
        ثبت سفارش
      </button>

      {message ? <p className="mt-3 text-sm text-slate-700">{message}</p> : null}
      {result ? (
        <div className="mt-3 rounded-lg bg-cyan-50 p-3 text-sm text-cyan-800">
          کد رهگیری شما: <strong>{result.trackingCode}</strong>
        </div>
      ) : null}
    </div>
  );
}
