import { redirect } from "next/navigation";
import { AuthForm } from "@/components/auth-form";
import { getCurrentUser } from "@/lib/auth";

export default async function AuthPage() {
  const user = await getCurrentUser();
  if (user) {
    redirect("/");
  }

  return (
    <main className="mx-auto w-full max-w-xl px-4 py-10">
      <h1 className="mb-2 text-2xl font-extrabold">ورود / ثبت‌نام</h1>
      <p className="mb-6 text-sm text-slate-600">برای ثبت سفارش و پیگیری، ابتدا وارد شوید یا حساب جدید بسازید.</p>
      <AuthForm />
    </main>
  );
}
