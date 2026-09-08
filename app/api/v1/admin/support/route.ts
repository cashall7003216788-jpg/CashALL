import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const [supportUsers, callLogs, sessionLogs, credLogs] = await Promise.all([
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
          firebaseUid: true,
          createdAt: true,
        },
        orderBy: {
          createdAt: "desc",
        },
      }),
      prisma.auditLog.findMany({
        where: { action: { in: ["SUPPORT_CALL_LOGGED", "SUPPORT_CALL_RECORDING"] } },
        orderBy: { createdAt: "desc" },
        take: 250,
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
      prisma.auditLog.findMany({
        where: { action: "SUPPORT_STAFF_CREDENTIALS" },
        orderBy: { createdAt: "desc" },
        take: 50,
      }),
    ]);

    // Ensure default test user "SANGEET SHAW" is present if not yet returned
    const staffList: any[] = [...supportUsers];
    const hasSangeet = staffList.some(
      (u) => u.name?.toLowerCase().includes("sangeet") || u.phone === "6289477287"
    );
    if (!hasSangeet) {
      staffList.push({
        id: "support_sangeet_shaw",
        name: "Sangeet Shaw",
        email: "sangeet@cashall.in",
        phone: "6289477287",
        firebaseUid: "support_sangeet_shaw",
        role: "EMPLOYEE",
        active: true,
        createdAt: new Date("2026-09-01T00:00:00Z"),
        updatedAt: new Date(),
      } as any);
    }

    const formatIST = (date: any) => {
      try {
        return new Date(date).toLocaleString("en-IN", {
          timeZone: "Asia/Kolkata",
          day: "2-digit",
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

    const formatDurationSec = (seconds: number) => {
      if (!seconds || seconds <= 0) return "0s";
      const h = Math.floor(seconds / 3600);
      const m = Math.floor((seconds % 3600) / 60);
      const s = Math.floor(seconds % 60);
      if (h > 0) return `${h}h ${m}m`;
      if (m > 0) return `${m}m ${s}s`;
      return `${s}s`;
    };

    // Process Login and Logout timing per staff
    const mapped = staffList.map((user) => {
      const uName = user.name?.toLowerCase().trim() || "";

      // Find user calls count & total duration
      let userTotalSeconds = 0;
      let userRecordingsCount = 0;
      const userCalls = callLogs.filter((log) => {
        if (!log.newValuesJson) return false;
        try {
          const data = JSON.parse(log.newValuesJson);
          const spName = data.supportPersonName?.toLowerCase().trim() || "";
          const spPhone = data.supportPersonPhone?.trim() || "";
          const isMatch =
            (uName && (spName === uName || spName.includes(uName) || uName.includes(spName))) ||
            (user.phone && spPhone && spPhone === user.phone);
          if (isMatch) {
            if (data.durationSeconds) userTotalSeconds += Number(data.durationSeconds);
            if (data.audioUrl) userRecordingsCount++;
            return true;
          }
          return false;
        } catch {
          return false;
        }
      });
      const callsCount = userCalls.length;
      const totalTalkTime = formatDurationSec(userTotalSeconds);

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
          (user.phone && sPhone && sPhone === user.phone)
        );
      });

      const userLogins = userSessions.filter((s) => s.action === "SUPPORT_LOGIN");
      const userLogouts = userSessions.filter((s) => s.action === "SUPPORT_LOGOUT");

      const lastLogin = userLogins[0]; // ordered desc
      const lastLogout = userLogouts[0];

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

      // Determine configured password
      let loginPassword = "";
      if (user.firebaseUid && user.firebaseUid.includes("_pwd_")) {
        try {
          const b64 = user.firebaseUid.split("_pwd_")[1];
          loginPassword = Buffer.from(b64, "base64").toString("utf-8");
        } catch {}
      }
      if (!loginPassword) {
        const cred = credLogs.find((c) => {
          if (!c.newValuesJson) return false;
          try {
            const p = JSON.parse(c.newValuesJson);
            return p.phone === user.phone || c.actorId === user.id || c.recordId === user.id;
          } catch {
            return false;
          }
        });
        if (cred?.newValuesJson) {
          try {
            loginPassword = JSON.parse(cred.newValuesJson).password || "";
          } catch {}
        }
      }
      if (!loginPassword) {
        loginPassword = user.phone || "Ank933967@";
      }

      return {
        ...user,
        loginPassword,
        callsCount,
        totalTalkTime,
        totalTalkSeconds: userTotalSeconds,
        recordingsCount: userRecordingsCount,
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
    const cleanPhone = phone ? phone.trim().replace(/\D/g, "") : `98${Date.now().toString().slice(-8)}`;
    const cleanPassword = (password || "").trim() || cleanPhone;
    const pwdB64 = Buffer.from(cleanPassword).toString("base64");
    const firebaseUid = `support_${cleanPhone}_pwd_${pwdB64}`;
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
          firebaseUid: firebaseUid,
          status: "ACTIVE",
        },
      });

      // Record credential log in auditLog
      try {
        await prisma.auditLog.create({
          data: {
            actorId: existingUser.id,
            actorRole: "ADMIN",
            action: "SUPPORT_STAFF_CREDENTIALS",
            tableName: "SupportStaff",
            recordId: existingUser.id,
            newValuesJson: JSON.stringify({
              password: cleanPassword,
              phone: cleanPhone,
              name: fullName,
              username: cleanUsername,
              updatedAt: new Date().toISOString(),
            }),
          },
        });
      } catch (e) {
        console.warn("Could not save credential log:", e);
      }

      return NextResponse.json({
        success: true,
        message: "Support staff registered/updated successfully",
        supportUser: updated,
      });
    }

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

    // Record credential log in auditLog
    try {
      await prisma.auditLog.create({
        data: {
          actorId: supportUser.id,
          actorRole: "ADMIN",
          action: "SUPPORT_STAFF_CREDENTIALS",
          tableName: "SupportStaff",
          recordId: supportUser.id,
          newValuesJson: JSON.stringify({
            password: cleanPassword,
            phone: cleanPhone,
            name: fullName,
            username: cleanUsername,
            createdAt: new Date().toISOString(),
          }),
        },
      });
    } catch (e) {
      console.warn("Could not save credential log:", e);
    }

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
