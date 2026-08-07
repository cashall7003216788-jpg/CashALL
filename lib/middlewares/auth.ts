import { NextRequest } from "next/server";
import { firebaseAdmin } from "../services/firebase";
import { AppError } from "../utils/AppError";

export interface DecodedUser {
  uid: string;
  phone?: string;
  email?: string;
  role: string;
}

export async function verifyAuthToken(req: NextRequest): Promise<DecodedUser> {
  const authHeader = req.headers.get("authorization");
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    throw new AppError("Authorization token is missing or invalid.", 401);
  }

  const token = authHeader.split(" ")[1];
  try {
    const decodedToken = await (firebaseAdmin as any).auth().verifyIdToken(token);
    return {
      uid: decodedToken.uid,
      phone: decodedToken.phone_number,
      email: decodedToken.email,
      role: (decodedToken.role as string) || "CUSTOMER",
    };
  } catch (error: any) {
    throw new AppError(`Authentication failed: ${error.message}`, 401);
  }
}

export function requireRole(allowedRoles: string[], userRole: string) {
  if (!allowedRoles.includes(userRole)) {
    throw new AppError("Access denied. Insufficient permissions.", 403);
  }
}
