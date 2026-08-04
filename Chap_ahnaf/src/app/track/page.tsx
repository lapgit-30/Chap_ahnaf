"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

interface Order {
  id: number;
  trackingCode: string;
  status: string;
  serviceName: string;
  options: Record<string, string>;
  notes: string;
  totalAmount: string;
  depositAmount: string;
  remainingAmount: string;
  estimatedDelivery: string;
  createdAt: string;
  filesCount: number;
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
  pending_review: "bg-yellow-100 text-yellow-800 border-yellow-300",
  confirmed: "bg-blue-100 text-blue-800 border-blue-300",
  in_progress: "bg-purple-100 text-purple-800 border-purple-300",
  ready_for_delivery: "bg-green-100 text-green-800 border-green-300",
  delivered: "bg-emerald-100 text-emerald-800 border-emerald-300",
  cancelled: "bg-red-100 text-red-800 border-red-300",
};

const statusSteps = [
  "pending_review",
  "confirmed",
  "in_progress",
  "ready_for_delivery",
  "delivered",
];

function TrackContent() {
  const searchParams = useSearchParams();
  const codeParam = searchParams.get("code");

  const [trackingCode, setTrackingCode] = useState(codeParam || "");
  const [order, setOrder] = useState<Order | null>(null);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (codeParam) {
      setTrackingCode(codeParam);
      handleTrack(codeParam);
    }
  }, [codeParam]);

  const handleTrack = async (code?: string) => {
    const codeToTrack = code || trackingCode;
    if (!codeToTrack) {
      setError("لطفاً کد رهگیری را وارد کنید");
      return;
    }

    setIsLoading(true);
    setError("");
    setOrder(null);

    try {
      const res = await fetch(`/api/orders/track?code=${codeToTrack}`);
      const data = await res.json();

      if (!res.ok) {
        setError(data.error);
        return;
      }

      setOrder(data.order);
    } catch {
      setError("خطا در جستجوی سفارش");
    } finally {
      setIsLoading(false);
    }
  };

  const getCurrentStepIndex = (status: string) => {
    return statusSteps.indexOf(status);
  };

  return (
    <div className="min-h-screen">
      <Header />

      <main className="pt-24 pb-16 bg-gray-50 min-h-screen">
        <div className="container mx-auto px-4 max-w-2xl">
          {/* Page Header */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-[#1a2744] mb-2">
              پیگیری سفارش
            </h1>
            <p className="text-gray-600">
              کد رهگیری خود را وارد کنید تا وضعیت سفارش را ببینید
            </p>
          </div>

          {/* Search Form */}
          <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
            <div className="flex gap-3">
              <input
                type="text"
                value={trackingCode}
                onChange={(e) => setTrackingCode(e.target.value)}
                className="input-field flex-1"
                placeholder="کد رهگیری را وارد کنید"
                dir="ltr"
              />
              <button
                onClick={() => handleTrack()}
                disabled={isLoading}
                className="bg-[#d4a853] hover:bg-[#c99d48] text-white px-6 py-3 rounded-lg font-bold transition-colors disabled:opacity-50"
              >
                {isLoading ? (
                  <i className="fas fa-spinner fa-spin"></i>
                ) : (
                  <>
                    <i className="fas fa-search ml-2"></i>
                    جستجو
                  </>
                )}
              </button>
            </div>
          </div>

          {error && (
            <div className="bg-red-50 text-red-600 p-4 rounded-lg mb-6">
              <i className="fas fa-exclamation-circle ml-2"></i>
              {error}
            </div>
          )}

          {/* Order Details */}
          {order && (
            <div className="bg-white rounded-xl shadow-lg p-6">
              {/* Status Badge */}
              <div className="text-center mb-6">
                <span
                  className={`inline-block px-4 py-2 rounded-full text-sm font-bold border ${
                    statusColors[order.status]
                  }`}
                >
                  {statusLabels[order.status]}
                </span>
              </div>

              {/* Tracking Code */}
              <div className="bg-gray-50 rounded-lg p-4 mb-6 text-center">
                <p className="text-sm text-gray-500 mb-1">کد رهگیری:</p>
                <p
                  className="text-2xl font-bold text-[#d4a853] tracking-wider"
                  dir="ltr"
                >
                  {order.trackingCode}
                </p>
              </div>

              {/* Progress Steps */}
              {order.status !== "cancelled" && (
                <div className="mb-6">
                  <div className="flex items-center justify-between">
                    {statusSteps.map((step, index) => {
                      const currentIndex = getCurrentStepIndex(order.status);
                      const isCompleted = index <= currentIndex;
                      const isCurrent = index === currentIndex;

                      return (
                        <div key={step} className="flex flex-col items-center flex-1">
                          <div
                            className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                              isCompleted
                                ? "bg-[#d4a853] text-white"
                                : "bg-gray-200 text-gray-500"
                            } ${isCurrent ? "ring-4 ring-[#d4a853]/30" : ""}`}
                          >
                            {isCompleted ? (
                              <i className="fas fa-check text-xs"></i>
                            ) : (
                              index + 1
                            )}
                          </div>
                          <span
                            className={`text-xs mt-2 text-center ${
                              isCompleted ? "text-[#1a2744] font-bold" : "text-gray-500"
                            }`}
                          >
                            {statusLabels[step]}
                          </span>
                          {index < statusSteps.length - 1 && (
                            <div
                              className={`w-full h-1 ${
                                index < currentIndex ? "bg-[#d4a853]" : "bg-gray-200"
                              }`}
                              style={{ marginTop: "-32px", zIndex: -1 }}
                            ></div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Order Info */}
              <div className="space-y-4">
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-sm text-gray-500">نوع خدمت:</p>
                  <p className="font-bold text-[#1a2744]">{order.serviceName}</p>
                </div>

                {order.options && Object.keys(order.options).length > 0 && (
                  <div className="bg-gray-50 rounded-lg p-4">
                    <p className="text-sm text-gray-500 mb-2">جزئیات سفارش:</p>
                    <div className="grid grid-cols-2 gap-2">
                      {Object.entries(order.options).map(([key, value]) => (
                        <div key={key}>
                          <span className="text-xs text-gray-500">{key}: </span>
                          <span className="text-sm font-bold">{value}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {order.notes && (
                  <div className="bg-gray-50 rounded-lg p-4">
                    <p className="text-sm text-gray-500 mb-1">توضیحات:</p>
                    <p className="text-sm">{order.notes}</p>
                  </div>
                )}

                {order.filesCount > 0 && (
                  <div className="bg-gray-50 rounded-lg p-4">
                    <p className="text-sm text-gray-500">
                      <i className="fas fa-paperclip ml-1"></i>
                      تعداد فایل‌ها: {order.filesCount}
                    </p>
                  </div>
                )}

                {order.totalAmount && (
                  <div className="bg-gray-50 rounded-lg p-4">
                    <p className="text-sm text-gray-500 mb-2">مبالغ:</p>
                    <div className="space-y-1">
                      <div className="flex justify-between">
                        <span className="text-sm">مبلغ کل:</span>
                        <span className="font-bold">
                          {new Intl.NumberFormat("fa-IR").format(
                            parseInt(order.totalAmount)
                          )}{" "}
                          تومان
                        </span>
                      </div>
                      {order.depositAmount && (
                        <div className="flex justify-between text-green-600">
                          <span className="text-sm">بیعانه پرداخت شده:</span>
                          <span className="font-bold">
                            {new Intl.NumberFormat("fa-IR").format(
                              parseInt(order.depositAmount)
                            )}{" "}
                            تومان
                          </span>
                        </div>
                      )}
                      {order.remainingAmount && (
                        <div className="flex justify-between text-orange-600">
                          <span className="text-sm">مابقی (هنگام تحویل):</span>
                          <span className="font-bold">
                            {new Intl.NumberFormat("fa-IR").format(
                              parseInt(order.remainingAmount)
                            )}{" "}
                            تومان
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-sm text-gray-500">
                    <i className="fas fa-clock ml-1"></i>
                    تاریخ ثبت:{" "}
                    {new Date(order.createdAt).toLocaleDateString("fa-IR")}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}

export default function TrackPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          <div className="w-12 h-12 border-4 border-[#d4a853] border-t-transparent rounded-full animate-spin"></div>
        </div>
      }
    >
      <TrackContent />
    </Suspense>
  );
}
