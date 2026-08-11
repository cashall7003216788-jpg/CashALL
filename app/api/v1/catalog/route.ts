import { NextRequest, NextResponse } from "next/server";
import { apiWrapper } from "@/lib/utils/api-wrapper";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

export const GET = apiWrapper(async (req: NextRequest) => {
  const { searchParams } = new URL(req.url);
  const brandSlug = searchParams.get("brand");

  if (brandSlug) {
    const brand = await prisma.brand.findFirst({
      where: { slug: brandSlug, active: true, deletedAt: null },
      include: {
        models: {
          where: { active: true, deletedAt: null },
          orderBy: { releaseYear: "desc" },
          include: {
            variants: {
              where: { active: true, deletedAt: null },
            },
          },
        },
      },
    });

    return NextResponse.json({ success: true, data: brand });
  }

  const brands = await prisma.brand.findMany({
    where: { active: true, deletedAt: null },
    orderBy: { sortOrder: "asc" },
  });

  const popularModels = await prisma.deviceModel.findMany({
    where: { active: true, popular: true, deletedAt: null },
    include: { brand: true },
  });

  return NextResponse.json({
    success: true,
    data: {
      brands,
      popularModels,
    },
  });
});
