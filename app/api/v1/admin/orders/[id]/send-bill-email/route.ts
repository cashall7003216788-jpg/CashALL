import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { EmailService } from "@/lib/services/email.service";
import { formatDeviceName, cleanDeviceName } from "@/lib/device";
import { logger } from "@/lib/utils/logger";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const orderIdentifier = params.id;
    const body = await req.json().catch(() => ({}));

    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(orderIdentifier);
    const cleanOrderNum = orderIdentifier.replace(/^#/, "");

    const order = await prisma.order.findFirst({
      where: {
        OR: isUuid
          ? [{ id: orderIdentifier }, { orderNumber: cleanOrderNum }]
          : [{ orderNumber: cleanOrderNum }, { orderNumber: `#${cleanOrderNum}` }],
        deletedAt: null,
      },
      include: {
        user: true,
        address: true,
        agent: true,
        pickups: { include: { partner: true } },
        payments: true,
        qcReports: true,
        imeiRecords: true,
        quote: {
          include: {
            variant: {
              include: {
                model: {
                  include: { brand: true },
                },
              },
            },
          },
        },
      },
    });

    if (!order) {
      return NextResponse.json({ success: false, error: `Order #${cleanOrderNum} not found in database.` }, { status: 404 });
    }

    // Determine target recipient email
    let recipientEmail = body.customerEmail || order.user?.email || (order as any).customerEmail || "";
    recipientEmail = String(recipientEmail).trim();

    if (!recipientEmail || !recipientEmail.includes("@")) {
      return NextResponse.json({
        success: false,
        error: "No valid recipient email address provided for this order.",
      }, { status: 400 });
    }

    // Update user's email if missing in DB
    if (order.user && (!order.user.email || order.user.email !== recipientEmail)) {
      try {
        await prisma.user.update({
          where: { id: order.user.id },
          data: { email: recipientEmail },
        });
      } catch (e) {
        logger.warn(`Could not update user email: ${e}`);
      }
    }

    // Resolve accurate clean device name
    let explicitDeviceName = "";
    if (order.quote?.breakdownJson) {
      try {
        const bd = JSON.parse(order.quote.breakdownJson);
        if (bd?.deviceName) explicitDeviceName = bd.deviceName;
      } catch {}
    }
    if (!explicitDeviceName && order.quote?.selectedAnswersJson) {
      try {
        const sa = JSON.parse(order.quote.selectedAnswersJson);
        if (sa?.device) explicitDeviceName = sa.device;
      } catch {}
    }

    let brandName = order.quote?.variant?.model?.brand?.name || "";
    let modelName = order.quote?.variant?.model?.name || "";
    let variantStorage = order.quote?.variant?.storage || "";

    let fullDeviceName = explicitDeviceName || formatDeviceName(brandName, modelName, variantStorage);
    fullDeviceName = cleanDeviceName(fullDeviceName);

    const payment = order.payments?.find((p) => p.status === "PAID") || order.payments?.[0];
    const finalPrice = typeof body.finalPrice === "number"
      ? body.finalPrice
      : (order.finalPrice || order.qcReports?.[0]?.revisedPrice || order.quote?.estimatedPrice || 0);

    const rawUtr = body.utr || order.urn || payment?.transactionRef || (order as any).utr || "";
    const utr = rawUtr && !rawUtr.startsWith("PAID-") && rawUtr !== "623480124575" ? rawUtr : "";
    const agentName = order.agent?.name || order.pickups?.[0]?.notes || "HYDER ALI";

    const customerAddress = order.address
      ? [order.address.house, order.address.street, order.address.area, order.address.city, order.address.state ? `${order.address.state} - ${order.address.pincode}` : order.address.pincode].filter(Boolean).join(", ")
      : "158, ghughupara road, bhattanagar, liluah, howrah, West Bengal - 711203";

    const orderDateFormatted = order.createdAt
      ? new Date(order.createdAt).toLocaleString("en-IN", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" })
      : undefined;

    const completedDateFormatted = (order.updatedAt || payment?.createdAt)
      ? new Date(order.updatedAt || payment?.createdAt || Date.now()).toLocaleString("en-IN", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" })
      : new Date().toLocaleString("en-IN", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" });

    // Send PDF invoice email via multi-tier SMTP
    const mailRes = await EmailService.sendInvoicePdfEmail({
      to: recipientEmail,
      orderNumber: order.orderNumber,
      customerName: order.user?.name || "Customer",
      customerPhone: order.user?.phone ? `+91 ${order.user.phone}` : "+91 6289477287",
      customerAddress,
      deviceName: fullDeviceName,
      finalPrice,
      urn: utr,
      orderDate: orderDateFormatted,
      completedDate: completedDateFormatted,
      agentName,
    });

    logger.info(`[SEND BILL EMAIL] Dispatched PDF invoice for order #${order.orderNumber} to ${recipientEmail} via ${mailRes.provider}`);

    return NextResponse.json({
      success: true,
      message: `Tax Invoice & Official Bill Email sent successfully to ${recipientEmail}!`,
      provider: mailRes.provider,
      messageId: mailRes.messageId,
    });
  } catch (error: any) {
    logger.error("Send bill email error:", error);
    return NextResponse.json({
      success: false,
      error: error.message || "Failed to send bill email.",
    }, { status: 500 });
  }
}
