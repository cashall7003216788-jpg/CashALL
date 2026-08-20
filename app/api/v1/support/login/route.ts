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

    // Default support master account or user created in DB
    const isMasterSupport = (inputName.toLowerCase() === "support agent" || inputName.toLowerCase() === "support") && inputPassword === "Ank933967@";

    let supportUser = null;
    if (!isMasterSupport) {
      supportUser = await prisma.user.findFirst({
        where: {
          name: { equals: inputName, mode: "insensitive" },
          deletedAt: null,
        },
      });
    }

    if (!isMasterSupport && (!supportUser || inputPassword !== "Ank933967@")) {
      return NextResponse.json(
        { success: false, error: "Invalid Support user name or password." },
        { status: 401 }
      );
    }

    const name = isMasterSupport ? "Support Agent" : (supportUser?.name || inputName);
    const token = `tok_support_${Date.now()}`;

    return NextResponse.json({
      success: true,
      token,
      supportUser: {
        id: supportUser?.id || "support_master_1",
        name,
        email: "support@cashall.in",
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
