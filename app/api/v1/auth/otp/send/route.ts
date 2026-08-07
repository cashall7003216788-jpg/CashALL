import { NextRequest, NextResponse } from "next/server";
import { apiWrapper } from "@/lib/utils/api-wrapper";
import { prisma } from "@/lib/db";
import { AppError } from "@/lib/utils/AppError";
import { logger } from "@/lib/utils/logger";
import { z } from "zod";

const sendOtpSchema = z.object({
  phone: z.string().min(10, "Phone number must be at least 10 digits"),
});

export const POST = apiWrapper(async (req: NextRequest) => {
  const body = await req.json();
  const validation = sendOtpSchema.safeParse(body);

  if (!validation.success) {
    throw new AppError(validation.error.issues[0].message, 400);
  }

  const cleanPhone = validation.data.phone.replace(/\D/g, "");
  if (cleanPhone.length !== 10) {
    throw new AppError("Please provide a valid 10-digit mobile number.", 400);
  }

  // Generate 6-digit OTP
  const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

  // Save OTP in database
  try {
    await prisma.otpLog.create({
      data: {
        phone: cleanPhone,
        code: otpCode,
        expiresAt,
        verified: false,
        type: "LOGIN",
      },
    });
  } catch (dbError: any) {
    logger.error("Failed to save OTP to database:", dbError);
    throw new AppError("OTP service temporarily unavailable. Please try again.", 503);
  }

  // Attempt real SMS gateway API dispatch if API key exists
  const fast2smsKey = process.env.FAST2SMS_API_KEY;
  if (fast2smsKey) {
    try {
      const smsRes = await fetch("https://www.fast2sms.com/dev/bulkV2", {
        method: "POST",
        headers: {
          authorization: fast2smsKey,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          route: "otp",
          variables_values: otpCode,
          numbers: cleanPhone,
        }),
      });
      const smsData = await smsRes.json();
      if (smsData.return) {
        logger.info(`SMS OTP dispatched via Fast2SMS to +91 ${cleanPhone}`);
      } else {
        logger.error(`Fast2SMS rejected request: ${JSON.stringify(smsData)}`);
      }
    } catch (err: any) {
      logger.error("Fast2SMS API dispatch failed:", err);
    }
  } else {
    logger.info(`[DEV] OTP for +91 ${cleanPhone}: ${otpCode} (Set FAST2SMS_API_KEY for live SMS)`);
  }

  return NextResponse.json({
    success: true,
    message: `Verification OTP sent to +91 ${cleanPhone}`,
  });
});
