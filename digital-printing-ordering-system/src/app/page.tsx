"use client";

import { useState, useEffect } from "react";
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

export default function HomePage() {
  const [categories, setCategories] = useState<ServiceCategory[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const res = await fetch("/api/services");
      const data = await res.json();
      if (data.success) {
        setCategories(data.categories);
      }
    } catch (error) {
      console.error("Error fetching categories:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen">
      <Header />

      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-[#1a2744] via-[#2a3f66] to-[#1a2744] text-white pt-20">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0 bg-[url('/pattern.svg')] bg-repeat"></div>
        </div>
        <div className="container mx-auto px-4 py-20 relative">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6">
              شعبه مجازی
              <span className="text-[#d4a853] block mt-2">کافی نت و چاپ احناف</span>
            </h1>
            <p className="text-xl text-gray-300 mb-8 leading-8">
              خدمات چاپ دیجیتال، کارت ویزیت، تراکت، بنر، پوستر و خدمات کافی‌نت
              با کیفیت بالا و قیمت مناسب
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                href="/order"
                className="bg-[#d4a853] hover:bg-[#c99d48] text-white px-8 py-4 rounded-lg font-bold text-lg transition-all duration-200 hover:scale-105 shadow-lg"
              >
                <i className="fas fa-shopping-cart ml-2"></i>
                ثبت سفارش آنلاین
              </Link>
              <Link
                href="/track"
                className="bg-white/10 hover:bg-white/20 text-white px-8 py-4 rounded-lg font-bold text-lg transition-all duration-200 backdrop-blur-sm"
              >
                <i className="fas fa-search ml-2"></i>
                پیگیری سفارش
              </Link>
            </div>
          </div>
        </div>

        {/* Wave */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg
            viewBox="0 0 1440 120"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M0 120L60 110C120 100 240 80 360 70C480 60 600 60 720 65C840 70 960 80 1080 85C1200 90 1320 90 1380 90L1440 90V120H1380C1320 120 1200 120 1080 120C960 120 840 120 720 120C600 120 480 120 360 120C240 120 120 120 60 120H0Z"
              fill="#f9fafb"
            />
          </svg>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-12 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="bg-white rounded-xl shadow-lg p-6 text-center">
              <div className="w-16 h-16 bg-[#d4a853]/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <i className="fas fa-print text-2xl text-[#d4a853]"></i>
              </div>
              <h3 className="text-3xl font-bold text-[#1a2744]">+1000</h3>
              <p className="text-gray-600">سفارش موفق</p>
            </div>
            <div className="bg-white rounded-xl shadow-lg p-6 text-center">
              <div className="w-16 h-16 bg-[#d4a853]/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <i className="fas fa-users text-2xl text-[#d4a853]"></i>
              </div>
              <h3 className="text-3xl font-bold text-[#1a2744]">+500</h3>
              <p className="text-gray-600">مشتری راضی</p>
            </div>
            <div className="bg-white rounded-xl shadow-lg p-6 text-center">
              <div className="w-16 h-16 bg-[#d4a853]/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <i className="fas fa-cogs text-2xl text-[#d4a853]"></i>
              </div>
              <h3 className="text-3xl font-bold text-[#1a2744]">+20</h3>
              <p className="text-gray-600">خدمات متنوع</p>
            </div>
            <div className="bg-white rounded-xl shadow-lg p-6 text-center">
              <div className="w-16 h-16 bg-[#d4a853]/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <i className="fas fa-clock text-2xl text-[#d4a853]"></i>
              </div>
              <h3 className="text-3xl font-bold text-[#1a2744]">14ساعته</h3>
              <p className="text-gray-600">ساعات کاری</p>
            </div>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-[#1a2744] mb-4">
              خدمات ما
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              مجموعه کاملی از خدمات چاپ و کافی‌نت را ارائه می‌دهیم
            </p>
          </div>

          {isLoading ? (
            <div className="flex justify-center py-12">
              <div className="w-12 h-12 border-4 border-[#d4a853] border-t-transparent rounded-full animate-spin"></div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {categories.map((category) => (
                <Link
                  key={category.id}
                  href={`/services?category=${category.id}`}
                  className="group bg-gray-50 hover:bg-[#1a2744] rounded-xl p-6 transition-all duration-300 hover:shadow-xl"
                >
                  <div className="w-16 h-16 bg-[#d4a853]/10 group-hover:bg-white/10 rounded-full flex items-center justify-center mb-4 transition-colors">
                    <i
                      className={`${serviceIcons[category.icon] || "fas fa-cog"} text-2xl text-[#d4a853]`}
                    ></i>
                  </div>
                  <h3 className="text-xl font-bold text-[#1a2744] group-hover:text-white mb-2 transition-colors">
                    {category.name}
                  </h3>
                  <p className="text-gray-600 group-hover:text-gray-300 text-sm transition-colors">
                    {category.description}
                  </p>
                </Link>
              ))}
            </div>
          )}

          <div className="text-center mt-8">
            <Link
              href="/services"
              className="inline-flex items-center gap-2 bg-[#1a2744] hover:bg-[#2a3f66] text-white px-6 py-3 rounded-lg font-bold transition-colors"
            >
              مشاهده همه خدمات
              <i className="fas fa-arrow-left"></i>
            </Link>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-[#1a2744] mb-4">
              نحوه سفارش
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              در چند مرحله ساده سفارش خود را ثبت کنید
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="w-20 h-20 bg-[#d4a853] rounded-full flex items-center justify-center mx-auto mb-4 relative">
                <i className="fas fa-user-plus text-white text-2xl"></i>
                <span className="absolute -top-2 -right-2 w-8 h-8 bg-[#1a2744] text-white rounded-full flex items-center justify-center font-bold">
                  1
                </span>
              </div>
              <h3 className="text-lg font-bold text-[#1a2744] mb-2">
                ثبت‌نام
              </h3>
              <p className="text-gray-600 text-sm">
                در سایت ثبت‌نام کنید
              </p>
            </div>

            <div className="text-center">
              <div className="w-20 h-20 bg-[#d4a853] rounded-full flex items-center justify-center mx-auto mb-4 relative">
                <i className="fas fa-list-alt text-white text-2xl"></i>
                <span className="absolute -top-2 -right-2 w-8 h-8 bg-[#1a2744] text-white rounded-full flex items-center justify-center font-bold">
                  2
                </span>
              </div>
              <h3 className="text-lg font-bold text-[#1a2744] mb-2">
                انتخاب خدمت
              </h3>
              <p className="text-gray-600 text-sm">
                خدمت مورد نظر را انتخاب کنید
              </p>
            </div>

            <div className="text-center">
              <div className="w-20 h-20 bg-[#d4a853] rounded-full flex items-center justify-center mx-auto mb-4 relative">
                <i className="fas fa-credit-card text-white text-2xl"></i>
                <span className="absolute -top-2 -right-2 w-8 h-8 bg-[#1a2744] text-white rounded-full flex items-center justify-center font-bold">
                  3
                </span>
              </div>
              <h3 className="text-lg font-bold text-[#1a2744] mb-2">
                پرداخت بیعانه
              </h3>
              <p className="text-gray-600 text-sm">
                بیعانه آنلاین پرداخت کنید
              </p>
            </div>

            <div className="text-center">
              <div className="w-20 h-20 bg-[#d4a853] rounded-full flex items-center justify-center mx-auto mb-4 relative">
                <i className="fas fa-check-circle text-white text-2xl"></i>
                <span className="absolute -top-2 -right-2 w-8 h-8 bg-[#1a2744] text-white rounded-full flex items-center justify-center font-bold">
                  4
                </span>
              </div>
              <h3 className="text-lg font-bold text-[#1a2744] mb-2">
                تحویل حضوری
              </h3>
              <p className="text-gray-600 text-sm">
                سفارش را حضوری تحویل بگیرید
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section className="py-16 bg-[#1a2744] text-white">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-6">
              آماده خدمت‌رسانی هستیم
            </h2>
            <p className="text-gray-300 mb-8 text-lg">
              برای سفارش یا مشاوره با ما در تماس باشید
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
              <a
                href="tel:09334989931"
                className="flex items-center gap-3 bg-white/10 hover:bg-white/20 px-6 py-4 rounded-lg transition-colors"
              >
                <i className="fas fa-phone text-[#d4a853] text-xl"></i>
                <span className="text-xl font-bold">09334989931</span>
              </a>
              <a
                href="https://instagram.com/Chap_ahnaf"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 bg-white/10 hover:bg-white/20 px-6 py-4 rounded-lg transition-colors"
              >
                <i className="fab fa-instagram text-[#d4a853] text-xl"></i>
                <span className="text-xl font-bold">@Chap_ahnaf</span>
              </a>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
