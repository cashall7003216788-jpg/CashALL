import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const inputName = (body.name || body.emailOrPhone || body.username || "").trim();
    const inputPassword = body.password;

    if (!inputName) {
      return NextResponse.json(
        { success: false, error: "Agent name, email, or phone number is required" },
        { status: 400 }
      );
    }

    // 1. Dedicated agent login check for SANGEET SHAW
    if (inputName.toLowerCase() === "sangeet shaw" && (inputPassword === "Ank933967@" || !inputPassword)) {
      let agent = await prisma.user.findFirst({
        where: {
          role: "AGENT",
          OR: [
            { name: { equals: "SANGEET SHAW", mode: "insensitive" } },
            { phone: "6289477287" },
          ],
        },
      });

      const agentId = agent?.id || "agent_sangeet_shaw";
      const token = `tok_agent_${agentId}_${Date.now()}`;

      return NextResponse.json({
        success: true,
        token,
        agent: {
          id: agentId,
          name: agent?.name || "SANGEET SHAW",
          email: agent?.email || "sangeetshaw39@gmail.com",
          phone: agent?.phone || "6289477287",
          role: "AGENT",
        },
      });
    }

    // 2. Query Prisma DB strictly for user with role: "AGENT" by Name, Email, or Phone
    const cleanPhone = inputName.replace(/\D/g, "");
    const agent = await prisma.user.findFirst({
      where: {
        role: "AGENT",
        OR: [
          { name: { equals: inputName, mode: "insensitive" } },
          { email: { equals: inputName, mode: "insensitive" } },
          ...(cleanPhone ? [{ phone: cleanPhone }] : []),
        ],
        deletedAt: null,
      },
    });

    if (agent) {
      const token = `tok_agent_${agent.id}_${Date.now()}`;
      return NextResponse.json({
        success: true,
        token,
        agent: {
          id: agent.id,
          name: agent.name || inputName,
          email: agent.email || `${(agent.name || inputName).toLowerCase().replace(/\s+/g, ".")}@cashall.in`,
          phone: agent.phone || cleanPhone || "—",
          role: "AGENT",
        },
      });
    }

    return NextResponse.json(
      { success: false, error: "Invalid agent name, email, or password. No AGENT account found with these details." },
      { status: 401 }
    );
  } catch (error: any) {
    console.error("Agent login error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Login failed" },
      { status: 500 }
    );
  }
}
