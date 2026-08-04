import {
  boolean,
  integer,
  jsonb,
  pgEnum,
  pgTable,
  serial,
  text,
  timestamp,
  uniqueIndex,
  varchar,
} from "drizzle-orm/pg-core";

export const userRoleEnum = pgEnum("user_role", ["customer", "admin"]);

export const otpPurposeEnum = pgEnum("otp_purpose", ["register", "login"]);

export const orderDomainEnum = pgEnum("order_domain", ["printshop", "cafenet"]);

export const orderStatusEnum = pgEnum("order_status", [
  "pending_review",
  "approved",
  "in_progress",
  "ready_for_pickup",
  "delivered",
  "cancelled",
]);

export const paymentStatusEnum = pgEnum("payment_status", ["pending", "paid", "failed"]);

export const users = pgTable(
  "users",
  {
    id: serial("id").primaryKey(),
    fullName: varchar("full_name", { length: 180 }).notNull(),
    username: varchar("username", { length: 60 }).notNull(),
    mobile: varchar("mobile", { length: 20 }).notNull(),
    passwordHash: text("password_hash"),
    role: userRoleEnum("role").notNull().default("customer"),
    isActive: boolean("is_active").notNull().default(true),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => ({
    usernameUnique: uniqueIndex("users_username_unique").on(t.username),
    mobileUnique: uniqueIndex("users_mobile_unique").on(t.mobile),
  }),
);

export const captchaChallenges = pgTable(
  "captcha_challenges",
  {
    id: serial("id").primaryKey(),
    token: varchar("token", { length: 80 }).notNull(),
    answerHash: text("answer_hash").notNull(),
    expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
    usedAt: timestamp("used_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => ({
    tokenUnique: uniqueIndex("captcha_token_unique").on(t.token),
  }),
);

export const otpCodes = pgTable("otp_codes", {
  id: serial("id").primaryKey(),
  mobile: varchar("mobile", { length: 20 }).notNull(),
  username: varchar("username", { length: 60 }).notNull(),
  purpose: otpPurposeEnum("purpose").notNull(),
  codeHash: text("code_hash").notNull(),
  expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
  usedAt: timestamp("used_at", { withTimezone: true }),
  attempts: integer("attempts").notNull().default(0),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const sessions = pgTable(
  "sessions",
  {
    id: serial("id").primaryKey(),
    userId: integer("user_id")
      .references(() => users.id, { onDelete: "cascade" })
      .notNull(),
    tokenHash: text("token_hash").notNull(),
    expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
    lastSeenAt: timestamp("last_seen_at", { withTimezone: true }).notNull().defaultNow(),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => ({
    tokenHashUnique: uniqueIndex("sessions_token_hash_unique").on(t.tokenHash),
  }),
);

export const orders = pgTable(
  "orders",
  {
    id: serial("id").primaryKey(),
    trackingCode: varchar("tracking_code", { length: 24 }).notNull(),
    userId: integer("user_id")
      .references(() => users.id, { onDelete: "cascade" })
      .notNull(),
    domain: orderDomainEnum("domain").notNull(),
    serviceKey: varchar("service_key", { length: 80 }).notNull(),
    serviceTitle: varchar("service_title", { length: 120 }).notNull(),
    details: jsonb("details").notNull().$type<Record<string, string | number | boolean>>(),
    notes: text("notes"),
    filePath: text("file_path"),
    status: orderStatusEnum("status").notNull().default("pending_review"),
    depositAmount: integer("deposit_amount"),
    totalAmount: integer("total_amount"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => ({
    trackingCodeUnique: uniqueIndex("orders_tracking_code_unique").on(t.trackingCode),
  }),
);

export const payments = pgTable("payments", {
  id: serial("id").primaryKey(),
  orderId: integer("order_id")
    .references(() => orders.id, { onDelete: "cascade" })
    .notNull(),
  amount: integer("amount").notNull(),
  status: paymentStatusEnum("status").notNull().default("pending"),
  refCode: varchar("ref_code", { length: 80 }),
  paidAt: timestamp("paid_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const adminActivityLogs = pgTable("admin_activity_logs", {
  id: serial("id").primaryKey(),
  adminUserId: integer("admin_user_id")
    .references(() => users.id, { onDelete: "set null" }),
  action: varchar("action", { length: 180 }).notNull(),
  meta: jsonb("meta").$type<Record<string, unknown>>(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const siteSettings = pgTable("site_settings", {
  key: varchar("key", { length: 80 }).primaryKey(),
  value: jsonb("value").notNull().$type<Record<string, unknown>>(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});
