import { NextResponse } from "next/server";
import { prisma, isDatabaseConfigured } from "@/lib/db";

export async function GET() {
  if (!isDatabaseConfigured()) {
    return NextResponse.json([]);
  }
  const categories = await prisma.category.findMany({ orderBy: { title: "asc" } });
  return NextResponse.json(categories);
}
