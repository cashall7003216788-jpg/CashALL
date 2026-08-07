import { NextRequest, NextResponse } from "next/server";
import { apiWrapper } from "@/lib/utils/api-wrapper";
import { verifyAuthToken, requireRole } from "@/lib/middlewares/auth";
import { prisma } from "@/lib/db";
import { AppError } from "@/lib/utils/AppError";

export const GET = apiWrapper(async (req: NextRequest) => {
  const decodedUser = await verifyAuthToken(req);
  requireRole(["ADMIN", "SUPER_ADMIN"], decodedUser.role);

  const rules = await prisma.pricingRule.findMany({
    where: { deletedAt: null },
    include: {
      question: true,
      option: true,
      variant: {
        include: {
          model: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({ success: true, data: rules });
});

export const POST = apiWrapper(async (req: NextRequest) => {
  const decodedUser = await verifyAuthToken(req);
  requireRole(["ADMIN", "SUPER_ADMIN"], decodedUser.role);

  const body = await req.json();
  const rule = await prisma.pricingRule.create({
    data: body,
  });

  return NextResponse.json({ success: true, data: rule });
});

export const PUT = apiWrapper(async (req: NextRequest) => {
  const decodedUser = await verifyAuthToken(req);
  requireRole(["ADMIN", "SUPER_ADMIN"], decodedUser.role);

  const body = await req.json();
  const { id, ...data } = body;

  const rule = await prisma.pricingRule.update({
    where: { id },
    data,
  });

  return NextResponse.json({ success: true, data: rule });
});

export const DELETE = apiWrapper(async (req: NextRequest) => {
  const decodedUser = await verifyAuthToken(req);
  requireRole(["ADMIN", "SUPER_ADMIN"], decodedUser.role);

  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");

  if (!id) {
    throw new AppError("Pricing rule identifier is required.", 400);
  }

  await prisma.pricingRule.update({
    where: { id },
    data: { deletedAt: new Date(), active: false },
  });

  return NextResponse.json({ success: true, message: "Pricing rule soft deleted successfully." });
});
