import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const ruleId = searchParams.get("ruleId");

    const history = await db.pricingHistory.findMany({
      where: ruleId ? { ruleId } : undefined,
      orderBy: { createdAt: "desc" },
      take: 100,
      include: {
        rule: {
          include: {
            question: true,
            option: true,
          },
        },
      },
    });

    return NextResponse.json({ success: true, data: history });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
