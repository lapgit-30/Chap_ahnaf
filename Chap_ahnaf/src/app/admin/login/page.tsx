"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

function getCookie(name: string) {
  return document.cookie
    .split("; ")
    .find((row) => row.startsWith(`${name}=`))
    ?.split("=")[1];
}

export default function AdminLoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [captcha, setCaptcha] = useState<{ token: string; question: string } | null>(null);
  const [captchaAnswer, setCaptchaAnswer] = useState("");
  const [error, setError] = useState("");
  const router = useRouter();

  const loadCaptcha = async () => {
    const response = await fetch("/api/auth/captcha");
    const data = await response.json();
    setCaptcha(data);
  };

  useEffect(() => {
    loadCaptcha();
  }, []);

  const onLogin = async () => {
    setError("");
    const csrf = getCookie("ahnaf_csrf") || "";

    const response = await fetch("/api/admin/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-csrf-token": csrf,
      },
      body: JSON.stringify({
        username,
        password,
        captchaToken: captcha?.token,
        captchaAnswer,
      }),
    });

    const data = await response.json();
    if (!response.ok) {
      setError(data.error || "ورود ناموفق بود");
      await loadCaptcha();
      return;
    }

    router.push("/admin");
    router.refresh();
  };

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-md items-center px-4 py-10">
      <div className="w-full rounded-2xl border border-slate-200 bg-white p-6">
        <h1 className="text-xl font-extrabold">ورود مدیر کل</h1>
        <p className="mt-1 text-xs text-slate-500">فقط Super Admin مجاز به ورود است.</p>

        <div className="mt-5 grid gap-3">
          <input
            className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
            placeholder="نام کاربری مدیر"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
          <input
            type="password"
            className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
            placeholder="رمز عبور"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <label className="text-xs text-slate-500">کپچا: {captcha?.question ?? "..."}</label>
          <input
            className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
            placeholder="پاسخ کپچا"
            value={captchaAnswer}
            onChange={(e) => setCaptchaAnswer(e.target.value)}
          />

          <button onClick={onLogin} className="rounded-lg bg-slate-900 px-4 py-2 text-sm text-white hover:bg-slate-700">
            ورود به پنل مدیریت
          </button>
          {error ? <p className="text-xs text-rose-700">{error}</p> : null}
        </div>
      </div>
    </main>
  );
}
