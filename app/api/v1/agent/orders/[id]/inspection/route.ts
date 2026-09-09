import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { logger } from "@/lib/utils/logger";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const orderIdentifier = params.id;
    const body = await req.json().catch(() => ({}));

    const { imei, screenFinding, bodyFinding, inspectedAnswers, quotedPrice, revisedPrice, finalPrice, reason, customerEmail, agentName } = body;

    if (!imei || String(imei).trim().length < 5) {
      return NextResponse.json({ success: false, error: "Valid IMEI number is required (min 5 digits)" }, { status: 400 });
    }

    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(orderIdentifier);
    const cleanOrderNum = orderIdentifier.replace(/^#/, "");

    const order = await prisma.order.findFirst({
      where: {
        OR: isUuid
          ? [{ id: orderIdentifier }, { orderNumber: cleanOrderNum }]
          : [{ orderNumber: cleanOrderNum }, { orderNumber: `#${cleanOrderNum}` }],
        deletedAt: null,
      },
      include: { quote: true, user: true },
    });

    if (!order) {
      return NextResponse.json({ success: false, error: "Order not found" }, { status: 404 });
    }

    // 1. Resolve initial online quote price
    let initialQuotePrice = typeof quotedPrice === "number" ? quotedPrice : parseFloat(String(quotedPrice));
    if (!initialQuotePrice && order.quote?.breakdownJson) {
      try {
        const bd = JSON.parse(order.quote.breakdownJson);
        if (typeof bd?.estimatedPrice === "number" && bd.estimatedPrice > 0) {
          initialQuotePrice = bd.estimatedPrice;
        }
      } catch {}
    }
    if (!initialQuotePrice) {
      initialQuotePrice = order.quote?.estimatedPrice || 0;
    }

    // 2. Doorstep physical QC re-quote price (deduction based valuation)
    const revisedPriceVal = typeof revisedPrice === "number"
      ? revisedPrice
      : (parseFloat(String(revisedPrice)) || initialQuotePrice);

    // 3. Final seller agreed payout
    const finalPriceVal = typeof finalPrice === "number"
      ? finalPrice
      : (parseFloat(String(finalPrice)) || revisedPriceVal || initialQuotePrice);

    const physicalAnswersData = inspectedAnswers || { screenFinding, bodyFinding };
    const physicalAnswersString = typeof physicalAnswersData === "object" ? JSON.stringify(physicalAnswersData) : String(physicalAnswersData);

    // 1. Update customer email if provided
    if (customerEmail && String(customerEmail).includes("@")) {
      await prisma.user.update({
        where: { id: order.userId },
        data: { email: String(customerEmail).trim() },
      }).catch(() => {});
    }

    // 2. Create or Update QC Report with doorstep re-quote price (revisedPriceVal)
    const existingQc = await prisma.qcReport.findFirst({ where: { orderId: order.id } });
    if (existingQc) {
      await prisma.qcReport.update({
        where: { id: existingQc.id },
        data: {
          inspectorName: agentName || "Field Logistics Agent",
          imeiNumber: String(imei).trim(),
          physicalAnswersJson: physicalAnswersString,
          revisedPrice: revisedPriceVal,
          priceDifferenceReason: reason || null,
          status: "APPROVED",
          inspectedAt: new Date(),
        },
      });
    } else {
      await prisma.qcReport.create({
        data: {
          orderId: order.id,
          inspectorName: agentName || "Field Logistics Agent",
          imeiNumber: String(imei).trim(),
          declaredAnswersJson: order.quote?.selectedAnswersJson || "{}",
          physicalAnswersJson: physicalAnswersString,
          revisedPrice: revisedPriceVal,
          priceDifferenceReason: reason || null,
          status: "APPROVED",
          inspectedAt: new Date(),
        },
      });
    }

    // 3. Update Quote selectedAnswersJson with inspected physical data
    if (order.quoteId && inspectedAnswers) {
      try {
        await prisma.quote.update({
          where: { id: order.quoteId },
          data: {
            selectedAnswersJson: physicalAnswersString,
          },
        });
      } catch (qErr) {
        logger.warn("Could not update quote answers with inspected data:", qErr);
      }
    }

    // 4. Record IMEI
    const existingImei = await prisma.imei.findFirst({ where: { code: String(imei).trim() } });
    if (!existingImei) {
      await prisma.imei.create({
        data: {
          orderId: order.id,
          code: String(imei).trim(),
          status: "VERIFIED",
        },
      }).catch(() => {});
    } else if (!existingImei.orderId) {
      await prisma.imei.update({
        where: { id: existingImei.id },
        data: { orderId: order.id },
      }).catch(() => {});
    }

    // 5. Update Order Status and Revised Price (preserve completed or cancelled status)
    const shouldPreserveStatus = ["COMPLETED", "CANCELLED", "REJECTED", "BILL_GENERATED"].includes(order.status);
    const updatedOrder = await prisma.order.update({
      where: { id: order.id },
      data: {
        status: shouldPreserveStatus ? order.status : "ACCEPTED",
        finalPrice: finalPriceVal,
      },
      include: {
        user: true,
        address: true,
        quote: true,
        qcReports: true,
        imeiRecords: true,
      },
    });

    logger.info(`[AGENT INSPECTION COMPLETED] Order #${order.orderNumber} - IMEI: ${imei}, Final Offer: ₹${finalPriceVal}`);

    return NextResponse.json({
      success: true,
      message: `Physical inspection completed! Final payout offer locked at ₹${finalPriceVal.toLocaleString("en-IN")}.`,
      order: updatedOrder,
    });
  } catch (error: any) {
    logger.error("Agent inspection route error:", error);
    return NextResponse.json({ success: false, error: error.message || "Failed to save inspection" }, { status: 500 });
  }
}
