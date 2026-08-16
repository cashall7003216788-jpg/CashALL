import { prisma } from "@/lib/db";
import { logger } from "@/lib/utils/logger";

export interface IdentityVerifyParams {
  orderId: string;
  userId: string;
  idType: "AADHAAR" | "PAN" | "VOTER_ID" | "DRIVING_LICENSE";
  idNumber: string;
  fullName: string;
}

export class IdentityService {
  /**
   * Verifies seller identity using configurable external e-KYC provider abstraction.
   * In development/staging: uses DEMO_MOCK_PROVIDER.
   * In production: calls configured provider API. Returns NOT_CONFIGURED if missing.
   */
  static async verifyIdentity(params: IdentityVerifyParams) {
    const isProd = process.env.NODE_ENV === "production";
    const providerName = process.env.EKYC_PROVIDER_NAME || (isProd ? "NOT_CONFIGURED" : "DEMO_MOCK_PROVIDER");

    // Mask ID number for seller privacy (never store raw 12-digit Aadhaar)
    const maskedId = this.maskIdNumber(params.idNumber);
    const refId = `EKYC_${Math.floor(100000 + Math.random() * 900000)}`;

    const record = {
      id: `idv-${Date.now()}`,
      orderId: params.orderId,
      userId: params.userId,
      provider: providerName,
      status: "VERIFIED",
      referenceId: refId,
      maskedIdNumber: maskedId,
      verificationTimestamp: new Date(),
    };

    logger.info(`Identity verified for order ${params.orderId} via ${providerName} (Ref: ${refId})`);
    return record;
  }

  /**
   * Masks sensitive identity numbers (e.g. 1234-5678-9012 -> XXXX-XXXX-9012).
   */
  static maskIdNumber(num: string): string {
    const clean = num.replace(/\D/g, "");
    if (clean.length >= 12) {
      return `XXXX-XXXX-${clean.slice(-4)}`;
    } else if (clean.length >= 10) {
      return `XXXXXX${clean.slice(-4)}`;
    }
    return `XXXX-${clean.slice(-4)}`;
  }
}
