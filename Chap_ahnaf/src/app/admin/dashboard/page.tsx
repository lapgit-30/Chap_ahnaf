"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

interface DashboardStats {
  totalOrders: number;
  pendingOrders: number;
  confirmedOrders: number;
  inProgressOrders: number;
  readyOrders: number;
  deliveredOrders: number;
  totalUsers: number;
  todayOrders: number;
}

interface RecentOrder {
  id: number;
  trackingCode: string;
  status: string;
  serviceName: string;
  createdAt: string;
  userFullName: string;
  userMobile: string;
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

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [recentOrders, setRecentOrders] = useState<RecentOrder[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchDashboard();
  }, []);

  const fetchDashboard = async () => {
    try {
      const token = localStorage.getItem("admin_token");
      const res = await fetch("/api/admin/dashboard", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();

      if (data.success) {
        setStats(data.stats);
        setRecentOrders(data.recentOrders);
      }
    } catch (error) {
      console.error("Error fetching dashboard:", error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="w-12 h-12 border-4 border-[#d4a853] border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm">کل سفارشات</p>
                <p className="text-3xl font-bold text-[#1a2744]">
                  {stats.totalOrders}
                </p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                <i className="fas fa-shopping-cart text-blue-500 text-xl"></i>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm">در انتظار بررسی</p>
                <p className="text-3xl font-bold text-yellow-500">
                  {stats.pendingOrders}
                </p>
              </div>
              <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center">
                <i className="fas fa-clock text-yellow-500 text-xl"></i>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm">آماده تحویل</p>
                <p className="text-3xl font-bold text-green-500">
                  {stats.readyOrders}
                </p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                <i className="fas fa-check-circle text-green-500 text-xl"></i>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm">کاربران</p>
                <p className="text-3xl font-bold text-[#1a2744]">
                  {stats.totalUsers}
                </p>
              </div>
              <div className="w-12 h-12 bg-[#d4a853]/10 rounded-full flex items-center justify-center">
                <i className="fas fa-users text-[#d4a853] text-xl"></i>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Quick Stats */}
      {stats && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="bg-white rounded-lg p-4 text-center">
            <p className="text-2xl font-bold text-blue-500">
              {stats.confirmedOrders}
            </p>
            <p className="text-xs text-gray-500">تأیید شده</p>
          </div>
          <div className="bg-white rounded-lg p-4 text-center">
            <p className="text-2xl font-bold text-purple-500">
              {stats.inProgressOrders}
            </p>
            <p className="text-xs text-gray-500">در حال انجام</p>
          </div>
          <div className="bg-white rounded-lg p-4 text-center">
            <p className="text-2xl font-bold text-emerald-500">
              {stats.deliveredOrders}
            </p>
            <p className="text-xs text-gray-500">تحویل شده</p>
          </div>
          <div className="bg-white rounded-lg p-4 text-center">
            <p className="text-2xl font-bold text-[#d4a853]">
              {stats.todayOrders}
            </p>
            <p className="text-xs text-gray-500">سفارش امروز</p>
          </div>
        </div>
      )}

      {/* Recent Orders */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-bold text-[#1a2744]">
            آخرین سفارشات
          </h2>
          <Link
            href="/admin/orders"
            className="text-[#d4a853] hover:underline text-sm font-bold"
          >
            مشاهده همه
            <i className="fas fa-arrow-left mr-1"></i>
          </Link>
        </div>

        {recentOrders.length === 0 ? (
          <div className="text-center py-8">
            <i className="fas fa-inbox text-4xl text-gray-300 mb-4"></i>
            <p className="text-gray-500">سفارشی وجود ندارد</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-right py-3 px-4 text-sm font-bold text-gray-600">
                    کد رهگیری
                  </th>
                  <th className="text-right py-3 px-4 text-sm font-bold text-gray-600">
                    مشتری
                  </th>
                  <th className="text-right py-3 px-4 text-sm font-bold text-gray-600">
                    خدمت
                  </th>
                  <th className="text-right py-3 px-4 text-sm font-bold text-gray-600">
                    وضعیت
                  </th>
                  <th className="text-right py-3 px-4 text-sm font-bold text-gray-600">
                    تاریخ
                  </th>
                  <th className="text-right py-3 px-4 text-sm font-bold text-gray-600">
                    عملیات
                  </th>
                </tr>
              </thead>
              <tbody>
                {recentOrders.map((order) => (
                  <tr key={order.id} className="border-b border-gray-100">
                    <td className="py-3 px-4">
                      <span
                        className="text-sm font-mono text-[#1a2744]"
                        dir="ltr"
                      >
                        {order.trackingCode}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <div>
                        <p className="text-sm font-bold">{order.userFullName}</p>
                        <p className="text-xs text-gray-500" dir="ltr">
                          {order.userMobile}
                        </p>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-sm">{order.serviceName}</td>
                    <td className="py-3 px-4">
                      <span
                        className={`inline-block px-2 py-1 rounded-full text-xs font-bold ${
                          statusColors[order.status]
                        }`}
                      >
                        {statusLabels[order.status]}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-sm text-gray-500">
                      {new Date(order.createdAt).toLocaleDateString("fa-IR")}
                    </td>
                    <td className="py-3 px-4">
                      <Link
                        href={`/admin/orders/${order.id}`}
                        className="text-[#d4a853] hover:underline text-sm"
                      >
                        مشاهده
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
