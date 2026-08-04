"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

export default function RegisterPage() {
  const router = useRouter();
  const [step, setStep] = useState<"info" | "otp">("info");
  const [formData, setFormData] = useState({
    fullName: "",
    username: "",
    mobile: "",
  });
  const [otp, setOtp] = useState("");
  const [otpCode, setOtpCode] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [captchaAnswer, setCaptchaAnswer] = useState("");
  const [captchaId, setCaptchaId] = useState("");
  const [captchaQuestion, setCaptchaQuestion] = useState("در حال بارگذاری...");

  const generateCaptcha = async () => {
    try {
      const res = await fetch("/api/auth/captcha", { cache: "no-store" });
      const data = await res.json();
      if (data.success) {
        setCaptchaId(data.captcha.id);
        setCaptchaQuestion(data.captcha.question);
        setCaptchaAnswer("");
      }
    } catch {
      setError("دریافت سوال امنیتی ناموفق بود");
    }
  };

  useEffect(() => {
    void generateCaptcha();
  }, []);

  const handleSendOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!formData.fullName || !formData.username || !formData.mobile) {
      setError("لطفاً تمام فیلدها را پر کنید");
      return;
    }

    if (!/^09\d{9}$/.test(formData.mobile)) {
      setError("شماره موبایل نامعتبر است");
      return;
    }

    if (!/^[a-zA-Z0-9_]{4,20}$/.test(formData.username)) {
      setError(
        "نام کاربری باید 4 تا 20 کاراکتر باشد (فقط حروف انگلیسی، اعداد و _)"
      );
      return;
    }

    if (!captchaId || !captchaAnswer) {
      setError("لطفاً پاسخ سوال امنیتی را وارد کنید");
      return;
    }

    setIsLoading(true);
    try {
      const res = await fetch("/api/auth/otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mobile: formData.mobile,
          type: "register",
          captchaId,
          captchaAnswer,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error);
        await generateCaptcha();
        return;
      }

      setOtpCode(data.otp || "");
      setStep("otp");
    } catch {
      setError("خطا در ارسال کد تأیید");
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!otp) {
      setError("لطفاً کد تأیید را وارد کنید");
      return;
    }

    setIsLoading(true);
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          otp,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error);
        return;
      }

      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));
      router.push("/");
    } catch {
      setError("خطا در ثبت‌نام");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen">
      <Header />

      <main className="pt-24 pb-16 flex items-center justify-center min-h-screen bg-gray-50">
        <div className="w-full max-w-md px-4">
          <div className="bg-white rounded-2xl shadow-xl p-8">
            <div className="text-center mb-8">
              <div className="w-20 h-20 bg-[#d4a853] rounded-full flex items-center justify-center mx-auto mb-4">
                <i className="fas fa-user-plus text-white text-3xl"></i>
              </div>
              <h1 className="text-2xl font-bold text-[#1a2744]">ثبت‌نام</h1>
              <p className="text-gray-500 mt-2">
                حساب کاربری جدید ایجاد کنید
              </p>
            </div>

            {error && (
              <div className="bg-red-50 text-red-600 p-4 rounded-lg mb-6 text-sm">
                <i className="fas fa-exclamation-circle ml-2"></i>
                {error}
              </div>
            )}

            {step === "info" ? (
              <form onSubmit={handleSendOTP} className="space-y-4">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">
                    نام و نام خانوادگی
                  </label>
                  <input
                    type="text"
                    value={formData.fullName}
                    onChange={(e) =>
                      setFormData({ ...formData, fullName: e.target.value })
                    }
                    className="input-field"
                    placeholder="نام کامل خود را وارد کنید"
                  />
                </div>

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
                    placeholder="username"
                    dir="ltr"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    4 تا 20 کاراکتر، فقط حروف انگلیسی، اعداد و _
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">
                    شماره موبایل
                  </label>
                  <input
                    type="tel"
                    value={formData.mobile}
                    onChange={(e) =>
                      setFormData({ ...formData, mobile: e.target.value })
                    }
                    className="input-field"
                    placeholder="09123456789"
                    dir="ltr"
                    maxLength={11}
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">
                    سوال امنیتی
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="number"
                      value={captchaAnswer}
                      onChange={(e) => setCaptchaAnswer(e.target.value)}
                      className="input-field flex-1"
                      placeholder="پاسخ"
                    />
                    <div className="bg-gray-100 px-4 py-3 rounded-lg font-bold text-[#1a2744] whitespace-nowrap">
                      {captchaQuestion}
                    </div>
                  </div>
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
                      <i className="fas fa-paper-plane ml-2"></i>
                      ارسال کد تأیید
                    </>
                  )}
                </button>
              </form>
            ) : (
              <form onSubmit={handleVerifyOTP} className="space-y-4">
                <div className="bg-blue-50 text-blue-600 p-4 rounded-lg text-sm mb-4">
                  <i className="fas fa-info-circle ml-2"></i>
                  کد تأیید به شماره {formData.mobile} ارسال شد
                  {otpCode && (
                    <div className="mt-2 text-xs text-gray-500">
                      (کد آزمایشی: {otpCode})
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">
                    کد تأیید
                  </label>
                  <input
                    type="text"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    className="input-field text-center text-2xl tracking-widest"
                    placeholder="123456"
                    dir="ltr"
                    maxLength={6}
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
                      <i className="fas fa-check ml-2"></i>
                      تأیید و ثبت‌نام
                    </>
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setStep("info");
                    setOtp("");
                    setError("");
                  }}
                  className="w-full text-gray-600 hover:text-[#1a2744] py-2 transition-colors"
                >
                  <i className="fas fa-arrow-right ml-2"></i>
                  بازگشت
                </button>
              </form>
            )}

            <div className="mt-6 text-center">
              <p className="text-gray-500 text-sm">
                قبلاً ثبت‌نام کرده‌اید؟{" "}
                <Link
                  href="/login"
                  className="text-[#d4a853] hover:underline font-bold"
                >
                  وارد شوید
                </Link>
              </p>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
