"use server";

import { z } from "zod";
import { prisma, isDatabaseConfigured } from "@/lib/db";

const contactSchema = z.object({
  name: z.string().min(1, "Name is required").max(200),
  email: z.string().email("Invalid email address").max(300),
  message: z.string().min(1, "Message is required").max(5000),
});

export async function submitContactForm(formData: FormData) {
  const parsed = contactSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    message: formData.get("message"),
  });

  if (!parsed.success) {
    return { error: parsed.error.errors[0].message };
  }

  if (!isDatabaseConfigured()) {
    // In development without a database, log and return success
    console.log("Contact form submission (no DB):", parsed.data);
    return { success: true };
  }

  await prisma.contactMessage.create({
    data: parsed.data,
  });

  // TODO: Send email notification via Resend/SendGrid when configured
  return { success: true };
}
