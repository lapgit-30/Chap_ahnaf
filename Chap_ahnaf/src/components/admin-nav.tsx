import Link from "next/link";

const links = [
  { href: "/admin", label: "داشبورد" },
  { href: "/admin/orders", label: "سفارش‌ها" },
  { href: "/admin/payments", label: "پرداخت‌ها" },
  { href: "/admin/users", label: "کاربران" },
  { href: "/admin/services", label: "مدیریت خدمات" },
  { href: "/admin/categories", label: "مدیریت دسته‌بندی‌ها" },
  { href: "/admin/settings", label: "تنظیمات" },
];

export function AdminNav() {
  return (
    <aside className="rounded-2xl border border-slate-200 bg-white p-4">
      <h2 className="mb-3 text-sm font-bold text-slate-900">پنل مدیریت</h2>
      <nav className="space-y-2 text-sm">
        {links.map((link) => (
          <Link key={link.href} href={link.href} className="block rounded-lg px-3 py-2 text-slate-700 hover:bg-slate-100">
            {link.label}
          </Link>
        ))}
      </nav>
    </aside>
  );
}
