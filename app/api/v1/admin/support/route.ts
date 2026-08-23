import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const [supportUsers, callLogs, sessionLogs] = await Promise.all([
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
      prisma.auditLog.findMany({
        where: {
          action: { in: ["SUPPORT_LOGIN", "SUPPORT_LOGOUT"] },
        },
        orderBy: {
          createdAt: "desc",
        },
        take: 100,
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

    const formatIST = (date: string | Date | null | undefined): string => {
      if (!date) return "—";
      try {
        const d = typeof date === "string" ? new Date(date) : date;
        if (isNaN(d.getTime())) return "—";
        return d.toLocaleString("en-IN", {
          timeZone: "Asia/Kolkata",
          day: "numeric",
          month: "short",
          year: "numeric",
          hour: "2-digit",
          minute: "2-digit",
          hour12: true,
        });
      } catch {
        return "—";
      }
    };

    // Process Login and Logout timing per staff
    const mapped = staffList.map((user) => {
      const uName = user.name?.toLowerCase().trim() || "";

      // Find user calls count
      const callsCount = callLogs.filter((log) => {
        if (!log.newValuesJson) return false;
        try {
          const data = JSON.parse(log.newValuesJson);
          const spName = data.supportPersonName?.toLowerCase().trim() || "";
          return spName === uName || spName.includes(uName) || uName.includes(spName);
        } catch {
          return false;
        }
      }).length;

      // Find user session logs
      const userSessions = sessionLogs.filter((s) => {
        let sName = "";
        let sPhone = "";
        try {
          const det = s.newValuesJson ? JSON.parse(s.newValuesJson) : {};
          sName = det.name?.toLowerCase().trim() || "";
          sPhone = det.phone?.trim() || "";
        } catch {}
        return (
          (uName && sName === uName) ||
          (uName && sName.includes(uName)) ||
          (uName && uName.includes(sName)) ||
          (user.phone && sPhone === user.phone) ||
          (user.id && s.actorId === user.id) ||
          (uName && s.actorId?.toLowerCase().includes(uName.replace(/\s+/g, "_")))
        );
      });

      const userLogins = userSessions.filter((s) => s.action === "SUPPORT_LOGIN");
      const userLogouts = userSessions.filter((s) => s.action === "SUPPORT_LOGOUT");

      const lastLogin = userLogins[0]; // ordered desc
      const lastLogout = userLogouts[0]; // ordered desc

      const lastLoginTime = lastLogin ? formatIST(lastLogin.createdAt) : "—";
      const lastLogoutTime = lastLogout ? formatIST(lastLogout.createdAt) : "—";

      let sessionStatus = "OFFLINE";
      if (lastLogin) {
        if (!lastLogout || new Date(lastLogin.createdAt).getTime() > new Date(lastLogout.createdAt).getTime()) {
          sessionStatus = "ONLINE";
        } else {
          sessionStatus = "OFFLINE";
        }
      } else {
        sessionStatus = "OFFLINE";
      }

      return {
        ...user,
        callsCount,
        lastLoginTime,
        lastLogoutTime,
        sessionStatus,
      };
    });

    const formattedSessions = sessionLogs.map((s) => {
      let parsed: any = {};
      try {
        parsed = s.newValuesJson ? JSON.parse(s.newValuesJson) : {};
      } catch {}
      return {
        id: s.id,
        action: s.action,
        staffName: parsed.name || "Support Staff",
        phone: parsed.phone || "—",
        event: s.action === "SUPPORT_LOGIN" ? "LOGGED IN" : "LOGGED OUT",
        timestamp: formatIST(s.createdAt),
        rawDate: s.createdAt,
      };
    });

    return NextResponse.json({
      success: true,
      supportStaff: mapped,
      sessionLogs: formattedSessions,
    });
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

    // Check if support user already exists
    const existingUser = await prisma.user.findFirst({
      where: {
        role: "EMPLOYEE",
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
          name: fullName,
          email: existingUser.email || autoEmail,
          phone: cleanPhone,
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
