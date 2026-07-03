/* ═══════════════════════════════════════════════════════════════════
   🌐 کافی نت و چاپ احناف — کد اصلی سایت
   ───────────────────────────────────────────────────────────────────
   ✏️ برای تغییر شماره تماس، متن‌ها، خدمات و اطلاعیه‌ها به فایل
      src/config.ts  برید — نیازی به دست زدن به این فایل نیست!
   ═══════════════════════════════════════════════════════════════════ */

import {
  Globe,
  Car,
  Landmark,
  GraduationCap,
  Printer,
  Phone,
  Send,
  MessageCircle,
  Clock,
  ShieldCheck,
  Zap,
  MapPin,
  ChevronLeft,
  Menu,
  X,
  Wifi,
  Monitor,
  BadgeCheck,
  Sparkles,
  Megaphone,
  ExternalLink,
  CalendarDays,
} from "lucide-react";
import { useEffect, useState } from "react";
import heroImage from "./assets/hero.jpg";
import {
  PHONE,
  INTL_PHONE,
  PHONE_DISPLAY,
  BUSINESS,
  MESSENGERS,
  SERVICES,
  ANNOUNCEMENTS_URL,
  DEFAULT_ANNOUNCEMENTS,
  type Announcement,
} from "./config";

/* ------------------------- نگاشت آیکون‌های خدمات ------------------------- */

const SERVICE_ICONS: Record<string, typeof Printer> = {
  printer: Printer,
  globe: Globe,
  car: Car,
  landmark: Landmark,
  graduation: GraduationCap,
};

const SERVICE_ACCENTS = [
  "from-amber-400/20 to-amber-600/5",
  "from-sky-400/20 to-sky-600/5",
  "from-emerald-400/20 to-emerald-600/5",
  "from-violet-400/20 to-violet-600/5",
  "from-rose-400/20 to-rose-600/5",
];

/* ------------------------------- داده‌های ثابت ------------------------------ */

const steps = [
  {
    num: "۱",
    icon: MessageCircle,
    title: "درخواست خود را بفرستید",
    desc: "از طریق واتساپ، تلگرام، ایتا یا بله پیام دهید یا تماس بگیرید.",
  },
  {
    num: "۲",
    icon: BadgeCheck,
    title: "تأیید و انجام کار",
    desc: "کارشناسان ما درخواست شما را بررسی کرده و در سریع‌ترین زمان انجام می‌دهند.",
  },
  {
    num: "۳",
    icon: Zap,
    title: "دریافت نتیجه",
    desc: "نتیجه کار، رسید یا فایل چاپی به‌صورت آنلاین یا حضوری تحویل شما می‌شود.",
  },
];

const features = [
  { icon: Clock, title: "پاسخگویی سریع", desc: "انجام کارها در کوتاه‌ترین زمان ممکن، بدون معطلی در صف" },
  { icon: ShieldCheck, title: "امانت‌داری کامل", desc: "اطلاعات و مدارک شما نزد ما کاملاً محرمانه می‌ماند" },
  { icon: Wifi, title: "شعبه مجازی", desc: "بدون نیاز به مراجعه حضوری، همه خدمات از راه دور" },
  { icon: Monitor, title: "تجهیزات حرفه‌ای", desc: "دستگاه‌های چاپ و کپی به‌روز با کیفیت بالا" },
];

const navLinks = [
  { label: "خانه", href: "#home" },
  { label: "خدمات", href: "#services" },
  { label: "اطلاع‌رسانی", href: "#news" },
  { label: "روند کار", href: "#steps" },
  { label: "چرا احناف؟", href: "#why" },
  { label: "تماس با ما", href: "#contact" },
];

/* --------------------------------- لوگو ---------------------------------- */

