"use client";

import { useState, useEffect } from "react";

interface Setting {
  id: number;
  key: string;
  value: string;
  description: string;
}

export default function AdminSettingsPage() {
  const [settings, setSettings] = useState<Setting[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState<Record<string, string>>({});
  const [message, setMessage] = useState({ type: "", text: "" });

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const token = localStorage.getItem("admin_token");
      const res = await fetch("/api/admin/settings", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();

      if (data.success) {
        setSettings(data.settings);
        const form: Record<string, string> = {};
        data.settings.forEach((s: Setting) => {
          form[s.key] = s.value || "";
        });
        setFormData(form);
      }
    } catch (error) {
      console.error("Error fetching settings:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    setMessage({ type: "", text: "" });

    try {
      const token = localStorage.getItem("admin_token");
      const res = await fetch("/api/admin/settings", {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ settings: formData }),
      });

      const data = await res.json();

      if (data.success) {
        setMessage({ type: "success", text: "تنظیمات با موفقیت ذخیره شد" });
        fetchSettings();
      } else {
        setMessage({ type: "error", text: data.error || "خطا در ذخیره" });
      }
    } catch {
      setMessage({ type: "error", text: "خطا در ذخیره تنظیمات" });
    } finally {
      setIsSaving(false);
    }
  };

  const getSettingDescription = (key: string) => {
    const setting = settings.find((s) => s.key === key);
    return setting?.description || "";
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="w-12 h-12 border-4 border-[#d4a853] border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-[#1a2744]">تنظیمات سایت</h1>
        <button
          onClick={handleSave}
          disabled={isSaving}
          className="bg-[#d4a853] hover:bg-[#c99d48] text-white px-4 py-2 rounded-lg font-bold transition-colors disabled:opacity-50"
        >
          {isSaving ? (
            <i className="fas fa-spinner fa-spin"></i>
          ) : (
            <>
              <i className="fas fa-save ml-2"></i>
              ذخیره تنظیمات
            </>
          )}
        </button>
      </div>

      {message.text && (
        <div
          className={`p-4 rounded-lg ${
            message.type === "success"
              ? "bg-green-50 text-green-600"
              : "bg-red-50 text-red-600"
          }`}
        >
          <i
            className={`fas ${
              message.type === "success" ? "fa-check-circle" : "fa-exclamation-circle"
            } ml-2`}
          ></i>
          {message.text}
        </div>
      )}

      {/* Settings Form */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* General Settings */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h2 className="text-lg font-bold text-[#1a2744] mb-4">
            <i className="fas fa-cog ml-2 text-[#d4a853]"></i>
            تنظیمات عمومی
          </h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">
                نام سایت
              </label>
              <input
                type="text"
                value={formData.site_name || ""}
                onChange={(e) =>
                  setFormData({ ...formData, site_name: e.target.value })
                }
                className="input-field"
              />
              <p className="text-xs text-gray-500 mt-1">
                {getSettingDescription("site_name")}
              </p>
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">
                توضیحات سایت
              </label>
              <textarea
                value={formData.site_description || ""}
                onChange={(e) =>
                  setFormData({ ...formData, site_description: e.target.value })
                }
                className="input-field h-20 resize-none"
              />
              <p className="text-xs text-gray-500 mt-1">
                {getSettingDescription("site_description")}
              </p>
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">
                آدرس
              </label>
              <input
                type="text"
                value={formData.address || ""}
                onChange={(e) =>
                  setFormData({ ...formData, address: e.target.value })
                }
                className="input-field"
              />
              <p className="text-xs text-gray-500 mt-1">
                {getSettingDescription("address")}
              </p>
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">
                ساعات کاری
              </label>
              <input
                type="text"
                value={formData.working_hours || ""}
                onChange={(e) =>
                  setFormData({ ...formData, working_hours: e.target.value })
                }
                className="input-field"
              />
              <p className="text-xs text-gray-500 mt-1">
                {getSettingDescription("working_hours")}
              </p>
            </div>
          </div>
        </div>

        {/* Contact Settings */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h2 className="text-lg font-bold text-[#1a2744] mb-4">
            <i className="fas fa-phone ml-2 text-[#d4a853]"></i>
            اطلاعات تماس
          </h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">
                شماره موبایل
              </label>
              <input
                type="tel"
                value={formData.phone || ""}
                onChange={(e) =>
                  setFormData({ ...formData, phone: e.target.value })
                }
                className="input-field"
                dir="ltr"
              />
              <p className="text-xs text-gray-500 mt-1">
                {getSettingDescription("phone")}
              </p>
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">
                اینستاگرام
              </label>
              <input
                type="text"
                value={formData.instagram || ""}
                onChange={(e) =>
                  setFormData({ ...formData, instagram: e.target.value })
                }
                className="input-field"
                dir="ltr"
              />
              <p className="text-xs text-gray-500 mt-1">
                {getSettingDescription("instagram")}
              </p>
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">
                تلگرام
              </label>
              <input
                type="text"
                value={formData.telegram || ""}
                onChange={(e) =>
                  setFormData({ ...formData, telegram: e.target.value })
                }
                className="input-field"
                dir="ltr"
              />
              <p className="text-xs text-gray-500 mt-1">
                {getSettingDescription("telegram")}
              </p>
            </div>
          </div>
        </div>

        {/* Payment Settings */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h2 className="text-lg font-bold text-[#1a2744] mb-4">
            <i className="fas fa-credit-card ml-2 text-[#d4a853]"></i>
            تنظیمات پرداخت
          </h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">
                درصد پیش‌فرض بیعانه
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  value={formData.default_deposit_percent || ""}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      default_deposit_percent: e.target.value,
                    })
                  }
                  className="input-field"
                  min="0"
                  max="100"
                />
                <span className="text-gray-500">%</span>
              </div>
              <p className="text-xs text-gray-500 mt-1">
                {getSettingDescription("default_deposit_percent")}
              </p>
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">
                حداقل درصد بیعانه
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  value={formData.min_deposit_percent || ""}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      min_deposit_percent: e.target.value,
                    })
                  }
                  className="input-field"
                  min="0"
                  max="100"
                />
                <span className="text-gray-500">%</span>
              </div>
              <p className="text-xs text-gray-500 mt-1">
                {getSettingDescription("min_deposit_percent")}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
