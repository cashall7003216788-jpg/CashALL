import { NextRequest, NextResponse } from "next/server";
import { apiWrapper } from "@/lib/utils/api-wrapper";
import { AppError } from "@/lib/utils/AppError";

export const dynamic = "force-dynamic";

const ALLOWED_ADMINS = [
  "SANGEET SHAW",
  "ABHISHEK BISWAKARMA",
  "ANKIT GUPTA",
  "AYUSH GUPTA",
];

const ADMIN_PASSWORD = "Ank933967@";

export const POST = apiWrapper(async (req: NextRequest) => {
  const body = await req.json();

  // Accept input via name, operatorName, email, or username
  const inputName = (body.name || body.operatorName || body.email || "").trim();
  const inputPassword = body.password;

  if (!inputName) {
    throw new AppError("Operator name is required.", 400);
  }

  if (!inputPassword) {
    throw new AppError("Password is required.", 400);
  }

  // Case-insensitive operator name matching (capital, small, mixed letters)
  const matchedAdmin = ALLOWED_ADMINS.find(
    (adminName) => adminName.toLowerCase() === inputName.toLowerCase()
  );

  // Exact-case password matching
  if (!matchedAdmin || inputPassword !== ADMIN_PASSWORD) {
    throw new AppError("Invalid operator name or password.", 401);
  }

  const slugifiedId = `admin_${matchedAdmin.toLowerCase().replace(/\s+/g, "_")}`;

  return NextResponse.json({
    success: true,
    data: {
      user: {
        id: slugifiedId,
        name: matchedAdmin,
        email: `${matchedAdmin.toLowerCase().replace(/\s+/g, ".")}@cashall.in`,
        role: "ADMIN",
        status: "ACTIVE",
      },
      token: "tok_admin_master_session",
    },
  });
});
