"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

interface ServiceCategory {
  id: number;
  name: string;
  nameEn: string;
  type: string;
  icon: string;
  description: string;
}

interface Service {
  id: number;
  categoryId: number;
  name: string;
  nameEn: string;
  description: string;
  options: string;
  basePrice: string;
}

const serviceIcons: Record<string, string> = {
  printer: "fas fa-print",
  palette: "fas fa-palette",
  book: "fas fa-book",
  globe: "fas fa-globe",
  building: "fas fa-building",
  "graduation-cap": "fas fa-graduation-cap",
  keyboard: "fas fa-keyboard",
  "ellipsis-h": "fas fa-ellipsis-h",
};

function ServicesContent() {
  const searchParams = useSearchParams();
  const categoryParam = searchParams.get("category");

  const [categories, setCategories] = useState<ServiceCategory[]>([]);
  const [allServices, setAllServices] = useState<Service[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<number | null>(
    categoryParam ? parseInt(categoryParam) : null
  );
  const [activeTab, setActiveTab] = useState<"printing" | "cafe">("printing");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchServices();
  }, []);

  useEffect(() => {
    if (categoryParam) {
      setSelectedCategory(parseInt(categoryParam));
      const cat = categories.find((c) => c.id === parseInt(categoryParam));
      if (cat) {
        setActiveTab(cat.type as "printing" | "cafe");
      }
    }
  }, [categoryParam, categories]);

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
    } finally {
      setIsLoading(false);
    }
  };

  const filteredCategories = categories.filter((c) => c.type === activeTab);
  const filteredServices = selectedCategory
    ? allServices.filter((s) => s.categoryId === selectedCategory)
    : allServices.filter((s) =>
        filteredCategories.some((c) => c.id === s.categoryId)
      );

  return (
    <div className="min-h-screen">
      <Header />

      <main className="pt-24 pb-16">
        <div className="container mx-auto px-4">
          {/* Page Header */}
          <div className="text-center mb-12">
            <h1 className="text-3xl md:text-4xl font-bold text-[#1a2744] mb-4">
              خدمات ما
            </h1>
            <p className="text-gray-600 max-w-2xl mx-auto">
              مجموعه کاملی از خدمات چاپ و کافی‌نت را ارائه می‌دهیم
            </p>
          </div>

          {/* Type Tabs */}
          <div className="flex justify-center mb-8">
            <div className="bg-gray-100 rounded-lg p-1 inline-flex">
              <button
                onClick={() => {
                  setActiveTab("printing");
                  setSelectedCategory(null);
                }}
                className={`px-6 py-3 rounded-lg font-bold transition-all ${
                  activeTab === "printing"
                    ? "bg-[#1a2744] text-white"
                    : "text-gray-600 hover:text-[#1a2744]"
                }`}
              >
                <i className="fas fa-print ml-2"></i>
                خدمات چاپ
              </button>
              <button
                onClick={() => {
                  setActiveTab("cafe");
                  setSelectedCategory(null);
                }}
                className={`px-6 py-3 rounded-lg font-bold transition-all ${
                  activeTab === "cafe"
                    ? "bg-[#1a2744] text-white"
                    : "text-gray-600 hover:text-[#1a2744]"
                }`}
              >
                <i className="fas fa-desktop ml-2"></i>
                خدمات کافی‌نت
              </button>
            </div>
          </div>

          {isLoading ? (
            <div className="flex justify-center py-12">
              <div className="w-12 h-12 border-4 border-[#d4a853] border-t-transparent rounded-full animate-spin"></div>
            </div>
          ) : (
            <>
              {/* Categories */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                <button
                  onClick={() => setSelectedCategory(null)}
                  className={`p-4 rounded-xl transition-all ${
                    !selectedCategory
                      ? "bg-[#d4a853] text-white"
                      : "bg-white text-[#1a2744] hover:bg-gray-100 border border-gray-200"
                  }`}
                >
                  <i className="fas fa-th-large text-xl mb-2 block"></i>
                  <span className="font-bold text-sm">همه</span>
                </button>
                {filteredCategories.map((category) => (
                  <button
                    key={category.id}
                    onClick={() => setSelectedCategory(category.id)}
                    className={`p-4 rounded-xl transition-all ${
                      selectedCategory === category.id
                        ? "bg-[#d4a853] text-white"
                        : "bg-white text-[#1a2744] hover:bg-gray-100 border border-gray-200"
                    }`}
                  >
                    <i
                      className={`${serviceIcons[category.icon] || "fas fa-cog"} text-xl mb-2 block`}
                    ></i>
                    <span className="font-bold text-sm">{category.name}</span>
                  </button>
                ))}
              </div>

              {/* Services Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredServices.map((service) => (
                  <div
                    key={service.id}
                    className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h3 className="text-lg font-bold text-[#1a2744]">
                          {service.name}
                        </h3>
                        <p className="text-gray-500 text-sm">
                          {service.description}
                        </p>
                      </div>
                      <div className="w-12 h-12 bg-[#d4a853]/10 rounded-full flex items-center justify-center">
                        <i className="fas fa-cog text-[#d4a853]"></i>
                      </div>
                    </div>

                    {service.basePrice && parseFloat(service.basePrice) > 0 && (
                      <div className="mb-4">
                        <span className="text-sm text-gray-500">قیمت پایه:</span>
                        <span className="text-[#d4a853] font-bold mr-2">
                          {new Intl.NumberFormat("fa-IR").format(
                            parseInt(service.basePrice)
                          )}{" "}
                          تومان
                        </span>
                      </div>
                    )}

                    {service.options && (
                      <div className="mb-4">
                        <p className="text-sm text-gray-500 mb-2">گزینه‌ها:</p>
                        <div className="flex flex-wrap gap-2">
                          {Object.keys(
                            JSON.parse(service.options as string)
                          ).map((key) => (
                            <span
                              key={key}
                              className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded"
                            >
                              {key}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    <Link
                      href={`/order?service=${service.id}`}
                      className="block w-full text-center bg-[#1a2744] hover:bg-[#2a3f66] text-white py-3 rounded-lg font-bold transition-colors"
                    >
                      ثبت سفارش
                      <i className="fas fa-arrow-left mr-2"></i>
                    </Link>
                  </div>
                ))}
              </div>

              {filteredServices.length === 0 && (
                <div className="text-center py-12">
                  <i className="fas fa-inbox text-4xl text-gray-300 mb-4"></i>
                  <p className="text-gray-500">خدمتی یافت نشد</p>
                </div>
              )}
            </>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}

export default function ServicesPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          <div className="w-12 h-12 border-4 border-[#d4a853] border-t-transparent rounded-full animate-spin"></div>
        </div>
      }
    >
      <ServicesContent />
    </Suspense>
  );
}
