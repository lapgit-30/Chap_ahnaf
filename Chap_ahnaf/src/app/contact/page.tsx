export default function ContactPage() {
  return (
    <main className="mx-auto w-full max-w-4xl px-4 py-10">
      <h1 className="text-2xl font-extrabold">تماس با ما</h1>
      <div className="mt-6 grid gap-4 md:grid-cols-2">
        <section className="rounded-2xl border border-slate-200 bg-white p-5">
          <h2 className="text-base font-bold text-cyan-700">چاپ دیجیتال احناف</h2>
          <p className="mt-3 text-sm leading-7 text-slate-700">
            آدرس: تهران، خیابان نمونه، پلاک ۱۲۳
            <br />
            تلفن: ۰۲۱-۱۲۳۴۵۶۷۸
            <br />
            موبایل: ۰۹۱۲۱۲۳۴۵۶۷
          </p>
        </section>
        <section className="rounded-2xl border border-slate-200 bg-white p-5">
          <h2 className="text-base font-bold text-cyan-700">ساعات کاری</h2>
          <p className="mt-3 text-sm leading-7 text-slate-700">
            شنبه تا چهارشنبه: ۸:۰۰ تا ۲۰:۰۰
            <br />
            پنجشنبه: ۸:۰۰ تا ۱۶:۰۰
            <br />
            جمعه: تعطیل
          </p>
        </section>
      </div>
    </main>
  );
}
