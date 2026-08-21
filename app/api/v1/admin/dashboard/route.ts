import { NextRequest, NextResponse } from "next/server";
import { apiWrapper } from "@/lib/utils/api-wrapper";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

const MAIN_ORDERS = ["CA33039", "CA83848", "CA36738"];
const MAIN_QUOTES = ["Q569571-6808", "Q593558-6690", "CAQ-367384"];

export const GET = apiWrapper(async (req: NextRequest) => {
  const [
    todayQuotes,
    totalOrders,
    pickupsToday,
    pendingInspections,
    pendingPayments,
    completedSales,
    recentOrdersRaw,
  ] = await Promise.all([
    prisma.quote.count({ where: { deletedAt: null } }),
    prisma.order.count({ where: { deletedAt: null } }),
    prisma.order.count({ where: { status: "PICKUP_SCHEDULED", deletedAt: null } }),
    prisma.order.count({ where: { status: "INSPECTION_STARTED", deletedAt: null } }),
    prisma.payment.count({ where: { status: "PENDING" } }),
    prisma.order.count({ where: { status: "COMPLETED", deletedAt: null } }),
    prisma.order.findMany({
      where: { deletedAt: null },
      include: {
        user: { select: { name: true, phone: true } },
        quote: true,
      },
      orderBy: { createdAt: "desc" },
      take: 20,
    }),
  ]);

  const recentOrders = recentOrdersRaw.map((ord) => ({
    id: ord.id,
    orderNumber: ord.orderNumber,
    customerName: ord.user?.name || "—",
    customerPhone: ord.user?.phone || "—",
    pickupDate: ord.pickupDate,
    pickupTimeSlot: ord.pickupTimeSlot,
    estimatedPrice: ord.quote?.estimatedPrice ?? 0,
    revisedPrice: ord.finalPrice ?? null,
    status: ord.status,
  }));

  return NextResponse.json({
    success: true,
    stats: {
      todayQuotes,
      todayOrders: totalOrders,
      pickupsToday,
      pendingInspections,
      pendingPayments,
      completedSales,
    },
    recentOrders,
  });
});