function Logo() {
  return (
    <div className="flex items-center gap-3">
      <div className="relative flex h-11 w-11 items-center justify-center rounded-2xl bg-navy-900 ring-2 ring-sand-400/60">
        <Monitor className="h-5 w-5 text-cream-100" />
        <Wifi className="absolute -top-1 left-1 h-3.5 w-3.5 text-sand-400" />
      </div>
      <div className="leading-tight">
        <div className="text-lg font-extrabold">{BUSINESS.name}</div>
        <div className="text-[11px] font-medium text-navy-900/60">{BUSINESS.subtitle}</div>
      </div>
    </div>
  );
}

/* --------------------------------- هدر ----------------------------------- */

function Header() {
  const [open, setOpen] = useState(false);
  return (
    <header className="sticky top-0 z-50 border-b border-cream-200/80 bg-cream-50/85 backdrop-blur-lg">
      <div className="mx-auto flex h-18 max-w-6xl items-center justify-between px-4 py-3">
        <Logo />
        <nav className="hidden items-center gap-6 text-sm font-semibold text-navy-900/75 md:flex">
          {navLinks.map((l) => (
            <a key={l.href} href={l.href} className="transition hover:text-sand-600">
              {l.label}
            </a>
          ))}
        </nav>
        <a
          href={`tel:${PHONE}`}
          className="hidden items-center gap-2 rounded-full bg-navy-900 px-5 py-2.5 text-sm font-bold text-cream-100 shadow-lg shadow-navy-900/20 transition hover:bg-navy-800 md:flex"
        >
          <Phone className="h-4 w-4" />
          <span dir="ltr">{PHONE_DISPLAY}</span>
        </a>
        <button
          className="rounded-xl border border-cream-200 p-2 md:hidden"
          onClick={() => setOpen(!open)}
          aria-label="منو"
        >
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>
      {open && (
        <nav className="border-t border-cream-200 bg-cream-50 px-4 pb-4 md:hidden">
          {navLinks.map((l) => (
            <a
              key={l.href}
              href={l.href}
              onClick={() => setOpen(false)}
              className="block border-b border-cream-100 py-3 text-sm font-semibold text-navy-900/80"
            >
              {l.label}
            </a>
          ))}
          <a
            href={`tel:${PHONE}`}
            className="mt-4 flex items-center justify-center gap-2 rounded-full bg-navy-900 px-5 py-3 text-sm font-bold text-cream-100"
          >
            <Phone className="h-4 w-4" />
            <span dir="ltr">{PHONE_DISPLAY}</span>
          </a>
        </nav>
      )}
    </header>
  );
}

/* --------------------------------- هیرو ---------------------------------- */

