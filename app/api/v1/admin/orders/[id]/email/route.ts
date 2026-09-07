import { NextRequest, NextResponse } from "next/server";
import { apiWrapper } from "@/lib/utils/api-wrapper";
import { verifyAuthToken, requireRole } from "@/lib/middlewares/auth";
import { prisma } from "@/lib/db";
import { AppError } from "@/lib/utils/AppError";
import { z } from "zod";

export const dynamic = "force-dynamic";

const updateEmailSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
});

export const POST = apiWrapper(async (req: NextRequest, { params }: { params: { id: string } }) => {
  const decodedUser = await verifyAuthToken(req);
  requireRole(["ADMIN", "SUPER_ADMIN", "EMPLOYEE"], decodedUser.role);

  const orderIdentifier = params.id;
  const body = await req.json().catch(() => ({}));
  const validation = updateEmailSchema.safeParse(body);

  if (!validation.success) {
    throw new AppError(validation.error.issues[0].message, 400);
  }

  const cleanEmail = validation.data.email.trim().toLowerCase();

  const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(orderIdentifier);
  const cleanOrderNum = orderIdentifier.replace(/^#/, "");

  const order = await prisma.order.findFirst({
    where: {
      OR: isUuid
        ? [{ id: orderIdentifier }, { orderNumber: cleanOrderNum }]
        : [{ orderNumber: cleanOrderNum }, { orderNumber: `#${cleanOrderNum}` }],
      deletedAt: null,
    },
    include: { user: true },
  });

  if (!order) {
    throw new AppError("Order not found.", 404);
  }

  // Handle unique constraint on User.email
  const existingUserWithEmail = await prisma.user.findFirst({
    where: {
      email: { equals: cleanEmail, mode: "insensitive" },
      id: { not: order.userId },
    },
  });

  if (existingUserWithEmail) {
    // Clear email from old placeholder to prevent unique constraint conflict
    await prisma.user.update({
      where: { id: existingUserWithEmail.id },
      data: { email: null },
    });
  }

  // Update order's user email
  const updatedUser = await prisma.user.update({
    where: { id: order.userId },
    data: { email: cleanEmail },
  });

  return NextResponse.json({
    success: true,
    message: `Customer email updated to ${cleanEmail}`,
    data: {
      orderId: order.id,
      orderNumber: order.orderNumber,
      customerEmail: updatedUser.email,
    },
  });
});
