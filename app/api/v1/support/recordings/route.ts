import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { StorageService } from "@/lib/services/storage.service";
import fs from "fs";
import path from "path";
import { v4 as uuidv4 } from "uuid";

export const dynamic = "force-dynamic";

function formatDuration(seconds: number): string {
  if (seconds < 0 || isNaN(seconds)) return "0s";
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  if (mins === 0) return `${secs}s`;
  return `${mins}m ${secs.toString().padStart(2, "0")}s`;
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const phone = searchParams.get("phone");

    const logs = await prisma.auditLog.findMany({
      where: {
        action: { in: ["SUPPORT_CALL_RECORDING", "SUPPORT_CALL_LOGGED"] },
      },
      orderBy: { createdAt: "desc" },
      take: 250,
    });

    const recordings = logs.map((log) => {
      let data: any = {};
      if (log.newValuesJson) {
        try {
          data = JSON.parse(log.newValuesJson);
        } catch {}
      }

      let agentPhone = data.supportPersonPhone || "—";
      const agentName = data.supportPersonName || "Support Agent";
      if ((agentPhone === "—" || !agentPhone) && agentName.toLowerCase().includes("harshita")) {
        agentPhone = "8981191734";
      }

      return {
        id: log.id,
        action: log.action,
        supportPersonName: agentName,
        supportPersonPhone: agentPhone,
        customerName: data.customerName || "Customer Lead",
        customerPhone: data.customerPhone || "—",
        deviceName: data.deviceName || "Mobile Device",
        quoteId: data.quoteId || "N/A",
        durationSeconds: Number(data.durationSeconds) || 0,
        durationFormatted: data.durationFormatted || formatDuration(Number(data.durationSeconds) || 0),
        audioUrl: data.audioUrl || "",
        callOutcome: data.callOutcome || (log.action === "SUPPORT_CALL_RECORDING" ? "CALL_COMPLETED" : "CALL_ATTEMPTED"),
        callNotes: data.callNotes || (log.action === "SUPPORT_CALL_RECORDING" ? "Recorded via CashALL Android Caller App." : ""),
        callStartTime: data.callStartTime || log.createdAt.toISOString(),
        callEndTime: data.callEndTime || log.createdAt.toISOString(),
        createdAtIST: data.callTimeIST || new Date(log.createdAt).toLocaleString("en-IN", { timeZone: "Asia/Kolkata" }),
        createdAt: log.createdAt.toISOString(),
      };
    });

    const filtered = phone
      ? recordings.filter((r) => r.supportPersonPhone === phone || r.customerPhone === phone)
      : recordings;

    // Filter out duplicate 0s logs if a valid call log exists for the same quote/phone within 60s
    const deduplicatedRecordings: any[] = [];
    for (const rec of filtered) {
      if (rec.durationSeconds === 0) {
        const hasBetterEntry = filtered.some(
          (other) =>
            other.id !== rec.id &&
            ((rec.quoteId !== "N/A" && other.quoteId === rec.quoteId) ||
              (rec.customerPhone !== "—" && other.customerPhone === rec.customerPhone)) &&
            other.durationSeconds > 0 &&
            Math.abs(new Date(other.createdAt).getTime() - new Date(rec.createdAt).getTime()) < 60000
        );
        if (hasBetterEntry) {
          continue; // Skip 0s duplicate
        }
      }
      deduplicatedRecordings.push(rec);
    }

    return NextResponse.json({
      success: true,
      count: deduplicatedRecordings.length,
      recordings: deduplicatedRecordings,
      data: deduplicatedRecordings,
      calls: deduplicatedRecordings,
    });
  } catch (error: any) {
    console.error("Error fetching call recordings:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to fetch call recordings" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const audioFile = formData.get("audio") as File | null;
    const supportPersonName = (formData.get("supportPersonName") as string) || "Support Staff";
    const supportPersonPhone = (formData.get("supportPersonPhone") as string) || "";
    const rawCustomerPhone = (formData.get("customerPhone") as string) || "";
    let customerPhone = rawCustomerPhone.trim();
    if (customerPhone.startsWith("+91")) customerPhone = customerPhone.replace("+91", "").trim();

    let customerName = (formData.get("customerName") as string) || "";
    let deviceName = (formData.get("deviceName") as string) || "";
    let quoteId = (formData.get("quoteId") as string) || "";
    const durationSeconds = Number(formData.get("durationSeconds")) || 0;
    const callOutcome = (formData.get("callOutcome") as string) || "CALL_COMPLETED";
    const callNotes = (formData.get("callNotes") as string) || "Recorded via CashALL Android Caller App.";
    const callStartTime = (formData.get("callStartTime") as string) || new Date().toISOString();
    const callEndTime = (formData.get("callEndTime") as string) || new Date().toISOString();

    // Automatic Quote & Customer Enrichment if not already provided
    const cleanDigits = customerPhone.replace(/\D/g, "").slice(-10);
    try {
      let matchedQuote: any = null;
      if (quoteId && quoteId !== "N/A") {
        matchedQuote = await prisma.quote.findFirst({
          where: { OR: [{ quoteNumber: quoteId }, { id: quoteId }] },
          include: {
            orders: { include: { user: true, address: true } },
            variant: { include: { model: { include: { brand: true } } } },
          },
        });
      }

      if (!matchedQuote && cleanDigits) {
        // Search quotes with this customer phone
        const recentQuotes = await prisma.quote.findMany({
          where: {
            deletedAt: null,
            OR: [
              { breakdownJson: { contains: cleanDigits } },
              { selectedAnswersJson: { contains: cleanDigits } },
            ],
          },
          include: {
            orders: { include: { user: true, address: true } },
            variant: { include: { model: { include: { brand: true } } } },
          },
          orderBy: { createdAt: "desc" },
          take: 1,
        });

        if (recentQuotes.length > 0) {
          matchedQuote = recentQuotes[0];
        }
      }

      if (matchedQuote) {
        if (!quoteId || quoteId === "N/A") quoteId = matchedQuote.quoteNumber;
        
        if (!deviceName || deviceName === "Mobile Device") {
          if (matchedQuote.variant) {
            deviceName = `${matchedQuote.variant.model.brand.name} ${matchedQuote.variant.model.name} (${matchedQuote.variant.storage})`;
          }
          if (matchedQuote.breakdownJson) {
            try {
              const bd = JSON.parse(matchedQuote.breakdownJson);
              if (bd.deviceName) deviceName = bd.deviceName;
              if (!customerName && bd.customerName) customerName = bd.customerName;
            } catch {}
          }
        }

        if (!customerName) {
          if (matchedQuote.selectedAnswersJson) {
            try {
              const sa = JSON.parse(matchedQuote.selectedAnswersJson);
              if (sa.customerName) customerName = sa.customerName;
            } catch {}
          }
          if (!customerName && matchedQuote.orders?.[0]?.user?.name) {
            customerName = matchedQuote.orders[0].user.name;
          }
        }
      }
    } catch (e: any) {
      console.warn("Could not enrich quote metadata:", e.message);
    }

    if (!customerName) customerName = "Customer Lead";
    if (!deviceName) deviceName = "Mobile Device";
    if (!quoteId) quoteId = "N/A";

    let audioUrl = "";
    let storageType = "none";

    if (audioFile && typeof audioFile.arrayBuffer === "function") {
      try {
        const arrayBuffer = await audioFile.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);
        const ext = audioFile.name?.split(".").pop() || "m4a";
        const fileName = `rec_${Date.now()}_${uuidv4().slice(0, 8)}.${ext}`;
        const mimeType = audioFile.type || "audio/m4a";

        if (buffer.length > 0) {
          // 1. Upload to Supabase Storage bucket 'support-recordings'
          try {
            const bucket = "support-recordings";
            const storagePath = `${fileName}`;
            await StorageService.uploadFile(bucket, storagePath, buffer, mimeType);
            audioUrl = await StorageService.getSignedUrl(bucket, storagePath, 31536000);
            storageType = "supabase";
          } catch (storageErr: any) {
            console.warn("Supabase upload failed, trying local fallback:", storageErr?.message);
            // 2. Fallback to local disk (for local dev)
            try {
              const publicUploadsDir = path.join(process.cwd(), "public", "uploads", "recordings");
              if (!fs.existsSync(publicUploadsDir)) {
                fs.mkdirSync(publicUploadsDir, { recursive: true });
              }
              const localFilePath = path.join(publicUploadsDir, fileName);
              fs.writeFileSync(localFilePath, buffer);
              audioUrl = `/uploads/recordings/${fileName}`;
              storageType = "local";
            } catch (localErr: any) {
              console.error("Local storage error:", localErr);
            }
          }
        }
      } catch (audioReadErr: any) {
        console.error("Error reading audio stream:", audioReadErr);
      }
    }

    const durationFormatted = formatDuration(durationSeconds);
    const callTimeIST = new Date().toLocaleString("en-IN", { timeZone: "Asia/Kolkata" });

    // Deduplication check within last 45 seconds
    const fortyFiveSecondsAgo = new Date(Date.now() - 45000);
    const recentLogs = await prisma.auditLog.findMany({
      where: {
        action: "SUPPORT_CALL_RECORDING",
        createdAt: { gte: fortyFiveSecondsAgo },
      },
      orderBy: { createdAt: "desc" },
      take: 5,
    });

    for (const recent of recentLogs) {
      let recentData: any = {};
      try {
        recentData = JSON.parse(recent.newValuesJson || "{}");
      } catch {}

      const isSameQuote = quoteId && quoteId !== "N/A" && recentData.quoteId === quoteId;
      const isSamePhone = cleanDigits && recentData.customerPhone && recentData.customerPhone.includes(cleanDigits);

      if (isSameQuote || isSamePhone) {
        const prevDuration = Number(recentData.durationSeconds) || 0;

        // If incoming is 0s and existing record already exists, discard 0s duplicate
        if (durationSeconds === 0) {
          console.log(`[Deduplication] Discarding duplicate 0s call event for ${customerPhone}`);
          return NextResponse.json({
            success: true,
            message: "Duplicate 0s call event discarded",
            recordingId: recent.id,
            durationFormatted: recentData.durationFormatted,
          });
        }

        // If incoming has valid duration and existing was 0s, update existing record with true duration
        if (durationSeconds > 0 && prevDuration === 0) {
          console.log(`[Deduplication] Updating existing 0s call event with true duration ${durationSeconds}s`);
          recentData.durationSeconds = durationSeconds;
          recentData.durationFormatted = durationFormatted;
          if (supportPersonName && supportPersonName !== "Support Staff" && supportPersonName !== "Support Agent") {
            recentData.supportPersonName = supportPersonName;
          }
          if (audioUrl) {
            recentData.audioUrl = audioUrl;
            recentData.storageType = storageType;
          }
          await prisma.auditLog.update({
            where: { id: recent.id },
            data: { newValuesJson: JSON.stringify(recentData) },
          });
          return NextResponse.json({
            success: true,
            message: "Existing call event updated with accurate duration",
            recordingId: recent.id,
            durationFormatted,
          });
        }
      }
    }

    // Save into database
    const record = await prisma.auditLog.create({
      data: {
        actorId: "00000000-0000-0000-0000-000000000000",
        actorRole: "SUPPORT",
        action: "SUPPORT_CALL_RECORDING",
        tableName: "SupportCallRecord",
        recordId: "00000000-0000-0000-0000-000000000000",
        newValuesJson: JSON.stringify({
          supportPersonName,
          supportPersonPhone,
          customerName,
          customerPhone: customerPhone || "—",
          deviceName,
          quoteId,
          durationSeconds,
          durationFormatted,
          audioUrl,
          storageType,
          callOutcome,
          callNotes,
          callStartTime,
          callEndTime,
          callTimeIST,
        }),
      },
    });

    return NextResponse.json({
      success: true,
      message: "Call recording & duration logged successfully",
      recordingId: record.id,
      audioUrl,
      durationFormatted,
      customerName,
      deviceName,
      quoteId,
    });
  } catch (error: any) {
    console.error("Error saving call recording:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to save call recording" },
      { status: 500 }
    );
  }
}