function Hero() {
  return (
    <section id="home" className="relative overflow-hidden">
      <div className="pointer-events-none absolute -top-32 left-1/2 h-96 w-[52rem] -translate-x-1/2 rounded-full bg-sand-400/25 blur-3xl" />
      <div className="mx-auto grid max-w-6xl items-center gap-12 px-4 pb-20 pt-14 lg:grid-cols-2 lg:pt-20">
        <div className="text-center lg:text-right">
          <span className="inline-flex items-center gap-2 rounded-full border border-sand-400/40 bg-cream-100 px-4 py-1.5 text-xs font-bold text-sand-600">
            <Sparkles className="h-3.5 w-3.5" />
            {BUSINESS.slogan}
          </span>
          <h1 className="mt-6 text-4xl font-black leading-tight sm:text-5xl lg:text-[3.4rem]">
            {BUSINESS.subtitle}
            <span className="relative mx-3 inline-block text-sand-600">
              {BUSINESS.name}
              <svg className="absolute -bottom-1 right-0 w-full" viewBox="0 0 120 8" fill="none">
                <path d="M2 6C30 2 90 2 118 6" stroke="#c9a876" strokeWidth="3" strokeLinecap="round" />
              </svg>
            </span>
          </h1>
          <p className="mx-auto mt-5 max-w-md text-base leading-8 text-navy-900/65 lg:mx-0">
            {BUSINESS.description}
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3 lg:justify-start">
            <a
              href={`tel:${PHONE}`}
              className="flex items-center gap-2 rounded-full bg-navy-900 px-7 py-3.5 text-sm font-bold text-cream-100 shadow-xl shadow-navy-900/25 transition hover:-translate-y-0.5 hover:bg-navy-800"
            >
              <Phone className="h-4 w-4" />
              تماس فوری
            </a>
            <a
              href="#services"
              className="flex items-center gap-1 rounded-full border-2 border-navy-900/15 bg-white/60 px-7 py-3.5 text-sm font-bold text-navy-900 transition hover:border-sand-500 hover:text-sand-600"
            >
              مشاهده خدمات
              <ChevronLeft className="h-4 w-4" />
            </a>
          </div>
          <div className="mt-8 flex items-center justify-center gap-6 text-xs font-semibold text-navy-900/55 lg:justify-start">
            <span className="flex items-center gap-1.5">
              <BadgeCheck className="h-4 w-4 text-sand-600" /> ۵ دسته خدمات
            </span>
            <span className="flex items-center gap-1.5">
              <Clock className="h-4 w-4 text-sand-600" /> پاسخگویی سریع
            </span>
            <span className="flex items-center gap-1.5">
              <ShieldCheck className="h-4 w-4 text-sand-600" /> کاملاً مطمئن
            </span>
          </div>
        </div>

        <div className="relative">
          <div className="absolute -inset-4 rounded-[2.5rem] bg-gradient-to-tr from-sand-400/40 via-cream-200 to-transparent blur-xl" />
          <img
            src={heroImage}
            alt={`محیط ${BUSINESS.fullName}`}
            className="relative w-full rounded-[2rem] border-4 border-white object-cover shadow-2xl shadow-navy-900/20"
          />
          <div className="absolute -bottom-6 right-6 flex items-center gap-3 rounded-2xl border border-cream-200 bg-white/95 px-5 py-3.5 shadow-xl backdrop-blur">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-sand-400/20">
              <Printer className="h-5 w-5 text-sand-600" />
            </div>
            <div>
              <div className="text-sm font-extrabold">چاپ با کیفیت</div>
              <div className="text-[11px] text-navy-900/55">بنر، تراکت، کارت ویزیت و…</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* -------------------------------- خدمات ---------------------------------- */

function Services() {
  return (
    <section id="services" className="relative bg-navy-950 py-20">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-40 bg-gradient-to-b from-sand-400/10 to-transparent" />
      <div className="mx-auto max-w-6xl px-4">
        <div className="text-center">
          <span className="text-xs font-bold tracking-wider text-sand-400">خدمات ما</span>
          <h2 className="mt-3 text-3xl font-black text-cream-50 sm:text-4xl">هر کاری داری، به ما بسپار</h2>
          <p className="mx-auto mt-4 max-w-xl text-sm leading-7 text-cream-100/60">
            از ثبت‌نام‌های اینترنتی تا چاپ کارت عروسی — همه خدمات زیر یک سقف، حضوری یا مجازی
          </p>
        </div>

        <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {SERVICES.map((s, i) => {
            const Icon = SERVICE_ICONS[s.icon] ?? Printer;
            const accent = SERVICE_ACCENTS[i % SERVICE_ACCENTS.length];
            return (
              <div
                key={s.title}
                className={`group relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-b ${accent} p-7 backdrop-blur transition hover:-translate-y-1 hover:border-sand-400/50`}
              >
                <div className="flex h-13 w-13 items-center justify-center rounded-2xl bg-white/10 p-3 ring-1 ring-white/15">
                  <Icon className="h-7 w-7 text-sand-400" />
                </div>
                <h3 className="mt-5 text-xl font-extrabold text-cream-50">{s.title}</h3>
                <p className="mt-1.5 text-xs text-cream-100/55">{s.desc}</p>
                <ul className="mt-5 space-y-2.5">
                  {s.items.map((item) => (
                    <li key={item} className="flex items-center gap-2 text-sm text-cream-100/80">
                      <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-sand-400" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            );
          })}

          <div className="flex flex-col items-center justify-center rounded-3xl border-2 border-dashed border-sand-400/40 bg-sand-400/5 p-7 text-center">
            <MessageCircle className="h-10 w-10 text-sand-400" />
            <h3 className="mt-4 text-lg font-extrabold text-cream-50">خدمت مورد نظرت رو پیدا نکردی؟</h3>
            <p className="mt-2 text-sm leading-7 text-cream-100/60">
              کافیه پیام بدی! تقریباً هر کار اینترنتی و اداری رو انجام می‌دیم.
            </p>
            <a
              href={`https://wa.me/98${PHONE.slice(1)}`}
              target="_blank"
              rel="noreferrer"
              className="mt-5 rounded-full bg-sand-500 px-6 py-2.5 text-sm font-bold text-navy-950 transition hover:bg-sand-400"
            >
              ارسال پیام در واتساپ
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ═════════════════════════ 📢 بخش اطلاع‌رسانی ═════════════════════════
   این بخش اطلاعیه‌ها رو از آدرسی که در config.ts گذاشتید
   (ANNOUNCEMENTS_URL) می‌خونه. اگر آدرس خالی باشه یا خطا بده،
   لیست پیش‌فرض DEFAULT_ANNOUNCEMENTS نمایش داده می‌شه.
   ═══════════════════════════════════════════════════════════════════ */

function normalizeAnnouncements(data: unknown): Announcement[] {
  if (!Array.isArray(data)) return [];
  return data
    .map((row): Announcement | null => {
      if (typeof row !== "object" || row === null) return null;
      const r = row as Record<string, unknown>;
      const title = String(r.title ?? r["عنوان"] ?? "").trim();
      const text = String(r.text ?? r["متن"] ?? "").trim();
      if (!title && !text) return null;
      return {
        title: title || "اطلاعیه",
        text,
        date: String(r.date ?? r["تاریخ"] ?? "").trim(),
        link: String(r.link ?? r["لینک"] ?? "").trim(),
      };
    })
    .filter((a): a is Announcement => a !== null);
}

function Announcements() {
  const [items, setItems] = useState<Announcement[]>(DEFAULT_ANNOUNCEMENTS);
  const [live, setLive] = useState(false);

  useEffect(() => {
    if (!ANNOUNCEMENTS_URL) return;
    fetch(ANNOUNCEMENTS_URL)
      .then((res) => {
        if (!res.ok) throw new Error("fetch failed");
        return res.json();
      })
      .then((data) => {
        const parsed = normalizeAnnouncements(data);
        if (parsed.length > 0) {
          setItems(parsed);
          setLive(true);
        }
      })
      .catch(() => {
        /* در صورت خطا، اطلاعیه‌های پیش‌فرض باقی می‌مونن */
      });
  }, []);

  return (
    <section id="news" className="bg-cream-100 py-20">
      <div className="mx-auto max-w-6xl px-4">
        <div className="flex flex-col items-center text-center">
          <span className="flex items-center gap-2 text-xs font-bold tracking-wider text-sand-600">
            <Megaphone className="h-4 w-4" />
            اطلاع‌رسانی
          </span>
          <h2 className="mt-3 text-3xl font-black sm:text-4xl">آخرین اخبار و اطلاعیه‌ها</h2>
          {live && (
            <span className="mt-3 flex items-center gap-1.5 rounded-full bg-emerald-100 px-3 py-1 text-[11px] font-bold text-emerald-700">
              <span className="h-2 w-2 animate-pulse rounded-full bg-emerald-500" />
              به‌روزرسانی خودکار فعال است
            </span>
          )}
        </div>

        <div className="mt-12 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {items.map((a, i) => (
            <article
              key={`${a.title}-${i}`}
              className="flex flex-col rounded-3xl border border-cream-200 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-lg"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-sand-400/15">
                  <Megaphone className="h-5 w-5 text-sand-600" />
                </div>
                {a.date && (
                  <span className="flex items-center gap-1 rounded-full bg-cream-100 px-3 py-1 text-[11px] font-bold text-navy-900/55">
                    <CalendarDays className="h-3 w-3" />
                    {a.date}
                  </span>
                )}
              </div>
              <h3 className="mt-4 font-extrabold">{a.title}</h3>
              <p className="mt-2 flex-1 text-sm leading-7 text-navy-900/65">{a.text}</p>
              {a.link && (
                <a
                  href={a.link}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-4 inline-flex items-center gap-1.5 text-xs font-bold text-sand-600 transition hover:text-sand-500"
                >
                  مشاهده جزئیات
                  <ExternalLink className="h-3.5 w-3.5" />
                </a>
              )}
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

/* -------------------------------- روند کار -------------------------------- */

function Steps() {
  return (
    <section id="steps" className="py-20">
      <div className="mx-auto max-w-6xl px-4">
        <div className="text-center">
          <span className="text-xs font-bold tracking-wider text-sand-600">شعبه مجازی چطور کار می‌کند؟</span>
          <h2 className="mt-3 text-3xl font-black sm:text-4xl">فقط در ۳ قدم ساده</h2>
        </div>
        <div className="relative mt-14 grid gap-10 md:grid-cols-3">
          <div className="pointer-events-none absolute inset-x-16 top-10 hidden border-t-2 border-dashed border-sand-400/50 md:block" />
          {steps.map((s) => (
            <div key={s.num} className="relative text-center">
              <div className="relative mx-auto flex h-20 w-20 items-center justify-center rounded-3xl bg-white shadow-lg shadow-navy-900/10 ring-1 ring-cream-200">
                <s.icon className="h-8 w-8 text-sand-600" />
                <span className="absolute -right-2 -top-2 flex h-8 w-8 items-center justify-center rounded-full bg-navy-900 text-sm font-black text-cream-100">
                  {s.num}
                </span>
              </div>
              <h3 className="mt-5 text-lg font-extrabold">{s.title}</h3>
              <p className="mx-auto mt-2 max-w-xs text-sm leading-7 text-navy-900/60">{s.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ------------------------------- چرا احناف؟ -------------------------------- */

function Why() {
  return (
    <section id="why" className="bg-cream-100 py-20">
      <div className="mx-auto max-w-6xl px-4">
        <div className="grid items-center gap-12 lg:grid-cols-2">
          <div>
            <span className="text-xs font-bold tracking-wider text-sand-600">چرا {BUSINESS.name}؟</span>
            <h2 className="mt-3 text-3xl font-black leading-snug sm:text-4xl">
              وقت شما ارزشمند است؛
              <br />
              کارهایتان را به ما بسپارید
            </h2>
            <p className="mt-5 max-w-md text-sm leading-8 text-navy-900/65">
              {BUSINESS.fullName} با سال‌ها تجربه در انجام امور اینترنتی و اداری، همراه مطمئن شما در
              تمامی ثبت‌نام‌ها، استعلام‌ها، پرداخت‌ها و خدمات چاپی است. با راه‌اندازی شعبه مجازی، دیگر
              نیازی به مراجعه حضوری ندارید.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <a
                href={`tel:${PHONE}`}
                className="flex items-center gap-2 rounded-full bg-sand-500 px-6 py-3 text-sm font-bold text-navy-950 shadow-lg shadow-sand-500/30 transition hover:bg-sand-400"
              >
                <Phone className="h-4 w-4" />
                <span dir="ltr">{PHONE_DISPLAY}</span>
              </a>
              <a
                href={`https://t.me/${INTL_PHONE}`}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-2 rounded-full border-2 border-navy-900/15 px-6 py-3 text-sm font-bold transition hover:border-sand-500 hover:text-sand-600"
              >
                <Send className="h-4 w-4" />
                پیام در تلگرام
              </a>
            </div>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            {features.map((f) => (
              <div
                key={f.title}
                className="rounded-3xl border border-cream-200 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-lg"
              >
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-sand-400/15">
                  <f.icon className="h-5.5 w-5.5 text-sand-600" />
                </div>
                <h3 className="mt-4 font-extrabold">{f.title}</h3>
                <p className="mt-1.5 text-xs leading-6 text-navy-900/60">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

/* --------------------------------- تماس ----------------------------------- */

function Contact() {
  return (
    <section id="contact" className="py-20">
      <div className="mx-auto max-w-6xl px-4">
        <div className="relative overflow-hidden rounded-[2.5rem] bg-navy-950 px-6 py-14 text-center sm:px-12">
          <div className="pointer-events-none absolute -top-24 left-1/2 h-64 w-[36rem] -translate-x-1/2 rounded-full bg-sand-400/20 blur-3xl" />
          <span className="relative text-xs font-bold tracking-wider text-sand-400">ارتباط با ما</span>
          <h2 className="relative mt-3 text-3xl font-black text-cream-50 sm:text-4xl">
            همین حالا پیام بده یا تماس بگیر
          </h2>
          <p className="relative mx-auto mt-4 max-w-lg text-sm leading-7 text-cream-100/60">
            در تمامی پیام‌رسان‌ها با شماره{" "}
            <span dir="ltr" className="font-bold text-sand-400">
              {PHONE_DISPLAY}
            </span>{" "}
            پاسخگوی شما هستیم.
          </p>

          <a
            href={`tel:${PHONE}`}
            dir="ltr"
            className="relative mt-8 inline-flex items-center gap-3 rounded-full border border-sand-400/40 bg-white/5 px-8 py-4 text-2xl font-black tracking-wide text-cream-50 backdrop-blur transition hover:border-sand-400 sm:text-3xl"
          >
            <Phone className="h-6 w-6 text-sand-400" />
            {PHONE_DISPLAY}
          </a>

          <div className="relative mt-8 flex flex-wrap items-center justify-center gap-3">
            {MESSENGERS.map((m) => (
              <a
                key={m.name}
                href={m.href}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-2 rounded-full bg-white/10 px-5 py-2.5 text-sm font-bold text-cream-100 ring-1 ring-white/15 transition hover:bg-sand-500 hover:text-navy-950"
              >
                <MessageCircle className="h-4 w-4" />
                {m.name}
              </a>
            ))}
          </div>

          <div className="relative mt-10 flex flex-wrap items-center justify-center gap-x-8 gap-y-3 text-xs font-semibold text-cream-100/50">
            <span className="flex items-center gap-1.5">
              <Clock className="h-4 w-4 text-sand-400" /> همه‌روزه پاسخگوی شما هستیم
            </span>
            <span className="flex items-center gap-1.5">
              <MapPin className="h-4 w-4 text-sand-400" /> خدمات حضوری و مجازی
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}

/* --------------------------------- فوتر ----------------------------------- */

function Footer() {
  return (
    <footer className="border-t border-cream-200 bg-cream-50 py-8">
      <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-5 px-4 sm:flex-row">
        <Logo />
        <p className="text-xs text-navy-900/50">
          © {new Date().getFullYear()} {BUSINESS.fullName} — تمامی حقوق محفوظ است.
        </p>
        <div className="flex items-center gap-4 text-xs font-bold text-navy-900/60">
          <a href={`tel:${PHONE}`} dir="ltr" className="transition hover:text-sand-600">
            {PHONE_DISPLAY}
          </a>
          <span className="text-cream-300">|</span>
          <a
            href={`https://t.me/${INTL_PHONE}`}
            target="_blank"
            rel="noreferrer"
            className="transition hover:text-sand-600"
          >
            تلگرام
          </a>
        </div>
      </div>
    </footer>
  );
}

/* ---------------------------------- App ----------------------------------- */

export default function App() {
  return (
    <div className="min-h-screen">
      <Header />
      <main>
        <Hero />
        <Services />
        <Announcements />
        <Steps />
        <Why />
        <Contact />
      </main>
      <Footer />
    </div>
  );
}
