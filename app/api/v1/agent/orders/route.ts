import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const agentId = searchParams.get("agentId");
    const phone = searchParams.get("phone");
    const name = searchParams.get("name");

    let targetAgentUser: any = null;

    if (agentId && agentId !== "undefined") {
      targetAgentUser = await prisma.user.findUnique({ where: { id: agentId } });
    }
    if (!targetAgentUser && phone) {
      targetAgentUser = await prisma.user.findFirst({
        where: { phone, role: "AGENT", deletedAt: null },
      });
    }
    if (!targetAgentUser && name) {
      targetAgentUser = await prisma.user.findFirst({
        where: { name: { equals: name, mode: "insensitive" }, role: "AGENT", deletedAt: null },
      });
    }

    const whereOrConditions: any[] = [];

    if (agentId && agentId !== "undefined") {
      whereOrConditions.push({ agentId });
    }
    if (targetAgentUser?.id) {
      whereOrConditions.push({ agentId: targetAgentUser.id });
    }
    if (targetAgentUser?.name) {
      whereOrConditions.push({
        pickups: {
          some: {
            notes: { contains: targetAgentUser.name, mode: "insensitive" },
          },
        },
      });
    }
    if (name) {
      whereOrConditions.push({
        pickups: {
          some: {
            notes: { contains: name, mode: "insensitive" },
          },
        },
      });
    }

    // Build query to fetch assigned lead orders for this field agent
    const where: any = {
      deletedAt: null,
      ...(whereOrConditions.length > 0 ? { OR: whereOrConditions } : {}),
    };

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
      if (ord.quote?.breakdownJson) {
        try {
          const bd = JSON.parse(ord.quote.breakdownJson);
          if (bd && typeof bd === "object" && !Array.isArray(bd) && bd.deviceName) {
            deviceName = bd.deviceName;
          }
        } catch {}
      }
      if (deviceName === "Mobile Device" && ord.quote?.selectedAnswersJson) {
        try {
          const sa = JSON.parse(ord.quote.selectedAnswersJson);
          if (sa?.device && sa.device !== "Customer Mobile Device") deviceName = sa.device;
        } catch {}
      }
      if (deviceName === "Mobile Device" && ord.quote?.variant?.model) {
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
