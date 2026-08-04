# سامانه سفارش آنلاین چاپ دیجیتال احناف

این پروژه با **Next.js (App Router)**، **TypeScript**، **Tailwind CSS**، **PostgreSQL** و **Drizzle ORM** پیاده‌سازی شده است.

## امکانات

- سایت اصلی مشتری (صفحه اصلی، خدمات، احراز هویت OTP/Captcha، ثبت سفارش، پیگیری سفارش، تماس با ما)
- پنل مدیریت جداگانه در مسیر `/admin` (غیرنمایش در منوی سایت)
- نقش‌ها: `customer` و `admin` (فقط Super Admin)
- ثبت سفارش هوشمند بر اساس نوع خدمت
- آپلود فایل اختیاری با محدودیت نوع/حجم
- تولید کد رهگیری سفارش
- مدیریت وضعیت سفارش‌ها و تعیین بیعانه
- پرداخت بیعانه آنلاین (ثبت پرداخت)
- لاگ فعالیت مدیر
- CSRF Protection، هش داده‌های حساس، محدودیت تلاش OTP و کنترل ورودی

## پیش‌نیازها

- Node.js 20+
- PostgreSQL 14+

## متغیرهای محیطی

فایل `.env` را تنظیم کنید:

```env
DATABASE_URL=postgresql://postgres:postgres@127.0.0.1:5432/app_db
SUPERADMIN_USERNAME=superadmin
SUPERADMIN_PASSWORD=ChangeThisStrongPassword
OTP_EXPOSE_CODE=true
```

> در محیط واقعی، `OTP_EXPOSE_CODE` را غیرفعال کرده و OTP را به سرویس پیامک متصل کنید.

## نصب و اجرا

```bash
npm install
npx drizzle-kit push
npm run build
npm run start
```

## مسیرها

- `/` صفحه اصلی
- `/auth` ورود/ثبت‌نام مشتری
- `/order/new` ثبت سفارش
- `/order/track` پیگیری سفارش
- `/account` پنل مشتری
- `/admin/login` ورود مدیر
- `/admin` داشبورد مدیریت

## نکات امنیتی

- کوکی نشست با `HttpOnly` و `SameSite=Strict`
- اعتبارسنجی CSRF برای عملیات حساس
- محدودیت فرمت و حجم فایل
- جلوگیری از ورود داده ناامن با sanitize و validation
- نگهداری فعالیت‌های مدیریتی در `admin_activity_logs`

## استقرار Production

- پیشنهاد: Docker + Nginx + Linux
- قبل از استقرار: `npm run build` و بررسی سلامت `/api/health`
