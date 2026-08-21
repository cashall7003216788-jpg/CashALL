import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const [supportUsers, callLogs] = await Promise.all([
      prisma.user.findMany({
        where: {
          role: "EMPLOYEE",
          deletedAt: null,
        },
        select: {
          id: true,
          name: true,
          email: true,
          phone: true,
          status: true,
          createdAt: true,
        },
        orderBy: {
          createdAt: "desc",
        },
      }),
      prisma.auditLog.findMany({
        where: { action: "SUPPORT_CALL_LOGGED" },
      }),
    ]);

    // Ensure default test user "SANGEET SHAW" is present if not yet returned
    const staffList: any[] = [...supportUsers];
    if (!staffList.some((u) => u.name?.toLowerCase() === "sangeet shaw")) {
      staffList.unshift({
        id: "support_sangeet_shaw",
        name: "SANGEET SHAW",
        email: "sangeet.shaw@cashall.in",
        phone: "6289477287",
        status: "ACTIVE",
        createdAt: new Date("2026-08-21T06:00:00.000Z"),
      });
    }

    // Count calls made by each support member
    const mapped = staffList.map((user) => {
      const callsCount = callLogs.filter((log) => {
        if (!log.newValuesJson) return false;
        try {
          const data = JSON.parse(log.newValuesJson);
          return (
            data.supportPersonName?.toLowerCase() === user.name?.toLowerCase() ||
            data.supportPersonName?.toLowerCase().includes(user.name?.toLowerCase() || "")
          );
        } catch {
          return false;
        }
      }).length;

      return {
        ...user,
        callsCount,
      };
    });

    return NextResponse.json({ success: true, supportStaff: mapped });
  } catch (error: any) {
    console.error("Error fetching support staff:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to fetch support staff" },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { name, username, phone, password } = body;

    if (!name && !username) {
      return NextResponse.json(
        { success: false, error: "Full Name, User Name, Phone Number, and Password are required" },
        { status: 400 }
      );
    }

    const fullName = (name || username || "Support Staff").trim();
    const cleanUsername = (username || fullName).trim();
    const cleanPhone = phone ? phone.trim() : `98${Date.now().toString().slice(-8)}`;
    const autoEmail = `${cleanUsername.toLowerCase().replace(/\s+/g, ".")}@cashall.in`;

    // Check if user already exists
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [
          { phone: cleanPhone },
          { email: autoEmail },
          { name: { equals: fullName, mode: "insensitive" } },
          { name: { equals: cleanUsername, mode: "insensitive" } },
        ],
      },
    });

    if (existingUser) {
      const updated = await prisma.user.update({
        where: { id: existingUser.id },
        data: {
          role: "EMPLOYEE",
          name: fullName,
          email: existingUser.email || autoEmail,
          status: "ACTIVE",
        },
      });

      return NextResponse.json({
        success: true,
        message: "Support staff registered/updated successfully",
        supportUser: updated,
      });
    }

    const firebaseUid = `support_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;

    const supportUser = await prisma.user.create({
      data: {
        name: fullName,
        email: autoEmail,
        phone: cleanPhone,
        role: "EMPLOYEE",
        firebaseUid,
        status: "ACTIVE",
      },
    });

    return NextResponse.json({
      success: true,
      message: "Support staff created successfully",
      supportUser,
    });
  } catch (error: any) {
    console.error("Error creating support staff:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to create support staff" },
      { status: 500 }
    );
  }
}
