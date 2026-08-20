import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const logs = await prisma.auditLog.findMany({
      where: {
        action: "SUPPORT_CALL_LOGGED",
      },
      orderBy: { createdAt: "desc" },
    });

    const calls = logs.map((log) => {
      let data: any = {};
      if (log.newValuesJson) {
        try {
          data = JSON.parse(log.newValuesJson);
        } catch {}
      }

      return {
        id: log.id,
        supportPersonName: data.supportPersonName || "Support Agent",
        quoteId: data.quoteId || "N/A",
        customerName: data.customerName || "Customer",
        customerPhone: data.customerPhone || "—",
        callOutcome: data.callOutcome || "CALL_ATTEMPTED",
        callNotes: data.callNotes || "Followed up with customer regarding valuation quote.",
        callTimeIST: data.callTimeIST || new Date(log.createdAt).toLocaleString("en-IN", { timeZone: "Asia/Kolkata" }),
        createdAt: log.createdAt.toISOString(),
      };
    });

    return NextResponse.json({
      success: true,
      calls,
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
    const { supportPersonName, quoteId, customerName, customerPhone, callOutcome, callNotes } = body;

    if (!customerPhone && !quoteId) {
      return NextResponse.json(
        { success: false, error: "Quote ID and Customer Phone are required to log a call" },
        { status: 400 }
      );
    }

    const callTimeIST = new Date().toLocaleString("en-IN", { timeZone: "Asia/Kolkata" });

    const callLog = await prisma.auditLog.create({
      data: {
        actorId: "00000000-0000-0000-0000-000000000000",
        actorRole: "SUPPORT",
        action: "SUPPORT_CALL_LOGGED",
        tableName: "SupportCallRecord",
        recordId: "00000000-0000-0000-0000-000000000000",
        newValuesJson: JSON.stringify({
          supportPersonName: supportPersonName || "Support Agent",
          quoteId: quoteId || "CAQ-LEAD",
          customerName: customerName || "Customer Lead",
          customerPhone: customerPhone || "—",
          callOutcome: callOutcome || "CUSTOMER_INTERESTED",
          callNotes: callNotes || "Followed up with customer regarding pending valuation.",
          callTimeIST,
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
