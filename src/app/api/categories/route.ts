import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const categories = await prisma.category.findMany({
    orderBy: [{ sortOrder: "asc" }, { nameFr: "asc" }],
    select: { id: true, slug: true, nameFr: true, parentId: true },
  });

  return NextResponse.json({ data: categories });
}
