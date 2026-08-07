import { NextRequest, NextResponse } from "next/server";
import { apiWrapper } from "@/lib/utils/api-wrapper";
import { verifyAuthToken, requireRole } from "@/lib/middlewares/auth";
import { prisma } from "@/lib/db";
import { AppError } from "@/lib/utils/AppError";

export const GET = apiWrapper(async (req: NextRequest) => {
  const decodedUser = await verifyAuthToken(req);
  requireRole(["ADMIN", "SUPER_ADMIN"], decodedUser.role);

  const settings = await prisma.systemSetting.findMany({
    orderBy: { key: "asc" },
  });

  return NextResponse.json({ success: true, data: settings });
});

export const POST = apiWrapper(async (req: NextRequest) => {
  const decodedUser = await verifyAuthToken(req);
  requireRole(["ADMIN", "SUPER_ADMIN"], decodedUser.role);

  const body = await req.json();
  const { key, value, description } = body;

  if (!key) {
    throw new AppError("Setting key is required.", 400);
  }

  const setting = await prisma.systemSetting.upsert({
    where: { key },
    update: { value, description },
    create: { key, value, description },
  });

  return NextResponse.json({ success: true, data: setting });
});
