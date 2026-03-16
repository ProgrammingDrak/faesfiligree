import { cookies } from "next/headers";
import crypto from "crypto";
import { prisma } from "@/lib/db";

const SESSION_COOKIE = "admin_session";
const SESSION_MAX_AGE = 60 * 60 * 24 * 7; // 7 days

function getSecret(): string {
  return process.env.ADMIN_SESSION_SECRET || "dev-secret-change-me";
}

function sign(value: string): string {
  const hmac = crypto.createHmac("sha256", getSecret());
  hmac.update(value);
  return `${value}.${hmac.digest("hex")}`;
}

function verify(signed: string): string | null {
  const lastDot = signed.lastIndexOf(".");
  if (lastDot === -1) return null;
  const value = signed.substring(0, lastDot);
  if (sign(value) === signed) return value;
  return null;
}

// --- Password hashing using Node crypto.scrypt ---

const SALT_LENGTH = 16;
const KEY_LENGTH = 64;

export async function hashPassword(password: string): Promise<string> {
  const salt = crypto.randomBytes(SALT_LENGTH).toString("hex");
  const derived = await new Promise<Buffer>((resolve, reject) => {
    crypto.scrypt(password, salt, KEY_LENGTH, (err, key) => {
      if (err) reject(err);
      else resolve(key);
    });
  });
  return `${salt}:${derived.toString("hex")}`;
}

export async function verifyPassword(
  password: string,
  hash: string
): Promise<boolean> {
  const [salt, key] = hash.split(":");
  if (!salt || !key) return false;
  const derived = await new Promise<Buffer>((resolve, reject) => {
    crypto.scrypt(password, salt, KEY_LENGTH, (err, result) => {
      if (err) reject(err);
      else resolve(result);
    });
  });
  return crypto.timingSafeEqual(Buffer.from(key, "hex"), derived);
}

// --- Session management ---

// Session token format: "userId:randomUUID"
export async function createSession(userId: string): Promise<void> {
  const token = `${userId}:${crypto.randomUUID()}`;
  const signed = sign(token);
  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE, signed, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: SESSION_MAX_AGE,
    path: "/",
  });
}

export async function destroySession(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE);
}

function parseSessionToken(signed: string): string | null {
  const value = verify(signed);
  if (!value) return null;
  const colonIndex = value.indexOf(":");
  if (colonIndex === -1) return null;
  return value.substring(0, colonIndex);
}

export async function isAuthenticated(): Promise<boolean> {
  const cookieStore = await cookies();
  const session = cookieStore.get(SESSION_COOKIE);
  if (!session) return false;
  return parseSessionToken(session.value) !== null;
}

export function isAuthenticatedSync(cookieValue: string | undefined): boolean {
  if (!cookieValue) return false;
  return parseSessionToken(cookieValue) !== null;
}

export async function getCurrentUserId(): Promise<string | null> {
  const cookieStore = await cookies();
  const session = cookieStore.get(SESSION_COOKIE);
  if (!session) return null;
  return parseSessionToken(session.value);
}

export async function getCurrentUser() {
  const userId = await getCurrentUserId();
  if (!userId) return null;
  return prisma.adminUser.findUnique({
    where: { id: userId },
    select: { id: true, email: true, name: true },
  });
}
