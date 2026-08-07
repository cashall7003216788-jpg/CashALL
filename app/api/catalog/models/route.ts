import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const brandSlug = searchParams.get("brandSlug");
    const category = searchParams.get("category");
    const search = searchParams.get("search");
    const popularOnly = searchParams.get("popular") === "true";

    const whereCondition: any = {
      active: true,
    };

    if (popularOnly) {
      whereCondition.popular = true;
    }

    if (category) {
      whereCondition.category = { equals: category, mode: "insensitive" };
    }

    if (brandSlug) {
      whereCondition.brand = { slug: brandSlug.toLowerCase() };
    }

    if (search && search.trim()) {
      const q = search.trim();
      whereCondition.OR = [
        { name: { contains: q, mode: "insensitive" } },
        { brand: { name: { contains: q, mode: "insensitive" } } },
      ];
    }

    const models = await db.deviceModel.findMany({
      where: whereCondition,
      orderBy: [{ popular: "desc" }, { name: "asc" }],
      include: {
        brand: {
          select: { id: true, name: true, slug: true, logoUrl: true },
        },
        variants: {
          where: { active: true },
          orderBy: { basePrice: "asc" },
          take: 1,
        },
      },
    });

    return NextResponse.json({ success: true, data: models });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
