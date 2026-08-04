"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

type Mode = "login" | "register";

function getCookie(name: string) {
  return document.cookie
    .split("; ")
    .find((row) => row.startsWith(`${name}=`))
    ?.split("=")[1];
}

export function AuthForm() {
  const [mode, setMode] = useState<Mode>("login");
  const [captcha, setCaptcha] = useState<{ token: string; question: string } | null>(null);
  const [otpHint, setOtpHint] = useState<string>("");
  const [message, setMessage] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const [form, setForm] = useState({
    fullName: "",
    username: "",
    mobile: "",
    captchaAnswer: "",
    otp: "",
  });

  const loadCaptcha = async () => {
    const response = await fetch("/api/auth/captcha");
    const data = await response.json();
    setCaptcha(data);
  };

  useEffect(() => {
    loadCaptcha();
  }, []);

  const requestOtp = async () => {
    if (!captcha) return;
    setLoading(true);
    setMessage("");
    const csrf = getCookie("ahnaf_csrf") || "";

    const response = await fetch("/api/auth/request-otp", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-csrf-token": csrf,
      },
      body: JSON.stringify({
        mode,
        username: form.username,
        mobile: form.mobile,
        captchaToken: captcha.token,
        captchaAnswer: form.captchaAnswer,
      }),
    });

    const data = await response.json();
    if (!response.ok) {
      setMessage(data.error || "خطا در ارسال OTP");
      setOtpHint("");
      setLoading(false);
      await loadCaptcha();
      return;
    }

    setMessage("کد تأیید ارسال شد.");
    setOtpHint(data.otp ? `کد موقت: ${data.otp}` : "کد به شماره موبایل شما ارسال شد.");
    setLoading(false);
    await loadCaptcha();
  };

  const verifyOtp = async () => {
    setLoading(true);
    setMessage("");
    const csrf = getCookie("ahnaf_csrf") || "";

    const response = await fetch("/api/auth/verify-otp", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-csrf-token": csrf,
      },
      body: JSON.stringify({
        mode,
        fullName: form.fullName,
        username: form.username,
        mobile: form.mobile,
        otp: form.otp,
      }),
    });

    const data = await response.json();
    if (!response.ok) {
      setMessage(data.error || "خطا در تأیید کد");
      setLoading(false);
      return;
    }

    setMessage("با موفقیت وارد شدید.");
    setLoading(false);
    router.push("/");
    router.refresh();
  };

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="mb-5 flex gap-2">
        <button
          type="button"
          onClick={() => setMode("login")}
          className={`rounded-lg px-4 py-2 text-sm ${mode === "login" ? "bg-cyan-700 text-white" : "bg-slate-100 text-slate-700"}`}
        >
          ورود
        </button>
        <button
          type="button"
          onClick={() => setMode("register")}
          className={`rounded-lg px-4 py-2 text-sm ${mode === "register" ? "bg-cyan-700 text-white" : "bg-slate-100 text-slate-700"}`}
        >
          ثبت‌نام
        </button>
      </div>

      <div className="grid gap-3">
        {mode === "register" && (
          <input
            className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
            placeholder="نام و نام خانوادگی"
            value={form.fullName}
            onChange={(e) => setForm((prev) => ({ ...prev, fullName: e.target.value }))}
          />
        )}
        <input
          className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
          placeholder="نام کاربری"
          value={form.username}
          onChange={(e) => setForm((prev) => ({ ...prev, username: e.target.value }))}
        />
        <input
          className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
          placeholder="شماره موبایل (09...)"
          value={form.mobile}
          onChange={(e) => setForm((prev) => ({ ...prev, mobile: e.target.value }))}
        />

        <label className="text-xs text-slate-500">کپچا: {captcha?.question ?? "..."}</label>
        <input
          className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
          placeholder="پاسخ کپچا"
          value={form.captchaAnswer}
          onChange={(e) => setForm((prev) => ({ ...prev, captchaAnswer: e.target.value }))}
        />

        <button
          type="button"
          onClick={requestOtp}
          disabled={loading}
          className="rounded-lg bg-slate-900 px-4 py-2 text-sm text-white hover:bg-slate-700 disabled:opacity-60"
        >
          دریافت کد تأیید
        </button>

        <input
          className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
          placeholder="کد ۶ رقمی"
          value={form.otp}
          onChange={(e) => setForm((prev) => ({ ...prev, otp: e.target.value }))}
        />

        <button
          type="button"
          onClick={verifyOtp}
          disabled={loading}
          className="rounded-lg bg-cyan-700 px-4 py-2 text-sm font-medium text-white hover:bg-cyan-800 disabled:opacity-60"
        >
          تأیید و ورود
        </button>

        {otpHint ? <p className="text-xs text-emerald-700">{otpHint}</p> : null}
        {message ? <p className="text-xs text-rose-700">{message}</p> : null}
      </div>
    </div>
  );
}
