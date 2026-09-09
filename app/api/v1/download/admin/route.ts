import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const publicApkPath = path.join(process.cwd(), "public", "CashALL-Admin.apk");
    const rootApkPath = path.join(process.cwd(), "CashALL-Admin.apk");
    const apkPath = fs.existsSync(publicApkPath) ? publicApkPath : rootApkPath;

    if (!fs.existsSync(apkPath)) {
      return NextResponse.json(
        { success: false, error: "Admin APK build not found. Please compile the app first." },
        { status: 404 }
      );
    }

    const fileBuffer = fs.readFileSync(apkPath);
    const stat = fs.statSync(apkPath);

    return new NextResponse(fileBuffer, {
      status: 200,
      headers: {
        "Content-Type": "application/vnd.android.package-archive",
        "Content-Disposition": 'attachment; filename="CashALL-Admin.apk"',
        "Content-Length": stat.size.toString(),
        "Cache-Control": "no-cache, no-store, must-revalidate",
      },
    });
  } catch (error: any) {
    console.error("Error serving Admin APK:", error);
    return NextResponse.json(
      { success: false, error: "Failed to download Admin APK" },
      { status: 500 }
    );
  }
}
