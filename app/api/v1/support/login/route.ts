import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const inputName = (body.name || body.username || body.phone || "").trim();
    const inputPassword = (body.password || "").trim();

    if (!inputName) {
      return NextResponse.json(
        { success: false, error: "Support User Name or Phone Number is required" },
        { status: 400 }
      );
    }
    if (!inputPassword) {
      return NextResponse.json(
        { success: false, error: "Password is required" },
        { status: 400 }
      );
    }

    const normalize = (str?: string | null) =>
      (str || "").toLowerCase().replace(/[^a-z0-9]/g, "").trim();

    const inputNormalized = normalize(inputName);
    const cleanPhone = inputName.replace(/\D/g, "");

    // 1. Check if test master user (SANGEET SHAW / SUPPORT AGENT / SUPPORT)
    const isTestMaster =
      inputNormalized === "sangeetshaw" ||
      cleanPhone === "6289477287" ||
      cleanPhone === "7604092333" ||
      inputNormalized === "supportagent" ||
      inputNormalized === "support";

    let supportUser: any = null;
    let savedCustomPassword: string | null = null;

    if (isTestMaster) {
      // Sangeet Shaw / Master user login
      const isMasterPass = inputPassword === "Ank933967@";
      const isPhonePass =
        inputPassword === "6289477287" || inputPassword === "7604092333";

      if (!isMasterPass && !isPhonePass) {
        return NextResponse.json(
          {
            success: false,
            error: "Invalid password for Sangeet Shaw. Use your phone number or master password.",
          },
          { status: 401 }
        );
      }
    } else {
      // 2. Lookup support user across all EMPLOYEE role users in DB
      const allEmployees = await prisma.user.findMany({
        where: {
          role: "EMPLOYEE",
          deletedAt: null,
        },
      });

      supportUser = allEmployees.find((u) => {
        const uNameNorm = normalize(u.name);
        const uEmailNorm = normalize(u.email?.split("@")[0]);
        const uFullEmail = (u.email || "").toLowerCase().trim();
        const uPhoneClean = (u.phone || "").replace(/\D/g, "");

        return (
          (inputNormalized && uNameNorm === inputNormalized) ||
          (inputNormalized && uNameNorm.includes(inputNormalized)) ||
          (inputNormalized && inputNormalized.includes(uNameNorm)) ||
          (inputNormalized && uEmailNorm === inputNormalized) ||
          (inputName && uFullEmail === inputName.toLowerCase()) ||
          (cleanPhone && cleanPhone.length >= 10 && uPhoneClean === cleanPhone)
        );
      });

      if (!supportUser) {
        return NextResponse.json(
          {
            success: false,
            error: `No registered support staff found for "${inputName}". Please enter your registered name or phone number.`,
          },
          { status: 404 }
        );
      }

      // Check if custom password exists in firebaseUid (format: support_{phone}_pwd_{base64})
      if (supportUser.firebaseUid && supportUser.firebaseUid.includes("_pwd_")) {
        try {
          const b64 = supportUser.firebaseUid.split("_pwd_")[1];
          savedCustomPassword = Buffer.from(b64, "base64").toString("utf-8");
        } catch {}
      }

      // Also check AuditLog for SUPPORT_STAFF_CREDENTIALS
      if (!savedCustomPassword) {
        const credAudit = await prisma.auditLog.findFirst({
          where: {
            action: "SUPPORT_STAFF_CREDENTIALS",
            OR: [
              { actorId: supportUser.id },
              { recordId: supportUser.id },
              { newValuesJson: { contains: supportUser.phone } },
            ],
          },
          orderBy: { createdAt: "desc" },
        });

        if (credAudit?.newValuesJson) {
          try {
            const parsed = JSON.parse(credAudit.newValuesJson);
            if (parsed.password) {
              savedCustomPassword = parsed.password;
            }
          } catch {}
        }
      }

      // Validate password against:
      // A) Master password (Ank933967@)
      // B) User's 10-digit registered phone number (e.g. 8981191734)
      // C) Saved custom password from registration
      const userPhoneClean = (supportUser.phone || "").replace(/\D/g, "");
      const inputPassClean = inputPassword.replace(/\D/g, "");

      const isMasterPass = inputPassword === "Ank933967@";
      const isPhonePass =
        userPhoneClean.length >= 10 &&
        (inputPassword === userPhoneClean ||
          (inputPassClean.length >= 10 && inputPassClean === userPhoneClean));
      const isCustomPass =
        Boolean(savedCustomPassword) && inputPassword === savedCustomPassword;

      if (!isMasterPass && !isPhonePass && !isCustomPass) {
        return NextResponse.json(
          {
            success: false,
            error:
              "Invalid password. You can log in using your registered 10-digit phone number, set password, or master password.",
          },
          { status: 401 }
        );
      }
    }

    const resolvedName = isTestMaster
      ? inputNormalized === "sangeetshaw" || cleanPhone === "6289477287"
        ? "SANGEET SHAW"
        : "Support Agent"
      : supportUser?.name || inputName;

    const token = `tok_support_${Date.now()}`;

    // Record Support Login timestamp in auditLog
    try {
      const isUuid =
        supportUser?.id &&
        /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
          supportUser.id
        );
      const actorId =
        isUuid && supportUser ? supportUser.id : crypto.randomUUID();
      await prisma.auditLog.create({
        data: {
          actorId,
          actorRole: "SUPPORT",
          action: "SUPPORT_LOGIN",
          tableName: "SupportSession",
          recordId: crypto.randomUUID(),
          newValuesJson: JSON.stringify({
            name: resolvedName,
            phone:
              supportUser?.phone ||
              (cleanPhone.length >= 10 ? cleanPhone : "7604092333"),
            event: "LOGIN",
            loginTime: new Date().toISOString(),
          }),
        },
      });
    } catch (auditErr) {
      console.warn("Could not record support login audit:", auditErr);
    }

    return NextResponse.json({
      success: true,
      token,
      supportUser: {
        id:
          supportUser?.id ||
          `support_${resolvedName.toLowerCase().replace(/\s+/g, "_")}`,
        name: resolvedName,
        phone: supportUser?.phone || (cleanPhone.length >= 10 ? cleanPhone : "—"),
        email:
          supportUser?.email ||
          `${resolvedName.toLowerCase().replace(/\s+/g, ".")}@cashall.in`,
        role: "SUPPORT",
      },
    });
  } catch (error: any) {
    console.error("Support login error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Login failed" },
      { status: 500 }
    );
  }
}
