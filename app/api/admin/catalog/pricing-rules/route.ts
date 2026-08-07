import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { logPricingRuleChange } from "@/lib/services/pricing-history.service";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const questionId = searchParams.get("questionId");
    const optionId = searchParams.get("optionId");
    const modelId = searchParams.get("modelId");

    const rules = await db.pricingRule.findMany({
      where: {
        ...(questionId ? { questionId } : {}),
        ...(optionId ? { optionId } : {}),
        ...(modelId ? { modelId } : {}),
      },
      include: {
        question: true,
        option: true,
        model: true,
        variant: true,
        historyLogs: {
          orderBy: { createdAt: "desc" },
          take: 5,
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ success: true, data: rules });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      questionId,
      optionId,
      modelId,
      variantId,
      ruleType,
      adjustmentValue,
      minValue,
      maxValue,
      priority,
      active,
      changedBy,
      reason,
    } = body;

    if (!questionId || !optionId || !ruleType || adjustmentValue === undefined) {
      return NextResponse.json(
        { success: false, error: "questionId, optionId, ruleType, and adjustmentValue are required" },
        { status: 400 }
      );
    }

    const rule = await db.pricingRule.create({
      data: {
        questionId,
        optionId,
        modelId: modelId || null,
        variantId: variantId || null,
        ruleType,
        adjustmentValue: parseFloat(adjustmentValue),
        minValue: minValue !== undefined && minValue !== null ? parseFloat(minValue) : null,
        maxValue: maxValue !== undefined && maxValue !== null ? parseFloat(maxValue) : null,
        priority: priority || 0,
        active: active !== undefined ? active : true,
      },
    });

    // Audit Log in PricingHistory
    await logPricingRuleChange({
      ruleId: rule.id,
      oldType: null,
      oldValue: null,
      newType: rule.ruleType,
      newValue: rule.adjustmentValue,
      changedBy: changedBy || "Admin",
      reason: reason || "Created new pricing rule",
    });

    return NextResponse.json({ success: true, data: rule }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      id,
      ruleType,
      adjustmentValue,
      minValue,
      maxValue,
      priority,
      active,
      changedBy,
      reason,
    } = body;

    if (!id) {
      return NextResponse.json({ success: false, error: "Pricing Rule ID is required" }, { status: 400 });
    }

    const existingRule = await db.pricingRule.findUnique({ where: { id } });
    if (!existingRule) {
      return NextResponse.json({ success: false, error: "Pricing Rule not found" }, { status: 404 });
    }

    const updated = await db.pricingRule.update({
      where: { id },
      data: {
        ruleType: ruleType || existingRule.ruleType,
        adjustmentValue: adjustmentValue !== undefined ? parseFloat(adjustmentValue) : existingRule.adjustmentValue,
        minValue: minValue !== undefined ? (minValue !== null ? parseFloat(minValue) : null) : existingRule.minValue,
        maxValue: maxValue !== undefined ? (maxValue !== null ? parseFloat(maxValue) : null) : existingRule.maxValue,
        priority: priority !== undefined ? priority : existingRule.priority,
        active: active !== undefined ? active : existingRule.active,
      },
    });

    // Version & Audit Log in PricingHistory
    await logPricingRuleChange({
      ruleId: updated.id,
      oldType: existingRule.ruleType,
      oldValue: existingRule.adjustmentValue,
      newType: updated.ruleType,
      newValue: updated.adjustmentValue,
      changedBy: changedBy || "Admin",
      reason: reason || "Updated pricing rule parameters",
    });

    return NextResponse.json({ success: true, data: updated });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
