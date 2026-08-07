import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { calculateDeviceQuote, saveOfferCalculationAudit } from "@/lib/pricing-engine";
import { v4 as uuidv4 } from "uuid";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { modelId, variantId, selectedAnswers, userId } = body;

    if (!modelId || !selectedAnswers || !Array.isArray(selectedAnswers)) {
      return NextResponse.json(
        { success: false, error: "modelId and selectedAnswers array are required" },
        { status: 400 }
      );
    }

    // 1. Fetch Model & Variant details
    const model = await db.deviceModel.findUnique({
      where: { id: modelId },
      include: {
        variants: true,
      },
    });

    if (!model) {
      return NextResponse.json({ success: false, error: "Device model not found" }, { status: 404 });
    }

    let basePrice = model.basePrice || 30000;
    let selectedVariant = null;

    if (variantId) {
      selectedVariant = model.variants.find((v) => v.id === variantId);
      if (selectedVariant) {
        basePrice = selectedVariant.basePrice;
      }
    } else if (model.variants.length > 0) {
      selectedVariant = model.variants[0];
      basePrice = selectedVariant.basePrice;
    }

    // 2. Fetch Active Pricing Rules (Model-specific overrides take precedence)
    const optionIds = selectedAnswers.map((a: any) => a.optionId);
    const rules = await db.pricingRule.findMany({
      where: {
        active: true,
        optionId: { in: optionIds },
        OR: [{ modelId: model.id }, { modelId: null }],
      },
      orderBy: { priority: "desc" },
    });

    // 3. Evaluate Pricing Engine Calculation
    const result = calculateDeviceQuote(basePrice, selectedAnswers, rules as any);

    // 4. Generate unique quote number
    const quoteNumber = `Q-${Math.floor(100000 + Math.random() * 900000)}`;

    // 5. Save Offer Calculation Audit Log into database
    await saveOfferCalculationAudit({
      quoteNumber,
      modelId: model.id,
      variantId: selectedVariant?.id || null,
      userId: userId || null,
      basePrice: result.basePrice,
      selectedAnswersJson: JSON.stringify(selectedAnswers),
      rulesAppliedJson: result.rulesAppliedJson,
      fixedAdjustments: result.totalFixedDeductions,
      percentageAdjustments: result.totalPercentageDeductions,
      finalOffer: result.estimatedPrice,
      adminRuleVersion: "v1.0",
    });

    return NextResponse.json({
      success: true,
      data: {
        quoteNumber,
        modelName: model.name,
        variantName: selectedVariant ? `${selectedVariant.storage} ${selectedVariant.ram || ""}`.trim() : "",
        basePrice: result.basePrice,
        totalDeductions: result.totalPercentageDeductions + result.totalFixedDeductions,
        totalBonuses: result.totalBonuses,
        estimatedPrice: result.estimatedPrice,
        breakdown: result.breakdown,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      },
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
