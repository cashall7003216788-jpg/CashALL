import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const modelId = searchParams.get("modelId");

    const variants = await db.deviceVariant.findMany({
      where: modelId ? { modelId } : undefined,
      orderBy: { basePrice: "asc" },
      include: {
        model: true,
      },
    });

    return NextResponse.json({ success: true, data: variants });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { modelId, ram, storage, basePrice, active, sortOrder } = body;

    if (!modelId || !storage || basePrice === undefined) {
      return NextResponse.json(
        { success: false, error: "modelId, storage, and basePrice are required" },
        { status: 400 }
      );
    }

    const variant = await db.deviceVariant.create({
      data: {
        modelId,
        ram: ram || null,
        storage,
        basePrice: parseFloat(basePrice),
        active: active !== undefined ? active : true,
        sortOrder: sortOrder || 0,
      },
    });

    return NextResponse.json({ success: true, data: variant }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, ram, storage, basePrice, active, sortOrder } = body;

    if (!id) {
      return NextResponse.json({ success: false, error: "Variant ID is required" }, { status: 400 });
    }

    const updated = await db.deviceVariant.update({
      where: { id },
      data: {
        ram,
        storage,
        basePrice: basePrice !== undefined ? parseFloat(basePrice) : undefined,
        active,
        sortOrder,
      },
    });

    return NextResponse.json({ success: true, data: updated });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ success: false, error: "Variant ID is required" }, { status: 400 });
    }

    await db.deviceVariant.delete({ where: { id } });

    return NextResponse.json({ success: true, message: "Storage variant deleted" });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
