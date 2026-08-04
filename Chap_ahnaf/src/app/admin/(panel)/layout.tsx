import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/auth";
import { AdminNav } from "@/components/admin-nav";
import { LogoutButton } from "@/components/logout-button";

export default async function AdminPanelLayout({ children }: { children: React.ReactNode }) {
  const admin = await requireAdmin();

  if (!admin) {
    redirect("/admin/login");
  }

  return (
    <main className="mx-auto w-full max-w-7xl px-4 py-8">
      <div className="mb-4 flex items-center justify-between rounded-xl bg-slate-900 px-4 py-3 text-white">
        <div>
          <h1 className="text-sm font-bold">مدیریت چاپ دیجیتال احناف</h1>
          <p className="text-xs text-slate-300">{admin.fullName}</p>
        </div>
        <LogoutButton admin />
      </div>
      <div className="grid gap-4 md:grid-cols-[240px_1fr]">
        <AdminNav />
        <section>{children}</section>
      </div>
    </main>
  );
}
