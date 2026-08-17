import { NextRequest, NextResponse } from "next/server";
import { apiWrapper } from "@/lib/utils/api-wrapper";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

export const GET = apiWrapper(async (req: NextRequest) => {
  const { searchParams } = new URL(req.url);
  const phone = searchParams.get("phone") || searchParams.get("mobile");

  if (!phone) {
    return NextResponse.json({ success: true, orders: [] });
  }

  // Clean phone number (strip +91, spaces)
  const cleanPhone = phone.replace(/\D/g, "").slice(-10);

  const orders = await prisma.order.findMany({
    where: {
      deletedAt: null,
      user: {
        phone: {
          contains: cleanPhone,
        },
      },
    },
    include: {
      user: true,
      address: true,
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
      pickups: true,
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  const formattedOrders = orders.map((ord) => {
    // Resolve deviceName from multiple sources in priority order
    let deviceName = "Mobile Device";

    // 1. Try breakdownJson (new object format with deviceName key)
    if (ord.quote?.breakdownJson) {
      try {
        const bd = JSON.parse(ord.quote.breakdownJson);
        if (bd && typeof bd === "object" && !Array.isArray(bd) && bd.deviceName) {
          deviceName = bd.deviceName;
        }
      } catch (e) {}
    }

    // 2. Try selectedAnswersJson.device (backup)
    if (deviceName === "Mobile Device" && ord.quote?.selectedAnswersJson) {
      try {
        const sa = JSON.parse(ord.quote.selectedAnswersJson);
        if (sa?.device && sa.device !== "Customer Mobile Device") deviceName = sa.device;
      } catch (e) {}
    }

    // 3. Try variant -> model -> brand chain
    if (deviceName === "Mobile Device" && ord.quote?.variant?.model) {
      const m = ord.quote.variant.model;
      deviceName = m.brand ? `${m.brand.name} ${m.name}` : m.name;
    }

    const basePrice = ord.quote?.basePrice || 0;
    const estimatedPrice = ord.quote?.estimatedPrice || ord.finalPrice || 0;

    const pickup = ord.pickups && ord.pickups.length > 0 ? ord.pickups[0] : null;

    return {
      id: ord.id,
      orderNumber: ord.orderNumber,
      quoteId: ord.quoteId,
      userId: ord.userId,
      customerName: ord.user?.name || "Customer",
      customerPhone: ord.user?.phone || phone,
      deviceName,
      pincode: ord.address?.pincode || "700001",
      addressSummary: ord.address
        ? `${ord.address.house || ""}, ${ord.address.street || ""}, ${ord.address.city || ""}, ${ord.address.state || ""} - ${ord.address.pincode || ""}`
        : "Address on file",
      pickupDate: pickup?.date ? pickup.date : "Tomorrow",
      pickupTimeSlot: pickup?.timeSlot || "10 AM - 1 PM",
      status: ord.status,
      assignedPartnerName: undefined,
      estimatedPrice,
      revisedPrice: ord.finalPrice || estimatedPrice,
      declaredConditionSummary: `${deviceName} - ₹${estimatedPrice.toLocaleString("en-IN")}`,
      createdAt: ord.createdAt.toISOString(),
      updatedAt: ord.updatedAt.toISOString(),
    };
  });

  return NextResponse.json({
    success: true,
    orders: formattedOrders,
  });
});
