import { CAFENET_SERVICES, PRINTSHOP_SERVICES } from "@/lib/services";

export default function ServicesPage() {
  return (
    <main className="mx-auto w-full max-w-6xl px-4 py-10">
      <h1 className="text-2xl font-extrabold text-slate-900">خدمات قابل سفارش آنلاین</h1>
      <p className="mt-2 text-sm text-slate-600">برای هر خدمت، فرم سفارش به‌صورت هوشمند گزینه‌های مرتبط را نمایش می‌دهد.</p>

      <div className="mt-8 grid gap-6 md:grid-cols-2">
        <section className="rounded-2xl border border-slate-200 bg-white p-5">
          <h2 className="text-lg font-bold text-cyan-700">خدمات چاپخانه</h2>
          <ul className="mt-4 space-y-2 text-sm text-slate-700">
            {PRINTSHOP_SERVICES.map((item) => (
              <li key={item.key} className="rounded-lg bg-slate-50 px-3 py-2">
                {item.title}
              </li>
            ))}
          </ul>
        </section>

        <section className="rounded-2xl border border-slate-200 bg-white p-5">
          <h2 className="text-lg font-bold text-cyan-700">خدمات کافی‌نت</h2>
          <ul className="mt-4 space-y-2 text-sm text-slate-700">
            {CAFENET_SERVICES.map((item) => (
              <li key={item.key} className="rounded-lg bg-slate-50 px-3 py-2">
                {item.title}
              </li>
            ))}
          </ul>
        </section>
      </div>
    </main>
  );
}
