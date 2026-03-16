"use server";

import { redirect } from "next/navigation";
import {
  verifyPassword,
  hashPassword,
  createSession,
  destroySession,
  getCurrentUserId,
} from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function loginAction(_prev: unknown, formData: FormData) {
  const email = (formData.get("email") as string)?.trim().toLowerCase();
  const password = formData.get("password") as string;

  if (!email || !password) {
    return { error: "Email and password are required" };
  }

  const user = await prisma.adminUser.findUnique({ where: { email } });
  if (!user) {
    return { error: "Invalid email or password" };
  }

  const valid = await verifyPassword(password, user.passwordHash);
  if (!valid) {
    return { error: "Invalid email or password" };
  }

  await createSession(user.id);
  redirect("/admin");
}

export async function logoutAction() {
  await destroySession();
  redirect("/admin/login");
}

export async function changePasswordAction(_prev: unknown, formData: FormData) {
  const currentPassword = formData.get("currentPassword") as string;
  const newPassword = formData.get("newPassword") as string;
  const confirmPassword = formData.get("confirmPassword") as string;

  if (!currentPassword || !newPassword || !confirmPassword) {
    return { error: "All fields are required" };
  }

  if (newPassword.length < 8) {
    return { error: "New password must be at least 8 characters" };
  }

  if (newPassword !== confirmPassword) {
    return { error: "New passwords do not match" };
  }

  const userId = await getCurrentUserId();
  if (!userId) {
    return { error: "Not authenticated" };
  }

  const user = await prisma.adminUser.findUnique({ where: { id: userId } });
  if (!user) {
    return { error: "User not found" };
  }

  const valid = await verifyPassword(currentPassword, user.passwordHash);
  if (!valid) {
    return { error: "Current password is incorrect" };
  }

  const newHash = await hashPassword(newPassword);
  await prisma.adminUser.update({
    where: { id: userId },
    data: { passwordHash: newHash },
  });

  return { success: "Password updated successfully" };
}

export async function createAdminUserAction(
  _prev: unknown,
  formData: FormData
) {
  const name = (formData.get("name") as string)?.trim();
  const email = (formData.get("email") as string)?.trim().toLowerCase();
  const password = formData.get("password") as string;

  if (!name || !email || !password) {
    return { error: "All fields are required" };
  }

  if (password.length < 8) {
    return { error: "Password must be at least 8 characters" };
  }

  const existing = await prisma.adminUser.findUnique({ where: { email } });
  if (existing) {
    return { error: "An account with this email already exists" };
  }

  const passwordHash = await hashPassword(password);
  await prisma.adminUser.create({
    data: { name, email, passwordHash },
  });

  return { success: `Admin account created for ${email}` };
}

export async function deleteAdminUserAction(userId: string) {
  const currentUserId = await getCurrentUserId();
  if (!currentUserId) {
    return { error: "Not authenticated" };
  }

  if (userId === currentUserId) {
    return { error: "You cannot delete your own account" };
  }

  const count = await prisma.adminUser.count();
  if (count <= 1) {
    return { error: "Cannot delete the last admin account" };
  }

  await prisma.adminUser.delete({ where: { id: userId } });
  return { success: "Admin account deleted" };
}
