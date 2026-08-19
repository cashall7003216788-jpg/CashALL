import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

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
    const { name, email, phone, password } = body;

    if (!phone) {
      return NextResponse.json(
        { success: false, error: "Phone number is required" },
        { status: 400 }
      );
    }

    const cleanPhone = phone.trim();
    const cleanEmail = email ? email.trim() : null;

    // Check if phone or email already exists
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [
          { phone: cleanPhone },
          ...(cleanEmail ? [{ email: cleanEmail }] : []),
        ],
      },
    });

    if (existingUser) {
      // If user exists, update their role to AGENT
      const updated = await prisma.user.update({
        where: { id: existingUser.id },
        data: {
          role: "AGENT",
          name: name || existingUser.name,
          email: cleanEmail || existingUser.email,
        },
      });

      return NextResponse.json({
        success: true,
        message: "User role updated to AGENT",
        agent: updated,
      });
    }

    const firebaseUid = `agent_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;

    const agent = await prisma.user.create({
      data: {
        name: name || "CashALL Field Agent",
        email: cleanEmail,
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
