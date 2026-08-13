import { OrderStatus } from "@prisma/client";
import { AppError } from "@/lib/utils/AppError";

/**
 * Valid state transitions for the CashALL Transaction State Machine.
 */
const VALID_TRANSITIONS: Record<string, string[]> = {
  CREATED: ["IDENTITY_VERIFICATION_PENDING", "IDENTITY_VERIFIED", "ASSIGNED", "CANCELLED"],
  IDENTITY_VERIFICATION_PENDING: ["IDENTITY_VERIFIED", "IDENTITY_MANUAL_REVIEW", "VERIFICATION_FAILED", "CANCELLED"],
  IDENTITY_MANUAL_REVIEW: ["IDENTITY_VERIFIED", "VERIFICATION_FAILED", "CANCELLED"],
  IDENTITY_VERIFIED: ["ASSIGNED", "CANCELLED"],
  ASSIGNED: ["PARTNER_ACCEPTED", "INSPECTION_STARTED", "ASSIGNED", "CANCELLED"],
  PARTNER_ACCEPTED: ["INSPECTION_STARTED", "CANCELLED"],
  INSPECTION_STARTED: ["INSPECTION_COMPLETED", "REJECTED", "CANCELLED"],
  INSPECTION_COMPLETED: ["IMEI_VERIFICATION_PENDING", "IMEI_VERIFIED", "IMEI_FLAGGED", "FINAL_OFFER", "REJECTED", "CANCELLED"],
  IMEI_VERIFICATION_PENDING: ["IMEI_VERIFIED", "IMEI_FLAGGED", "IMEI_MANUAL_REVIEW", "REJECTED", "CANCELLED"],
  IMEI_MANUAL_REVIEW: ["IMEI_VERIFIED", "IMEI_FLAGGED", "REJECTED", "CANCELLED"],
  IMEI_FLAGGED: ["DISPUTED", "CANCELLED", "REJECTED"], // STOP TRANSACTION RULE
  IMEI_VERIFIED: ["FINAL_OFFER", "REJECTED", "CANCELLED"],
  FINAL_OFFER: ["CUSTOMER_ACCEPTED", "REJECTED", "CANCELLED"],
  CUSTOMER_ACCEPTED: ["PAYMENT_PENDING", "PAYMENT_CONFIRMED", "PAYMENT_MANUAL_REVIEW", "CANCELLED"],
  PAYMENT_PENDING: ["PAYMENT_CONFIRMED", "PAYMENT_MANUAL_REVIEW", "PAYMENT_FAILED", "CANCELLED"],
  PAYMENT_MANUAL_REVIEW: ["PAYMENT_CONFIRMED", "PAYMENT_FAILED", "DISPUTED"],
  PAYMENT_CONFIRMED: ["ESIGN_PENDING", "ESIGNED", "CANCELLED"],
  ESIGN_PENDING: ["ESIGNED", "CANCELLED"],
  ESIGNED: ["DEVICE_RECEIVED", "DISPUTED"],
  DEVICE_RECEIVED: ["BILL_GENERATED", "COMPLETED", "DISPUTED"],
  BILL_GENERATED: ["COMPLETED", "DISPUTED"],
  COMPLETED: ["DISPUTED"],
  DISPUTED: ["COMPLETED", "CANCELLED"],
  CANCELLED: [],
  REJECTED: [],
  PAYMENT_FAILED: ["PAYMENT_PENDING", "CANCELLED"],
  VERIFICATION_FAILED: ["IDENTITY_VERIFICATION_PENDING", "CANCELLED"],
};

export class OrderStateMachine {
  /**
   * Validates whether a state transition from `currentStatus` to `targetStatus` is permitted.
   */
  static canTransition(currentStatus: string, targetStatus: string): boolean {
    const allowed = VALID_TRANSITIONS[currentStatus] || [];
    return allowed.includes(targetStatus);
  }

  /**
   * Asserts state transition or throws an AppError.
   */
  static assertTransition(currentStatus: string, targetStatus: string): void {
    if (!this.canTransition(currentStatus, targetStatus)) {
      throw new AppError(
        `Invalid transaction state transition from '${currentStatus}' to '${targetStatus}'.`,
        400
      );
    }
  }

  /**
   * Strict backend verification before marking an order as COMPLETED.
   */
  static verifyCompletionCriteria(order: {
    status: string;
    identityVerifications?: any[];
    imeiVerifications?: any[];
    qcReports?: any[];
    offers?: any[];
    payments?: any[];
    signatures?: any[];
    bills?: any[];
    finalPrice?: number | null;
  }): { valid: boolean; missingConditions: string[] } {
    const missing: string[] = [];

    // 1. Identity Verified
    const hasIdentityVerified = order.identityVerifications?.some(
      (v) => v.status === "VERIFIED"
    );
    if (!hasIdentityVerified) missing.push("Identity verification incomplete");

    // 2. IMEI Clear
    const hasImeiClear = order.imeiVerifications?.some(
      (v) => v.status === "CLEAR" || v.status === "VERIFIED"
    );
    if (!hasImeiClear) missing.push("Device IMEI verification not cleared");

    // 3. Inspection Completed
    const hasQcReport = (order.qcReports && order.qcReports.length > 0) || order.status === "INSPECTION_COMPLETED" || order.status === "COMPLETED";
    if (!hasQcReport) missing.push("Device inspection report missing");

    // 4. Customer Accepted Final Offer
    const hasAcceptedOffer = order.offers?.some((o) => o.status === "ACCEPTED") || order.finalPrice !== null;
    if (!hasAcceptedOffer) missing.push("Customer final price offer acceptance missing");

    // 5. Payment Confirmed
    const hasPaidPayment = order.payments?.some(
      (p) => p.status === "PAID" || p.status === "CONFIRMED"
    );
    if (!hasPaidPayment) missing.push("Manual UPI payment confirmation missing");

    // 6. Electronic Signature Completed
    const hasSignature = order.signatures?.some((s) => s.status === "ESIGNED");
    if (!hasSignature) missing.push("Signed Sale Agreement missing");

    // 7. Bill Generated
    const hasBill = order.bills && order.bills.length > 0;
    if (!hasBill) missing.push("Generated Purchase Receipt / Bill missing");

    return {
      valid: missing.length === 0,
      missingConditions: missing,
    };
  }
}
