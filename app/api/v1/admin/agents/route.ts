import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const agents = await prisma.user.findMany({
      where: {
        role: "AGENT",
        deletedAt: null,
      },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        status: true,
        createdAt: true,
        _count: {
          select: {
            assignedOrders: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json({ success: true, agents });
  } catch (error: any) {
    console.error("Error fetching agents:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to fetch agents" },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { name, username, phone, password } = body;

    if (!phone && !name && !username) {
      return NextResponse.json(
        { success: false, error: "Full Name, User Name, Phone Number, and Password are required" },
        { status: 400 }
      );
    }

    const fullName = (name || username || "CashALL Field Agent").trim();
    const cleanUsername = (username || fullName).trim();
    const cleanPhone = phone ? phone.trim() : `99${Date.now().toString().slice(-8)}`;
    const autoEmail = `${cleanUsername.toLowerCase().replace(/\s+/g, ".")}@cashall.in`;

    // Check if an AGENT with this phone, email, or name already exists in database
    const existingAgent = await prisma.user.findFirst({
      where: {
        role: "AGENT",
        OR: [
          { phone: cleanPhone },
          { email: autoEmail },
          { name: { equals: fullName, mode: "insensitive" } },
          { name: { equals: cleanUsername, mode: "insensitive" } },
        ],
      },
    });

    if (existingAgent) {
      // Update existing agent
      const updated = await prisma.user.update({
        where: { id: existingAgent.id },
        data: {
          name: fullName,
          email: existingAgent.email || autoEmail,
          phone: cleanPhone,
          status: "ACTIVE",
        },
      });

      return NextResponse.json({
        success: true,
        message: "Agent registered/updated successfully",
        agent: updated,
      });
    }

    const firebaseUid = `agent_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;

    const agent = await prisma.user.create({
      data: {
        name: fullName,
        email: autoEmail,
        phone: cleanPhone,
        role: "AGENT",
        firebaseUid,
        status: "ACTIVE",
      },
    });

    return NextResponse.json({
      success: true,
      message: "Agent created successfully",
      agent,
    });
  } catch (error: any) {
    console.error("Error creating agent:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to create agent" },
      { status: 500 }
    );
  }
}
