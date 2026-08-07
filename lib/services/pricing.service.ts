import { prisma } from "../db";
import { AppError } from "../utils/AppError";
import { logger } from "../utils/logger";

export interface SelectedAnswer {
  questionId: string;
  questionTitle: string;
  group: string; // BASIC, SCREEN, BODY, FUNCTIONAL, REPAIR, ACCESSORIES
  optionId: string;
  optionLabel: string;
}

export class PricingService {
  /**
   * Calculates estimated payout quote for a device variant and screening options.
   */
  static async calculateQuote(variantId: string, answers: SelectedAnswer[]) {
    try {
      const variant = await prisma.deviceVariant.findUnique({
        where: { id: variantId },
        include: { model: { include: { brand: true } } },
      });

      if (!variant) {
        throw new AppError("Device variant not found.", 404);
      }

      const basePrice = variant.basePrice;
      let totalDeductions = 0;
      let totalBonuses = 0;
      const breakdown: any[] = [];

      // Fetch pricing rules for this variant or global rules where variantId is null
      const rules = await prisma.pricingRule.findMany({
        where: {
          OR: [
            { variantId: variantId },
            { variantId: null },
          ],
          active: true,
        },
      });

      for (const answer of answers) {
        const rule = rules.find(
          (r) => r.questionId === answer.questionId && r.optionId === answer.optionId
        );

        if (rule) {
          const ruleData = rule as any;
          let calcAmount = 0;

          if (ruleData.adjustmentType === "FIXED_DEDUCTION") {
            calcAmount = -Math.abs(ruleData.adjustmentValue);
            totalDeductions += Math.abs(calcAmount);
          } else if (ruleData.adjustmentType === "PERCENTAGE_DEDUCTION") {
            const pDeduct = (basePrice * Math.abs(ruleData.adjustmentValue)) / 100;
            calcAmount = -Math.round(pDeduct);
            totalDeductions += Math.abs(calcAmount);
          } else if (ruleData.adjustmentType === "FIXED_BONUS") {
            calcAmount = Math.abs(ruleData.adjustmentValue);
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

      const rawEstimated = basePrice - totalDeductions + totalBonuses;
      const floorPrice = Math.max(500, Math.round(basePrice * 0.15));
      const estimatedPrice = Math.max(floorPrice, Math.round(rawEstimated));

      logger.info(`Calculated quote for variant ${variantId}: base: ${basePrice}, est: ${estimatedPrice}`);

      return {
        variant,
        basePrice,
        totalDeductions: Math.round(totalDeductions),
        totalBonuses: Math.round(totalBonuses),
        estimatedPrice,
        breakdown,
      };
    } catch (error: any) {
      logger.error("Error in calculateQuote service:", error);
      if (error instanceof AppError) throw error;
      throw new AppError(`Pricing calculation failed: ${error.message}`, 500);
    }
  }
}
