import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const modelId = searchParams.get("modelId");

    const calculations = await db.offerCalculation.findMany({
      where: modelId ? { modelId } : undefined,
      orderBy: { calculatedAt: "desc" },
      take: 100,
      include: {
        model: {
          include: { brand: true },
        },
        variant: true,
        user: true,
      },
    });

    return NextResponse.json({ success: true, data: calculations });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
