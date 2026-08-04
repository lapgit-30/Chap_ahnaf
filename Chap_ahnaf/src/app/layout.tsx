import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "کافی نت و چاپ احناف | شعبه مجازی",
  description:
    "شعبه مجازی کافی نت و چاپ احناف - خدمات چاپ دیجیتال، کارت ویزیت، تراکت، بنر، پوستر و خدمات کافی‌نت",
  keywords: [
    "چاپ",
    "چاپخانه",
    "کافی‌نت",
    "کارت ویزیت",
    "تراکت",
    "بنر",
    "پوستر",
    "پرینت",
    "صحافی",
    "لمینت",
    "تایپ",
    "ترجمه",
    "احناف",
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fa" dir="rtl">
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Vazirmatn:wght@100;200;300;400;500;600;700;800;900&display=swap"
          rel="stylesheet"
        />
        <link
          rel="stylesheet"
          href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css"
        />
      </head>
      <body className="bg-gray-50 min-h-screen">{children}</body>
    </html>
  );
}
