import { NextRequest, NextResponse } from "next/server";
import { apiWrapper } from "@/lib/utils/api-wrapper";
import { loginSchema } from "@/lib/validators/auth";
import { AuthService } from "@/lib/services/auth.service";
import { firebaseAdmin } from "@/lib/services/firebase";
import { AppError } from "@/lib/utils/AppError";

export const POST = apiWrapper(async (req: NextRequest) => {
  const body = await req.json();
  const result = loginSchema.safeParse(body);
  
  if (!result.success) {
    throw new AppError(result.error.errors[0].message, 400);
  }

  const { idToken, name } = result.data;
  
  try {
    const decodedToken = await firebaseAdmin.auth().verifyIdToken(idToken);
    const phone = decodedToken.phone_number;
    
    if (!phone) {
      throw new AppError("Firebase token does not contain a verified phone number.", 400);
    }
    
    const user = await AuthService.syncUser(
      decodedToken.uid,
      phone,
      decodedToken.email,
      name
    );

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
          lastLogin: user.lastLogin,
        },
      },
    });
  } catch (error: any) {
    if (error instanceof AppError) throw error;
    throw new AppError(`Login failed: ${error.message}`, 401);
  }
});
