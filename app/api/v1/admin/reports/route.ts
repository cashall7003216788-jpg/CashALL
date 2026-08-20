import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const orders = await prisma.order.findMany({
      where: { deletedAt: null },
      include: {
        user: true,
        address: true,
        agent: true,
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
        pickups: {
          include: { partner: true },
        },
        payments: true,
      },
      orderBy: { createdAt: "desc" },
    });

    const reportEntries = orders.map((ord: any) => {
      // 1. Unified Multi-Stage deviceName resolution
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

      // 2. Correct IST Date Formatting (Asia/Kolkata)
      const d = new Date(ord.createdAt);
      const istDate = d.toLocaleDateString("en-IN", {
        timeZone: "Asia/Kolkata",
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
      }).split("/").reverse().join("-");

      const activePayment = ord.payments?.find((p: any) => p.status === "PAID") || ord.payments?.[0];
      const paymentStatus = activePayment?.status === "PAID" || ord.status === "COMPLETED" ? "PAID" : "PENDING";
      const urn = ord.urn || activePayment?.transactionRef || "N/A";
      const notes = ord.pickups?.[0]?.notes || "";
      const isValidNotesAgent = notes && notes !== "Doorstep pickup order confirmed." && notes !== "Order synced to database automatically.";
      const agentName = ord.agent?.name || (isValidNotesAgent ? notes : (ord.pickups?.[0]?.partner?.name || "In-House Agent"));

      return {
        id: ord.id,
        orderNumber: ord.orderNumber,
        date: istDate,
        customerName: ord.user?.name || "Customer",
        customerPhone: ord.user?.phone || "—",
        customerEmail: ord.user?.email || "—",
        pincode: ord.address?.pincode || "—",
        address: ord.address
          ? `${ord.address.house || ""}, ${ord.address.city || ""}`
          : "Doorstep Address",
        deviceName,
        amountPaid: ord.finalPrice || ord.quote?.estimatedPrice || 0,
        paymentStatus,
        urn,
        agentName,
        status: ord.status,
      };
    });

    // Summary statistics
    const totalOrders = reportEntries.length;
    const paidOrders = reportEntries.filter((r) => r.paymentStatus === "PAID").length;
    const totalPayoutAmount = reportEntries
      .filter((r) => r.paymentStatus === "PAID")
      .reduce((sum, r) => sum + r.amountPaid, 0);

    return NextResponse.json({
      success: true,
      summary: {
        totalOrders,
        paidOrders,
        totalPayoutAmount,
      },
      data: reportEntries,
    });
  } catch (error: any) {
    console.error("Error generating admin report data:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to generate report data" },
      { status: 500 }
    );
  }
}
