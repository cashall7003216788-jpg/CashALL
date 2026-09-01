import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const inputName = (body.name || body.username || "").trim();
    const inputPassword = body.password;

    if (!inputName) {
      return NextResponse.json(
        { success: false, error: "Support User Name is required" },
        { status: 400 }
      );
    }
    if (!inputPassword) {
      return NextResponse.json(
        { success: false, error: "Password is required" },
        { status: 400 }
      );
    }

    // Exact master password check
    if (inputPassword !== "Ank933967@") {
      return NextResponse.json(
        { success: false, error: "Invalid Support password." },
        { status: 401 }
      );
    }

    // Check if test master user (SANGEET SHAW / SUPPORT AGENT / SUPPORT)
    const isTestMaster =
      inputName.toLowerCase() === "sangeet shaw" ||
      inputName.toLowerCase() === "support agent" ||
      inputName.toLowerCase() === "support";

    let supportUser = null;
    if (!isTestMaster) {
      supportUser = await prisma.user.findFirst({
        where: {
          OR: [
            { name: { equals: inputName, mode: "insensitive" } },
            { email: { equals: `${inputName.toLowerCase().replace(/\s+/g, ".")}@cashall.in`, mode: "insensitive" } },
            { phone: inputName },
          ],
          deletedAt: null,
        },
      });
    }

    const resolvedName = isTestMaster
      ? (inputName.toLowerCase() === "sangeet shaw" ? "SANGEET SHAW" : "Support Agent")
      : (supportUser?.name || inputName);

    const token = `tok_support_${Date.now()}`;

    // Record Support Login timestamp in auditLog
    try {
      const isUuid = supportUser?.id && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(supportUser.id);
      const actorId = isUuid && supportUser ? supportUser.id : crypto.randomUUID();
      await prisma.auditLog.create({
        data: {
          actorId,
          actorRole: "SUPPORT",
          action: "SUPPORT_LOGIN",
          tableName: "SupportSession",
          recordId: crypto.randomUUID(),
          newValuesJson: JSON.stringify({
            name: resolvedName,
            phone: supportUser?.phone || body.phone || "7604092333",
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
        id: supportUser?.id || `support_${resolvedName.toLowerCase().replace(/\s+/g, "_")}`,
        name: resolvedName,
        email: supportUser?.email || `${resolvedName.toLowerCase().replace(/\s+/g, ".")}@cashall.in`,
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
