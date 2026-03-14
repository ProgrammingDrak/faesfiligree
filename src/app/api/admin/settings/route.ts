import { NextResponse } from "next/server";
import { prisma, isDatabaseConfigured } from "@/lib/db";

export async function GET() {
  if (!isDatabaseConfigured()) {
    return NextResponse.json({
      heroHeading: "Handcrafted with Enchantment",
      heroSubheading: "",
      aboutContent: null,
      contactEmail: null,
      laborRate: 2500,
      processSteps: null,
      socialLinks: null,
    });
  }

  const settings = await prisma.siteSettings.findUnique({
    where: { id: "singleton" },
  });

  if (!settings) {
    return NextResponse.json({
      heroHeading: "Handcrafted with Enchantment",
      heroSubheading: "",
      aboutContent: null,
      contactEmail: null,
      laborRate: 2500,
      processSteps: null,
      socialLinks: null,
    });
  }

  return NextResponse.json(settings);
}
