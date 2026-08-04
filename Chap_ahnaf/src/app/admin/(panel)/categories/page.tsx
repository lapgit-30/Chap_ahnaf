export default function AdminCategoriesPage() {
  return (
    <div>
      <h2 className="text-xl font-extrabold">مدیریت دسته‌بندی‌ها</h2>
      <div className="mt-4 grid gap-3 md:grid-cols-2">
        <article className="rounded-xl border border-slate-200 bg-white p-4">
          <h3 className="font-bold text-cyan-700">چاپخانه</h3>
          <p className="mt-2 text-sm text-slate-600">شامل انواع چاپ، طراحی، صحافی، بنر، کارت ویزیت، کتاب و خدمات وابسته.</p>
        </article>
        <article className="rounded-xl border border-slate-200 bg-white p-4">
          <h3 className="font-bold text-cyan-700">کافی‌نت</h3>
          <p className="mt-2 text-sm text-slate-600">شامل پرینت، اسکن، تایپ، ترجمه، ثبت‌نام‌های اینترنتی و خدمات الکترونیکی.</p>
        </article>
      </div>
    </div>
  );
}
