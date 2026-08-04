"use client";

import Link from "next/link";

export default function Footer() {
  return (
    <footer className="bg-[#1a2744] text-white">
      {/* Main Footer */}
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* About */}
          <div>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-[#d4a853] rounded-full flex items-center justify-center">
                <i className="fas fa-print text-white"></i>
              </div>
              <div>
                <h3 className="text-lg font-bold">احناف</h3>
                <p className="text-xs text-gray-400">کافی نت و چاپ</p>
              </div>
            </div>
            <p className="text-gray-400 text-sm leading-7">
              کافی نت و چاپ احناف با بیش از ده سال تجربه در زمینه خدمات چاپ
              دیجیتال و کافی‌نت، آماده ارائه خدمات با کیفیت به شما عزیزان است.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-lg font-bold mb-4">دسترسی سریع</h4>
            <ul className="space-y-2">
              <li>
                <Link
                  href="/"
                  className="text-gray-400 hover:text-[#d4a853] transition-colors"
                >
                  صفحه اصلی
                </Link>
              </li>
              <li>
                <Link
                  href="/services"
                  className="text-gray-400 hover:text-[#d4a853] transition-colors"
                >
                  خدمات ما
                </Link>
              </li>
              <li>
                <Link
                  href="/order"
                  className="text-gray-400 hover:text-[#d4a853] transition-colors"
                >
                  ثبت سفارش
                </Link>
              </li>
              <li>
                <Link
                  href="/track"
                  className="text-gray-400 hover:text-[#d4a853] transition-colors"
                >
                  پیگیری سفارش
                </Link>
              </li>
            </ul>
          </div>

          {/* Services */}
          <div>
            <h4 className="text-lg font-bold mb-4">خدمات ما</h4>
            <ul className="space-y-2">
              <li>
                <span className="text-gray-400">چاپ سیاه‌وسفید و رنگی</span>
              </li>
              <li>
                <span className="text-gray-400">کارت ویزیت</span>
              </li>
              <li>
                <span className="text-gray-400">تراکت و بروشور</span>
              </li>
              <li>
                <span className="text-gray-400">بنر و پوستر</span>
              </li>
              <li>
                <span className="text-gray-400">صحافی و لمینت</span>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-lg font-bold mb-4">تماس با ما</h4>
            <ul className="space-y-3">
              <li className="flex items-center gap-3">
                <i className="fas fa-phone text-[#d4a853]"></i>
                <span className="text-gray-400">09334989931</span>
              </li>
              <li className="flex items-center gap-3">
                <i className="fas fa-clock text-[#d4a853]"></i>
                <span className="text-gray-400">ساعات کاری: 8 صبح تا 10 شب</span>
              </li>
              <li className="flex items-center gap-3">
                <i className="fas fa-map-marker-alt text-[#d4a853]"></i>
                <span className="text-gray-400">آدرس چاپخانه</span>
              </li>
            </ul>
            <div className="flex gap-4 mt-4">
              <a
                href="https://instagram.com/Chap_ahnaf"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 bg-gray-700 hover:bg-[#d4a853] rounded-full flex items-center justify-center transition-colors"
              >
                <i className="fab fa-instagram"></i>
              </a>
              <a
                href="https://t.me/Chap_ahnaf"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 bg-gray-700 hover:bg-[#d4a853] rounded-full flex items-center justify-center transition-colors"
              >
                <i className="fab fa-telegram-plane"></i>
              </a>
              <a
                href="https://eitaa.com/Chap_ahnaf"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 bg-gray-700 hover:bg-[#d4a853] rounded-full flex items-center justify-center transition-colors"
              >
                <i className="fas fa-circle-notch"></i>
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-gray-700">
        <div className="container mx-auto px-4 py-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-gray-400 text-sm">
              © {new Date().getFullYear()} کافی نت و چاپ احناف. تمامی حقوق
              محفوظ است.
            </p>
            <div className="flex items-center gap-4 text-sm text-gray-400">
              <span>
                <i className="fas fa-phone ml-1 text-[#d4a853]"></i>
                09334989931
              </span>
              <span>
                <i className="fab fa-instagram ml-1 text-[#d4a853]"></i>
                @Chap_ahnaf
              </span>
              <span>
                <i className="fab fa-telegram-plane ml-1 text-[#d4a853]"></i>
                @Chap_ahnaf
              </span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
