import { NextRequest, NextResponse } from "next/server";
import { apiWrapper } from "@/lib/utils/api-wrapper";
import { verifyAuthToken } from "@/lib/middlewares/auth";
import { prisma } from "@/lib/db";
import { AppError } from "@/lib/utils/AppError";

export const GET = apiWrapper(async (req: NextRequest) => {
  const decodedUser = await verifyAuthToken(req);
  
  const user = await prisma.user.findFirst({
    where: {
      firebaseUid: decodedUser.uid,
      deletedAt: null,
    },
  });

  if (!user) {
    throw new AppError("User profile does not exist in database.", 404);
  }

  return NextResponse.json({
    success: true,
    data: {
      user: {
        id: user.id,
        phone: user.phone,
        name: user.name,
        email: user.email,
        role: user.role,
        status: user.status,
      },
    },
  });
});
