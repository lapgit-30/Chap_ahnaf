"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export default function AdminLoginPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    username: "",
    password: "",
  });
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // Check if already logged in as admin
    const token = localStorage.getItem("admin_token");
    const user = localStorage.getItem("admin_user");
    if (token && user) {
      try {
        const userData = JSON.parse(user);
        if (userData.role === "super_admin") {
          router.push("/admin/dashboard");
        }
      } catch {
        localStorage.removeItem("admin_token");
        localStorage.removeItem("admin_user");
      }
    }
  }, [router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!formData.username || !formData.password) {
      setError("لطفاً تمام فیلدها را پر کنید");
      return;
    }

    setIsLoading(true);
    try {
      const res = await fetch("/api/admin/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error);
        return;
      }

      localStorage.setItem("admin_token", data.token);
      localStorage.setItem("admin_user", JSON.stringify(data.user));
      router.push("/admin/dashboard");
    } catch {
      setError("خطا در ورود");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#1a2744] flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <div className="text-center mb-8">
            <div className="w-20 h-20 bg-[#1a2744] rounded-full flex items-center justify-center mx-auto mb-4">
              <i className="fas fa-shield-alt text-white text-3xl"></i>
            </div>
            <h1 className="text-2xl font-bold text-[#1a2744]">
              پنل مدیریت
            </h1>
            <p className="text-gray-500 mt-2">ورود به پنل مدیریت سیستم</p>
          </div>

          {error && (
            <div className="bg-red-50 text-red-600 p-4 rounded-lg mb-6 text-sm">
              <i className="fas fa-exclamation-circle ml-2"></i>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">
                نام کاربری
              </label>
              <input
                type="text"
                value={formData.username}
                onChange={(e) =>
                  setFormData({ ...formData, username: e.target.value })
                }
                className="input-field"
                placeholder="نام کاربری"
                dir="ltr"
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">
                رمز عبور
              </label>
              <input
                type="password"
                value={formData.password}
                onChange={(e) =>
                  setFormData({ ...formData, password: e.target.value })
                }
                className="input-field"
                placeholder="رمز عبور"
                dir="ltr"
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-[#d4a853] hover:bg-[#c99d48] text-white font-bold py-3 rounded-lg transition-colors disabled:opacity-50"
            >
              {isLoading ? (
                <i className="fas fa-spinner fa-spin"></i>
              ) : (
                <>
                  <i className="fas fa-sign-in-alt ml-2"></i>
                  ورود
                </>
              )}
            </button>
          </form>

          <div className="mt-6 text-center">
            <a
              href="/"
              className="text-gray-500 hover:text-[#1a2744] text-sm transition-colors"
            >
              <i className="fas fa-arrow-right ml-1"></i>
              بازگشت به سایت اصلی
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
