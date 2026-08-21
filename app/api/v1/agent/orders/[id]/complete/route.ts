import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { EmailService } from "@/lib/services/email.service";
import { logger } from "@/lib/utils/logger";

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
    const transactionRef = utr || order.urn || `PAID-${Date.now()}`;

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

    // 4. Send PDF Tax Invoice & Bill Email to Customer
    const customerEmail = order.user?.email || (order as any).customerEmail;
    if (customerEmail && customerEmail.includes("@")) {
      let deviceName = "Mobile Device";
      if (order.quote?.variant?.model) {
        const m = order.quote.variant.model;
        deviceName = m.brand ? `${m.brand.name} ${m.name}` : m.name;
      }

      EmailService.sendInvoicePdfEmail({
        to: customerEmail,
        orderNumber: order.orderNumber,
        customerName: order.user?.name || "Customer",
        customerPhone: phoneStr,
        customerAddress: customerAddressStr,
        deviceName,
        finalPrice: price,
        urn: transactionRef,
        agentName: activeAgentName,
      }).catch((emailErr) => logger.error(`Failed to send PDF invoice email to ${customerEmail}:`, emailErr));
    }

    logger.info(`[AGENT COMPLETED ORDER] #${order.orderNumber} marked COMPLETED & PAID by ${activeAgentName}. Sheets synced & PDF invoice dispatched.`);

    return NextResponse.json({
      success: true,
      message: `Order #${order.orderNumber} marked as COMPLETED & PAID. Tax Invoice email sent to ${customerEmail || "customer"}.`,
      order: updatedOrder,
    });
  } catch (error: any) {
    logger.error("Agent complete order error:", error);
    return NextResponse.json({ success: false, error: error.message || "Failed to complete order" }, { status: 500 });
  }
}
