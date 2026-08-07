import { NextRequest, NextResponse } from "next/server";

/**
 * POST /api/v1/auth/otp/send
 *
 * With Firebase Phone Auth, OTP is sent DIRECTLY from the browser via Firebase SDK.
 * This route is kept for backwards compatibility but is no longer needed for OTP dispatch.
 *
 * The actual flow:
 * 1. Client calls Firebase signInWithPhoneNumber() -> Firebase sends OTP SMS
 * 2. User enters OTP -> Firebase verifies it -> gives idToken
 * 3. Client POSTs idToken to /api/v1/auth/otp/verify for backend session/audit
 */
export async function POST(req: NextRequest) {
  return NextResponse.json({
    success: true,
    message: "OTP is sent via Firebase Phone Auth on the client side.",
  });
}
