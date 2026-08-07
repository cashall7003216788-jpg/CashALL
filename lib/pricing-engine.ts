import { db } from "./db";

export interface SelectedAnswer {
  questionId: string;
  questionTitle?: string;
  group?: string;
  optionId: string;
  optionLabel?: string;
}

export interface PricingAdjustmentRule {
  id?: string;
  questionId: string;
  optionId: string;
  modelId?: string | null;
  variantId?: string | null;
  ruleType:
    | "PERCENTAGE_INCREASE"
    | "PERCENTAGE_DECREASE"
    | "FIXED_INCREASE"
    | "FIXED_DECREASE"
    | "BONUS"
    | "PENALTY"
    | "NO_CHANGE"
    | "FIXED_DEDUCTION"
    | "PERCENTAGE_DEDUCTION"
    | "FIXED_BONUS";
  adjustmentValue: number;
  minValue?: number | null;
  maxValue?: number | null;
  priority?: number;
  active?: boolean;
}

export interface AppliedRuleBreakdown {
  ruleId?: string;
  category: string;
  title: string;
  selection: string;
  ruleType: string;
  rawAdjustmentValue: number;
  calculatedAmount: number; // Positive for bonus/increase, negative for penalty/decrease
}

export interface CalculationResult {
  basePrice: number;
  totalPercentageDeductions: number;
  totalFixedDeductions: number;
  totalBonuses: number;
  totalPenalties: number;
  estimatedPrice: number;
  breakdown: AppliedRuleBreakdown[];
  rulesAppliedJson: string;
}

/**
 * Calculates device quote dynamically based on user selections and database pricing rules.
 */
export function calculateDeviceQuote(
  basePrice: number,
  answers: SelectedAnswer[],
  rules: PricingAdjustmentRule[]
): CalculationResult {
  let totalPercentageDeductions = 0;
  let totalFixedDeductions = 0;
  let totalBonuses = 0;
  let totalPenalties = 0;
  const breakdown: AppliedRuleBreakdown[] = [];

  // Sort rules by priority if present
  const sortedRules = [...rules].sort((a, b) => (b.priority || 0) - (a.priority || 0));

  for (const answer of answers) {
    // Find matching active rule for question + option
    const matchingRule = sortedRules.find(
      (r) =>
        r.active !== false &&
        r.questionId === answer.questionId &&
        r.optionId === answer.optionId
    );

    if (!matchingRule) continue;

    let calcAmount = 0;
    const ruleType = matchingRule.ruleType;
    const val = Math.abs(matchingRule.adjustmentValue);

    switch (ruleType) {
      case "PERCENTAGE_INCREASE":
      case "FIXED_BONUS":
      case "BONUS":
        if (ruleType === "PERCENTAGE_INCREASE") {
          calcAmount = Math.round((basePrice * val) / 100);
        } else {
          calcAmount = Math.round(val);
        }

        if (matchingRule.maxValue !== null && matchingRule.maxValue !== undefined) {
          calcAmount = Math.min(calcAmount, matchingRule.maxValue);
        }
        totalBonuses += calcAmount;
        break;

      case "PERCENTAGE_DECREASE":
      case "PERCENTAGE_DEDUCTION":
        calcAmount = -Math.round((basePrice * val) / 100);
        if (matchingRule.minValue !== null && matchingRule.minValue !== undefined) {
          calcAmount = -Math.min(Math.abs(calcAmount), matchingRule.minValue);
        }
        totalPercentageDeductions += Math.abs(calcAmount);
        break;

      case "FIXED_DECREASE":
      case "FIXED_DEDUCTION":
      case "PENALTY":
        calcAmount = -Math.round(val);
        if (matchingRule.minValue !== null && matchingRule.minValue !== undefined) {
          calcAmount = -Math.min(Math.abs(calcAmount), matchingRule.minValue);
        }
        totalPenalties += Math.abs(calcAmount);
        totalFixedDeductions += Math.abs(calcAmount);
        break;

      case "FIXED_INCREASE":
        calcAmount = Math.round(val);
        if (matchingRule.maxValue !== null && matchingRule.maxValue !== undefined) {
          calcAmount = Math.min(calcAmount, matchingRule.maxValue);
        }
        totalBonuses += calcAmount;
        break;

      case "NO_CHANGE":
      default:
        calcAmount = 0;
        break;
    }

    if (calcAmount !== 0 || ruleType === "NO_CHANGE") {
      breakdown.push({
        ruleId: matchingRule.id,
        category: answer.group || "CONDITION",
        title: answer.questionTitle || "Condition Question",
        selection: answer.optionLabel || "Selected Option",
        ruleType,
        rawAdjustmentValue: matchingRule.adjustmentValue,
        calculatedAmount: calcAmount,
      });
    }
  }

  // Calculate final offer
  const rawEstimated = basePrice - totalPercentageDeductions - totalFixedDeductions + totalBonuses;
  const floorPrice = Math.max(500, Math.round(basePrice * 0.1));
  const estimatedPrice = Math.max(floorPrice, Math.round(rawEstimated));

  return {
    basePrice,
    totalPercentageDeductions,
    totalFixedDeductions,
    totalBonuses,
    totalPenalties,
    estimatedPrice,
    breakdown,
    rulesAppliedJson: JSON.stringify(breakdown),
  };
}

/**
 * Persists an offer calculation audit log in PostgreSQL
 */
export async function saveOfferCalculationAudit(params: {
  quoteNumber: string;
  modelId: string;
  variantId?: string | null;
  userId?: string | null;
  basePrice: number;
  selectedAnswersJson: string;
  rulesAppliedJson: string;
  fixedAdjustments: number;
  percentageAdjustments: number;
  finalOffer: number;
  adminRuleVersion?: string;
}) {
  try {
    return await db.offerCalculation.create({
      data: {
        quoteNumber: params.quoteNumber,
        modelId: params.modelId,
        variantId: params.variantId || null,
        userId: params.userId || null,
        basePrice: params.basePrice,
        selectedAnswersJson: params.selectedAnswersJson,
        rulesAppliedJson: params.rulesAppliedJson,
        fixedAdjustments: params.fixedAdjustments,
        percentageAdjustments: params.percentageAdjustments,
        finalOffer: params.finalOffer,
        adminRuleVersion: params.adminRuleVersion || "v1.0",
      },
    });
  } catch (error) {
    console.error("Failed to save offer calculation audit log:", error);
    return null;
  }
}
