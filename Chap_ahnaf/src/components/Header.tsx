"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

interface User {
  id: number;
  fullName: string;
  username: string;
  mobile: string;
  role: string;
}

export default function Header() {
  const [user, setUser] = useState<User | null>(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("token");
    const userData = localStorage.getItem("user");
    if (token && userData) {
      try {
        setUser(JSON.parse(userData));
      } catch {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
      }
    }

    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
    window.location.href = "/";
  };

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled
          ? "bg-[#1a2744]/95 backdrop-blur-md shadow-lg"
          : "bg-[#1a2744]"
      }`}
    >
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3">
            <div className="w-12 h-12 bg-[#d4a853] rounded-full flex items-center justify-center">
              <i className="fas fa-print text-white text-xl"></i>
            </div>
            <div className="text-white">
              <h1 className="text-xl font-bold">احناف</h1>
              <p className="text-xs text-gray-300">کافی نت و چاپ</p>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-8">
            <Link
              href="/"
              className="text-white hover:text-[#d4a853] transition-colors"
            >
              صفحه اصلی
            </Link>
            <Link
              href="/services"
              className="text-white hover:text-[#d4a853] transition-colors"
            >
              خدمات
            </Link>
            <Link
              href="/track"
              className="text-white hover:text-[#d4a853] transition-colors"
            >
              پیگیری سفارش
            </Link>
            <Link
              href="/contact"
              className="text-white hover:text-[#d4a853] transition-colors"
            >
              تماس با ما
            </Link>
          </nav>

          {/* Auth Buttons */}
          <div className="hidden md:flex items-center gap-4">
            {user ? (
              <div className="flex items-center gap-4">
                <Link
                  href="/dashboard"
                  className="text-white hover:text-[#d4a853] transition-colors"
                >
                  <i className="fas fa-user ml-2"></i>
                  {user.fullName}
                </Link>
                <button
                  onClick={handleLogout}
                  className="text-gray-300 hover:text-red-400 transition-colors"
                >
                  <i className="fas fa-sign-out-alt"></i>
                </button>
              </div>
            ) : (
              <>
                <Link
                  href="/login"
                  className="text-white hover:text-[#d4a853] transition-colors"
                >
                  ورود
                </Link>
                <Link
                  href="/register"
                  className="bg-[#d4a853] hover:bg-[#c99d48] text-white px-4 py-2 rounded-lg transition-colors"
                >
                  ثبت‌نام
                </Link>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden text-white text-2xl"
          >
            <i className={`fas ${isMenuOpen ? "fa-times" : "fa-bars"}`}></i>
          </button>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden bg-[#1a2744] border-t border-gray-700 py-4 animate-fadeIn">
            <nav className="flex flex-col gap-4">
              <Link
                href="/"
                className="text-white hover:text-[#d4a853] px-4 py-2 transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                صفحه اصلی
              </Link>
              <Link
                href="/services"
                className="text-white hover:text-[#d4a853] px-4 py-2 transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                خدمات
              </Link>
              <Link
                href="/track"
                className="text-white hover:text-[#d4a853] px-4 py-2 transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                پیگیری سفارش
              </Link>
              <Link
                href="/contact"
                className="text-white hover:text-[#d4a853] px-4 py-2 transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                تماس با ما
              </Link>
              <hr className="border-gray-700" />
              {user ? (
                <>
                  <Link
                    href="/dashboard"
                    className="text-white hover:text-[#d4a853] px-4 py-2 transition-colors"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <i className="fas fa-user ml-2"></i>
                    پنل کاربری
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="text-red-400 hover:text-red-300 px-4 py-2 text-right transition-colors"
                  >
                    <i className="fas fa-sign-out-alt ml-2"></i>
                    خروج
                  </button>
                </>
              ) : (
                <>
                  <Link
                    href="/login"
                    className="text-white hover:text-[#d4a853] px-4 py-2 transition-colors"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    ورود
                  </Link>
                  <Link
                    href="/register"
                    className="bg-[#d4a853] hover:bg-[#c99d48] text-white px-4 py-2 rounded-lg text-center transition-colors"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    ثبت‌نام
                  </Link>
                </>
              )}
            </nav>
          </div>
        )}
      </div>
    </header>
  );
}
