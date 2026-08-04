import Link from "next/link";

export default function HomePage() {
  return (
    <main className="mx-auto w-full max-w-6xl px-4 py-10">
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-l from-cyan-700 via-sky-700 to-blue-900 p-8 text-white shadow-2xl md:p-14">
        <div className="relative z-10 max-w-3xl">
          <p className="text-sm font-medium text-cyan-100">چاپخانه و کافی‌نت حرفه‌ای</p>
          <h1 className="mt-3 text-3xl font-extrabold leading-tight md:text-5xl">
            سفارش آنلاین خدمات چاپ دیجیتال احناف
          </h1>
          <p className="mt-5 text-sm leading-7 text-cyan-50 md:text-base">
            ثبت سفارش آنلاین، آپلود فایل اختیاری، پرداخت بیعانه و تحویل حضوری؛ همه‌چیز در یک سامانه سریع، امن و قابل پیگیری.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link href="/order/new" className="rounded-xl bg-white px-5 py-2.5 text-sm font-bold text-cyan-800 hover:bg-cyan-50">
              ثبت سفارش جدید
            </Link>
            <Link href="/order/track" className="rounded-xl border border-white/70 px-5 py-2.5 text-sm font-bold text-white hover:bg-white/10">
              پیگیری سفارش
            </Link>
          </div>
        </div>
        <div className="pointer-events-none absolute -left-10 -top-12 h-44 w-44 rounded-full bg-cyan-300/20 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-10 -right-10 h-52 w-52 rounded-full bg-blue-300/20 blur-3xl" />
      </section>

      <section className="mt-8 grid gap-4 md:grid-cols-3">
        {[
          ["ثبت سفارش هوشمند", "نمایش گزینه‌های اختصاصی برای هر خدمت چاپخانه و کافی‌نت"],
          ["پرداخت بیعانه آنلاین", "تعیین مبلغ توسط مدیر و پرداخت امن قبل از شروع کار"],
          ["پیگیری با کد رهگیری", "مشاهده وضعیت سفارش از ثبت تا تحویل حضوری"],
        ].map(([title, text]) => (
          <article key={title} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <h3 className="text-base font-bold text-slate-900">{title}</h3>
            <p className="mt-2 text-sm leading-7 text-slate-600">{text}</p>
          </article>
        ))}
      </section>
    </main>
  );
}
