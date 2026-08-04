import {
  pgTable,
  serial,
  varchar,
  text,
  boolean,
  timestamp,
  integer,
  decimal,
  jsonb,
  uniqueIndex,
  pgEnum,
} from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";

// Enums
export const userRoleEnum = pgEnum("user_role", ["customer", "super_admin"]);
export const orderStatusEnum = pgEnum("order_status", [
  "pending_review",
  "confirmed",
  "in_progress",
  "ready_for_delivery",
  "delivered",
  "cancelled",
]);
export const paymentStatusEnum = pgEnum("payment_status", [
  "pending",
  "partial",
  "completed",
  "refunded",
]);
export const serviceCategoryTypeEnum = pgEnum("service_category_type", [
  "printing",
  "cafe",
]);

// Users table
export const users = pgTable(
  "users",
  {
    id: serial("id").primaryKey(),
    fullName: varchar("full_name", { length: 100 }).notNull(),
    username: varchar("username", { length: 50 }).notNull(),
    mobile: varchar("mobile", { length: 11 }).notNull(),
    passwordHash: text("password_hash").notNull(),
    role: userRoleEnum("role").default("customer").notNull(),
    isActive: boolean("is_active").default(true).notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (table) => ({
    usernameUnique: uniqueIndex("username_unique").on(table.username),
    mobileUnique: uniqueIndex("mobile_unique").on(table.mobile),
    singleSuperAdmin: uniqueIndex("single_super_admin")
      .on(table.role)
      .where(sql`${table.role} = 'super_admin'`),
  })
);

// OTP codes table
export const otpCodes = pgTable("otp_codes", {
  id: serial("id").primaryKey(),
  mobile: varchar("mobile", { length: 11 }).notNull(),
  code: varchar("code", { length: 6 }).notNull(),
  type: varchar("type", { length: 20 }).notNull(), // 'register' or 'login'
  expiresAt: timestamp("expires_at").notNull(),
  used: boolean("used").default(false).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// One-time server-side captcha challenges
export const captchaChallenges = pgTable("captcha_challenges", {
  id: varchar("id", { length: 64 }).primaryKey(),
  answerHash: varchar("answer_hash", { length: 64 }).notNull(),
  expiresAt: timestamp("expires_at").notNull(),
  used: boolean("used").default(false).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Service categories
export const serviceCategories = pgTable("service_categories", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 100 }).notNull(),
  nameEn: varchar("name_en", { length: 100 }).notNull(),
  type: serviceCategoryTypeEnum("type").notNull(),
  icon: varchar("icon", { length: 50 }),
  description: text("description"),
  isActive: boolean("is_active").default(true).notNull(),
  sortOrder: integer("sort_order").default(0),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Services
export const services = pgTable("services", {
  id: serial("id").primaryKey(),
  categoryId: integer("category_id")
    .references(() => serviceCategories.id)
    .notNull(),
  name: varchar("name", { length: 100 }).notNull(),
  nameEn: varchar("name_en", { length: 100 }).notNull(),
  description: text("description"),
  options: jsonb("options"), // Service-specific options
  basePrice: decimal("base_price", { precision: 10, scale: 2 }),
  isActive: boolean("is_active").default(true).notNull(),
  sortOrder: integer("sort_order").default(0),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Orders
export const orders = pgTable(
  "orders",
  {
    id: serial("id").primaryKey(),
    trackingCode: varchar("tracking_code", { length: 20 }).notNull(),
    userId: integer("user_id")
      .references(() => users.id)
      .notNull(),
    serviceId: integer("service_id")
      .references(() => services.id)
      .notNull(),
    status: orderStatusEnum("status").default("pending_review").notNull(),
    serviceName: varchar("service_name", { length: 100 }).notNull(),
    options: jsonb("options"),
    notes: text("notes"),
    totalAmount: decimal("total_amount", { precision: 10, scale: 2 }),
    depositAmount: decimal("deposit_amount", { precision: 10, scale: 2 }),
    remainingAmount: decimal("remaining_amount", { precision: 10, scale: 2 }),
    estimatedDelivery: timestamp("estimated_delivery"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (table) => ({
    trackingCodeUnique: uniqueIndex("orders_tracking_code_unique").on(
      table.trackingCode
    ),
  })
);

// Order files
export const orderFiles = pgTable("order_files", {
  id: serial("id").primaryKey(),
  orderId: integer("order_id")
    .references(() => orders.id)
    .notNull(),
  fileName: varchar("file_name", { length: 255 }).notNull(),
  fileOriginalName: varchar("file_original_name", { length: 255 }).notNull(),
  fileSize: integer("file_size"),
  mimeType: varchar("mime_type", { length: 100 }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Payments
export const payments = pgTable(
  "payments",
  {
    id: serial("id").primaryKey(),
    orderId: integer("order_id")
      .references(() => orders.id)
      .notNull(),
    amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
    status: paymentStatusEnum("status").default("pending").notNull(),
    authority: varchar("authority", { length: 100 }),
    transactionId: varchar("transaction_id", { length: 100 }),
    paymentMethod: varchar("payment_method", { length: 50 }),
    paidAt: timestamp("paid_at"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => ({
    authorityUnique: uniqueIndex("payments_authority_unique").on(
      table.authority
    ),
  })
);

// Site settings
export const siteSettings = pgTable(
  "site_settings",
  {
    id: serial("id").primaryKey(),
    key: varchar("key", { length: 100 }).notNull(),
    value: text("value"),
    description: text("description"),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (table) => ({
    keyUnique: uniqueIndex("site_settings_key_unique").on(table.key),
  })
);

// Contact requests submitted by customers
export const contactMessages = pgTable("contact_messages", {
  id: serial("id").primaryKey(),
  fullName: varchar("full_name", { length: 100 }).notNull(),
  mobile: varchar("mobile", { length: 11 }).notNull(),
  subject: varchar("subject", { length: 40 }).notNull(),
  message: text("message").notNull(),
  isRead: boolean("is_read").default(false).notNull(),
  ipAddress: varchar("ip_address", { length: 45 }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Activity logs
export const activityLogs = pgTable("activity_logs", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id),
  action: varchar("action", { length: 100 }).notNull(),
  details: jsonb("details"),
  ipAddress: varchar("ip_address", { length: 45 }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Login attempts for rate limiting
export const loginAttempts = pgTable("login_attempts", {
  id: serial("id").primaryKey(),
  mobile: varchar("mobile", { length: 11 }).notNull(),
  success: boolean("success").default(false).notNull(),
  ipAddress: varchar("ip_address", { length: 45 }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type Order = typeof orders.$inferSelect;
export type Service = typeof services.$inferSelect;
export type ServiceCategory = typeof serviceCategories.$inferSelect;
