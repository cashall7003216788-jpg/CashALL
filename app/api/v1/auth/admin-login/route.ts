import { NextRequest, NextResponse } from "next/server";
import { apiWrapper } from "@/lib/utils/api-wrapper";
import { AppError } from "@/lib/utils/AppError";
import { prisma } from "@/lib/db";

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

  // Case-insensitive operator name matching (capital, small, mixed letters) or Admin phone/email
  let matchedAdmin = ALLOWED_ADMINS.find(
    (adminName) => adminName.toLowerCase() === inputName.toLowerCase()
  );

  if (!matchedAdmin) {
    const cleanPhone = inputName.replace(/\D/g, "");
    const adminUser = await prisma.user.findFirst({
      where: {
        role: "ADMIN",
        OR: [
          ...(cleanPhone ? [{ phone: cleanPhone }] : []),
          { email: { equals: inputName, mode: "insensitive" } },
          { name: { equals: inputName, mode: "insensitive" } },
        ],
        deletedAt: null,
      },
    });

    if (adminUser?.name) {
      const uName = adminUser.name;
      matchedAdmin = ALLOWED_ADMINS.find((a) => a.toLowerCase() === uName.toLowerCase()) || uName;
    }
  }

  // Exact-case password matching
  if (!matchedAdmin || inputPassword !== ADMIN_PASSWORD) {
    throw new AppError("Invalid operator name or password.", 401);
  }

  // Record Admin Login Event in Database
  try {
    const ip = req.headers.get("x-forwarded-for") || "127.0.0.1";
    await prisma.auditLog.create({
      data: {
        actorId: "00000000-0000-0000-0000-000000000000",
        actorRole: "ADMIN",
        action: "ADMIN_LOGIN",
        tableName: "AdminSession",
        recordId: "00000000-0000-0000-0000-000000000000",
        newValuesJson: JSON.stringify({
          adminName: matchedAdmin,
          loginTimeIST: new Date().toLocaleString("en-IN", { timeZone: "Asia/Kolkata" }),
          ipAddress: ip,
        }),
      },
    });
  } catch (logErr) {
    console.warn("Could not log admin login event:", logErr);
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
