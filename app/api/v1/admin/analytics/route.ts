import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

import { apiWrapper } from "@/lib/utils/api-wrapper";
import { verifyAuthToken, requireRole } from "@/lib/middlewares/auth";
import { prisma } from "@/lib/db";

export const GET = apiWrapper(async (req: NextRequest) => {
  const decodedUser = await verifyAuthToken(req);
  requireRole(["ADMIN", "SUPER_ADMIN"], decodedUser.role);

  // 1. Inventory statistics
  const modelStats = await prisma.order.findMany({
    where: { deletedAt: null },
    select: {
      quote: {
        select: {
          variant: {
            select: {
              model: {
                select: {
                  name: true,
                  brand: {
                    select: { name: true },
                  },
                },
              },
            },
          },
        },
      },
    },
  });

  const inventoryDistribution = modelStats.reduce((acc, current) => {
    const brandName = current.quote?.variant?.model?.brand?.name || "Unknown";
    const modelName = current.quote?.variant?.model?.name || "Unknown";
    const key = `${brandName} ${modelName}`;
    acc[key] = (acc[key] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  // 2. Revenue timeline (daily revenue tracking)
  const payments = await prisma.payment.findMany({
    where: { status: "PAID" },
    select: {
      amount: true,
      createdAt: true,
    },
    orderBy: { createdAt: "asc" },
  });

  const revenueByDate = payments.reduce((acc, current) => {
    const dateStr = current.createdAt.toISOString().split("T")[0]; // YYYY-MM-DD
    acc[dateStr] = (acc[dateStr] || 0) + current.amount;
    return acc;
  }, {} as Record<string, number>);

  // 3. Conversion and orders overview
  const ordersCount = await prisma.order.count({ where: { deletedAt: null } });
  const completedOrdersCount = await prisma.order.count({
    where: { status: "COMPLETED", deletedAt: null },
  });
  const cancelledOrdersCount = await prisma.order.count({
    where: { status: "DECLINED", deletedAt: null },
  });

  const conversionRate = ordersCount > 0 ? (completedOrdersCount / ordersCount) * 100 : 0;

  return NextResponse.json({
    success: true,
    data: {
      inventoryDistribution,
      revenueByDate,
      conversion: {
        totalOrders: ordersCount,
        completedOrders: completedOrdersCount,
        cancelledOrders: cancelledOrdersCount,
        conversionPercentage: Math.round(conversionRate * 100) / 100,
      },
    },
  });
});
