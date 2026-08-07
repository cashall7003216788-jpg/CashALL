import { prisma } from "../db";
import { AppError } from "../utils/AppError";
import { logger } from "../utils/logger";
import { calculateDeviceQuote } from "../pricing-engine";

export interface SelectedAnswer {
  questionId: string;
  questionTitle: string;
  group: string;
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

      const rules = await prisma.pricingRule.findMany({
        where: {
          active: true,
          OR: [
            { variantId: variantId },
            { modelId: variant.modelId },
            { variantId: null, modelId: null },
          ],
        },
      });

      const calcResult = calculateDeviceQuote(variant.basePrice, answers, rules as any[]);

      return {
        variant,
        basePrice: calcResult.basePrice,
        totalDeductions: calcResult.totalFixedDeductions + calcResult.totalPercentageDeductions,
        totalBonuses: calcResult.totalBonuses,
        estimatedPrice: calcResult.estimatedPrice,
        breakdown: calcResult.breakdown,
      };
    } catch (error: any) {
      logger.error("Error in calculateQuote service:", error);
      if (error instanceof AppError) throw error;
      throw new AppError(`Pricing calculation failed: ${error.message}`, 500);
    }
  }
}
