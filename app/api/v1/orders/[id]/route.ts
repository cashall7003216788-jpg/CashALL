import { NextRequest, NextResponse } from "next/server";
import { apiWrapper } from "@/lib/utils/api-wrapper";
import { verifyAuthToken } from "@/lib/middlewares/auth";
import { prisma } from "@/lib/db";
import { AppError } from "@/lib/utils/AppError";

export const GET = apiWrapper(async (req: NextRequest, { params }: { params: { id: string } }) => {
  const decodedUser = await verifyAuthToken(req);
  const orderIdentifier = params.id;

  const order = await prisma.order.findFirst({
    where: {
      OR: [
        { id: orderIdentifier },
        { orderNumber: orderIdentifier },
      ],
      deletedAt: null,
    },
    include: {
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
      address: true,
      pickups: {
        include: {
          partner: true,
        },
        orderBy: { createdAt: "desc" },
      },
      qcReports: {
        orderBy: { inspectedAt: "desc" },
      },
      offers: {
        orderBy: { createdAt: "desc" },
      },
      payments: {
        orderBy: { createdAt: "desc" },
      },
      invoices: {
        orderBy: { createdAt: "desc" },
      },
    },
  });

  if (!order) {
    throw new AppError("Order not found.", 404);
  }

  // RBAC checks
  if (
    order.userId !== decodedUser.uid &&
    decodedUser.role !== "ADMIN" &&
    decodedUser.role !== "SUPER_ADMIN" &&
    decodedUser.role !== "EMPLOYEE"
  ) {
    throw new AppError("Access denied. Insufficient permissions.", 403);
  }

  return NextResponse.json({
    success: true,
    data: order,
  });
});
