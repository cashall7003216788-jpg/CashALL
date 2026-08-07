import { NextRequest, NextResponse } from "next/server";
import { apiWrapper } from "@/lib/utils/api-wrapper";
import { auth } from "@/lib/services/firebase";
import { prisma } from "@/lib/db";
import { AppError } from "@/lib/utils/AppError";
import { logger } from "@/lib/utils/logger";
import { z } from "zod";

const verifySchema = z.object({
  idToken: z.string().min(1, "Firebase ID token is required"),
});

/**
 * POST /api/v1/auth/otp/verify
 *
 * Receives a Firebase Phone Auth ID token from the client after the user
 * completes the OTP flow in the browser. Verifies it with Firebase Admin SDK
 * and returns success with user phone number.
 */
export const POST = apiWrapper(async (req: NextRequest) => {
  const body = await req.json();
  const validation = verifySchema.safeParse(body);

  if (!validation.success) {
    throw new AppError(validation.error.issues[0].message, 400);
  }

  const { idToken } = validation.data;

  let decodedToken;
  try {
    decodedToken = await auth.verifyIdToken(idToken);
  } catch (err: any) {
    logger.error("Firebase ID token verification failed:", err);
    throw new AppError("Invalid or expired OTP verification. Please try again.", 401);
  }

  const phone = decodedToken.phone_number;
  if (!phone) {
    throw new AppError("Phone number not found in Firebase token.", 400);
  }

  // Log verified OTP in database for audit trail
  try {
    await prisma.otpLog.create({
      data: {
        phone: phone.replace(/\D/g, "").slice(-10), // last 10 digits
        code: "FIREBASE_VERIFIED",
        expiresAt: new Date(decodedToken.exp * 1000),
        verified: true,
        type: "LOGIN",
      },
    });
  } catch (dbErr) {
    // Non-fatal — continue even if logging fails
    logger.warn("OTP audit log write failed:", dbErr);
  }

  logger.info(`Firebase OTP verified successfully for ${phone}`);

  return NextResponse.json({
    success: true,
    phone,
    message: "Phone number verified successfully via Firebase.",
  });
});
