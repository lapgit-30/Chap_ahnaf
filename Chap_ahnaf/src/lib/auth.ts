import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "ahnaf-jwt-secret-key-2024-secure";
const OTP_EXPIRY_MINUTES = 5;
const SALT_ROUNDS = 12;

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, SALT_ROUNDS);
}

export async function comparePassword(
  password: string,
  hash: string
): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

export function generateOTP(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

export function getOTPExpiry(): Date {
  const expiry = new Date();
  expiry.setMinutes(expiry.getMinutes() + OTP_EXPIRY_MINUTES);
  return expiry;
}

export function generateToken(payload: {
  userId: number;
  role: string;
}): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: "7d" });
}

export function verifyToken(
  token: string
): { userId: number; role: string } | null {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as {
      userId: number;
      role: string;
    };
    return decoded;
  } catch {
    return null;
  }
}

export function generateTrackingCode(): string {
  const prefix = "AH";
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `${prefix}${timestamp}${random}`;
}
