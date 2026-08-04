"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

interface Order {
  id: number;
  trackingCode: string;
  userId: number;
  serviceId: number;
  status: string;
  serviceName: string;
  options: Record<string, string>;
  notes: string;
  totalAmount: string;
  depositAmount: string;
  remainingAmount: string;
  createdAt: string;
  updatedAt: string;
  userFullName: string;
  userMobile: string;
  userUsername: string;
}

interface Pagination {
  page: number;
  limit: number;
  total: number;
  pages: number;
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

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [pagination, setPagination] = useState<Pagination | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    fetchOrders();
  }, [currentPage, statusFilter]);

  const fetchOrders = async () => {
    try {
      const token = localStorage.getItem("admin_token");
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: "20",
      });

      if (statusFilter) params.append("status", statusFilter);
      if (search) params.append("search", search);

      const res = await fetch(`/api/admin/orders?${params}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();

      if (data.success) {
        setOrders(data.orders);
        setPagination(data.pagination);
      }
    } catch (error) {
      console.error("Error fetching orders:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = () => {
    setCurrentPage(1);
    fetchOrders();
  };

  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <div className="flex gap-2">
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                className="input-field flex-1"
                placeholder="جستجو بر اساس کد رهگیری، نام یا موبایل..."
              />
              <button
                onClick={handleSearch}
                className="bg-[#1a2744] hover:bg-[#2a3f66] text-white px-4 py-2 rounded-lg transition-colors"
              >
                <i className="fas fa-search"></i>
              </button>
            </div>
          </div>
          <div>
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="select-field"
            >
              <option value="">همه وضعیت‌ها</option>
              {Object.entries(statusLabels).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="w-12 h-12 border-4 border-[#d4a853] border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : orders.length === 0 ? (
          <div className="text-center py-12">
            <i className="fas fa-inbox text-4xl text-gray-300 mb-4"></i>
            <p className="text-gray-500">سفارشی یافت نشد</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
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
                {orders.map((order) => (
                  <tr
                    key={order.id}
                    className="border-t border-gray-100 hover:bg-gray-50"
                  >
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
                        <p className="text-sm font-bold">
                          {order.userFullName}
                        </p>
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
                        className="text-[#d4a853] hover:underline text-sm font-bold"
                      >
                        مشاهده
                        <i className="fas fa-arrow-left mr-1"></i>
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {pagination && pagination.pages > 1 && (
          <div className="border-t border-gray-100 px-4 py-3 flex items-center justify-between">
            <span className="text-sm text-gray-500">
              نمایش {(pagination.page - 1) * pagination.limit + 1} تا{" "}
              {Math.min(pagination.page * pagination.limit, pagination.total)}{" "}
              از {pagination.total} سفارش
            </span>
            <div className="flex gap-2">
              <button
                onClick={() => setCurrentPage(currentPage - 1)}
                disabled={currentPage === 1}
                className="px-3 py-1 rounded border border-gray-300 text-sm disabled:opacity-50"
              >
                <i className="fas fa-chevron-right"></i>
              </button>
              {Array.from({ length: Math.min(5, pagination.pages) }, (_, i) => {
                const page =
                  currentPage <= 3
                    ? i + 1
                    : currentPage + i - 2;
                if (page < 1 || page > pagination.pages) return null;
                return (
                  <button
                    key={page}
                    onClick={() => setCurrentPage(page)}
                    className={`px-3 py-1 rounded text-sm ${
                      currentPage === page
                        ? "bg-[#1a2744] text-white"
                        : "border border-gray-300"
                    }`}
                  >
                    {page}
                  </button>
                );
              })}
              <button
                onClick={() => setCurrentPage(currentPage + 1)}
                disabled={currentPage === pagination.pages}
                className="px-3 py-1 rounded border border-gray-300 text-sm disabled:opacity-50"
              >
                <i className="fas fa-chevron-left"></i>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
