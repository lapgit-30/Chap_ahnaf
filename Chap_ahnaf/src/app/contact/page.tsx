"use client";

import { useState } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

const contacts = [
  { title: "تماس تلفنی", value: "09334989931", href: "tel:09334989931", icon: "fas fa-phone", color: "bg-[#d4a853]" },
  { title: "اینستاگرام", value: "@Chap_ahnaf", href: "https://instagram.com/Chap_ahnaf", icon: "fab fa-instagram", color: "bg-gradient-to-br from-purple-500 to-pink-500" },
  { title: "تلگرام", value: "@Chap_ahnaf", href: "https://t.me/Chap_ahnaf", icon: "fab fa-telegram-plane", color: "bg-blue-500" },
  { title: "ایتا", value: "@Chap_ahnaf", href: "https://eitaa.com/Chap_ahnaf", icon: "fas fa-paper-plane", color: "bg-green-500" },
];

export default function ContactPage() {
  const [form, setForm] = useState({ fullName: "", mobile: "", subject: "", message: "", website: "" });
  const [isSending, setIsSending] = useState(false);
  const [notice, setNotice] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setIsSending(true);
    setNotice(null);
    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await response.json();
      if (!response.ok) {
        setNotice({ type: "error", text: data.error || "ارسال پیام انجام نشد" });
        return;
      }
      setNotice({ type: "success", text: data.message });
      setForm({ fullName: "", mobile: "", subject: "", message: "", website: "" });
    } catch {
      setNotice({ type: "error", text: "ارتباط با سرور برقرار نشد" });
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="min-h-screen">
      <Header />
      <main className="min-h-screen bg-gray-50 pb-16 pt-24">
        <div className="container mx-auto max-w-5xl px-4">
          <div className="mb-12 text-center">
            <span className="mb-3 inline-block rounded-full bg-[#d4a853]/10 px-4 py-2 text-sm font-bold text-[#b3893f]">ارتباط مستقیم با احناف</span>
            <h1 className="mb-4 text-3xl font-black text-[#1a2744] md:text-4xl">تماس با ما</h1>
            <p className="mx-auto max-w-2xl text-gray-600">برای مشاوره چاپ، استعلام سفارش یا ارسال پیشنهاد با ما در ارتباط باشید.</p>
          </div>

          <div className="grid grid-cols-1 gap-8 lg:grid-cols-[0.9fr_1.1fr]">
            <div className="space-y-4">
              {contacts.map((item) => (
                <a key={item.title} href={item.href} target={item.href.startsWith("http") ? "_blank" : undefined} rel="noreferrer" className="group flex items-center gap-4 rounded-2xl border border-gray-100 bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-lg">
                  <div className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl text-white ${item.color}`}>
                    <i className={`${item.icon} text-xl`}></i>
                  </div>
                  <div>
                    <h3 className="font-bold text-[#1a2744]">{item.title}</h3>
                    <span className="font-bold text-[#b3893f]" dir="ltr">{item.value}</span>
                  </div>
                  <i className="fas fa-chevron-left mr-auto text-gray-300 transition group-hover:text-[#d4a853]"></i>
                </a>
              ))}
              <div className="flex items-center gap-4 rounded-2xl bg-[#1a2744] p-5 text-white shadow-lg">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/10"><i className="fas fa-clock text-xl text-[#d4a853]"></i></div>
                <div><h3 className="font-bold">ساعات کاری</h3><p className="text-sm text-gray-300">هر روز از ساعت ۸ صبح تا ۱۰ شب</p></div>
              </div>
            </div>

            <div className="rounded-2xl bg-white p-6 shadow-xl md:p-8">
              <h2 className="mb-2 text-xl font-black text-[#1a2744]">ارسال پیام</h2>
              <p className="mb-6 text-sm text-gray-500">پیام شما در سامانه ثبت می‌شود و کارشناسان احناف پیگیری می‌کنند.</p>
              {notice && (
                <div className={`mb-5 rounded-xl p-4 text-sm ${notice.type === "success" ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"}`}>
                  <i className={`fas ${notice.type === "success" ? "fa-check-circle" : "fa-exclamation-circle"} ml-2`}></i>{notice.text}
                </div>
              )}
              <form onSubmit={handleSubmit} className="space-y-4">
                <input type="text" name="website" value={form.website} onChange={(e) => setForm({ ...form, website: e.target.value })} className="hidden" tabIndex={-1} autoComplete="off" />
                <div className="grid gap-4 sm:grid-cols-2">
                  <div><label className="mb-2 block text-sm font-bold text-gray-700">نام و نام خانوادگی</label><input required minLength={3} maxLength={100} value={form.fullName} onChange={(e) => setForm({ ...form, fullName: e.target.value })} className="input-field" placeholder="نام کامل" /></div>
                  <div><label className="mb-2 block text-sm font-bold text-gray-700">شماره موبایل</label><input required pattern="09[0-9]{9}" maxLength={11} value={form.mobile} onChange={(e) => setForm({ ...form, mobile: e.target.value })} className="input-field" placeholder="09123456789" dir="ltr" /></div>
                </div>
                <div><label className="mb-2 block text-sm font-bold text-gray-700">موضوع</label><select required value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value })} className="select-field"><option value="">انتخاب کنید</option><option value="order">سفارش</option><option value="consultation">مشاوره</option><option value="complaint">شکایت</option><option value="suggestion">پیشنهاد</option><option value="other">سایر</option></select></div>
                <div><label className="mb-2 block text-sm font-bold text-gray-700">پیام</label><textarea required minLength={10} maxLength={2000} value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} className="input-field h-36 resize-none" placeholder="متن پیام خود را بنویسید..." /></div>
                <button type="submit" disabled={isSending} className="w-full rounded-xl bg-[#d4a853] py-3 font-bold text-white transition hover:bg-[#c99d48] disabled:opacity-60"><i className={`fas ${isSending ? "fa-spinner fa-spin" : "fa-paper-plane"} ml-2`}></i>{isSending ? "در حال ارسال" : "ثبت و ارسال پیام"}</button>
              </form>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
