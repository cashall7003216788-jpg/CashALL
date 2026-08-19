import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const body = await req.json();

    // Construct the exact 8 fields in exact sequence required
    const payload = {
      date: body.date || new Date().toISOString().split("T")[0],
      urn: body.urn || "N/A",
      amountPaid: body.amountPaid ?? body.amount ?? 0,
      agentName: body.agentName || "CashALL Agent",
      orderId: body.orderId || body.orderNumber || "N/A",
      customerAddress: body.customerAddress || body.address || "N/A",
      pincode: body.pincode || "N/A",
      customerPhone: body.customerPhone || body.phone || "N/A",
    };

    const webhookUrl = process.env.GOOGLE_SHEETS_WEBHOOK_URL;

    // Gracefully handle missing or placeholder webhook URL without failing payment upload
    if (
      !webhookUrl ||
      webhookUrl.includes("your_make_or_google_script_webhook_url") ||
      webhookUrl.includes("placeholder")
    ) {
      console.warn(
        "⚠️ [GOOGLE SHEETS SYNC SKIPPED] GOOGLE_SHEETS_WEBHOOK_URL is missing or set to a placeholder in .env.local. Payload would have been:",
        payload
      );
      return NextResponse.json({
        success: true,
        skipped: true,
        message: "Google Sheets sync skipped (webhook URL missing or placeholder)",
        payload,
      });
    }

    // Trigger webhook POST request
    const response = await fetch(webhookUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      console.error(
        `Google Sheets webhook returned status ${response.status}: ${await response.text()}`
      );
    } else {
      console.log("✅ Google Sheets synced successfully:", payload);
    }

    return NextResponse.json({
      success: true,
      message: "Google Sheets sync initiated",
      payload,
    });
  } catch (error: any) {
    console.error("Error in sync-sheets route:", error);
    // Never fail with 500 so payment upload succeeds gracefully
    return NextResponse.json(
      {
        success: false,
        warning: error.message || "Failed to push to Google Sheets webhook",
      },
      { status: 200 }
    );
  }
}
