import { prisma } from "@/lib/db";
import { logger } from "@/lib/utils/logger";
import { OrderStateMachine } from "./order-state";

export class BillService {
  /**
   * Generates Document A (Mobile/Device Sale Agreement) & Document B (CashALL Purchase Receipt).
   * ENFORCES strict completion criteria before generating bill & marking order COMPLETED.
   */
  static async generateFinalBill(orderId: string) {
    // 1. Fetch full order with all relational verification data
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        user: true,
        address: true,
        quote: {
          include: {
            variant: {
              include: { model: { include: { brand: true } } },
            },
          },
        },
        identityVerifications: true,
        imeiVerifications: true,
        qcReports: true,
        offers: true,
        payments: true,
        signatures: true,
        bills: true,
      },
    });

    if (!order) {
      throw new Error("Order not found for bill generation.");
    }

    // 2. Enforce strict backend completion criteria
    const check = OrderStateMachine.verifyCompletionCriteria(order);
    if (!check.valid) {
      throw new Error(
        `Cannot generate bill. Missing completion requirements: ${check.missingConditions.join(", ")}`
      );
    }

    const billNumber = `CABILL-${order.orderNumber}`;
    const deviceName = `${order.quote.variant.model.brand.name} ${order.quote.variant.model.name}`;
    const payment = order.payments.find((p) => p.status === "PAID" || p.status === "CONFIRMED") || order.payments[0];
    const signature = order.signatures.find((s) => s.status === "ESIGNED") || order.signatures[0];
    const identity = order.identityVerifications[0];
    const imei = order.imeiVerifications[0];

    const billData = {
      billNumber,
      orderNumber: order.orderNumber,
      transactionDate: new Date().toISOString(),
      seller: {
        name: signature?.signerName || order.user.name || "CashALL Seller",
        phoneMasked: order.user.phone ? `+91 ${order.user.phone.slice(0, 2)}****${order.user.phone.slice(-4)}` : "—",
        address: order.address
          ? `${order.address.house}, ${order.address.street}, ${order.address.city}, ${order.address.state} - ${order.address.pincode}`
          : "—",
      },
      device: {
        brand: order.quote.variant.model.brand.name,
        model: order.quote.variant.model.name,
        variant: order.quote.variant.storage,
        imei1: imei?.imei1 || "—",
        imei2: imei?.imei2 || "—",
      },
      financials: {
        estimatedPrice: order.quote.estimatedPrice,
        finalPurchasePrice: order.finalPrice || order.quote.estimatedPrice,
        paymentMethod: payment?.method || "UPI",
        utrNumber: payment?.utrNumber || payment?.transactionRef || "—",
        paymentStatus: payment?.status || "PAID",
      },
      verifications: {
        identityProvider: identity?.provider || "DEMO_MOCK_PROVIDER",
        identityStatus: identity?.status || "VERIFIED",
        identityRef: identity?.referenceId || "—",
        imeiProvider: imei?.provider || "DEMO_MOCK_IMEI",
        imeiStatus: imei?.status || "CLEAR",
        imeiRef: imei?.referenceId || "—",
      },
      declarations: {
        sellerDeclarationText: signature?.sellerDeclaration || "I confirm I am the lawful owner of this device.",
        eSignTimestamp: signature?.signedAt || new Date().toISOString(),
        documentHash: signature?.documentHash || "—",
      },
      cashallInfo: {
        companyName: "CashALL Recommerce Pvt Ltd",
        website: "https://cashall.in",
        contactEmail: "support@cashall.in",
      },
    };

    // Store or update Bill entity
    const billRecord = await prisma.bill.upsert({
      where: { billNumber },
      update: {
        billDataJson: JSON.stringify(billData),
        status: "ISSUED",
        saleAgreementUrl: `https://cashall.in/documents/agreements/${order.orderNumber}.pdf`,
        receiptUrl: `https://cashall.in/documents/receipts/${billNumber}.pdf`,
        signedPdfUrl: `https://cashall.in/documents/signed/${billNumber}.pdf`,
      },
      create: {
        orderId: order.id,
        billNumber,
        saleAgreementUrl: `https://cashall.in/documents/agreements/${order.orderNumber}.pdf`,
        receiptUrl: `https://cashall.in/documents/receipts/${billNumber}.pdf`,
        signedPdfUrl: `https://cashall.in/documents/signed/${billNumber}.pdf`,
        status: "ISSUED",
        billDataJson: JSON.stringify(billData),
      },
    });

    // Mark order COMPLETED
    await prisma.order.update({
      where: { id: orderId },
      data: { status: "COMPLETED" },
    });

    logger.info(`Final Bill #${billNumber} generated successfully for Order ${order.orderNumber}. Transaction COMPLETED.`);
    return { billRecord, billData };
  }
}
