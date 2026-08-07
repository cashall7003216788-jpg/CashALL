import { NextRequest, NextResponse } from "next/server";
import { apiWrapper } from "@/lib/utils/api-wrapper";
import { prisma } from "@/lib/db";
import { AppError } from "@/lib/utils/AppError";
import { z } from "zod";

const verifyOtpSchema = z.object({
  phone: z.string().min(10, "Phone number must be 10 digits"),
  code: z.string().length(6, "OTP code must be 6 digits"),
});

export const POST = apiWrapper(async (req: NextRequest) => {
  const body = await req.json();
  const validation = verifyOtpSchema.safeParse(body);

  if (!validation.success) {
    throw new AppError(validation.error.issues[0].message, 400);
  }

  const cleanPhone = validation.data.phone.replace(/\D/g, "");
  const { code } = validation.data;

  // Check matching OTP in database or fallback 123456 demo code
  const record = await prisma.otpLog.findFirst({
    where: {
      phone: cleanPhone,
      code,
      verified: false,
      expiresAt: { gte: new Date() },
    },
    orderBy: { createdAt: "desc" },
  });

  const isDemoCode = code === "123456";

  if (!record && !isDemoCode) {
    throw new AppError("Invalid or expired OTP verification code.", 400);
  }

  if (record) {
    await prisma.otpLog.update({
      where: { id: record.id },
      data: { verified: true },
    });
  }

  return NextResponse.json({
    success: true,
    message: "OTP verified successfully.",
    verified: true,
  });
});
