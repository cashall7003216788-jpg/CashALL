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
      let deviceName = "Mobile Device";
      if (ord.quote?.variant?.model) {
        const m = ord.quote.variant.model;
        deviceName = m.brand ? `${m.brand.name} ${m.name}` : m.name;
      }

      const activePayment = ord.payments?.find((p: any) => p.status === "PAID") || ord.payments?.[0];
      const paymentStatus = activePayment?.status === "PAID" || ord.status === "COMPLETED" ? "PAID" : "PENDING";
      const urn = ord.urn || activePayment?.transactionRef || "N/A";
      const agentName = ord.agent?.name || ord.pickups?.[0]?.notes || "In-House Agent";

      return {
        id: ord.id,
        orderNumber: ord.orderNumber,
        date: ord.createdAt.toISOString().split("T")[0],
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
