"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

interface ServiceCategory {
  id: number;
  name: string;
  nameEn: string;
  type: string;
}

interface Service {
  id: number;
  categoryId: number;
  name: string;
  nameEn: string;
  description: string;
  options: Record<string, string[]> | null;
  basePrice: string;
}

function OrderContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const serviceIdParam = searchParams.get("service");

  const [step, setStep] = useState(1);
  const [categories, setCategories] = useState<ServiceCategory[]>([]);
  const [allServices, setAllServices] = useState<Service[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [selectedOptions, setSelectedOptions] = useState<
    Record<string, string>
  >({});
  const [notes, setNotes] = useState("");
  const [files, setFiles] = useState<File[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState<{
    trackingCode: string;
    orderId: number;
  } | null>(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("token");
    setIsLoggedIn(!!token);
    fetchServices();
  }, []);

  useEffect(() => {
    if (serviceIdParam && allServices.length > 0) {
      const service = allServices.find(
        (s) => s.id === parseInt(serviceIdParam)
      );
      if (service) {
        setSelectedService(service);
        setSelectedCategory(service.categoryId);
        setStep(2);
      }
    }
  }, [serviceIdParam, allServices]);

  const fetchServices = async () => {
    try {
      const res = await fetch("/api/services");
      const data = await res.json();
      if (data.success) {
        setCategories(data.categories);
        setAllServices(data.services);
      }
    } catch (error) {
      console.error("Error fetching services:", error);
    }
  };

  const filteredServices = selectedCategory
    ? allServices.filter((s) => s.categoryId === selectedCategory)
    : [];

  const parseOptions = (optionsStr: string | null): Record<string, string[]> => {
    if (!optionsStr) return {};
    try {
      return JSON.parse(optionsStr);
    } catch {
      return {};
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newFiles = e.target.files;
    if (!newFiles) return;

    const allowedTypes = [
      "application/pdf",
      "image/jpeg",
      "image/jpg",
      "image/png",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "application/zip",
      "application/x-zip-compressed",
    ];

    const maxSize = 20 * 1024 * 1024; // 20MB

    for (const file of Array.from(newFiles)) {
      if (!allowedTypes.includes(file.type)) {
        setError(`فرمت فایل ${file.name} مجاز نیست`);
        return;
      }
      if (file.size > maxSize) {
        setError(`حجم فایل ${file.name} بیش از 20 مگابایت است`);
        return;
      }
    }

    setFiles([...files, ...Array.from(newFiles)]);
    setError("");
  };

  const removeFile = (index: number) => {
    setFiles(files.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    if (!isLoggedIn) {
      router.push("/login");
      return;
    }

    if (!selectedService) return;

    setIsSubmitting(true);
    setError("");

    try {
      const token = localStorage.getItem("token");
      const formData = new FormData();
      formData.append("serviceId", selectedService.id.toString());
      formData.append("serviceName", selectedService.name);
      formData.append("options", JSON.stringify(selectedOptions));
      formData.append("notes", notes);

      for (const file of files) {
        formData.append("files", file);
      }

      const res = await fetch("/api/orders", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error);
        return;
      }

      setSuccess({
        trackingCode: data.trackingCode,
        orderId: data.orderId,
      });
      setStep(4);
    } catch {
      setError("خطا در ارسال سفارش");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen">
        <Header />
        <main className="pt-24 pb-16 flex items-center justify-center min-h-screen bg-gray-50">
          <div className="w-full max-w-md px-4">
            <div className="bg-white rounded-2xl shadow-xl p-8 text-center">
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <i className="fas fa-check text-green-600 text-3xl"></i>
              </div>
              <h1 className="text-2xl font-bold text-[#1a2744] mb-4">
                سفارش ثبت شد!
              </h1>
              <p className="text-gray-600 mb-6">
                سفارش شما با موفقیت ثبت شد و در انتظار بررسی است.
              </p>
              <div className="bg-gray-50 rounded-lg p-4 mb-6">
                <p className="text-sm text-gray-500 mb-2">کد رهگیری:</p>
                <p
                  className="text-2xl font-bold text-[#d4a853] tracking-wider"
                  dir="ltr"
                >
                  {success.trackingCode}
                </p>
              </div>
              <div className="flex flex-col gap-3">
                <Link
                  href={`/track?code=${success.trackingCode}`}
                  className="w-full bg-[#1a2744] hover:bg-[#2a3f66] text-white py-3 rounded-lg font-bold transition-colors"
                >
                  <i className="fas fa-search ml-2"></i>
                  پیگیری سفارش
                </Link>
                <Link
                  href="/dashboard"
                  className="w-full bg-gray-100 hover:bg-gray-200 text-[#1a2744] py-3 rounded-lg font-bold transition-colors"
                >
                  <i className="fas fa-list ml-2"></i>
                  مشاهده سفارشات
                </Link>
                <Link
                  href="/"
                  className="w-full text-gray-600 hover:text-[#1a2744] py-3 transition-colors"
                >
                  بازگشت به صفحه اصلی
                </Link>
              </div>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <Header />

      <main className="pt-24 pb-16 bg-gray-50 min-h-screen">
        <div className="container mx-auto px-4 max-w-4xl">
          {/* Page Header */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-[#1a2744] mb-2">
              ثبت سفارش
            </h1>
            <p className="text-gray-600">خدمت مورد نظر خود را انتخاب کنید</p>
          </div>

          {/* Progress Steps */}
          <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
            <div className="flex items-center justify-between">
              {[1, 2, 3].map((s) => (
                <div key={s} className="flex items-center">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${
                      step >= s
                        ? "bg-[#d4a853] text-white"
                        : "bg-gray-200 text-gray-500"
                    }`}
                  >
                    {step > s ? (
                      <i className="fas fa-check"></i>
                    ) : (
                      s
                    )}
                  </div>
                  <span
                    className={`mr-2 text-sm font-bold hidden sm:block ${
                      step >= s ? "text-[#1a2744]" : "text-gray-500"
                    }`}
                  >
                    {s === 1
                      ? "انتخاب خدمت"
                      : s === 2
                        ? "جزئیات"
                        : "تکمیل"}
                  </span>
                  {s < 3 && (
                    <div
                      className={`w-16 sm:w-24 h-1 mx-2 ${
                        step > s ? "bg-[#d4a853]" : "bg-gray-200"
                      }`}
                    ></div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {error && (
            <div className="bg-red-50 text-red-600 p-4 rounded-lg mb-6">
              <i className="fas fa-exclamation-circle ml-2"></i>
              {error}
            </div>
          )}

          {/* Step 1: Select Service */}
          {step === 1 && (
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h2 className="text-xl font-bold text-[#1a2744] mb-6">
                انتخاب خدمت
              </h2>

              {/* Category Selection */}
              <div className="mb-6">
                <label className="block text-sm font-bold text-gray-700 mb-3">
                  دسته‌بندی خدمت
                </label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {categories.map((category) => (
                    <button
                      key={category.id}
                      onClick={() => setSelectedCategory(category.id)}
                      className={`p-3 rounded-lg text-center transition-all ${
                        selectedCategory === category.id
                          ? "bg-[#d4a853] text-white"
                          : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                      }`}
                    >
                      <span className="text-sm font-bold">{category.name}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Service Selection */}
              {selectedCategory && (
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-3">
                    نوع خدمت
                  </label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {filteredServices.map((service) => (
                      <button
                        key={service.id}
                        onClick={() => {
                          setSelectedService(service);
                          setStep(2);
                        }}
                        className={`p-4 rounded-lg text-right transition-all border-2 ${
                          selectedService?.id === service.id
                            ? "border-[#d4a853] bg-[#d4a853]/5"
                            : "border-gray-200 hover:border-[#d4a853]"
                        }`}
                      >
                        <h3 className="font-bold text-[#1a2744]">
                          {service.name}
                        </h3>
                        <p className="text-sm text-gray-500 mt-1">
                          {service.description}
                        </p>
                        {service.basePrice &&
                          parseFloat(service.basePrice) > 0 && (
                            <p className="text-[#d4a853] font-bold mt-2 text-sm">
                              از{" "}
                              {new Intl.NumberFormat("fa-IR").format(
                                parseInt(service.basePrice)
                              )}{" "}
                              تومان
                            </p>
                          )}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Step 2: Service Options */}
          {step === 2 && selectedService && (
            <div className="bg-white rounded-xl shadow-lg p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-[#1a2744]">
                  جزئیات سفارش: {selectedService.name}
                </h2>
                <button
                  onClick={() => setStep(1)}
                  className="text-gray-500 hover:text-[#1a2744]"
                >
                  <i className="fas fa-edit ml-1"></i>
                  تغییر خدمت
                </button>
              </div>

              {/* Dynamic Options */}
              {selectedService.options && (
                <div className="space-y-4 mb-6">
                  {Object.entries(selectedService.options).map(([key, values]) => (
                    <div key={key}>
                      <label className="block text-sm font-bold text-gray-700 mb-2">
                        {key}
                      </label>
                      <div className="flex flex-wrap gap-2">
                        {values.map((value) => (
                          <button
                            key={value}
                            onClick={() =>
                              setSelectedOptions({
                                ...selectedOptions,
                                [key]: value,
                              })
                            }
                            className={`px-4 py-2 rounded-lg text-sm transition-all ${
                              selectedOptions[key] === value
                                ? "bg-[#d4a853] text-white"
                                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                            }`}
                          >
                            {value}
                          </button>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Quantity */}
              <div className="mb-6">
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  تعداد
                </label>
                <input
                  type="number"
                  value={selectedOptions["quantity"] || "1"}
                  onChange={(e) =>
                    setSelectedOptions({
                      ...selectedOptions,
                      quantity: e.target.value,
                    })
                  }
                  className="input-field w-32"
                  min="1"
                />
              </div>

              {/* File Upload */}
              <div className="mb-6">
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  فایل (اختیاری)
                </label>
                <p className="text-xs text-gray-500 mb-2">
                  فرمت‌های مجاز: PDF, JPG, PNG, DOC, DOCX, ZIP (حداکثر 20
                  مگابایت)
                </p>
                <input
                  type="file"
                  onChange={handleFileChange}
                  className="input-field"
                  accept=".pdf,.jpg,.jpeg,.png,.doc,.docx,.zip"
                  multiple
                />
                {files.length > 0 && (
                  <div className="mt-3 space-y-2">
                    {files.map((file, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between bg-gray-50 p-2 rounded"
                      >
                        <span className="text-sm text-gray-600 truncate flex-1">
                          <i className="fas fa-file ml-2"></i>
                          {file.name}
                        </span>
                        <button
                          onClick={() => removeFile(index)}
                          className="text-red-500 hover:text-red-700 mr-2"
                        >
                          <i className="fas fa-times"></i>
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Notes */}
              <div className="mb-6">
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  توضیحات سفارش (اختیاری)
                </label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="input-field h-24 resize-none"
                  placeholder="در صورت نیاز توضیحات خود را وارد کنید..."
                />
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setStep(3)}
                  className="flex-1 bg-[#1a2744] hover:bg-[#2a3f66] text-white py-3 rounded-lg font-bold transition-colors"
                >
                  مرحله بعد
                  <i className="fas fa-arrow-left mr-2"></i>
                </button>
                <button
                  onClick={() => setStep(1)}
                  className="px-6 py-3 border border-gray-300 rounded-lg text-gray-600 hover:bg-gray-50 transition-colors"
                >
                  بازگشت
                </button>
              </div>
            </div>
          )}

          {/* Step 3: Review & Submit */}
          {step === 3 && selectedService && (
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h2 className="text-xl font-bold text-[#1a2744] mb-6">
                بررسی و تأیید سفارش
              </h2>

              <div className="space-y-4 mb-6">
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-sm text-gray-500">خدمت انتخابی:</p>
                  <p className="font-bold text-[#1a2744]">
                    {selectedService.name}
                  </p>
                </div>

                {Object.keys(selectedOptions).length > 0 && (
                  <div className="bg-gray-50 rounded-lg p-4">
                    <p className="text-sm text-gray-500 mb-2">گزینه‌های انتخابی:</p>
                    <div className="grid grid-cols-2 gap-2">
                      {Object.entries(selectedOptions).map(([key, value]) => (
                        <div key={key}>
                          <span className="text-xs text-gray-500">{key}: </span>
                          <span className="text-sm font-bold">{value}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {files.length > 0 && (
                  <div className="bg-gray-50 rounded-lg p-4">
                    <p className="text-sm text-gray-500 mb-2">فایل‌ها:</p>
                    <ul className="space-y-1">
                      {files.map((file, index) => (
                        <li key={index} className="text-sm">
                          <i className="fas fa-file ml-2 text-[#d4a853]"></i>
                          {file.name}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {notes && (
                  <div className="bg-gray-50 rounded-lg p-4">
                    <p className="text-sm text-gray-500 mb-2">توضیحات:</p>
                    <p className="text-sm">{notes}</p>
                  </div>
                )}
              </div>

              {!isLoggedIn && (
                <div className="bg-yellow-50 text-yellow-700 p-4 rounded-lg mb-6">
                  <i className="fas fa-exclamation-triangle ml-2"></i>
                  برای ثبت سفارش ابتدا باید{" "}
                  <Link href="/login" className="font-bold underline">
                    وارد شوید
                  </Link>{" "}
                  یا{" "}
                  <Link href="/register" className="font-bold underline">
                    ثبت‌نام کنید
                  </Link>
                </div>
              )}

              <div className="flex gap-3">
                <button
                  onClick={handleSubmit}
                  disabled={isSubmitting}
                  className="flex-1 bg-[#d4a853] hover:bg-[#c99d48] text-white py-3 rounded-lg font-bold transition-colors disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <i className="fas fa-spinner fa-spin"></i>
                  ) : (
                    <>
                      <i className="fas fa-paper-plane ml-2"></i>
                      ثبت سفارش
                    </>
                  )}
                </button>
                <button
                  onClick={() => setStep(2)}
                  className="px-6 py-3 border border-gray-300 rounded-lg text-gray-600 hover:bg-gray-50 transition-colors"
                >
                  بازگشت
                </button>
              </div>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}

export default function OrderPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          <div className="w-12 h-12 border-4 border-[#d4a853] border-t-transparent rounded-full animate-spin"></div>
        </div>
      }
    >
      <OrderContent />
    </Suspense>
  );
}
