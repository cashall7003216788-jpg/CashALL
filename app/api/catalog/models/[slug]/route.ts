import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getDynamicModelDetails } from "@/lib/services/catalog.service";

export async function GET(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const model = await getDynamicModelDetails(params.slug);

    if (!model || !model.active) {
      return NextResponse.json({ success: false, error: "Device model not found" }, { status: 404 });
    }

    const fullModel = model as any;

    // If model has no assigned questionSetId, fallback to active QuestionSet for category or any active set
    let questionSet = fullModel.questionSet;
    if (!questionSet) {
      questionSet = await db.questionSet.findFirst({
        where: {
          active: true,
          deviceCategory: { equals: fullModel.category || "MOBILE", mode: "insensitive" },
        },
        include: {
          questions: {
            where: { active: true },
            orderBy: { sortOrder: "asc" },
            include: {
              options: {
                where: { active: true },
                orderBy: { sortOrder: "asc" },
              },
            },
          },
        },
      });
    }

    if (!questionSet) {
      questionSet = await db.questionSet.findFirst({
        where: { active: true },
        include: {
          questions: {
            where: { active: true },
            orderBy: { sortOrder: "asc" },
            include: {
              options: {
                where: { active: true },
                orderBy: { sortOrder: "asc" },
              },
            },
          },
        },
      });
    }

    // Load active pricing rules associated with this model, its options, or global options
    const questionIds = questionSet?.questions?.map((q: any) => q.id) || [];
    const optionIds = questionSet?.questions?.flatMap((q: any) => q.options?.map((o: any) => o.id)) || [];

    const pricingRules = await db.pricingRule.findMany({
      where: {
        active: true,
        OR: [
          { modelId: fullModel.id },
          {
            modelId: null,
            optionId: { in: optionIds },
          },
        ],
      },
    });

    return NextResponse.json({
      success: true,
      data: {
        model: fullModel,
        questionSet,
        pricingRules,
      },
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
