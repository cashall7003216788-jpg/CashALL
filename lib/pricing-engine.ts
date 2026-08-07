export interface SelectedAnswer {
  questionId: string;
  questionTitle: string;
  group: string; // BASIC, SCREEN, BODY, FUNCTIONAL, REPAIR, ACCESSORIES
  optionId: string;
  optionLabel: string;
}

export interface PricingAdjustmentRule {
  questionId: string;
  optionId: string;
  adjustmentType: "FIXED_DEDUCTION" | "PERCENTAGE_DEDUCTION" | "FIXED_BONUS";
  adjustmentValue: number;
}

export interface DeductionItem {
  category: string;
  title: string;
  selection: string;
  amount: number; // positive for bonus, negative for deduction
}

export interface CalculationResult {
  basePrice: number;
  totalDeductions: number;
  totalBonuses: number;
  estimatedPrice: number;
  breakdown: DeductionItem[];
}

export function calculateDeviceQuote(
  basePrice: number,
  answers: SelectedAnswer[],
  rules: PricingAdjustmentRule[]
): CalculationResult {
  let totalDeductions = 0;
  let totalBonuses = 0;
  const breakdown: DeductionItem[] = [];

  for (const answer of answers) {
    // Find matching rule for this question and option
    const matchingRule = rules.find(
      (r) => r.questionId === answer.questionId && r.optionId === answer.optionId
    );

    if (matchingRule) {
      let calcAmount = 0;

      if (matchingRule.adjustmentType === "FIXED_DEDUCTION") {
        calcAmount = -Math.abs(matchingRule.adjustmentValue);
        totalDeductions += Math.abs(calcAmount);
      } else if (matchingRule.adjustmentType === "PERCENTAGE_DEDUCTION") {
        const pDeduct = (basePrice * Math.abs(matchingRule.adjustmentValue)) / 100;
        calcAmount = -Math.round(pDeduct);
        totalDeductions += Math.abs(calcAmount);
      } else if (matchingRule.adjustmentType === "FIXED_BONUS") {
        calcAmount = Math.abs(matchingRule.adjustmentValue);
        totalBonuses += calcAmount;
      }

      if (calcAmount !== 0) {
        breakdown.push({
          category: answer.group,
          title: answer.questionTitle,
          selection: answer.optionLabel,
          amount: calcAmount,
        });
      }
    }
  }

  // Calculate final value
  let rawEstimated = basePrice - totalDeductions + totalBonuses;
  // Floor at 15% of base price or ₹500
  const floorPrice = Math.max(500, Math.round(basePrice * 0.15));
  const estimatedPrice = Math.max(floorPrice, Math.round(rawEstimated));

  return {
    basePrice,
    totalDeductions: Math.round(totalDeductions),
    totalBonuses: Math.round(totalBonuses),
    estimatedPrice,
    breakdown,
  };
}
