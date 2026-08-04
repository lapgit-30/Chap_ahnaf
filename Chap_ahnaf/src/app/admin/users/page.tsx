"use client";

import { useState, useEffect } from "react";

interface User {
  id: number;
  fullName: string;
  username: string;
  mobile: string;
  role: string;
  isActive: boolean;
  createdAt: string;
}

interface Pagination {
  page: number;
  limit: number;
  total: number;
  pages: number;
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [pagination, setPagination] = useState<Pagination | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    fetchUsers();
  }, [currentPage]);

  const fetchUsers = async () => {
    try {
      const token = localStorage.getItem("admin_token");
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: "20",
      });

      if (search) params.append("search", search);

      const res = await fetch(`/api/admin/users?${params}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();

      if (data.success) {
        setUsers(data.users);
        setPagination(data.pagination);
      }
    } catch (error) {
      console.error("Error fetching users:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = () => {
    setCurrentPage(1);
    fetchUsers();
  };

  const toggleUser = async (user: User) => {
    try {
      const token = localStorage.getItem("admin_token");
      const response = await fetch("/api/admin/users", {
        method: "PATCH",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify({ id: user.id, isActive: !user.isActive }),
      });
      if (!response.ok) throw new Error("UPDATE_FAILED");
      setUsers((current) => current.map((item) => item.id === user.id ? { ...item, isActive: !item.isActive } : item));
    } catch {
      alert("تغییر وضعیت کاربر انجام نشد");
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-[#1a2744]">مدیریت کاربران</h1>
        <span className="text-sm text-gray-500">
          {pagination?.total || 0} کاربر
        </span>
      </div>

      {/* Search */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="flex gap-2">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSearch()}
            className="input-field flex-1"
            placeholder="جستجو بر اساس نام، نام کاربری یا موبایل..."
          />
          <button
            onClick={handleSearch}
            className="bg-[#1a2744] hover:bg-[#2a3f66] text-white px-4 py-2 rounded-lg transition-colors"
          >
            <i className="fas fa-search"></i>
          </button>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="w-12 h-12 border-4 border-[#d4a853] border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : users.length === 0 ? (
          <div className="text-center py-12">
            <i className="fas fa-users text-4xl text-gray-300 mb-4"></i>
            <p className="text-gray-500">کاربری یافت نشد</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="text-right py-3 px-4 text-sm font-bold text-gray-600">
                    نام
                  </th>
                  <th className="text-right py-3 px-4 text-sm font-bold text-gray-600">
                    نام کاربری
                  </th>
                  <th className="text-right py-3 px-4 text-sm font-bold text-gray-600">
                    موبایل
                  </th>
                  <th className="text-right py-3 px-4 text-sm font-bold text-gray-600">
                    تاریخ عضویت
                  </th>
                  <th className="text-right py-3 px-4 text-sm font-bold text-gray-600">
                    وضعیت
                  </th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr
                    key={user.id}
                    className="border-t border-gray-100 hover:bg-gray-50"
                  >
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-[#d4a853]/10 rounded-full flex items-center justify-center">
                          <i className="fas fa-user text-[#d4a853] text-sm"></i>
                        </div>
                        <span className="font-bold">{user.fullName}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-sm" dir="ltr">
                      @{user.username}
                    </td>
                    <td className="py-3 px-4 text-sm" dir="ltr">
                      {user.mobile}
                    </td>
                    <td className="py-3 px-4 text-sm text-gray-500">
                      {new Date(user.createdAt).toLocaleDateString("fa-IR")}
                    </td>
                    <td className="py-3 px-4">
                      <button
                        type="button"
                        onClick={() => toggleUser(user)}
                        title="تغییر وضعیت حساب"
                        className={`inline-block px-3 py-1 rounded-full text-xs font-bold transition ${
                          user.isActive
                            ? "bg-green-100 text-green-800 hover:bg-red-100 hover:text-red-800"
                            : "bg-red-100 text-red-800 hover:bg-green-100 hover:text-green-800"
                        }`}
                      >
                        {user.isActive ? "فعال" : "غیرفعال"}
                      </button>
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
              از {pagination.total} کاربر
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
                const page = currentPage <= 3 ? i + 1 : currentPage + i - 2;
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
