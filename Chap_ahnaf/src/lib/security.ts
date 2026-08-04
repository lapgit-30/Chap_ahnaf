import { randomBytes, createHash } from "crypto";
import bcrypt from "bcryptjs";

export const SESSION_COOKIE = "ahnaf_session";
export const CSRF_COOKIE = "ahnaf_csrf";

export function sha256(value: string) {
  return createHash("sha256").update(value).digest("hex");
}

export function generateToken(size = 32) {
  return randomBytes(size).toString("hex");
}

export async function hashSecret(value: string) {
  return bcrypt.hash(value, 12);
}

export async function compareSecret(value: string, hash: string) {
  return bcrypt.compare(value, hash);
}

export function generateOtpCode() {
  return `${Math.floor(100000 + Math.random() * 900000)}`;
}

export function sanitizeText(value: string, maxLength = 500) {
  return value.replace(/[<>]/g, "").trim().slice(0, maxLength);
}

export function normalizeMobile(value: string) {
  const digits = value.replace(/\D/g, "");
  if (digits.startsWith("98") && digits.length === 12) {
    return `0${digits.slice(2)}`;
  }
  return digits;
}

export function isValidIranMobile(value: string) {
  return /^09\d{9}$/.test(value);
}

export function isValidUsername(value: string) {
  return /^[a-zA-Z0-9_]{3,30}$/.test(value);
}

export function ensureCsrfToken(existing?: string) {
  return existing && existing.length > 20 ? existing : generateToken(24);
}
