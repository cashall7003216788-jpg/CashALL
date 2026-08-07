import { NextRequest, NextResponse } from "next/server";
import { duplicateDeviceModel } from "@/lib/services/catalog.service";

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    const { newName, newSlug } = body;

    if (!newName || !newSlug) {
      return NextResponse.json(
        { success: false, error: "newName and newSlug are required" },
        { status: 400 }
      );
    }

    const duplicated = await duplicateDeviceModel(params.id, newName, newSlug.toLowerCase().trim());

    return NextResponse.json({ success: true, data: duplicated }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
