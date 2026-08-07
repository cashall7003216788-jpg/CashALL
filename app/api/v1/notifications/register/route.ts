import { NextRequest, NextResponse } from "next/server";
import { apiWrapper } from "@/lib/utils/api-wrapper";
import { verifyAuthToken } from "@/lib/middlewares/auth";
import { FirebaseService } from "@/lib/services/firebase.service";
import { AppError } from "@/lib/utils/AppError";
import { z } from "zod";

const registerTokenSchema = z.object({
  token: z.string().min(1, "FCM token is required"),
  deviceType: z.string().optional(),
});

export const POST = apiWrapper(async (req: NextRequest) => {
  const decodedUser = await verifyAuthToken(req);

  const body = await req.json();
  const validation = registerTokenSchema.safeParse(body);

  if (!validation.success) {
    throw new AppError(validation.error.issues[0].message, 400);
  }

  const { token, deviceType } = validation.data;

  await FirebaseService.registerFcmToken(decodedUser.uid, token, deviceType);

  return NextResponse.json({
    success: true,
    message: "FCM token registered successfully.",
  });
});
