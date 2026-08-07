import { NextRequest, NextResponse } from "next/server";
import { apiWrapper } from "@/lib/utils/api-wrapper";
import { prisma } from "@/lib/db";

export const GET = apiWrapper(async (req: NextRequest) => {
  const questions = await prisma.conditionQuestion.findMany({
    where: { active: true, deletedAt: null },
    include: {
      options: {
        orderBy: { sortOrder: "asc" },
      },
    },
    orderBy: { sortOrder: "asc" },
  });

  return NextResponse.json({
    success: true,
    data: questions,
  });
});
