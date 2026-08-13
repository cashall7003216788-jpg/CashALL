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
    throw new AppError(result.error.issues[0].message, 400);
  }

  const { email, password } = result.data;
  const targetAdminEmail = (process.env.ADMIN_EMAIL || "admin@cashall.in").trim().toLowerCase();
  const targetAdminPassword = process.env.ADMIN_PASSWORD || "CashallAdmin2026!";

  const cleanEmail = email.trim().toLowerCase();

  // Validate admin password and email matching
  if (cleanEmail !== targetAdminEmail || password !== targetAdminPassword) {
    throw new AppError("Invalid credentials.", 401);
  }

  // Check email profile exists in database with admin roles
  let user;
  try {
    user = await AuthService.verifyAdmin(cleanEmail);
  } catch (err) {
    // If profile not yet seeded in db, allow master admin login
    user = {
      id: "admin_master_1",
      email: targetAdminEmail,
      name: "CashALL Admin",
      role: "ADMIN",
      status: "ACTIVE",
    };
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
      token: "tok_admin_master_session",
    },
  });
});
