"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

interface User {
  id: number;
  fullName: string;
  username: string;
  mobile: string;
  role: string;
}

interface Order {
  id: number;
  trackingCode: string;
  status: string;
  serviceName: string;
  options: Record<string, string>;
  totalAmount: string;
  createdAt: string;
}

const statusLabels: Record<string, string> = {
  pending_review: "در انتظار بررسی",
  confirmed: "تأیید شده",
  in_progress: "در حال انجام",
  ready_for_delivery: "آماده تحویل",
  delivered: "تحویل داده شد",
  cancelled: "لغو شده",
};

const statusColors: Record<string, string> = {
  pending_review: "bg-yellow-100 text-yellow-800",
  confirmed: "bg-blue-100 text-blue-800",
  in_progress: "bg-purple-100 text-purple-800",
  ready_for_delivery: "bg-green-100 text-green-800",
  delivered: "bg-emerald-100 text-emerald-800",
  cancelled: "bg-red-100 text-red-800",
};

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"all" | "active" | "completed">(
    "all"
  );

  useEffect(() => {
    const token = localStorage.getItem("token");
    const userData = localStorage.getItem("user");

    if (!token || !userData) {
      router.push("/login");
      return;
    }

    try {
      setUser(JSON.parse(userData));
      fetchOrders(token);
    } catch {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      router.push("/login");
    }
  }, [router]);

  const fetchOrders = async (token: string) => {
    try {
      const res = await fetch("/api/orders", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();

      if (data.success) {
        setOrders(data.orders);
      }
    } catch (error) {
      console.error("Error fetching orders:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredOrders = orders.filter((order) => {
    if (activeTab === "active") {
      return !["delivered", "cancelled"].includes(order.status);
    }
    if (activeTab === "completed") {
      return ["delivered", "cancelled"].includes(order.status);
    }
    return true;
  });

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    router.push("/");
  };

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <main className="pt-24 pb-16">
        <div className="container mx-auto px-4 max-w-4xl">
          {/* User Info Card */}
          <div className="bg-[#1a2744] rounded-xl shadow-lg p-6 mb-6 text-white">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-[#d4a853] rounded-full flex items-center justify-center">
                  <i className="fas fa-user text-2xl"></i>
                </div>
                <div>
                  <h1 className="text-xl font-bold">{user.fullName}</h1>
                  <p className="text-gray-300 text-sm">@{user.username}</p>
                  <p className="text-gray-300 text-sm">{user.mobile}</p>
                </div>
              </div>
              <button
                onClick={handleLogout}
                className="text-gray-300 hover:text-red-400 transition-colors"
              >
                <i className="fas fa-sign-out-alt text-xl"></i>
              </button>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <Link
              href="/order"
              className="bg-white rounded-xl shadow-lg p-4 text-center hover:shadow-xl transition-shadow"
            >
              <div className="w-12 h-12 bg-[#d4a853]/10 rounded-full flex items-center justify-center mx-auto mb-2">
                <i className="fas fa-plus text-[#d4a853]"></i>
              </div>
              <span className="text-sm font-bold text-[#1a2744]">
                سفارش جدید
              </span>
            </Link>
            <Link
              href="/track"
              className="bg-white rounded-xl shadow-lg p-4 text-center hover:shadow-xl transition-shadow"
            >
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-2">
                <i className="fas fa-search text-blue-500"></i>
              </div>
              <span className="text-sm font-bold text-[#1a2744]">
                پیگیری سفارش
              </span>
            </Link>
            <div className="bg-white rounded-xl shadow-lg p-4 text-center">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-2">
                <i className="fas fa-check-circle text-green-500"></i>
              </div>
              <span className="text-sm font-bold text-[#1a2744]">
                {orders.filter((o) => o.status === "delivered").length}
              </span>
              <span className="text-xs text-gray-500 block">سفارش تکمیل شده</span>
            </div>
            <div className="bg-white rounded-xl shadow-lg p-4 text-center">
              <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-2">
                <i className="fas fa-clock text-yellow-500"></i>
              </div>
              <span className="text-sm font-bold text-[#1a2744]">
                {
                  orders.filter(
                    (o) => !["delivered", "cancelled"].includes(o.status)
                  ).length
                }
              </span>
              <span className="text-xs text-gray-500 block">سفارش در حال انجام</span>
            </div>
          </div>

          {/* Orders Section */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-[#1a2744]">سفارشات من</h2>
            </div>

            {/* Tabs */}
            <div className="flex gap-2 mb-6">
              <button
                onClick={() => setActiveTab("all")}
                className={`px-4 py-2 rounded-lg text-sm font-bold transition-colors ${
                  activeTab === "all"
                    ? "bg-[#1a2744] text-white"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                همه
              </button>
              <button
                onClick={() => setActiveTab("active")}
                className={`px-4 py-2 rounded-lg text-sm font-bold transition-colors ${
                  activeTab === "active"
                    ? "bg-[#1a2744] text-white"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                در حال انجام
              </button>
              <button
                onClick={() => setActiveTab("completed")}
                className={`px-4 py-2 rounded-lg text-sm font-bold transition-colors ${
                  activeTab === "completed"
                    ? "bg-[#1a2744] text-white"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                تکمیل شده
              </button>
            </div>

            {isLoading ? (
              <div className="flex justify-center py-12">
                <div className="w-12 h-12 border-4 border-[#d4a853] border-t-transparent rounded-full animate-spin"></div>
              </div>
            ) : filteredOrders.length === 0 ? (
              <div className="text-center py-12">
                <i className="fas fa-inbox text-4xl text-gray-300 mb-4"></i>
                <p className="text-gray-500 mb-4">سفارشی یافت نشد</p>
                <Link
                  href="/order"
                  className="inline-block bg-[#d4a853] hover:bg-[#c99d48] text-white px-6 py-2 rounded-lg font-bold transition-colors"
                >
                  ثبت سفارش جدید
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredOrders.map((order) => (
                  <Link
                    key={order.id}
                    href={`/track?code=${order.trackingCode}`}
                    className="block bg-gray-50 rounded-lg p-4 hover:bg-gray-100 transition-colors"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-3">
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-bold ${
                            statusColors[order.status]
                          }`}
                        >
                          {statusLabels[order.status]}
                        </span>
                        <span className="text-sm text-gray-500">
                          {order.serviceName}
                        </span>
                      </div>
                      <i className="fas fa-chevron-left text-gray-400"></i>
                    </div>
                    <div className="flex items-center justify-between">
                      <span
                        className="text-sm text-gray-500"
                        dir="ltr"
                      >
                        کد: {order.trackingCode}
                      </span>
                      <span className="text-sm text-gray-500">
                        {new Date(order.createdAt).toLocaleDateString("fa-IR")}
                      </span>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
