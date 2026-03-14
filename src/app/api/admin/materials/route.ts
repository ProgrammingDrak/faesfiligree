import { NextResponse } from "next/server";
import { prisma, isDatabaseConfigured } from "@/lib/db";

export async function GET() {
  if (!isDatabaseConfigured()) {
    return NextResponse.json([]);
  }
  const materials = await prisma.material.findMany({ orderBy: { name: "asc" } });
  return NextResponse.json(materials);
}
