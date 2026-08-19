import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { emailOrPhone, password } = body;

    if (!emailOrPhone) {
      return NextResponse.json(
        { success: false, error: "Email or phone number is required" },
        { status: 400 }
      );
    }

    const cleanInput = emailOrPhone.trim();

    // Find agent user
    const agent = await prisma.user.findFirst({
      where: {
        OR: [
          { phone: cleanInput },
          { email: cleanInput },
        ],
        role: "AGENT",
        deletedAt: null,
      },
    });

    if (!agent) {
      // Fallback check: if no user with AGENT role found, check if user exists and upgrade role or allow default agent login
      const fallbackUser = await prisma.user.findFirst({
        where: {
          OR: [{ phone: cleanInput }, { email: cleanInput }],
          deletedAt: null,
        },
      });

      if (fallbackUser) {
        // Upgrade user to agent
        const upgraded = await prisma.user.update({
          where: { id: fallbackUser.id },
          data: { role: "AGENT" },
        });

        const token = `tok_agent_${upgraded.id}_${Date.now()}`;
        return NextResponse.json({
          success: true,
          token,
          agent: {
            id: upgraded.id,
            name: upgraded.name || "Field Agent",
            email: upgraded.email,
            phone: upgraded.phone,
          },
        });
      }

      return NextResponse.json(
        { success: false, error: "Invalid agent credentials or account not registered as AGENT." },
        { status: 401 }
      );
    }

    const token = `tok_agent_${agent.id}_${Date.now()}`;

    return NextResponse.json({
      success: true,
      token,
      agent: {
        id: agent.id,
        name: agent.name || "Field Agent",
        email: agent.email,
        phone: agent.phone,
      },
    });
  } catch (error: any) {
    console.error("Agent login error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Login failed" },
      { status: 500 }
    );
  }
}
