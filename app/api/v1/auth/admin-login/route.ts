import { NextRequest, NextResponse } from "next/server";
import { apiWrapper } from "@/lib/utils/api-wrapper";
import { adminLoginSchema } from "@/lib/validators/auth";
import { AuthService } from "@/lib/services/auth.service";
import { AppError } from "@/lib/utils/AppError";

export const POST = apiWrapper(async (req: NextRequest) => {
  const body = await req.json();
  
  // 1. Firebase ID Token authorization mode
  if (body.idToken) {
    const { firebaseAdmin } = await import("@/lib/services/firebase");
    try {
      const decodedToken = await firebaseAdmin.auth().verifyIdToken(body.idToken);
      if (!decodedToken.email) {
        throw new AppError("Firebase token does not contain an email.", 400);
      }
      
      const user = await AuthService.verifyAdmin(decodedToken.email);
      return NextResponse.json({
        success: true,
        data: {
          user: {
            id: user.id,
            email: user.email,
            name: user.name,
            role: user.role,
            status: user.status,
          },
          token: body.idToken,
        },
      });
    } catch (err: any) {
      if (err instanceof AppError) throw err;
      throw new AppError(`Admin auth failed: ${err.message}`, 401);
    }
  }

  // 2. Direct email authentication mode (checks role and password configuration)
  const result = adminLoginSchema.safeParse(body);
  if (!result.success) {
    throw new AppError(result.error.errors[0].message, 400);
  }

  const { email, password } = result.data;

  // Check email profile exists in database with admin roles
  const user = await AuthService.verifyAdmin(email);

  // Validate admin credential stubs for demo config (in production, verify hashed password)
  if (email === "admin@cashall.in" && password !== "admin123") {
    throw new AppError("Invalid credentials.", 401);
  }

  return NextResponse.json({
    success: true,
    data: {
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        status: user.status,
      },
      token: "tok_admin_demo_session",
    },
  });
});
