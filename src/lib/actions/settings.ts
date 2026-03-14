"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";

export async function updateSiteSettings(formData: FormData) {
  const heroHeading = formData.get("heroHeading") as string;
  const heroSubheading = formData.get("heroSubheading") as string;
  const aboutContent = (formData.get("aboutContent") as string) || null;
  const contactEmail = (formData.get("contactEmail") as string) || null;
  const laborRate = Math.round(parseFloat(formData.get("laborRate") as string || "25") * 100);
  const processSteps = JSON.parse(formData.get("processSteps") as string || "[]");
  const socialLinks = JSON.parse(formData.get("socialLinks") as string || "[]");

  await prisma.siteSettings.upsert({
    where: { id: "singleton" },
    create: {
      heroHeading: heroHeading || "Handcrafted with Enchantment",
      heroSubheading: heroSubheading || "",
      aboutContent,
      contactEmail,
      laborRate,
      processSteps,
      socialLinks,
    },
    update: {
      heroHeading: heroHeading || "Handcrafted with Enchantment",
      heroSubheading: heroSubheading || "",
      aboutContent,
      contactEmail,
      laborRate,
      processSteps,
      socialLinks,
    },
  });

  revalidatePath("/admin/settings");
  revalidatePath("/");
  revalidatePath("/about");
  return { success: true };
}
