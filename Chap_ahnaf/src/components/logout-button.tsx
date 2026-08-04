"use client";

import { useRouter } from "next/navigation";

export function LogoutButton({ admin = false }: { admin?: boolean }) {
  const router = useRouter();

  return (
    <button
      type="button"
      onClick={async () => {
        await fetch(admin ? "/api/admin/logout" : "/api/auth/logout", {
          method: "POST",
        });
        router.refresh();
        router.push(admin ? "/admin/login" : "/");
      }}
      className="rounded-xl bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-700"
    >
      خروج
    </button>
  );
}
