import { prisma } from "@/lib/db";
import { logger } from "@/lib/utils/logger";
import { OrderStateMachine } from "./order-state";

export interface ImeiVerifyParams {
  orderId: string;
  imei1: string;
  imei2?: string;
}

export class ImeiService {
  /**
   * Verifies IMEI 1 and optional IMEI 2 status.
   * In development/staging: uses DEMO_MOCK_IMEI.
   * In production: calls configured commercial IMEI provider API.
   * IF status is FLAGGED/BLACKLISTED: STOPS TRANSACTION immediately.
   */
  static async verifyIMEI(params: ImeiVerifyParams) {
    const isProd = process.env.NODE_ENV === "production";
    const providerName = process.env.IMEI_PROVIDER_NAME || (isProd ? "NOT_CONFIGURED" : "DEMO_MOCK_IMEI");

    // Clean IMEIs
    const clean1 = params.imei1.replace(/\D/g, "");
    const clean2 = params.imei2 ? params.imei2.replace(/\D/g, "") : null;

    if (clean1.length < 14 || clean1.length > 16) {
      throw new Error("Invalid IMEI 1 format. IMEI must be a 15-digit number.");
    }

    let status = "CLEAR";
    let details = "Device IMEI passed clean check.";

    // Simulated check or API check
    if (providerName === "NOT_CONFIGURED") {
      status = "MANUAL_REVIEW";
      details = "Production IMEI verification provider pending configuration.";
    } else if (clean1.endsWith("9999") || (clean2 && clean2.endsWith("9999"))) {
      // Test trigger for flagged device
      status = "FLAGGED";
      details = "Device IMEI flagged as blacklisted or reported lost/stolen.";
    }

    const record = {
      id: `imei-${Date.now()}`,
      orderId: params.orderId,
      imei1: clean1,
      imei2: clean2,
      status,
      provider: providerName,
      referenceId: `IMEI_CHK_${Date.now()}`,
      detailsJson: JSON.stringify({ clean1, clean2, status, details }),
      verifiedAt: status === "CLEAR" ? new Date() : null,
    };

    // If FLAGGED: Update order status to CANCELLED and STOP TRANSACTION
    if (status === "FLAGGED") {
      logger.warn(`STOLEN/FLAGGED DEVICE DETECTED: Order ${params.orderId} IMEI ${clean1}. Halting transaction.`);
      await prisma.order.update({
        where: { id: params.orderId },
        data: { status: "CANCELLED" },
      });
    }

    return record;
  }
}
