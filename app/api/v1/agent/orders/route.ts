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

    // ─── SINGLE efficient agent lookup (one DB call) ──────────────────
    let targetAgentId: string | null = null;
    let targetAgentName: string | null = null;

    if (agentId && agentId !== "undefined" && /^[0-9a-f-]{36}$/i.test(agentId)) {
      // Already have a UUID — use it directly, no extra DB lookup needed
      targetAgentId = agentId;
    } else {
      // Build a single OR query to find the agent by phone or name in one shot
      const orConditions: any[] = [];
      if (phone) orConditions.push({ phone, role: "AGENT" as const });
      if (name) {
        orConditions.push({ name: { equals: name.trim(), mode: "insensitive" as const }, role: "AGENT" as const });
      }

      if (orConditions.length > 0) {
        const agent = await prisma.user.findFirst({
          where: {
            deletedAt: null,
            OR: orConditions,
          },
          select: { id: true, name: true },
        });

        if (agent) {
          targetAgentId = agent.id;
          targetAgentName = agent.name;
        } else if (name) {
          // Fuzzy fallback: normalize and compare in JS — fetch only agents (lightweight)
          const normalize = (str?: string | null) =>
            (str || "").toLowerCase().replace(/[^a-z0-9]/g, "").trim();
          const normInput = normalize(name);
          const allAgents = await prisma.user.findMany({
            where: { role: "AGENT", deletedAt: null },
            select: { id: true, name: true, email: true },
          });
          const matched = allAgents.find(
            (a) =>
              normalize(a.name) === normInput ||
              normalize(a.email?.split("@")[0]) === normInput
          );
          if (matched) {
            targetAgentId = matched.id;
            targetAgentName = matched.name;
          }
        }
      }
    }

    // If we couldn't identify any agent, return empty immediately
    if (!targetAgentId) {
      return NextResponse.json({ success: true, orders: [] });
    }

    // ─── Main order query — scoped strictly to this agent ────────────
    const orders = await prisma.order.findMany({
      where: {
        deletedAt: null,
        agentId: targetAgentId,
      },
      include: {
        user: { select: { name: true, phone: true, email: true } },
        address: true,
        pickups: { take: 1, orderBy: { createdAt: "desc" } },
        qcReports: { take: 1, orderBy: { inspectedAt: "desc" } },
        imeiRecords: { take: 1, orderBy: { createdAt: "desc" } },
        payments: { take: 1, orderBy: { createdAt: "desc" } },
        quote: {
          select: {
            quoteNumber: true,
            estimatedPrice: true,
            breakdownJson: true,
            selectedAnswersJson: true,
            variant: {
              select: {
                storage: true,
                model: {
                  select: {
                    name: true,
                    brand: { select: { name: true } },
                  },
                },
              },
            },
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    const agentDisplayName = targetAgentName || "CashALL Agent";

    const mapped = orders.map((ord: any) => {
      let fullAddress = "Doorstep Location";
      if (ord.address) {
        const parts = [
          ord.address.house,
          ord.address.street,
          ord.address.area,
          ord.address.city,
          ord.address.state
            ? `${ord.address.state} - ${ord.address.pincode}`
            : ord.address.pincode,
        ].filter(Boolean);
        fullAddress = parts.join(", ");
      }

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
          if (sa?.device && sa.device !== "Customer Mobile Device")
            explicitDeviceName = sa.device;
        } catch {}
      }

      const brandName = ord.quote?.variant?.model?.brand?.name || "";
      const modelName = ord.quote?.variant?.model?.name || "";
      const storage = ord.quote?.variant?.storage || "";
      let deviceName =
        explicitDeviceName ||
        formatDeviceName(brandName, modelName, storage) ||
        "Mobile Device";
      deviceName = cleanDeviceName(deviceName);

      const activePickup = ord.pickups?.[0];
      const qcReport = ord.qcReports?.[0];
      const imeiCode =
        ord.imeiRecords?.[0]?.code ||
        qcReport?.imeiNumber ||
        (ord as any).imeiNumber ||
        "";
      const activePayment = ord.payments?.[0];

      let quotedPrice = 0;
      if (ord.quote?.breakdownJson) {
        try {
          const bd = JSON.parse(ord.quote.breakdownJson);
          if (typeof bd?.estimatedPrice === "number" && bd.estimatedPrice > 0) {
            quotedPrice = bd.estimatedPrice;
          }
        } catch {}
      }
      if (!quotedPrice) quotedPrice = ord.quote?.estimatedPrice || 0;

      const requotedPrice = qcReport?.revisedPrice ?? quotedPrice;
      const finalSettled =
        ord.finalPrice ??
        activePayment?.amount ??
        (ord.status === "COMPLETED" ? requotedPrice || quotedPrice : null);
      const finalPrice = finalSettled ?? requotedPrice ?? quotedPrice;

      return {
        id: ord.id,
        orderNumber: ord.orderNumber,
        customerName: ord.user?.name || "Customer",
        customerPhone: ord.user?.phone || ord.address?.phone || "—",
        customerEmail: ord.user?.email || "—",
        deviceName,
        imeiNumber: imeiCode,
        quotedPrice,
        requotedPrice,
        revisedPrice: requotedPrice,
        estimatedPrice: quotedPrice,
        finalPrice,
        amount: finalPrice,
        address: fullAddress,
        addressSummary: fullAddress,
        pickupDate: ord.pickupDate || activePickup?.date || "Scheduled",
        pickupTimeSlot: ord.pickupTimeSlot || activePickup?.timeSlot || "Standard",
        pincode: ord.address?.pincode || "700001",
        status: ord.status,
        paymentStatus:
          activePayment?.status ||
          (ord.status === "COMPLETED" ? "PAID" : "PENDING"),
        urn:
          ord.urn &&
          !ord.urn.startsWith("PAID-") &&
          ord.urn !== "128158907549" &&
          ord.urn !== "623480124575"
            ? ord.urn
            : activePayment?.transactionRef &&
              !activePayment.transactionRef.startsWith("PAID-") &&
              activePayment.transactionRef !== "128158907549"
            ? activePayment.transactionRef
            : null,
        paymentScreenshotUrl: ord.paymentScreenshotUrl || null,
        agentName: agentDisplayName,
        selectedAnswersJson:
          ord.quote?.selectedAnswersJson ||
          (ord as any).selectedAnswersJson ||
          null,
        breakdownJson:
          ord.quote?.breakdownJson || (ord as any).breakdownJson || null,
        priceDifferenceReason:
          qcReport?.priceDifferenceReason ||
          ord.offers?.[0]?.priceDifferenceReason ||
          (ord as any).priceDifferenceReason ||
          null,
        quoteNumber: ord.quote?.quoteNumber || null,
        cancellationReason:
          ord.cancellationReason ||
          (activePickup?.notes?.startsWith("Order Cancelled:")
            ? activePickup.notes.replace(/^Order Cancelled:\s*/i, "")
            : null) ||
          null,
        createdAt: ord.createdAt,
      };
    });

    return NextResponse.json({ success: true, orders: mapped });
  } catch (error: any) {
    console.error("Agent orders API error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}
