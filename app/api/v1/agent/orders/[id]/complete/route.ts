import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { EmailService } from "@/lib/services/email.service";
import { logger } from "@/lib/utils/logger";
import { formatDeviceName, cleanDeviceName } from "@/lib/device";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const orderIdentifier = params.id;
    const body = await req.json().catch(() => ({}));

    const { finalPrice, utr, agentName } = body;

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
        qcReports: true,
        imeiRecords: true,
        quote: { include: { variant: { include: { model: { include: { brand: true } } } } } },
      },
    });

    if (!order) {
      return NextResponse.json({ success: false, error: "Order not found" }, { status: 404 });
    }

    const price = typeof finalPrice === "number" 
      ? finalPrice 
      : (parseFloat(String(finalPrice)) || order.finalPrice || order.qcReports?.[0]?.revisedPrice || order.quote?.estimatedPrice || 0);
    const cleanUtr = typeof utr === "string" ? utr.trim() : "";
    const transactionRef = cleanUtr && !cleanUtr.startsWith("PAID-") ? cleanUtr : (order.urn && !order.urn.startsWith("PAID-") ? order.urn : null);

    // 1. Create or update payment record
    const existingPayment = await prisma.payment.findFirst({ where: { orderId: order.id } });
    if (!existingPayment) {
      await prisma.payment.create({
        data: {
          orderId: order.id,
          amount: price,
          method: "UPI",
          status: "PAID",
          transactionRef,
          paidAt: new Date(),
        },
      });
    } else {
      await prisma.payment.update({
        where: { id: existingPayment.id },
        data: {
          amount: price,
          status: "PAID",
          transactionRef,
          paidAt: new Date(),
        },
      });
    }

    // 2. Update order status to COMPLETED
    const updatedOrder = await prisma.order.update({
      where: { id: order.id },
      data: {
        status: "COMPLETED",
        finalPrice: price,
        urn: transactionRef,
      },
      include: {
        user: true,
        address: true,
        payments: true,
      },
    });

    const activeAgentName = agentName || order.agent?.name || order.pickups?.[0]?.notes || "CashALL Field Agent";
    const customerAddressStr = order.address
      ? `${order.address.house || ""}, ${order.address.street || ""}, ${order.address.city || ""}`
      : "Doorstep Address";
    const pincodeStr = order.address?.pincode || "—";
    const phoneStr = order.user?.phone || "—";

    // 3. Trigger Google Sheets Auto-Sync
    const host = req.headers.get("host") || "localhost:3000";
    const protocol = host.includes("localhost") ? "http" : "https";
    const syncSheetsUrl = `${protocol}://${host}/api/sync-sheets`;

    fetch(syncSheetsUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        date: new Date().toISOString().split("T")[0],
        urn: transactionRef,
        amountPaid: price,
        agentName: activeAgentName,
        orderId: order.orderNumber,
        customerAddress: customerAddressStr,
        pincode: pincodeStr,
        customerPhone: phoneStr,
      }),
    }).catch((syncErr) =>
      logger.warn(`Google Sheets auto-sync notice on completion for order #${order.orderNumber}: ${syncErr.message}`)
    );

    const customerEmail = order.user?.email || (order as any).customerEmail || "";
    let emailSent = false;
    let emailProvider: string | null = null;
    let emailError: string | null = null;

    if (customerEmail && customerEmail.includes("@")) {
      let deviceName = "Mobile Device";
      if (order.quote?.breakdownJson) {
        try {
          const bd = JSON.parse(order.quote.breakdownJson);
          if (bd?.deviceName) deviceName = bd.deviceName;
        } catch {}
      }
      if (deviceName === "Mobile Device" && order.quote?.selectedAnswersJson) {
        try {
          const sa = JSON.parse(order.quote.selectedAnswersJson);
          if (sa?.device) deviceName = sa.device;
        } catch {}
      }
      if (deviceName === "Mobile Device" && order.quote?.variant?.model) {
        const m = order.quote.variant.model;
        const b = m.brand?.name || "";
        deviceName = formatDeviceName(b, m.name, order.quote.variant.storage);
      }
      deviceName = cleanDeviceName(deviceName);

      try {
        const mailRes = await EmailService.sendInvoicePdfEmail({
          to: customerEmail,
          orderNumber: order.orderNumber,
          customerName: order.user?.name || "Customer",
          customerPhone: phoneStr,
          customerAddress: customerAddressStr,
          deviceName,
          quotedPrice: order.quote?.estimatedPrice || price,
          requotedPrice: order.qcReports?.[0]?.revisedPrice || price,
          finalPrice: price,
          urn: transactionRef || "",
          agentName: activeAgentName,
        });
        emailSent = mailRes.success;
        emailProvider = mailRes.provider || null;
      } catch (emailErr: any) {
        emailError = emailErr.message || String(emailErr);
        logger.error(`Failed to send PDF invoice email to ${customerEmail}:`, emailErr);
      }
    }

    logger.info(`[AGENT COMPLETED ORDER] #${order.orderNumber} marked COMPLETED & PAID by ${activeAgentName}. Sheets synced & PDF invoice: ${emailSent ? "Sent via " + emailProvider : "Failed: " + emailError}.`);

    return NextResponse.json({
      success: true,
      message: `Order #${order.orderNumber} marked as COMPLETED & PAID.${emailSent ? ` Tax Invoice email sent to ${customerEmail} via ${emailProvider}.` : emailError ? ` (Email issue: ${emailError})` : ""}`,
      emailSent,
      emailProvider,
      emailError,
      order: updatedOrder,
    });
  } catch (error: any) {
    logger.error("Agent complete order error:", error);
    return NextResponse.json({ success: false, error: error.message || "Failed to complete order" }, { status: 500 });
  }
}
