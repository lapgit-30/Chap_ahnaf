export type ServiceFieldType = "text" | "number" | "select" | "boolean";

export interface ServiceField {
  key: string;
  label: string;
  type: ServiceFieldType;
  options?: string[];
  required?: boolean;
}

export interface ServiceDefinition {
  key: string;
  title: string;
  domain: "printshop" | "cafenet";
  fields: ServiceField[];
}

export const ORDER_STATUS_LABELS: Record<string, string> = {
  pending_review: "در انتظار بررسی",
  approved: "تأیید شده",
  in_progress: "در حال انجام",
  ready_for_pickup: "آماده تحویل",
  delivered: "تحویل داده شد",
  cancelled: "لغو شده",
};

export const PRINTSHOP_SERVICES: ServiceDefinition[] = [
  {
    key: "bw_print",
    title: "چاپ سیاه‌وسفید",
    domain: "printshop",
    fields: [
      { key: "pages", label: "تعداد صفحات", type: "number", required: true },
      { key: "size", label: "سایز کاغذ", type: "select", options: ["A4", "A5", "A3"], required: true },
      { key: "sides", label: "یک‌رو یا دورو", type: "select", options: ["یک‌رو", "دورو"], required: true },
    ],
  },
  {
    key: "color_print",
    title: "چاپ رنگی",
    domain: "printshop",
    fields: [
      { key: "pages", label: "تعداد صفحات", type: "number", required: true },
      { key: "size", label: "سایز کاغذ", type: "select", options: ["A4", "A5", "A3"], required: true },
      { key: "sides", label: "یک‌رو یا دورو", type: "select", options: ["یک‌رو", "دورو"], required: true },
    ],
  },
  {
    key: "photocopy",
    title: "فتوکپی",
    domain: "printshop",
    fields: [{ key: "pages", label: "تعداد صفحات", type: "number", required: true }],
  },
  {
    key: "photo_print",
    title: "چاپ عکس",
    domain: "printshop",
    fields: [
      { key: "size", label: "سایز", type: "select", options: ["10x15", "13x18", "20x30"], required: true },
      { key: "count", label: "تعداد", type: "number", required: true },
    ],
  },
  {
    key: "business_card",
    title: "کارت ویزیت",
    domain: "printshop",
    fields: [
      { key: "material", label: "جنس", type: "select", options: ["گلاسه", "کتان", "PVC"], required: true },
      { key: "coating", label: "روکش", type: "select", options: ["ندارد", "مات", "براق", "UV"], required: true },
      { key: "count", label: "تعداد", type: "number", required: true },
      { key: "size", label: "سایز", type: "select", options: ["8.5x4.8", "9x6"], required: true },
      { key: "sides", label: "یک‌رو یا دورو", type: "select", options: ["یک‌رو", "دورو"], required: true },
      { key: "design_mode", label: "طراحی", type: "select", options: ["فایل آماده", "نیاز به طراحی"], required: true },
    ],
  },
  {
    key: "flyer",
    title: "تراکت",
    domain: "printshop",
    fields: [
      { key: "size", label: "سایز", type: "select", options: ["A5", "A4", "A3"], required: true },
      { key: "count", label: "تعداد", type: "number", required: true },
    ],
  },
  {
    key: "brochure",
    title: "بروشور",
    domain: "printshop",
    fields: [
      { key: "fold_type", label: "نوع تا", type: "select", options: ["دو لت", "سه لت"], required: true },
      { key: "count", label: "تعداد", type: "number", required: true },
    ],
  },
  {
    key: "poster",
    title: "پوستر",
    domain: "printshop",
    fields: [
      { key: "size", label: "سایز", type: "select", options: ["A3", "A2", "A1"], required: true },
      { key: "count", label: "تعداد", type: "number", required: true },
    ],
  },
  {
    key: "banner",
    title: "بنر",
    domain: "printshop",
    fields: [
      { key: "length", label: "طول (سانتی‌متر)", type: "number", required: true },
      { key: "width", label: "عرض (سانتی‌متر)", type: "number", required: true },
      { key: "material", label: "جنس", type: "select", options: ["فلکس", "سولیت", "مش"], required: true },
      { key: "count", label: "تعداد", type: "number", required: true },
      { key: "grommet", label: "پانچ", type: "boolean", required: false },
    ],
  },
  { key: "label", title: "لیبل", domain: "printshop", fields: [{ key: "count", label: "تعداد", type: "number", required: true }] },
  { key: "letterhead", title: "سربرگ", domain: "printshop", fields: [{ key: "count", label: "تعداد", type: "number", required: true }] },
  { key: "envelope", title: "پاکت", domain: "printshop", fields: [{ key: "count", label: "تعداد", type: "number", required: true }] },
  { key: "thesis", title: "پایان‌نامه", domain: "printshop", fields: [{ key: "copies", label: "تعداد نسخه", type: "number", required: true }] },
  { key: "booklet", title: "جزوه", domain: "printshop", fields: [{ key: "pages", label: "تعداد صفحات", type: "number", required: true }] },
  { key: "book", title: "کتاب", domain: "printshop", fields: [{ key: "copies", label: "تعداد نسخه", type: "number", required: true }] },
  { key: "binding", title: "صحافی", domain: "printshop", fields: [{ key: "type", label: "نوع صحافی", type: "select", options: ["فنری", "چسب گرم", "سیمی"], required: true }] },
  { key: "laminate", title: "لمینت", domain: "printshop", fields: [{ key: "size", label: "سایز", type: "select", options: ["A4", "A3"], required: true }] },
  { key: "design", title: "طراحی", domain: "printshop", fields: [{ key: "delivery_time", label: "زمان تحویل", type: "select", options: ["عادی", "فوری"], required: true }] },
  { key: "print_other", title: "سایر", domain: "printshop", fields: [] },
];

