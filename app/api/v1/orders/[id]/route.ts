import { NextRequest, NextResponse } from "next/server";
import { apiWrapper } from "@/lib/utils/api-wrapper";
import { verifyAuthToken } from "@/lib/middlewares/auth";
import { prisma } from "@/lib/db";
import { AppError } from "@/lib/utils/AppError";

export const GET = apiWrapper(async (req: NextRequest, { params }: { params: { id: string } }) => {
  const orderIdentifier = params.id;

  const order = await prisma.order.findFirst({
    where: {
      OR: [
        { id: orderIdentifier },
        { orderNumber: orderIdentifier },
      ],
      deletedAt: null,
    },
    include: {
      user: true,
      quote: {
        include: {
          variant: {
            include: {
              model: {
                include: {
                  brand: true,
                },
              },
            },
          },
        },
      },
      address: true,
      pickups: {
        include: {
          partner: true,
        },
        orderBy: { createdAt: "desc" },
      },
      qcReports: {
        orderBy: { inspectedAt: "desc" },
      },
      offers: {
        orderBy: { createdAt: "desc" },
      },
      payments: {
        orderBy: { createdAt: "desc" },
      },
      invoices: {
        orderBy: { createdAt: "desc" },
      },
    },
  });

  if (!order) {
    throw new AppError("Order not found.", 404);
  }

  // Resolve device name & location summary
  const addr = order.address;
  const addressSummary = addr
    ? [addr.house, addr.street, addr.area, addr.landmark, addr.city, addr.state].filter(Boolean).join(", ") + (addr.pincode ? ` - ${addr.pincode}` : "")
    : "Doorstep Location";

  let deviceName = "Mobile Device";
  if (order.quote?.breakdownJson) {
    try {
      const bd = JSON.parse(order.quote.breakdownJson);
      if (bd?.deviceName) deviceName = bd.deviceName;
    } catch {}
  }
  if (deviceName === "Mobile Device" && order.quote?.variant?.model) {
    const m = order.quote.variant.model;
    deviceName = m.brand ? `${m.brand.name} ${m.name}` : m.name;
  }

  const assignedPartner = order.pickups?.[0]?.partner;
  const pickup = order.pickups?.[0];
  const assignedAgentName = (pickup?.notes && pickup.notes !== "Doorstep pickup order confirmed." && pickup.notes !== "Order synced to database automatically.")
    ? pickup.notes
    : (assignedPartner?.name || assignedPartner?.businessName || null);

  const activePayment = order.payments?.find((p: any) => p.status === "PAID") || order.payments?.[0];

  return NextResponse.json({
    success: true,
    data: {
      ...order,
      deviceName,
      addressSummary,
      customerName: order.user?.name || "Customer",
      customerPhone: order.user?.phone || "—",
      customerEmail: order.user?.email || null,
      assignedPartnerName: assignedAgentName,
      assignedPartnerPhone: assignedPartner?.phone || "7003216788",
      assignedPartnerBusiness: assignedPartner?.businessName || "CashALL Express Logistics",
      utr: activePayment?.transactionRef || "",
      revisedPrice: order.finalPrice ?? order.quote?.estimatedPrice ?? 0,
      estimatedPrice: order.quote?.estimatedPrice ?? 0,
    },
  });
});
