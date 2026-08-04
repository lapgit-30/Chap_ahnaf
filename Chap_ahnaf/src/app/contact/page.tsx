"use client";

import Header from "@/components/Header";
import Footer from "@/components/Footer";

export default function ContactPage() {
  return (
    <div className="min-h-screen">
      <Header />

      <main className="pt-24 pb-16 bg-gray-50 min-h-screen">
        <div className="container mx-auto px-4 max-w-4xl">
          {/* Page Header */}
          <div className="text-center mb-12">
            <h1 className="text-3xl md:text-4xl font-bold text-[#1a2744] mb-4">
              تماس با ما
            </h1>
            <p className="text-gray-600 max-w-2xl mx-auto">
              برای سفارش یا مشاوره با ما در تماس باشید
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Contact Info */}
            <div className="space-y-6">
              {/* Phone */}
              <div className="bg-white rounded-xl shadow-lg p-6">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 bg-[#d4a853] rounded-full flex items-center justify-center">
                    <i className="fas fa-phone text-white text-xl"></i>
                  </div>
                  <div>
                    <h3 className="font-bold text-[#1a2744]">تماس تلفنی</h3>
                    <a
                      href="tel:09334989931"
                      className="text-lg text-[#d4a853] font-bold hover:underline"
                      dir="ltr"
                    >
                      09334989931
                    </a>
                  </div>
                </div>
              </div>

              {/* Instagram */}
              <div className="bg-white rounded-xl shadow-lg p-6">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                    <i className="fab fa-instagram text-white text-xl"></i>
                  </div>
                  <div>
                    <h3 className="font-bold text-[#1a2744]">اینستاگرام</h3>
                    <a
                      href="https://instagram.com/Chap_ahnaf"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-lg text-[#d4a853] font-bold hover:underline"
                    >
                      @Chap_ahnaf
                    </a>
                  </div>
                </div>
              </div>

              {/* Telegram */}
              <div className="bg-white rounded-xl shadow-lg p-6">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 bg-blue-500 rounded-full flex items-center justify-center">
                    <i className="fab fa-telegram-plane text-white text-xl"></i>
                  </div>
                  <div>
                    <h3 className="font-bold text-[#1a2744]">تلگرام</h3>
                    <a
                      href="https://t.me/Chap_ahnaf"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-lg text-[#d4a853] font-bold hover:underline"
                    >
                      @Chap_ahnaf
                    </a>
                  </div>
                </div>
              </div>

              {/* Eitaa */}
              <div className="bg-white rounded-xl shadow-lg p-6">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 bg-green-500 rounded-full flex items-center justify-center">
                    <i className="fas fa-circle-notch text-white text-xl"></i>
                  </div>
                  <div>
                    <h3 className="font-bold text-[#1a2744]">ایتا</h3>
                    <a
                      href="https://eitaa.com/Chap_ahnaf"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-lg text-[#d4a853] font-bold hover:underline"
                    >
                      @Chap_ahnaf
                    </a>
                  </div>
                </div>
              </div>

              {/* Working Hours */}
              <div className="bg-white rounded-xl shadow-lg p-6">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 bg-[#1a2744] rounded-full flex items-center justify-center">
                    <i className="fas fa-clock text-white text-xl"></i>
                  </div>
                  <div>
                    <h3 className="font-bold text-[#1a2744]">ساعات کاری</h3>
                    <p className="text-gray-600">هر روز از ساعت 8 صبح تا 10 شب</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Contact Form */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h2 className="text-xl font-bold text-[#1a2744] mb-6">
                ارسال پیام
              </h2>
              <form className="space-y-4">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">
                    نام و نام خانوادگی
                  </label>
                  <input
                    type="text"
                    className="input-field"
                    placeholder="نام خود را وارد کنید"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">
                    شماره موبایل
                  </label>
                  <input
                    type="tel"
                    className="input-field"
                    placeholder="09123456789"
                    dir="ltr"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">
                    موضوع
                  </label>
                  <select className="select-field">
                    <option value="">انتخاب کنید</option>
                    <option value="order">سفارش</option>
                    <option value="consultation">مشاوره</option>
                    <option value="complaint">شکایت</option>
                    <option value="suggestion">پیشنهاد</option>
                    <option value="other">سایر</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">
                    پیام
                  </label>
                  <textarea
                    className="input-field h-32 resize-none"
                    placeholder="پیام خود را بنویسید..."
                  />
                </div>
                <button
                  type="submit"
                  className="w-full bg-[#d4a853] hover:bg-[#c99d48] text-white font-bold py-3 rounded-lg transition-colors"
                >
                  <i className="fas fa-paper-plane ml-2"></i>
                  ارسال پیام
                </button>
              </form>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
