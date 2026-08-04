"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";

interface OrderDetail {
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
  estimatedDelivery: string;
  createdAt: string;
  updatedAt: string;
  userFullName: string;
  userMobile: string;
  userUsername: string;
  files: Array<{
    id: number;
    fileName: string;
    fileOriginalName: string;
    fileSize: number;
    mimeType: string;
  }>;
  payments: Array<{
    id: number;
    amount: string;
    status: string;
    transactionId: string;
    paidAt: string;
  }>;
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

export default function AdminOrderDetailPage() {
  const router = useRouter();
  const params = useParams();
  const orderId = params.id;

  const [order, setOrder] = useState<OrderDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);
  const [formData, setFormData] = useState({
    status: "",
    totalAmount: "",
    depositAmount: "",
    notes: "",
    estimatedDelivery: "",
  });

  useEffect(() => {
    fetchOrder();
  }, [orderId]);

  useEffect(() => {
    if (order) {
      setFormData({
        status: order.status,
        totalAmount: order.totalAmount || "",
        depositAmount: order.depositAmount || "",
        notes: order.notes || "",
        estimatedDelivery: order.estimatedDelivery
          ? new Date(order.estimatedDelivery).toISOString().split("T")[0]
          : "",
      });
    }
  }, [order]);

  const fetchOrder = async () => {
    try {
      const token = localStorage.getItem("admin_token");
      const res = await fetch(`/api/admin/orders/${orderId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();

      if (!data.success) {
        router.push("/admin/orders");
        return;
      }

      setOrder(data.order);
    } catch (error) {
      console.error("Error fetching order:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDownload = async (fileId: number, fileName: string) => {
    try {
      const token = localStorage.getItem("admin_token");
      const response = await fetch(`/api/admin/files/${fileId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!response.ok) throw new Error("DOWNLOAD_FAILED");
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const anchor = document.createElement("a");
      anchor.href = url;
      anchor.download = fileName;
      anchor.click();
      URL.revokeObjectURL(url);
    } catch {
      alert("دریافت فایل انجام نشد");
    }
  };

  const handleUpdate = async () => {
    setIsUpdating(true);
    try {
      const token = localStorage.getItem("admin_token");
      const res = await fetch(`/api/admin/orders/${orderId}`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (data.success) {
        fetchOrder();
        alert("سفارش با موفقیت به‌روزرسانی شد");
      }
    } catch (error) {
      console.error("Error updating order:", error);
      alert("خطا در به‌روزرسانی سفارش");
    } finally {
      setIsUpdating(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="w-12 h-12 border-4 border-[#d4a853] border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">سفارش یافت نشد</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link
            href="/admin/orders"
            className="text-gray-500 hover:text-[#1a2744]"
          >
            <i className="fas fa-arrow-right text-xl"></i>
          </Link>
          <div>
            <h1 className="text-xl font-bold text-[#1a2744]">
              جزئیات سفارش
            </h1>
            <p className="text-sm text-gray-500" dir="ltr">
              کد: {order.trackingCode}
            </p>
          </div>
        </div>
        <span
          className={`inline-block px-3 py-1 rounded-full text-sm font-bold ${
            statusColors[order.status]
          }`}
        >
          {statusLabels[order.status]}
        </span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Info */}
        <div className="lg:col-span-2 space-y-6">
          {/* Order Details */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-lg font-bold text-[#1a2744] mb-4">
              جزئیات سفارش
            </h2>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-gray-50 rounded-lg p-3">
                <p className="text-sm text-gray-500">نوع خدمت</p>
                <p className="font-bold">{order.serviceName}</p>
              </div>
              <div className="bg-gray-50 rounded-lg p-3">
                <p className="text-sm text-gray-500">تاریخ ثبت</p>
                <p className="font-bold">
                  {new Date(order.createdAt).toLocaleDateString("fa-IR")}
                </p>
              </div>
            </div>

            {/* Options */}
            {order.options && Object.keys(order.options).length > 0 && (
              <div className="mt-4">
                <h3 className="text-sm font-bold text-gray-600 mb-2">
                  گزینه‌های انتخابی:
                </h3>
                <div className="grid grid-cols-2 gap-2">
                  {Object.entries(order.options).map(([key, value]) => (
                    <div key={key} className="bg-gray-50 rounded-lg p-2">
                      <span className="text-xs text-gray-500">{key}: </span>
                      <span className="text-sm font-bold">{value}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Notes */}
            {order.notes && (
              <div className="mt-4">
                <h3 className="text-sm font-bold text-gray-600 mb-2">
                  توضیحات:
                </h3>
                <p className="bg-gray-50 rounded-lg p-3 text-sm">
                  {order.notes}
                </p>
              </div>
            )}

            {/* Files */}
            {order.files && order.files.length > 0 && (
              <div className="mt-4">
                <h3 className="text-sm font-bold text-gray-600 mb-2">
                  فایل‌ها:
                </h3>
                <div className="space-y-2">
                  {order.files.map((file) => (
                    <div
                      key={file.id}
                      className="flex items-center justify-between bg-gray-50 rounded-lg p-3"
                    >
                      <div className="flex items-center gap-3">
                        <i className="fas fa-file text-[#d4a853]"></i>
                        <div>
                          <p className="text-sm font-bold">
                            {file.fileOriginalName}
                          </p>
                          <p className="text-xs text-gray-500">
                            {file.mimeType} •{" "}
                            {(file.fileSize / 1024 / 1024).toFixed(2)} MB
                          </p>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleDownload(file.id, file.fileOriginalName)}
                        className="text-[#d4a853] hover:underline text-sm"
                      >
                        <i className="fas fa-download ml-1"></i>
                        دانلود
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Update Form */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-lg font-bold text-[#1a2744] mb-4">
              به‌روزرسانی سفارش
            </h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  وضعیت سفارش
                </label>
                <select
                  value={formData.status}
                  onChange={(e) =>
                    setFormData({ ...formData, status: e.target.value })
                  }
                  className="select-field"
                >
                  {Object.entries(statusLabels).map(([value, label]) => (
                    <option key={value} value={value}>
                      {label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">
                    مبلغ کل (تومان)
                  </label>
                  <input
                    type="number"
                    value={formData.totalAmount}
                    onChange={(e) =>
                      setFormData({ ...formData, totalAmount: e.target.value })
                    }
                    className="input-field"
                    placeholder="0"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">
                    بیعانه (تومان)
                  </label>
                  <input
                    type="number"
                    value={formData.depositAmount}
                    onChange={(e) =>
                      setFormData({ ...formData, depositAmount: e.target.value })
                    }
                    className="input-field"
                    placeholder="0"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  تاریخ تحویل تقریبی
                </label>
                <input
                  type="date"
                  value={formData.estimatedDelivery}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      estimatedDelivery: e.target.value,
                    })
                  }
                  className="input-field"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  توضیحات
                </label>
                <textarea
                  value={formData.notes}
                  onChange={(e) =>
                    setFormData({ ...formData, notes: e.target.value })
                  }
                  className="input-field h-24 resize-none"
                  placeholder="توضیحات..."
                />
              </div>

              <button
                onClick={handleUpdate}
                disabled={isUpdating}
                className="w-full bg-[#d4a853] hover:bg-[#c99d48] text-white font-bold py-3 rounded-lg transition-colors disabled:opacity-50"
              >
                {isUpdating ? (
                  <i className="fas fa-spinner fa-spin"></i>
                ) : (
                  <>
                    <i className="fas fa-save ml-2"></i>
                    ذخیره تغییرات
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Customer Info */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-lg font-bold text-[#1a2744] mb-4">
              اطلاعات مشتری
            </h2>
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-[#d4a853]/10 rounded-full flex items-center justify-center">
                  <i className="fas fa-user text-[#d4a853]"></i>
                </div>
                <div>
                  <p className="font-bold">{order.userFullName}</p>
                  <p className="text-sm text-gray-500">
                    @{order.userUsername}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-[#d4a853]/10 rounded-full flex items-center justify-center">
                  <i className="fas fa-phone text-[#d4a853]"></i>
                </div>
                <div>
                  <p className="text-sm text-gray-500">موبایل</p>
                  <p className="font-bold" dir="ltr">
                    {order.userMobile}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Payment Info */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-lg font-bold text-[#1a2744] mb-4">
              اطلاعات مالی
            </h2>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-sm text-gray-500">مبلغ کل:</span>
                <span className="font-bold">
                  {order.totalAmount
                    ? new Intl.NumberFormat("fa-IR").format(
                        parseInt(order.totalAmount)
                      )
                    : "تعیین نشده"}{" "}
                  <span className="text-xs">تومان</span>
                </span>
              </div>
              <div className="flex justify-between text-green-600">
                <span className="text-sm">بیعانه:</span>
                <span className="font-bold">
                  {order.depositAmount
                    ? new Intl.NumberFormat("fa-IR").format(
                        parseInt(order.depositAmount)
                      )
                    : "0"}{" "}
                  <span className="text-xs">تومان</span>
                </span>
              </div>
              <div className="flex justify-between text-orange-600">
                <span className="text-sm">مابقی:</span>
                <span className="font-bold">
                  {order.remainingAmount
                    ? new Intl.NumberFormat("fa-IR").format(
                        parseInt(order.remainingAmount)
                      )
                    : "0"}{" "}
                  <span className="text-xs">تومان</span>
                </span>
              </div>
              <hr />
              <div className="flex justify-between">
                <span className="text-sm text-gray-500">وضعیت پرداخت:</span>
                <span className="font-bold text-sm">
                  {order.payments?.some((payment) => payment.status === "completed") ? (
                    <span className="text-green-600">
                      پرداخت شده
                      {order.payments.find((payment) => payment.status === "completed")?.transactionId && (
                        <small className="mt-1 block font-mono" dir="ltr">
                          {order.payments.find((payment) => payment.status === "completed")?.transactionId}
                        </small>
                      )}
                    </span>
                  ) : order.payments?.some((payment) => payment.status === "pending") ? (
                    <span className="text-blue-600">در انتظار تکمیل پرداخت</span>
                  ) : (
                    <span className="text-yellow-600">پرداخت نشده</span>
                  )}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
