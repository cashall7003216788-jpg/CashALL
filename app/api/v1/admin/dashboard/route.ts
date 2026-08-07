import { NextRequest, NextResponse } from "next/server";
import { apiWrapper } from "@/lib/utils/api-wrapper";
import { verifyAuthToken, requireRole } from "@/lib/middlewares/auth";
import { prisma } from "@/lib/db";

export const GET = apiWrapper(async (req: NextRequest) => {
  const decodedUser = await verifyAuthToken(req);
  requireRole(["ADMIN", "SUPER_ADMIN"], decodedUser.role);

  // Group status counts
  const orderCounts = await prisma.order.groupBy({
    by: ["status"],
    _count: { id: true },
  });

  const statusStats = orderCounts.reduce((acc, current) => {
    acc[current.status] = current._count.id;
    return acc;
  }, {} as Record<string, number>);

  // Total Revenue
  const revenueAgg = await prisma.payment.aggregate({
    where: { status: "PAID" },
    _sum: { amount: true },
  });
  const totalRevenue = revenueAgg._sum.amount || 0;

  // Customers count
  const totalCustomers = await prisma.user.count({
    where: { role: "CUSTOMER", deletedAt: null },
  });

  // Open support tickets count
  const openTickets = await prisma.supportTicket.count({
    where: { status: "OPEN" },
  });

  // Recent orders list
  const recentOrders = await prisma.order.findMany({
    where: { deletedAt: null },
    include: {
      user: true,
      quote: {
        include: {
          variant: {
            include: {
              model: true,
            },
          },
        },
      },
    },
    orderBy: { createdAt: "desc" },
    take: 5,
  });

  return NextResponse.json({
    success: true,
    data: {
      metrics: {
        totalRevenue,
        totalCustomers,
        openTickets,
        statusStats,
      },
      recentOrders,
    },
  });
});
