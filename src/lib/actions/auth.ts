"use server";

import { redirect } from "next/navigation";
import { verifyPassword, createSession, destroySession } from "@/lib/auth";

export async function loginAction(_prev: unknown, formData: FormData) {
  const password = formData.get("password") as string;

  if (!password || !verifyPassword(password)) {
    return { error: "Invalid password" };
  }

  await createSession();
  return { success: true };
}

export async function logoutAction() {
  await destroySession();
  redirect("/admin/login");
}
