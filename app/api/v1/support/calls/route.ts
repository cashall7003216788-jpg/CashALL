import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const logs = await prisma.auditLog.findMany({
      where: {
        action: { in: ["SUPPORT_CALL_LOGGED", "SUPPORT_CALL_RECORDING"] },
        actorRole: { not: "AGENT" },
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
        createdAtIST: data.callTimeIST || new Date(log.createdAt).toLocaleString("en-IN", { timeZone: "Asia/Kolkata" }),
        callTimeIST: data.callTimeIST || new Date(log.createdAt).toLocaleString("en-IN", { timeZone: "Asia/Kolkata" }),
        durationSeconds: durationSec,
        durationFormatted: durationFmt,
        audioUrl: data.audioUrl || "",
        hasRecording: !!data.audioUrl,
        createdAt: log.createdAt.toISOString(),
      };
    });

    const isFieldAgent = (name: string = "", notes: string = "") => {
      const lower = name.toLowerCase();
      const lowerNotes = notes.toLowerCase();
      return (
        lower.includes("arshad") ||
        lower.includes("aman") ||
        lower.includes("hyder") ||
        lower.includes("ankit") ||
        lowerNotes.includes("field agent") ||
        lowerNotes.includes("agent app")
      );
    };

    const supportOnlyItems = rawItems.filter(
      (item) => !isFieldAgent(item.supportPersonName, item.callNotes)
    );

    // Merge recording and logged outcome within 24 hours for the same quote or 10-digit customer phone
    const mergedCalls: typeof supportOnlyItems = [];
    const usedIds = new Set<string>();

    for (let i = 0; i < supportOnlyItems.length; i++) {
      const item = supportOnlyItems[i];
      if (usedIds.has(item.id)) continue;

      const p1 = (item.customerPhone || "").replace(/\D/g, "").slice(-10);

      const matchIndex = supportOnlyItems.findIndex((other, idx) => {
        if (idx <= i || usedIds.has(other.id)) return false;
        // Only merge a phone call recording with a dashboard notes log, not two identical logs of the same type!
        if (item.action === other.action) return false;

        const sameQuote = item.quoteId !== "N/A" && other.quoteId !== "N/A" && item.quoteId === other.quoteId;
        const p2 = (other.customerPhone || "").replace(/\D/g, "").slice(-10);
        const samePhone = p1.length === 10 && p1 === p2;
        if (!sameQuote && !samePhone) return false;

        const timeDiffMs = Math.abs(new Date(item.createdAt).getTime() - new Date(other.createdAt).getTime());
        return timeDiffMs < 24 * 60 * 60 * 1000; // Within 24 hours
      });

      if (matchIndex !== -1) {
        const other = rawItems[matchIndex];
        usedIds.add(other.id);

        const loggedEntry = item.action === "SUPPORT_CALL_LOGGED" ? item : other.action === "SUPPORT_CALL_LOGGED" ? other : null;
        const recordingEntry = item.action === "SUPPORT_CALL_RECORDING" ? item : other.action === "SUPPORT_CALL_RECORDING" ? other : null;

        // Choose the real callNotes (avoid placeholder if one of them has a real note)
        const isPlaceholder = (n?: string) => !n || n.includes("CashALL Caller App") || n.includes("Android Caller App");
        let resolvedNotes = "";
        if (loggedEntry && !isPlaceholder(loggedEntry.callNotes)) {
          resolvedNotes = loggedEntry.callNotes;
        } else if (recordingEntry && !isPlaceholder(recordingEntry.callNotes)) {
          resolvedNotes = recordingEntry.callNotes;
        } else if (!isPlaceholder(item.callNotes)) {
          resolvedNotes = item.callNotes;
        } else if (!isPlaceholder(other.callNotes)) {
          resolvedNotes = other.callNotes;
        } else {
          resolvedNotes = loggedEntry?.callNotes || item.callNotes || other.callNotes || "";
        }

        let resolvedOutcome = item.callOutcome;
        if (loggedEntry?.callOutcome && loggedEntry.callOutcome !== "CALL_COMPLETED" && loggedEntry.callOutcome !== "CALL_ATTEMPTED") {
          resolvedOutcome = loggedEntry.callOutcome;
        } else if (other.callOutcome && other.callOutcome !== "CALL_COMPLETED" && other.callOutcome !== "CALL_ATTEMPTED") {
          resolvedOutcome = other.callOutcome;
        }

        const combined = {
          ...(recordingEntry || item),
          id: (recordingEntry || item).id,
          callOutcome: resolvedOutcome,
          callNotes: resolvedNotes,
          durationSeconds: recordingEntry?.durationSeconds || item.durationSeconds || other.durationSeconds,
          durationFormatted: recordingEntry?.durationFormatted || item.durationFormatted || other.durationFormatted,
          audioUrl: recordingEntry?.audioUrl || item.audioUrl || other.audioUrl,
          hasRecording: !!(recordingEntry?.audioUrl || item.audioUrl || other.audioUrl),
          deviceName: (item.deviceName && item.deviceName !== "Mobile Device" ? item.deviceName : other.deviceName) || "Mobile Device",
          customerName: (item.customerName && item.customerName !== "Customer Lead" ? item.customerName : other.customerName) || "Customer Lead",
          customerPhone: (item.customerPhone && item.customerPhone !== "—" ? item.customerPhone : other.customerPhone) || "—",
          supportPersonPhone: item.supportPersonPhone !== "—" ? item.supportPersonPhone : other.supportPersonPhone,
          createdAtIST: item.createdAtIST || other.createdAtIST,
          callTimeIST: item.callTimeIST || other.callTimeIST,
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

    // Find the single most recent SUPPORT_CALL_RECORDING from the active call session (last 15 minutes)
    const cleanCustomerDigits = (customerPhone || "").replace(/\D/g, "").slice(-10);
    let matchedRecording: { logItem: any; data: any } | null = null;

    try {
      const recentAuditLogs = await prisma.auditLog.findMany({
        where: {
          action: "SUPPORT_CALL_RECORDING",
          createdAt: { gte: new Date(Date.now() - 15 * 60 * 1000) },
        },
        orderBy: { createdAt: "desc" },
        take: 10,
      });

      for (const logItem of recentAuditLogs) {
        try {
          const d = JSON.parse(logItem.newValuesJson || "{}");
          const matchQuote = quoteId && quoteId !== "N/A" && d.quoteId === quoteId;
          const matchPhone = cleanCustomerDigits && d.customerPhone && d.customerPhone.replace(/\D/g, "").slice(-10) === cleanCustomerDigits;

          if (matchQuote || matchPhone) {
            matchedRecording = { logItem, data: d };
            break; // Strictly match ONLY the single most recent recording from this call session
          }
        } catch {}
      }
    } catch (updateErr) {
      console.warn("Could not check recent recording:", updateErr);
    }

    if (matchedRecording) {
      const updatedValues = {
        ...matchedRecording.data,
        callOutcome: callOutcome || matchedRecording.data.callOutcome || "CUSTOMER_INTERESTED",
        callNotes: callNotes || matchedRecording.data.callNotes,
        customerName: customerName && customerName !== "Customer Lead" ? customerName : matchedRecording.data.customerName,
        supportPersonName: supportPersonName || matchedRecording.data.supportPersonName || "Support Agent",
        supportPersonPhone: finalAgentPhone || matchedRecording.data.supportPersonPhone,
        updatedAtIST: callTimeIST,
      };

      const updated = await prisma.auditLog.update({
        where: { id: matchedRecording.logItem.id },
        data: {
          newValuesJson: JSON.stringify(updatedValues),
          updatedAt: new Date(),
        },
      });

      return NextResponse.json({
        success: true,
        message: "Support call recording outcome updated successfully",
        callLog: updated,
      });
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

export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json();
    const { id, quoteId, customerPhone, callOutcome, callNotes, supportPersonName } = body;

    if (!id && !quoteId && !customerPhone) {
      return NextResponse.json(
        { success: false, error: "Record ID, Quote ID, or Customer Phone is required to update call reason" },
        { status: 400 }
      );
    }

    let targetLog = null;
    if (id) {
      targetLog = await prisma.auditLog.findUnique({ where: { id } });
    }

    if (!targetLog && (quoteId || customerPhone)) {
      const cleanCustomerDigits = (customerPhone || "").replace(/\D/g, "").slice(-10);
      const candidates = await prisma.auditLog.findMany({
        where: {
          action: { in: ["SUPPORT_CALL_LOGGED", "SUPPORT_CALL_RECORDING"] },
        },
        orderBy: { createdAt: "desc" },
        take: 60,
      });

      for (const c of candidates) {
        try {
          const d = JSON.parse(c.newValuesJson || "{}");
          if (quoteId && quoteId !== "N/A" && d.quoteId === quoteId) {
            targetLog = c;
            break;
          }
          if (cleanCustomerDigits && d.customerPhone && d.customerPhone.replace(/\D/g, "").slice(-10) === cleanCustomerDigits) {
            targetLog = c;
            break;
          }
        } catch {}
      }
    }

    if (!targetLog) {
      return NextResponse.json({ success: false, error: "Call log entry not found" }, { status: 404 });
    }

    let existingData: any = {};
    try {
      existingData = JSON.parse(targetLog.newValuesJson || "{}");
    } catch {}

    const updatedData = {
      ...existingData,
      callOutcome: callOutcome !== undefined ? callOutcome : existingData.callOutcome,
      callNotes: callNotes !== undefined ? callNotes : existingData.callNotes,
      supportPersonName: supportPersonName || existingData.supportPersonName,
      updatedAtIST: new Date().toLocaleString("en-IN", { timeZone: "Asia/Kolkata" }),
    };

    const updated = await prisma.auditLog.update({
      where: { id: targetLog.id },
      data: {
        newValuesJson: JSON.stringify(updatedData),
        updatedAt: new Date(),
      },
    });

    // Also update any other recent log matching this quoteId or customerPhone so both are synchronized
    const cleanDigits = (updatedData.customerPhone || customerPhone || "").replace(/\D/g, "").slice(-10);
    const quote = updatedData.quoteId || quoteId;
    if (quote && quote !== "N/A" || cleanDigits) {
      try {
        const otherLogs = await prisma.auditLog.findMany({
          where: {
            id: { not: targetLog.id },
            action: { in: ["SUPPORT_CALL_LOGGED", "SUPPORT_CALL_RECORDING"] },
            createdAt: { gte: new Date(Date.now() - 24 * 60 * 60 * 1000) },
          },
          take: 20,
        });
        for (const ol of otherLogs) {
          try {
            const od = JSON.parse(ol.newValuesJson || "{}");
            const matchQ = quote && quote !== "N/A" && od.quoteId === quote;
            const matchP = cleanDigits && od.customerPhone && od.customerPhone.replace(/\D/g, "").slice(-10) === cleanDigits;
            if (matchQ || matchP) {
              await prisma.auditLog.update({
                where: { id: ol.id },
                data: {
                  newValuesJson: JSON.stringify({
                    ...od,
                    callOutcome: updatedData.callOutcome,
                    callNotes: updatedData.callNotes,
                  }),
                  updatedAt: new Date(),
                },
              });
            }
          } catch {}
        }
      } catch {}
    }

    return NextResponse.json({
      success: true,
      message: "Call reason and outcome updated successfully",
      data: {
        id: updated.id,
        callOutcome: updatedData.callOutcome,
        callNotes: updatedData.callNotes,
      },
    });
  } catch (error: any) {
    console.error("Error updating call log:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to update call log" },
      { status: 500 }
    );
  }
}
