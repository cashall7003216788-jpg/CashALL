import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const agentId = searchParams.get("agentId");
    const phone = searchParams.get("phone");

    const where: any = {
      deletedAt: null,
    };

    if (agentId) {
      where.agentId = agentId;
    } else if (phone) {
      const agentUser = await prisma.user.findFirst({
        where: { phone, role: "AGENT" },
      });
      if (agentUser) {
        where.agentId = agentUser.id;
      }
    }

    const orders = await prisma.order.findMany({
      where,
      include: {
        user: true,
        address: true,
        agent: true,
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
        pickups: {
          include: { partner: true },
        },
        payments: true,
      },
      orderBy: { createdAt: "desc" },
    });

    const formatted = orders.map((ord: any) => {
      let deviceName = "Mobile Device";
      if (ord.quote?.variant?.model) {
        const m = ord.quote.variant.model;
        deviceName = m.brand ? `${m.brand.name} ${m.name}` : m.name;
      }

      const activePayment = ord.payments?.find((p: any) => p.status === "PAID") || ord.payments?.[0];
      const paymentStatus = activePayment?.status === "PAID" || ord.status === "COMPLETED" ? "PAID" : "PENDING";

      return {
        id: ord.id,
        orderNumber: ord.orderNumber,
        customerName: ord.user?.name || "Customer",
        customerPhone: ord.user?.phone || "—",
        customerEmail: ord.user?.email || null,
        pincode: ord.address?.pincode || "—",
        address: ord.address
          ? `${ord.address.house || ""}, ${ord.address.street || ""}, ${ord.address.city || ""}, ${ord.address.state || ""} - ${ord.address.pincode || ""}`
          : "Doorstep Pickup Address",
        deviceName,
        pickupDate: ord.pickupDate || "Today",
        pickupTimeSlot: ord.pickupTimeSlot || "Standard Slot",
        amount: ord.finalPrice || ord.quote?.estimatedPrice || 0,
        status: ord.status,
        paymentStatus,
        urn: ord.urn || activePayment?.transactionRef || null,
        paymentScreenshotUrl: ord.paymentScreenshotUrl || null,
      };
    });

    return NextResponse.json({
      success: true,
      orders: formatted,
    });
  } catch (error: any) {
    console.error("Error fetching agent orders:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to fetch agent orders" },
      { status: 500 }
    );
  }
}
