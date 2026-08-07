import { db } from "../db";

export interface LogPricingRuleChangeParams {
  ruleId: string;
  oldType?: string | null;
  oldValue?: number | null;
  newType: string;
  newValue: number;
  changedBy?: string | null;
  reason?: string | null;
}

/**
 * Creates an immutable audit record in pricing_history table whenever a rule is updated.
 */
export async function logPricingRuleChange(params: LogPricingRuleChangeParams) {
  try {
    return await db.pricingHistory.create({
      data: {
        ruleId: params.ruleId,
        oldType: params.oldType || null,
        oldValue: params.oldValue !== undefined && params.oldValue !== null ? params.oldValue : null,
        newType: params.newType,
        newValue: params.newValue,
        changedBy: params.changedBy || "Admin",
        reason: params.reason || "Admin Pricing Rule Adjustment",
      },
    });
  } catch (error) {
    console.error("Error logging pricing rule change history:", error);
    return null;
  }
}
