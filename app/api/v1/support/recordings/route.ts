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
        action: "SUPPORT_CALL_RECORDING",
      },
      orderBy: { createdAt: "desc" },
      take: 150,
    });

    const recordings = logs.map((log) => {
      let data: any = {};
      if (log.newValuesJson) {
        try {
          data = JSON.parse(log.newValuesJson);
        } catch {}
      }

      return {
        id: log.id,
        supportPersonName: data.supportPersonName || "Support Agent",
        supportPersonPhone: data.supportPersonPhone || "—",
        customerPhone: data.customerPhone || "—",
        quoteId: data.quoteId || "N/A",
        durationSeconds: Number(data.durationSeconds) || 0,
        durationFormatted: data.durationFormatted || formatDuration(Number(data.durationSeconds) || 0),
        audioUrl: data.audioUrl || "",
        callOutcome: data.callOutcome || "CALL_COMPLETED",
        callNotes: data.callNotes || "Recorded via CashALL Android Caller App.",
        callStartTime: data.callStartTime || log.createdAt.toISOString(),
        callEndTime: data.callEndTime || log.createdAt.toISOString(),
        createdAtIST: new Date(log.createdAt).toLocaleString("en-IN", { timeZone: "Asia/Kolkata" }),
        createdAt: log.createdAt.toISOString(),
      };
    });

    const filtered = phone
      ? recordings.filter((r) => r.supportPersonPhone === phone || r.customerPhone === phone)
      : recordings;

    return NextResponse.json({
      success: true,
      count: filtered.length,
      recordings: filtered,
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
    const customerPhone = (formData.get("customerPhone") as string) || "Unknown Customer";
    const durationSeconds = Number(formData.get("durationSeconds")) || 0;
    const callOutcome = (formData.get("callOutcome") as string) || "CALL_COMPLETED";
    const callNotes = (formData.get("callNotes") as string) || "Recorded via CashALL Android Caller App.";
    const callStartTime = (formData.get("callStartTime") as string) || new Date().toISOString();
    const callEndTime = (formData.get("callEndTime") as string) || new Date().toISOString();
    const quoteId = (formData.get("quoteId") as string) || "";

    let audioUrl = "";
    let storageType = "none";

    if (audioFile) {
      const arrayBuffer = await audioFile.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);
      const ext = audioFile.name?.split(".").pop() || "m4a";
      const fileName = `rec_${Date.now()}_${uuidv4().slice(0, 8)}.${ext}`;
      const mimeType = audioFile.type || "audio/m4a";

      // 1. Try Supabase Storage first
      try {
        const bucket = "support-recordings";
        const storagePath = `recordings/${fileName}`;
        await StorageService.uploadFile(bucket, storagePath, buffer, mimeType);
        audioUrl = await StorageService.getSignedUrl(bucket, storagePath, 60 * 60 * 24 * 365); // 1 year signed URL
        storageType = "supabase";
      } catch (storageErr: any) {
        console.warn("Supabase bucket upload fallback to local disk storage:", storageErr?.message);
        // 2. Fallback to local disk (public/uploads/recordings)
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
          console.error("Local disk storage error:", localErr);
        }
      }
    }

    const durationFormatted = formatDuration(durationSeconds);
    const callTimeIST = new Date().toLocaleString("en-IN", { timeZone: "Asia/Kolkata" });

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
          customerPhone,
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
    });
  } catch (error: any) {
    console.error("Error saving call recording:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to save call recording" },
      { status: 500 }
    );
  }
}
