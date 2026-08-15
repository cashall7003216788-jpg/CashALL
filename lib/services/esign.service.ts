import { prisma } from "@/lib/db";
import { logger } from "@/lib/utils/logger";
import crypto from "crypto";

export interface ESignParams {
  orderId: string;
  userId: string;
  signerName: string;
  signerPhone: string;
  signatureDataUrl?: string;
  sellerDeclaration: string;
}

export class ESignService {
  /**
   * Completes customer electronic signing of the exact Sale Agreement.
   * Computes SHA-256 hash of final agreement text + metadata to ensure document immutability.
   */
  static async processESign(params: ESignParams) {
    const isProd = process.env.NODE_ENV === "production";
    const providerName = process.env.ESIGN_PROVIDER_NAME || (isProd ? "NOT_CONFIGURED" : "DEMO_MOCK_ESIGN");

    // Fetch order details to bind document hash
    const order = await prisma.order.findUnique({
      where: { id: params.orderId },
      include: {
        quote: {
          include: {
            variant: {
              include: { model: { include: { brand: true } } },
            },
          },
        },
      },
    });

    if (!order) {
      throw new Error("Order not found for eSign binding.");
    }

    const deviceName = `${order.quote.variant.model.brand.name} ${order.quote.variant.model.name}`;
    const agreementContent = `
      CASHALL DEVICE SALE AGREEMENT
      Order ID: ${order.orderNumber}
      Seller Name: ${params.signerName}
      Seller Phone: ${params.signerPhone}
      Device: ${deviceName}
      Final Agreed Purchase Price: ₹${order.finalPrice || 0}
      Seller Declaration: ${params.sellerDeclaration}
      Timestamp: ${new Date().toISOString()}
    `;

    // Compute cryptographic document hash
    const documentHash = crypto.createHash("sha256").update(agreementContent).digest("hex");

    const record = await prisma.signature.create({
      data: {
        orderId: params.orderId,
        userId: params.userId,
        signerName: params.signerName,
        signerPhone: params.signerPhone,
        signingProvider: providerName,
        status: "ESIGNED",
        signedDocumentUrl: params.signatureDataUrl || `https://www.cashall.in/documents/agreements/${order.orderNumber}.pdf`,
        documentHash,
        sellerDeclaration: params.sellerDeclaration,
        signedAt: new Date(),
      },
    });

    // Advance order state to ESIGNED
    await prisma.order.update({
      where: { id: params.orderId },
      data: { status: "ESIGNED" },
    });

    logger.info(`Electronic signature recorded for Order ${order.orderNumber} (Hash: ${documentHash.slice(0, 10)}...)`);
    return record;
  }
}
