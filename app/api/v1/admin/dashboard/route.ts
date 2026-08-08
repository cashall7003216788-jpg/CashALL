import { NextRequest, NextResponse } from "next/server";
import { apiWrapper } from "@/lib/utils/api-wrapper";
import { verifyAuthToken, requireRole } from "@/lib/middlewares/auth";
import { prisma } from "@/lib/db";

export const GET = apiWrapper(async (req: NextRequest) => {
  const decodedUser = await verifyAuthToken(req);
  requireRole(["ADMIN", "SUPER_ADMIN"], decodedUser.role);

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Real counts from DB
  const [
    todayQuotes,
    todayOrders,
    pickupsToday,
    pendingInspections,
    pendingPayments,
    completedSales,
    recentOrdersRaw,
  ] = await Promise.all([
    prisma.quote.count({ where: { createdAt: { gte: today }, deletedAt: null } }),
    prisma.order.count({ where: { createdAt: { gte: today }, deletedAt: null } }),
    prisma.order.count({ where: { pickupDate: today.toISOString().split("T")[0], deletedAt: null } }),
    prisma.order.count({ where: { status: "INSPECTION_STARTED", deletedAt: null } }),
    prisma.payment.count({ where: { status: "PENDING" } }),
    prisma.order.count({ where: { status: "COMPLETED", deletedAt: null } }),
    prisma.order.findMany({
      where: { deletedAt: null },
      include: {
        user: { select: { name: true, phone: true } },
        quote: { include: { variant: { include: { model: true } } } },
      },
      orderBy: { createdAt: "desc" },
      take: 10,
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
      todayOrders,
      pickupsToday,
      pendingInspections,
      pendingPayments,
      completedSales,
    },
    recentOrders,
  });
});
