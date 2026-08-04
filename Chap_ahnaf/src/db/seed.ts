import { db } from "./index";
import { users, serviceCategories, services, siteSettings } from "./schema";
import { hashPassword } from "@/lib/auth";
import { eq } from "drizzle-orm";

async function seed() {
  console.log("Starting database seed...");

  // Create the single Super Admin only from environment configuration.
  const isProduction = process.env.NODE_ENV === "production";
  const adminUsername = process.env.SUPER_ADMIN_USERNAME || (!isProduction ? "admin" : "");
  const adminPasswordValue = process.env.SUPER_ADMIN_PASSWORD || (!isProduction ? "admin123456" : "");
  const adminMobile = process.env.SUPER_ADMIN_MOBILE || (!isProduction ? "09123456789" : "");
  const adminFullName = process.env.SUPER_ADMIN_FULL_NAME || "مدیر سیستم";
  if (!adminUsername || adminPasswordValue.length < 12 || !/^09\d{9}$/.test(adminMobile)) {
    throw new Error("SUPER_ADMIN_USERNAME, SUPER_ADMIN_PASSWORD (12+ chars), and SUPER_ADMIN_MOBILE are required");
  }
  const existingAdmin = await db
    .select()
    .from(users)
    .where(eq(users.role, "super_admin"))
    .limit(1);

  if (!existingAdmin.length) {
    await db.insert(users).values({
      fullName: adminFullName,
      username: adminUsername,
      mobile: adminMobile,
      passwordHash: await hashPassword(adminPasswordValue),
      role: "super_admin",
    });
    console.log("Super admin created from environment configuration");
  } else {
    console.log("Super admin already exists");
  }

  // Create service categories
  const printingCategory = await db
    .select()
    .from(serviceCategories)
    .where(eq(serviceCategories.nameEn, "printing"))
    .limit(1);

  if (!printingCategory.length) {
    await db.insert(serviceCategories).values([
      {
        name: "خدمات چاپ",
        nameEn: "printing",
        type: "printing",
        icon: "printer",
        description: "خدمات چاپ سیاه‌وسفید، رنگی، فتوکپی و چاپ عکس",
        sortOrder: 1,
      },
      {
        name: "طراحی و تبلیغات",
        nameEn: "design",
        type: "printing",
        icon: "palette",
        description: "طراحی کارت ویزیت، تراکت، بروشور و بنر",
        sortOrder: 2,
      },
      {
        name: "صحافی و لمینت",
        nameEn: "binding",
        type: "printing",
        icon: "book",
        description: "صحافی، لمینت و آماده‌سازی مدارک",
        sortOrder: 3,
      },
      {
        name: "خدمات اینترنتی",
        nameEn: "internet",
        type: "cafe",
        icon: "globe",
        description: "خدمات اینترنتی و آنلاین",
        sortOrder: 4,
      },
      {
        name: "خدمات دولتی",
        nameEn: "government",
        type: "cafe",
        icon: "building",
        description: "ثبت‌نام اینترنتی و خدمات دولتی",
        sortOrder: 5,
      },
      {
        name: "خدمات دانشگاهی",
        nameEn: "university",
        type: "cafe",
        icon: "graduation-cap",
        description: "خدمات مرتبط با دانشگاه",
        sortOrder: 6,
      },
      {
        name: "تایپ و ترجمه",
        nameEn: "typing",
        type: "cafe",
        icon: "keyboard",
        description: "تایپ و ترجمه متون",
        sortOrder: 7,
      },
      {
        name: "سایر خدمات",
        nameEn: "other",
        type: "cafe",
        icon: "ellipsis-h",
        description: "سایر خدمات کافی‌نت",
        sortOrder: 8,
      },
    ]);
    console.log("Service categories created");
  }

  // Get categories for service creation
  const categories = await db.select().from(serviceCategories);

  // Create services
  const existingServices = await db.select().from(services);
  if (existingServices.length === 0) {
    const printingCat = categories.find((c) => c.nameEn === "printing");
    const designCat = categories.find((c) => c.nameEn === "design");
    const bindingCat = categories.find((c) => c.nameEn === "binding");
    const internetCat = categories.find((c) => c.nameEn === "internet");
    const governmentCat = categories.find((c) => c.nameEn === "government");
    const universityCat = categories.find((c) => c.nameEn === "university");
    const typingCat = categories.find((c) => c.nameEn === "typing");
    const otherCat = categories.find((c) => c.nameEn === "other");

    const servicesData = [
      // Printing services
      {
        categoryId: printingCat!.id,
        name: "چاپ سیاه‌وسفید",
        nameEn: "bw_print",
        description: "چاپ سیاه‌وسفید روی کاغذ A4 و A3",
        options: JSON.stringify({
          paperSize: ["A4", "A3"],
          sided: ["یک‌رو", "دورو"],
          paperType: ["معمولی", "گلاسه"],
        }),
        basePrice: "500",
        sortOrder: 1,
      },
      {
        categoryId: printingCat!.id,
        name: "چاپ رنگی",
        nameEn: "color_print",
        description: "چاپ رنگی روی کاغذ A4 و A3",
        options: JSON.stringify({
          paperSize: ["A4", "A3"],
          sided: ["یک‌رو", "دورو"],
          paperType: ["معمولی", "گلاسه"],
        }),
        basePrice: "2000",
        sortOrder: 2,
      },
      {
        categoryId: printingCat!.id,
        name: "فتوکپی",
        nameEn: "photocopy",
        description: "فتوکپی سیاه‌وسفید و رنگی",
        options: JSON.stringify({
          color: ["سیاه‌وسفید", "رنگی"],
          paperSize: ["A4", "A3"],
          sided: ["یک‌رو", "دورو"],
        }),
        basePrice: "300",
        sortOrder: 3,
      },
      {
        categoryId: printingCat!.id,
        name: "چاپ عکس",
        nameEn: "photo_print",
        description: "چاپ عکس با کیفیت بالا",
        options: JSON.stringify({
          paperSize: ["9×12", "10×15", "13×18", "20×30", "30×40"],
          paperType: ["معمولی", "گلاسه", "متالیک"],
        }),
        basePrice: "5000",
        sortOrder: 4,
      },
      // Design services
      {
        categoryId: designCat!.id,
        name: "کارت ویزیت",
        nameEn: "business_card",
        description: "طراحی و چاپ کارت ویزیت",
        options: JSON.stringify({
          material: ["کاغذی", "پی وی سی", "پلاستیکی"],
          coating: ["بدون روکش", "سلوفان مات", "سلوفان براق", "لمینت"],
          size: ["8.5×5.5 سانتی‌متر"],
          sided: ["یک‌رو", "دورو"],
          design: ["طراحی جدید", "فایل آماده"],
        }),
        basePrice: "50000",
        sortOrder: 5,
      },
      {
        categoryId: designCat!.id,
        name: "تراکت",
        nameEn: "flyer",
        description: "طراحی و چاپ تراکت",
        options: JSON.stringify({
          paperSize: ["A5", "A4", "A3"],
          material: ["گراماژ 135", "گراماژ 170", "گراماژ 250"],
          sided: ["یک‌رو", "دورو"],
          coating: ["بدون روکش", "سلوفان مات", "سلوفان براق"],
          design: ["طراحی جدید", "فایل آماده"],
        }),
        basePrice: "30000",
        sortOrder: 6,
      },
      {
        categoryId: designCat!.id,
        name: "بروشور",
        nameEn: "brochure",
        description: "طراحی و چاپ بروشور",
        options: JSON.stringify({
          paperSize: ["A4", "A3"],
          material: ["گراماژ 170", "گراماژ 250"],
          folding: ["تک تا", "دو تا", "سه تا"],
          coating: ["سلوفان مات", "سلوفان براق"],
          design: ["طراحی جدید", "فایل آماده"],
        }),
        basePrice: "100000",
        sortOrder: 7,
      },
      {
        categoryId: designCat!.id,
        name: "پوستر",
        nameEn: "poster",
        description: "طراحی و چاپ پوستر",
        options: JSON.stringify({
          paperSize: ["40×60", "50×70", "70×100"],
          material: ["گلاسه", "کاغذ معمولی"],
          coating: ["سلوفان مات", "سلوفان براق"],
          design: ["طراحی جدید", "فایل آماده"],
        }),
        basePrice: "150000",
        sortOrder: 8,
      },
      {
        categoryId: designCat!.id,
        name: "بنر",
        nameEn: "banner",
        description: "طراحی و چاپ بنر",
        options: JSON.stringify({
          width: ["1 متر", "1.5 متر", "2 متر", "3 متر"],
          length: ["1 متر", "2 متر", "3 متر", "5 متر"],
          material: ["بنر فلکسی", "بنر مش mesh", "استیکر"],
          punching: ["بدون پانچ", "با پانچ"],
          design: ["طراحی جدید", "فایل آماده"],
        }),
        basePrice: "500000",
        sortOrder: 9,
      },
      {
        categoryId: designCat!.id,
        name: "لیبل",
        nameEn: "label",
        description: "چاپ لیبل و برچسب",
        options: JSON.stringify({
          material: ["کاغذی", "پی وی سی", "شیشه‌ای"],
          size: ["3×2", "5×3", "7×4", "سفارشی"],
          coating: ["سلوفان مات", "سلوفان براق"],
          design: ["طراحی جدید", "فایل آماده"],
        }),
        basePrice: "100000",
        sortOrder: 10,
      },
      {
        categoryId: designCat!.id,
        name: "سربرگ",
        nameEn: "letterhead",
        description: "طراحی و چاپ سربرگ",
        options: JSON.stringify({
          paperSize: ["A4"],
          material: ["گراماژ 120", "گراماژ 170"],
          design: ["طراحی جدید", "فایل آماده"],
        }),
        basePrice: "200000",
        sortOrder: 11,
      },
      {
        categoryId: designCat!.id,
        name: "پاکت",
        nameEn: "envelope",
        description: "چاپ پاکت",
        options: JSON.stringify({
          size: ["پاکت A4", "پاکت ملخی"],
          material: ["گراماژ 80", "گراماژ 100"],
          design: ["طراحی جدید", "فایل آماده"],
        }),
        basePrice: "50000",
        sortOrder: 12,
      },
      // Binding services
      {
        categoryId: bindingCat!.id,
        name: "پایان‌نامه",
        nameEn: "thesis",
        description: "چاپ و صحافی پایان‌نامه",
        options: JSON.stringify({
          bindingType: ["صحافی فنری", "صحافی چسبی", "صحافی گالینگور"],
          cover: ["جلد سخت", "جلد نرم"],
          sided: ["یک‌رو", "دورو"],
          color: ["سیاه‌وسفید", "رنگی"],
        }),
        basePrice: "200000",
        sortOrder: 13,
      },
      {
        categoryId: bindingCat!.id,
        name: "جزوه",
        nameEn: "booklet",
        description: "چاپ و صحافی جزوه",
        options: JSON.stringify({
          bindingType: ["صحافی فنری", "صحافی چسبی"],
          sided: ["یک‌رو", "دورو"],
          color: ["سیاه‌وسفید", "رنگی"],
        }),
        basePrice: "100000",
        sortOrder: 14,
      },
      {
        categoryId: bindingCat!.id,
        name: "کتاب",
        nameEn: "book",
        description: "چاپ و صحافی کتاب",
        options: JSON.stringify({
          bindingType: ["صحافی چسبی", "صحافی گالینگور"],
          cover: ["جلد سخت", "جلد نرم"],
          sided: ["یک‌رو", "دورو"],
          color: ["سیاه‌وسفید", "رنگی"],
        }),
        basePrice: "300000",
        sortOrder: 15,
      },
      {
        categoryId: bindingCat!.id,
        name: "صحافی",
        nameEn: "binding",
        description: "صحافی مدارک",
        options: JSON.stringify({
          bindingType: ["صحافی فنری", "صحافی چسبی", "صحافی گالینگور"],
          cover: ["جلد سخت", "جلد نرم", "بدون جلد"],
        }),
        basePrice: "50000",
        sortOrder: 16,
      },
      {
        categoryId: bindingCat!.id,
        name: "لمینت",
        nameEn: "lamination",
        description: "لمینت مدارک و عکس",
        options: JSON.stringify({
          paperSize: ["A4", "A3", "A2"],
          type: ["لمینت مات", "لمینت براق"],
          thickness: ["75 میکرون", "100 میکرون", "125 میکرون"],
        }),
        basePrice: "20000",
        sortOrder: 17,
      },
      // Cafe services
      {
        categoryId: internetCat!.id,
        name: "پرینت",
        nameEn: "cafe_print",
        description: "پرینت از فایل مشتری",
        options: JSON.stringify({
          color: ["سیاه‌وسفید", "رنگی"],
          paperSize: ["A4", "A3"],
          sided: ["یک‌رو", "دورو"],
        }),
        basePrice: "1000",
        sortOrder: 18,
      },
      {
        categoryId: internetCat!.id,
        name: "اسکن",
        nameEn: "scan",
        description: "اسکن مدارک",
        options: JSON.stringify({
          color: ["سیاه‌وسفید", "رنگی"],
          format: ["PDF", "JPG", "TIFF"],
        }),
        basePrice: "2000",
        sortOrder: 19,
      },
      {
        categoryId: typingCat!.id,
        name: "تایپ",
        nameEn: "typing",
        description: "تایپ متون فارسی و انگلیسی",
        options: JSON.stringify({
          language: ["فارسی", "انگلیسی", "مختلط"],
          deliveryTime: ["عادی", "فوری"],
        }),
        basePrice: "5000",
        sortOrder: 20,
      },
      {
        categoryId: typingCat!.id,
        name: "ترجمه",
        nameEn: "translation",
        description: "ترجمه متون",
        options: JSON.stringify({
          language: ["انگلیسی به فارسی", "فارسی به انگلیسی"],
          type: ["ترجمه معمولی", "ترجمه تخصصی"],
          deliveryTime: ["عادی", "فوری"],
        }),
        basePrice: "50000",
        sortOrder: 21,
      },
      {
        categoryId: governmentCat!.id,
        name: "ثبت‌نام اینترنتی",
        nameEn: "online_registration",
        description: "ثبت‌نام اینترنتی سازمان‌ها و نهادها",
        options: null,
        basePrice: "50000",
        sortOrder: 22,
      },
      {
        categoryId: governmentCat!.id,
        name: "خدمات دولتی",
        nameEn: "government_services",
        description: "انجام خدمات دولتی",
        options: null,
        basePrice: "100000",
        sortOrder: 23,
      },
      {
        categoryId: universityCat!.id,
        name: "خدمات دانشگاهی",
        nameEn: "university_services",
        description: "انجام خدمات دانشگاهی",
        options: null,
        basePrice: "50000",
        sortOrder: 24,
      },
      {
        categoryId: otherCat!.id,
        name: "پرداخت قبوض",
        nameEn: "bill_payment",
        description: "پرداخت قبوض",
        options: null,
        basePrice: "0",
        sortOrder: 25,
      },
      {
        categoryId: otherCat!.id,
        name: "سایر خدمات",
        nameEn: "other_services",
        description: "سایر خدمات کافی‌نت",
        options: null,
        basePrice: "0",
        sortOrder: 26,
      },
    ];

    await db.insert(services).values(servicesData);
    console.log("Services created");
  }

  // Create default settings
  const existingSettings = await db.select().from(siteSettings);
  if (existingSettings.length === 0) {
    await db.insert(siteSettings).values([
      { key: "site_name", value: "کافی نت و چاپ احناف", description: "نام سایت" },
      { key: "site_description", value: "شعبه مجازی کافی نت و چاپ احناف", description: "توضیحات سایت" },
      { key: "phone", value: "09334989931", description: "شماره تماس" },
      { key: "instagram", value: "@Chap_ahnaf", description: "آیدی اینستاگرام" },
      { key: "telegram", value: "@Chap_ahnaf", description: "آیدی تلگرام" },
      { key: "address", value: "آدرس چاپخانه", description: "آدرس" },
      { key: "working_hours", value: "8 صبح تا 10 شب", description: "ساعات کاری" },
      { key: "default_deposit_percent", value: "50", description: "درصد پیش‌فرض بیعانه" },
      { key: "min_deposit_percent", value: "30", description: "حداقل درصد بیعانه" },
    ]);
    console.log("Default settings created");
  }

  console.log("Seed completed successfully!");
}

seed().catch((error) => {
  console.error("Seed failed:", error);
  process.exit(1);
});
