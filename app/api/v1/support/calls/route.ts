import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

let callsCache: { data: any; timestamp: number } | null = null;

export async function GET(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const noCache = url.searchParams.get("nocache") === "true";

    // 6-second in-memory cache to make reloads and navigation instantaneous
    if (!noCache && callsCache && Date.now() - callsCache.timestamp < 6000) {
      return NextResponse.json(callsCache.data, {
        headers: { "Cache-Control": "private, s-maxage=5, stale-while-revalidate=15" },
      });
    }

    const logs = await prisma.auditLog.findMany({
      where: {
        action: { in: ["SUPPORT_CALL_LOGGED", "SUPPORT_CALL_RECORDING"] },
        actorRole: { not: "AGENT" },
      },
      select: {
        id: true,
        action: true,
        actorRole: true,
        newValuesJson: true,
        createdAt: true,
      },
      orderBy: { createdAt: "desc" },
      take: 200,
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

    const rawItems = logs.map((log) => {
      let data: any = {};
      if (log.newValuesJson) {
        try {
          data = JSON.parse(log.newValuesJson);
        } catch {}
      }

      const quoteId = data.quoteId || "N/A";
      const resolvedDevice = data.deviceName || "Mobile Device";

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

    const supportOnlyItems = rawItems.filter(
      (item) => !isFieldAgent(item.supportPersonName, item.callNotes)
    );

    // Merge recording and logged outcome within 45 minutes for the same quote or 10-digit customer phone
    const mergedCalls: typeof supportOnlyItems = [];
    const usedIds = new Set<string>();

    for (let i = 0; i < supportOnlyItems.length; i++) {
      const item = supportOnlyItems[i];
      if (usedIds.has(item.id)) continue;

      const p1 = (item.customerPhone || "").replace(/\D/g, "").slice(-10);

      const matchIndex = supportOnlyItems.findIndex((other, idx) => {
        if (idx <= i || usedIds.has(other.id)) return false;

        // Must belong to the same support person (or generic support agent fallback)
        const name1 = item.supportPersonName.toLowerCase().trim();
        const name2 = other.supportPersonName.toLowerCase().trim();
        const isSamePerson =
          name1 === name2 ||
          name1.includes(name2) ||
          name2.includes(name1) ||
          name1 === "support agent" ||
          name2 === "support agent";
        if (!isSamePerson) return false;

        const sameQuote = item.quoteId !== "N/A" && other.quoteId !== "N/A" && item.quoteId === other.quoteId;
        const p2 = (other.customerPhone || "").replace(/\D/g, "").slice(-10);
        const samePhone = p1.length === 10 && p1 === p2;
        if (!sameQuote && !samePhone) return false;

        const timeDiffMs = Math.abs(new Date(item.createdAt).getTime() - new Date(other.createdAt).getTime());
        // Merge complementary actions (RECORDING + LOGGED within 45 mins) OR identical action duplicates within 60 mins
        const isDuplicateSameAction = item.action === other.action && timeDiffMs < 60 * 60 * 1000;
        const isComplementary = item.action !== other.action && timeDiffMs < 45 * 60 * 1000;

        return isComplementary || isDuplicateSameAction;
      });

      if (matchIndex !== -1) {
        const other = supportOnlyItems[matchIndex];
        usedIds.add(other.id);

        const loggedEntry = item.action === "SUPPORT_CALL_LOGGED" ? item : other.action === "SUPPORT_CALL_LOGGED" ? other : null;
        const recordingEntry = item.action === "SUPPORT_CALL_RECORDING" ? item : other.action === "SUPPORT_CALL_RECORDING" ? other : null;

        // Choose the real callNotes (avoid generic placeholder if a real note exists)
        const isPlaceholder = (n?: string) => !n || n.includes("CashALL Caller App") || n.includes("Android Caller App");
        let resolvedNotes = "";
        if (loggedEntry && !isPlaceholder(loggedEntry.callNotes)) {
          resolvedNotes = loggedEntry.callNotes;
        } else if (recordingEntry && !isPlaceholder(recordingEntry.callNotes)) {
          resolvedNotes = recordingEntry.callNotes;
        } else {
          resolvedNotes = item.callNotes || other.callNotes || "";
        }

        let resolvedOutcome = item.callOutcome;
        if (loggedEntry?.callOutcome && loggedEntry.callOutcome !== "CALL_COMPLETED" && loggedEntry.callOutcome !== "CALL_ATTEMPTED") {
          resolvedOutcome = loggedEntry.callOutcome;
        } else if (other.callOutcome && other.callOutcome !== "CALL_COMPLETED" && other.callOutcome !== "CALL_ATTEMPTED") {
          resolvedOutcome = other.callOutcome;
        }

        // Preserve genuine support person name
        let resolvedName = item.supportPersonName;
        if (resolvedName === "Support Agent" && other.supportPersonName !== "Support Agent") {
          resolvedName = other.supportPersonName;
        }

        const combined = {
          id: (recordingEntry || item).id,
          action: item.action,
          supportPersonName: resolvedName,
          supportPersonPhone: item.supportPersonPhone !== "—" ? item.supportPersonPhone : other.supportPersonPhone,
          quoteId: (item.quoteId !== "N/A" ? item.quoteId : other.quoteId) || "N/A",
          customerName: item.customerName !== "Customer Lead" ? item.customerName : other.customerName,
          customerPhone: item.customerPhone !== "—" ? item.customerPhone : other.customerPhone,
          deviceName: item.deviceName !== "Mobile Device" ? item.deviceName : other.deviceName,
          callOutcome: resolvedOutcome,
          callNotes: resolvedNotes,
          durationSeconds: recordingEntry?.durationSeconds || item.durationSeconds || other.durationSeconds,
          durationFormatted: recordingEntry?.durationFormatted || item.durationFormatted || other.durationFormatted,
          audioUrl: recordingEntry?.audioUrl || item.audioUrl || other.audioUrl,
          hasRecording: !!(recordingEntry?.audioUrl || item.audioUrl || other.audioUrl),
          createdAtIST: item.createdAtIST || other.createdAtIST,
          callTimeIST: item.callTimeIST || other.callTimeIST,
          createdAt: new Date(item.createdAt).getTime() > new Date(other.createdAt).getTime() ? item.createdAt : other.createdAt,
        };

        mergedCalls.push(combined);
      } else {
        mergedCalls.push(item);
      }
      usedIds.add(item.id);
    }

    const responsePayload = {
      success: true,
      count: mergedCalls.length,
      calls: mergedCalls,
      recordings: mergedCalls,
      data: mergedCalls,
    };

    callsCache = { data: responsePayload, timestamp: Date.now() };

    return NextResponse.json(responsePayload, {
      headers: { "Cache-Control": "private, s-maxage=5, stale-while-revalidate=15" },
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

      callsCache = null;

      return NextResponse.json({
        success: true,
        message: "Support call recording outcome updated successfully",
        callLog: updated,
      });
    }

    // Check if an existing SUPPORT_CALL_LOGGED exists within the last 30 minutes for this quote or phone
    let existingLogged: { logItem: any; data: any } | null = null;
    try {
      const recentLoggedList = await prisma.auditLog.findMany({
        where: {
          action: "SUPPORT_CALL_LOGGED",
          createdAt: { gte: new Date(Date.now() - 30 * 60 * 1000) },
        },
        orderBy: { createdAt: "desc" },
        take: 10,
      });

      for (const logItem of recentLoggedList) {
        try {
          const d = JSON.parse(logItem.newValuesJson || "{}");
          const matchQuote = quoteId && quoteId !== "N/A" && d.quoteId === quoteId;
          const matchPhone = cleanCustomerDigits && d.customerPhone && d.customerPhone.replace(/\D/g, "").slice(-10) === cleanCustomerDigits;

          if (matchQuote || matchPhone) {
            existingLogged = { logItem, data: d };
            break;
          }
        } catch {}
      }
    } catch (e) {
      console.warn("Could not check existing logged call:", e);
    }

    if (existingLogged) {
      const updatedValues = {
        ...existingLogged.data,
        callOutcome: callOutcome || existingLogged.data.callOutcome || "CUSTOMER_INTERESTED",
        callNotes: callNotes || existingLogged.data.callNotes,
        customerName: customerName && customerName !== "Customer Lead" ? customerName : existingLogged.data.customerName,
        supportPersonName: supportPersonName || existingLogged.data.supportPersonName || "Support Agent",
        supportPersonPhone: finalAgentPhone || existingLogged.data.supportPersonPhone,
        updatedAtIST: callTimeIST,
      };

      const updated = await prisma.auditLog.update({
        where: { id: existingLogged.logItem.id },
        data: {
          newValuesJson: JSON.stringify(updatedValues),
          updatedAt: new Date(),
        },
      });

      callsCache = null;

      return NextResponse.json({
        success: true,
        message: "Support call log updated successfully",
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

    callsCache = null;

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
    callsCache = null;
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
