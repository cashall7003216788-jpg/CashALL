import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    return NextResponse.json({
      success: true,
      agent: {
        versionCode: 3,
        versionName: "1.0.3",
        downloadUrl: "https://cashall.in/api/v1/download/agent",
        forceUpdate: false,
        title: "CashALL Agent Update Available",
        releaseNotes: "In-app customer call recording, zero phone storage buildup, strict field agent call logging.",
      },
      caller: {
        versionCode: 3,
        versionName: "1.0.3",
        downloadUrl: "https://cashall.in/api/v1/download/caller",
        forceUpdate: false,
        title: "CashALL Caller Desk Update Available",
        releaseNotes: "Company phone support desk call tagging and HD audio sync.",
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Failed to fetch app version" },
      { status: 500 }
    );
  }
}
