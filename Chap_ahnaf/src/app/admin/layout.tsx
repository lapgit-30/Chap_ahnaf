"use client";

import { useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";

interface AdminUser {
  id: number;
  fullName: string;
  username: string;
  role: string;
}

const menuItems = [
  {
    label: "داشبورد",
    href: "/admin/dashboard",
    icon: "fas fa-tachometer-alt",
  },
  {
    label: "سفارشات",
    href: "/admin/orders",
    icon: "fas fa-shopping-cart",
  },
  {
    label: "پرداخت‌ها",
    href: "/admin/payments",
    icon: "fas fa-credit-card",
  },
  {
    label: "کاربران",
    href: "/admin/users",
    icon: "fas fa-users",
  },
  {
    label: "خدمات",
    href: "/admin/services",
    icon: "fas fa-cogs",
  },
  {
    label: "دسته‌بندی‌ها",
    href: "/admin/categories",
    icon: "fas fa-layer-group",
  },
  {
    label: "تنظیمات",
    href: "/admin/settings",
    icon: "fas fa-cog",
  },
];

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [user, setUser] = useState<AdminUser | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("admin_token");
    const userData = localStorage.getItem("admin_user");

    if (!token || !userData) {
      router.push("/admin");
      return;
    }

    try {
      const parsedUser = JSON.parse(userData);
      if (parsedUser.role !== "super_admin") {
        router.push("/admin");
        return;
      }
      setUser(parsedUser);
    } catch {
      localStorage.removeItem("admin_token");
      localStorage.removeItem("admin_user");
      router.push("/admin");
    }
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem("admin_token");
    localStorage.removeItem("admin_user");
    router.push("/admin");
  };

  // Don't render layout for the login page
  if (pathname === "/admin") {
    return <>{children}</>;
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-[#d4a853] border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 flex">
      {/* Sidebar */}
      <aside
        className={`bg-[#1a2744] text-white transition-all duration-300 ${
          isSidebarOpen ? "w-64" : "w-20"
        }`}
      >
        {/* Logo */}
        <div className="p-4 border-b border-gray-700">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-[#d4a853] rounded-full flex items-center justify-center flex-shrink-0">
              <i className="fas fa-shield-alt text-white"></i>
            </div>
            {isSidebarOpen && (
              <div>
                <h2 className="font-bold">پنل مدیریت</h2>
                <p className="text-xs text-gray-400">احناف</p>
              </div>
            )}
          </div>
        </div>

        {/* Menu */}
        <nav className="p-4">
          <ul className="space-y-2">
            {menuItems.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                    pathname === item.href
                      ? "bg-[#d4a853] text-white"
                      : "text-gray-300 hover:bg-white/10"
                  }`}
                >
                  <i className={`${item.icon} w-5`}></i>
                  {isSidebarOpen && <span>{item.label}</span>}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        {/* Toggle Button */}
        <div className="absolute bottom-4 left-4">
          <button
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="w-full px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors"
          >
            <i
              className={`fas ${
                isSidebarOpen ? "fa-chevron-right" : "fa-chevron-left"
              }`}
            ></i>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <header className="bg-white shadow-sm px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                className="lg:hidden text-gray-600 hover:text-[#1a2744]"
              >
                <i className="fas fa-bars text-xl"></i>
              </button>
              <h1 className="text-lg font-bold text-[#1a2744]">
                {menuItems.find((item) => item.href === pathname)?.label ||
                  "پنل مدیریت"}
              </h1>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-[#d4a853] rounded-full flex items-center justify-center">
                  <i className="fas fa-user text-white text-sm"></i>
                </div>
                <span className="text-sm font-bold text-gray-700 hidden sm:block">
                  {user.fullName}
                </span>
              </div>
              <button
                onClick={handleLogout}
                className="text-gray-500 hover:text-red-500 transition-colors"
                title="خروج"
              >
                <i className="fas fa-sign-out-alt"></i>
              </button>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-6">{children}</main>
      </div>
    </div>
  );
}
