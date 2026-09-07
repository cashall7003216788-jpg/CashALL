import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const logs = await prisma.auditLog.findMany({
      where: {
        action: { in: ["SUPPORT_CALL_LOGGED", "SUPPORT_CALL_RECORDING"] },
      },
      orderBy: { createdAt: "desc" },
      take: 300,
    });

    // Collect quote numbers to resolve device name if missing
    const quoteNumbers = Array.from(
      new Set(
        logs
          .map((l) => {
            try {
              const d = JSON.parse(l.newValuesJson || "{}");
              return d.quoteId;
            } catch {
              return null;
            }
          })
          .filter((q): q is string => typeof q === "string" && (q.startsWith("CAQ") || q.startsWith("Q")))
      )
    );

    const quotes =
      quoteNumbers.length > 0
        ? await prisma.quote.findMany({
            where: { quoteNumber: { in: quoteNumbers } },
            include: {
              variant: {
                include: {
                  model: {
                    include: { brand: true },
                  },
                },
              },
            },
          })
        : [];

    const quoteDeviceMap = new Map<string, string>();
    for (const q of quotes) {
      let devName = q.variant
        ? `${q.variant.model.brand.name} ${q.variant.model.name} (${q.variant.storage})`
        : "";
      if (!devName && q.breakdownJson) {
        try {
          const bd = JSON.parse(q.breakdownJson);
          if (bd.deviceName) devName = bd.deviceName;
        } catch {}
      }
      if (devName) quoteDeviceMap.set(q.quoteNumber, devName);
    }

    const rawItems = logs.map((log) => {
      let data: any = {};
      if (log.newValuesJson) {
        try {
          data = JSON.parse(log.newValuesJson);
        } catch {}
      }

      const quoteId = data.quoteId || "N/A";
      const resolvedDevice = data.deviceName || quoteDeviceMap.get(quoteId) || "Mobile Device";

      let agentPhone = data.supportPersonPhone || "—";
      const agentName = data.supportPersonName || "Support Agent";
      if ((agentPhone === "—" || !agentPhone) && agentName.toLowerCase().includes("harshita")) {
        agentPhone = "8981191734";
      }

      const durationSec = Number(data.durationSeconds) || 0;
      const durationFmt =
        data.durationFormatted ||
        (durationSec > 0
          ? durationSec < 60
            ? `${durationSec}s`
            : `${Math.floor(durationSec / 60)}m ${durationSec % 60}s`
          : "—");

      return {
        id: log.id,
        action: log.action,
        supportPersonName: agentName,
        supportPersonPhone: agentPhone,
        quoteId,
        customerName: data.customerName || "Customer Lead",
        customerPhone: data.customerPhone || "—",
        deviceName: resolvedDevice,
        callOutcome: data.callOutcome || (log.action === "SUPPORT_CALL_RECORDING" ? "CALL_COMPLETED" : "CALL_ATTEMPTED"),
        callNotes: data.callNotes || (log.action === "SUPPORT_CALL_RECORDING" ? "Logged via CashALL Caller App" : ""),
        callTimeIST: data.callTimeIST || new Date(log.createdAt).toLocaleString("en-IN", { timeZone: "Asia/Kolkata" }),
        durationSeconds: durationSec,
        durationFormatted: durationFmt,
        audioUrl: data.audioUrl || "",
        hasRecording: !!data.audioUrl,
        createdAt: log.createdAt.toISOString(),
      };
    });

    // Merge recording and logged outcome if within 25 minutes for the same quote/phone
    const mergedCalls: typeof rawItems = [];
    const usedIds = new Set<string>();

    for (let i = 0; i < rawItems.length; i++) {
      const item = rawItems[i];
      if (usedIds.has(item.id)) continue;

      const matchIndex = rawItems.findIndex((other, idx) => {
        if (idx <= i || usedIds.has(other.id)) return false;
        // Only merge a phone call recording with a dashboard notes log, not two distinct logs of the same type!
        if (item.action === other.action) return false;

        const sameQuote = item.quoteId !== "N/A" && item.quoteId === other.quoteId;
        const samePhone = item.customerPhone !== "—" && item.customerPhone === other.customerPhone;
        if (!sameQuote && !samePhone) return false;

        const timeDiffMs = Math.abs(new Date(item.createdAt).getTime() - new Date(other.createdAt).getTime());
        return timeDiffMs < 10 * 60 * 1000; // Within 10 minutes
      });

      if (matchIndex !== -1) {
        const other = rawItems[matchIndex];
        usedIds.add(other.id);

        const loggedEntry = item.action === "SUPPORT_CALL_LOGGED" ? item : other.action === "SUPPORT_CALL_LOGGED" ? other : null;
        const recordingEntry = item.action === "SUPPORT_CALL_RECORDING" ? item : other.action === "SUPPORT_CALL_RECORDING" ? other : null;

        const combined = {
          ...(recordingEntry || item),
          callOutcome: loggedEntry?.callOutcome || item.callOutcome,
          callNotes: loggedEntry?.callNotes || item.callNotes,
          durationSeconds: recordingEntry?.durationSeconds || item.durationSeconds || other.durationSeconds,
          durationFormatted: recordingEntry?.durationFormatted || item.durationFormatted || other.durationFormatted,
          audioUrl: recordingEntry?.audioUrl || item.audioUrl || other.audioUrl,
          hasRecording: !!(recordingEntry?.audioUrl || item.audioUrl || other.audioUrl),
          deviceName: (item.deviceName && item.deviceName !== "Mobile Device" ? item.deviceName : other.deviceName) || "Mobile Device",
          customerName: (item.customerName && item.customerName !== "Customer Lead" ? item.customerName : other.customerName) || "Customer Lead",
          customerPhone: (item.customerPhone && item.customerPhone !== "—" ? item.customerPhone : other.customerPhone) || "—",
          supportPersonPhone: item.supportPersonPhone !== "—" ? item.supportPersonPhone : other.supportPersonPhone,
        };

        mergedCalls.push(combined);
      } else {
        mergedCalls.push(item);
      }
      usedIds.add(item.id);
    }

    return NextResponse.json({
      success: true,
      count: mergedCalls.length,
      calls: mergedCalls,
      recordings: mergedCalls,
      data: mergedCalls,
    });
  } catch (error: any) {
    console.error("Error fetching support calls:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to fetch call logs" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      supportPersonName,
      supportPersonPhone,
      quoteId,
      customerName,
      customerPhone,
      deviceName,
      callOutcome,
      callNotes,
      durationSeconds,
    } = body;

    if (!customerPhone && !quoteId) {
      return NextResponse.json(
        { success: false, error: "Quote ID and Customer Phone are required to log a call" },
        { status: 400 }
      );
    }

    const callTimeIST = new Date().toLocaleString("en-IN", { timeZone: "Asia/Kolkata" });

    let finalAgentPhone = supportPersonPhone || "";
    if (!finalAgentPhone && supportPersonName?.toLowerCase().includes("harshita")) {
      finalAgentPhone = "8981191734";
    }

    const callLog = await prisma.auditLog.create({
      data: {
        actorId: "00000000-0000-0000-0000-000000000000",
        actorRole: "SUPPORT",
        action: "SUPPORT_CALL_LOGGED",
        tableName: "SupportCallRecord",
        recordId: "00000000-0000-0000-0000-000000000000",
        newValuesJson: JSON.stringify({
          supportPersonName: supportPersonName || "Support Agent",
          supportPersonPhone: finalAgentPhone,
          quoteId: quoteId || "CAQ-LEAD",
          customerName: customerName || "Customer Lead",
          customerPhone: customerPhone || "—",
          deviceName: deviceName || "Mobile Device",
          callOutcome: callOutcome || "CUSTOMER_INTERESTED",
          callNotes: callNotes || "Followed up with customer regarding pending valuation.",
          callTimeIST,
          durationSeconds: Number(durationSeconds) || 0,
        }),
      },
    });

    return NextResponse.json({
      success: true,
      message: "Support call recorded in database successfully",
      callLog,
    });
  } catch (error: any) {
    console.error("Error logging support call:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to log call" },
      { status: 500 }
    );
  }
}
