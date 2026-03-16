/**
 * Seed script to create the initial admin user.
 *
 * Usage:
 *   npx tsx prisma/seed-admin.ts <name> <email> <password>
 *
 * Example:
 *   npx tsx prisma/seed-admin.ts "Fae" "fae@example.com" "mypassword123"
 */

import { PrismaClient } from "@prisma/client";
import crypto from "crypto";

const SALT_LENGTH = 16;
const KEY_LENGTH = 64;

async function hashPassword(password: string): Promise<string> {
  const salt = crypto.randomBytes(SALT_LENGTH).toString("hex");
  const derived = await new Promise<Buffer>((resolve, reject) => {
    crypto.scrypt(password, salt, KEY_LENGTH, (err, key) => {
      if (err) reject(err);
      else resolve(key);
    });
  });
  return `${salt}:${derived.toString("hex")}`;
}

async function main() {
  const [name, email, password] = process.argv.slice(2);

  if (!name || !email || !password) {
    console.error(
      "Usage: npx tsx prisma/seed-admin.ts <name> <email> <password>"
    );
    process.exit(1);
  }

  if (password.length < 8) {
    console.error("Password must be at least 8 characters");
    process.exit(1);
  }

  const prisma = new PrismaClient();

  try {
    const existing = await prisma.adminUser.findUnique({
      where: { email: email.toLowerCase() },
    });

    if (existing) {
      console.error(`Admin user with email ${email} already exists`);
      process.exit(1);
    }

    const passwordHash = await hashPassword(password);
    const user = await prisma.adminUser.create({
      data: {
        name,
        email: email.toLowerCase(),
        passwordHash,
      },
    });

    console.log(`Admin user created: ${user.name} (${user.email})`);
  } finally {
    await prisma.$disconnect();
  }
}

main();
