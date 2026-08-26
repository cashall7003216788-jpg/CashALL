import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { formatDeviceName, cleanDeviceName } from "@/lib/device";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const agentId = searchParams.get("agentId");
    const phone = searchParams.get("phone");
    const name = searchParams.get("name");

    let targetAgentUser: any = null;

    if (agentId && agentId !== "undefined") {
      const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(agentId);
      if (isUuid) {
        targetAgentUser = await prisma.user.findUnique({ where: { id: agentId } });
      }
    }
    if (!targetAgentUser && phone) {
      targetAgentUser = await prisma.user.findFirst({
        where: { phone, role: "AGENT", deletedAt: null },
      });
    }
    if (!targetAgentUser && name) {
      const normalize = (str?: string | null) => (str || "").toLowerCase().replace(/[^a-z0-9]/g, "").trim();
      const normInput = normalize(name);

      const allAgents = await prisma.user.findMany({
        where: { role: "AGENT", deletedAt: null },
      });

      targetAgentUser = allAgents.find((a) => {
        return normalize(a.name) === normInput || normalize(a.email?.split("@")[0]) === normInput;
      });
    }

    const whereOrConditions: any[] = [];

    if (targetAgentUser?.id) {
      whereOrConditions.push({ agentId: targetAgentUser.id });
    }
    if (targetAgentUser?.name) {
      whereOrConditions.push({
        agent: { name: { equals: targetAgentUser.name, mode: "insensitive" } },
      });
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
        agent: { name: { equals: name, mode: "insensitive" } },
      });
      whereOrConditions.push({
        pickups: {
          some: {
            notes: { contains: name, mode: "insensitive" },
          },
        },
      });
    }

    // STRICT ISOLATION FILTERING:
    // If no agent identification criteria is provided or matched, return an empty array (0 orders).
    if (whereOrConditions.length === 0) {
      return NextResponse.json({
        success: true,
        orders: [],
      });
    }

    const where: any = {
      deletedAt: null,
      OR: whereOrConditions,
    };

    const orders = await prisma.order.findMany({
      where,
      include: {
        user: true,
        address: true,
        pickups: true,
        qcReports: true,
        imeiRecords: true,
        payments: true,
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
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    const mapped = orders.map((ord: any) => {
      let fullAddress = "Doorstep Location";
      if (ord.address) {
        const parts = [
          ord.address.house,
          ord.address.street,
          ord.address.area,
          ord.address.city,
          ord.address.state ? `${ord.address.state} - ${ord.address.pincode}` : ord.address.pincode,
        ].filter(Boolean);
        fullAddress = parts.join(", ");
      }

      // Resolve accurate clean device name (priority on evaluated breakdownJson/selectedAnswersJson)
      let explicitDeviceName = "";
      if (ord.quote?.breakdownJson) {
        try {
          const bd = JSON.parse(ord.quote.breakdownJson);
          if (bd?.deviceName) explicitDeviceName = bd.deviceName;
        } catch {}
      }
      if (!explicitDeviceName && ord.quote?.selectedAnswersJson) {
        try {
          const sa = JSON.parse(ord.quote.selectedAnswersJson);
          if (sa?.device && sa.device !== "Customer Mobile Device") explicitDeviceName = sa.device;
        } catch {}
      }

      let brandName = ord.quote?.variant?.model?.brand?.name || "";
      let modelName = ord.quote?.variant?.model?.name || "";
      let storage = ord.quote?.variant?.storage || "";

      let deviceName = explicitDeviceName || formatDeviceName(brandName, modelName, storage) || "Mobile Device";
      deviceName = cleanDeviceName(deviceName);

      const activePickup = ord.pickups?.[0];
      const qcReport = ord.qcReports?.[0];
      const imeiCode = ord.imeiRecords?.[0]?.code || qcReport?.imeiNumber || (ord as any).imeiNumber || "";
      const activePayment = ord.payments?.[0];

      let finalSettled = ord.finalPrice;
      if (!finalSettled && qcReport?.revisedPrice) {
        finalSettled = qcReport.revisedPrice;
      }
      if (!finalSettled && ord.status === "COMPLETED") {
        finalSettled = ord.quote?.estimatedPrice;
      }

      return {
        id: ord.id,
        orderNumber: ord.orderNumber,
        customerName: ord.user?.name || "Customer",
        customerPhone: ord.user?.phone || ord.address?.phone || "—",
        customerEmail: ord.user?.email || "—",
        deviceName,
        imeiNumber: imeiCode,
        estimatedPrice: ord.quote?.estimatedPrice || 0,
        finalPrice: finalSettled,
        amount: finalSettled || ord.quote?.estimatedPrice || 0,
        address: fullAddress,
        addressSummary: fullAddress,
        pickupDate: ord.pickupDate || activePickup?.date || "Scheduled",
        pickupTimeSlot: ord.pickupTimeSlot || activePickup?.timeSlot || "Standard",
        pincode: ord.address?.pincode || "700001",
        status: ord.status,
        paymentStatus: activePayment?.status || (ord.status === "COMPLETED" ? "PAID" : "PENDING"),
        urn: ord.urn && !ord.urn.startsWith("PAID-") && ord.urn !== "128158907549" && ord.urn !== "623480124575" ? ord.urn : (activePayment?.transactionRef && !activePayment.transactionRef.startsWith("PAID-") && activePayment.transactionRef !== "128158907549" ? activePayment.transactionRef : null),
        paymentScreenshotUrl: ord.paymentScreenshotUrl || null,
        agentName: targetAgentUser?.name || "CashALL Agent",
        selectedAnswersJson: ord.quote?.selectedAnswersJson || (ord as any).selectedAnswersJson || null,
        breakdownJson: ord.quote?.breakdownJson || (ord as any).breakdownJson || null,
        priceDifferenceReason: qcReport?.priceDifferenceReason || ord.offers?.[0]?.priceDifferenceReason || (ord as any).priceDifferenceReason || null,
        quoteNumber: ord.quote?.quoteNumber || null,
        createdAt: ord.createdAt,
      };
    });

    return NextResponse.json({
      success: true,
      orders: mapped,
    });
  } catch (error: any) {
    console.error("Agent orders API error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}
