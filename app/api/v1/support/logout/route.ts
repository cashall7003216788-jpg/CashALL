import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const name = (body.name || body.username || "Support Agent").trim();
    const phone = (body.phone || "7604092333").trim();

    try {
      await prisma.auditLog.create({
        data: {
          actorId: crypto.randomUUID(),
          actorRole: "SUPPORT",
          action: "SUPPORT_LOGOUT",
          tableName: "SupportSession",
          recordId: crypto.randomUUID(),
          newValuesJson: JSON.stringify({
            name,
            phone,
            event: "LOGOUT",
            logoutTime: new Date().toISOString(),
          }),
        },
      });
    } catch (e) {
      console.warn("Could not log support logout:", e);
    }

    return NextResponse.json({
      success: true,
      message: "Support staff logout recorded successfully.",
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Logout record failed." },
      { status: 500 }
    );
  }
}