export const CAFENET_SERVICES: ServiceDefinition[] = [
  {
    key: "print",
    title: "پرینت",
    domain: "cafenet",
    fields: [
      { key: "color", label: "رنگ", type: "select", options: ["رنگی", "سیاه‌وسفید"], required: true },
      { key: "pages", label: "تعداد صفحات", type: "number", required: true },
      { key: "sides", label: "یک‌رو یا دورو", type: "select", options: ["یک‌رو", "دورو"], required: true },
      { key: "paper_size", label: "سایز کاغذ", type: "select", options: ["A4", "A5", "A3"], required: true },
    ],
  },
  {
    key: "scan",
    title: "اسکن",
    domain: "cafenet",
    fields: [
      { key: "pages", label: "تعداد صفحات", type: "number", required: true },
      { key: "color", label: "رنگ", type: "select", options: ["رنگی", "سیاه‌وسفید"], required: true },
      { key: "format", label: "فرمت خروجی", type: "select", options: ["PDF", "JPG", "PNG"], required: true },
    ],
  },
  {
    key: "typing",
    title: "تایپ",
    domain: "cafenet",
    fields: [
      { key: "pages", label: "تعداد صفحات", type: "number", required: true },
      { key: "language", label: "زبان", type: "select", options: ["فارسی", "انگلیسی", "عربی"], required: true },
      { key: "delivery_time", label: "زمان تحویل", type: "select", options: ["عادی", "فوری"], required: true },
    ],
  },
  { key: "translation", title: "ترجمه", domain: "cafenet", fields: [{ key: "language_pair", label: "زبان مبدا/مقصد", type: "text", required: true }] },
  { key: "internet_registration", title: "ثبت‌نام اینترنتی", domain: "cafenet", fields: [] },
  { key: "government_services", title: "خدمات دولتی", domain: "cafenet", fields: [] },
  { key: "university_services", title: "خدمات دانشگاهی", domain: "cafenet", fields: [] },
  { key: "bill_payment", title: "پرداخت قبوض", domain: "cafenet", fields: [] },
  { key: "reservation", title: "رزروها", domain: "cafenet", fields: [] },
  { key: "cafenet_other", title: "سایر", domain: "cafenet", fields: [] },
];

export const ALL_SERVICES = [...PRINTSHOP_SERVICES, ...CAFENET_SERVICES];

export const SERVICE_BY_KEY = Object.fromEntries(ALL_SERVICES.map((item) => [item.key, item]));
