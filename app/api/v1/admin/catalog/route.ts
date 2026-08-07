import { NextRequest, NextResponse } from "next/server";
import { apiWrapper } from "@/lib/utils/api-wrapper";
import { verifyAuthToken, requireRole } from "@/lib/middlewares/auth";
import { prisma } from "@/lib/db";
import { AppError } from "@/lib/utils/AppError";

export const POST = apiWrapper(async (req: NextRequest) => {
  const decodedUser = await verifyAuthToken(req);
  requireRole(["ADMIN", "SUPER_ADMIN"], decodedUser.role);

  const body = await req.json();
  const { type, data } = body; // "brand" | "model" | "variant"

  if (type === "brand") {
    const brand = await prisma.brand.create({ data });
    return NextResponse.json({ success: true, data: brand });
  } else if (type === "model") {
    const model = await prisma.deviceModel.create({ data });
    return NextResponse.json({ success: true, data: model });
  } else if (type === "variant") {
    const variant = await prisma.deviceVariant.create({ data });
    return NextResponse.json({ success: true, data: variant });
  } else {
    throw new AppError("Invalid catalog type specified.", 400);
  }
});

export const PUT = apiWrapper(async (req: NextRequest) => {
  const decodedUser = await verifyAuthToken(req);
  requireRole(["ADMIN", "SUPER_ADMIN"], decodedUser.role);

  const body = await req.json();
  const { type, id, data } = body;

  if (type === "brand") {
    const brand = await prisma.brand.update({ where: { id }, data });
    return NextResponse.json({ success: true, data: brand });
  } else if (type === "model") {
    const model = await prisma.deviceModel.update({ where: { id }, data });
    return NextResponse.json({ success: true, data: model });
  } else if (type === "variant") {
    const variant = await prisma.deviceVariant.update({ where: { id }, data });
    return NextResponse.json({ success: true, data: variant });
  } else {
    throw new AppError("Invalid catalog type specified.", 400);
  }
});

export const DELETE = apiWrapper(async (req: NextRequest) => {
  const decodedUser = await verifyAuthToken(req);
  requireRole(["ADMIN", "SUPER_ADMIN"], decodedUser.role);

  const { searchParams } = new URL(req.url);
  const type = searchParams.get("type");
  const id = searchParams.get("id");

  if (!id) {
    throw new AppError("Identifier is required.", 400);
  }

  if (type === "brand") {
    await prisma.brand.update({ where: { id }, data: { deletedAt: new Date(), active: false } });
  } else if (type === "model") {
    await prisma.deviceModel.update({ where: { id }, data: { deletedAt: new Date(), active: false } });
  } else if (type === "variant") {
    await prisma.deviceVariant.update({ where: { id }, data: { deletedAt: new Date(), active: false } });
  } else {
    throw new AppError("Invalid catalog type specified.", 400);
  }

  return NextResponse.json({ success: true, message: "Catalog item soft deleted successfully." });
});
