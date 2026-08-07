import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET() {
  try {
    const sets = await db.questionSet.findMany({
      orderBy: { sortOrder: "asc" },
      include: {
        questions: {
          orderBy: { sortOrder: "asc" },
          include: {
            options: {
              orderBy: { sortOrder: "asc" },
            },
          },
        },
        _count: {
          select: { models: true },
        },
      },
    });

    return NextResponse.json({ success: true, data: sets });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, description, deviceCategory, active, sortOrder } = body;

    if (!name) {
      return NextResponse.json({ success: false, error: "Question Set Name is required" }, { status: 400 });
    }

    const set = await db.questionSet.create({
      data: {
        name,
        description: description || null,
        deviceCategory: deviceCategory || "MOBILE",
        active: active !== undefined ? active : true,
        sortOrder: sortOrder || 0,
      },
    });

    return NextResponse.json({ success: true, data: set }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, name, description, deviceCategory, active, sortOrder } = body;

    if (!id) {
      return NextResponse.json({ success: false, error: "Question Set ID is required" }, { status: 400 });
    }

    const updated = await db.questionSet.update({
      where: { id },
      data: {
        name,
        description,
        deviceCategory,
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
      return NextResponse.json({ success: false, error: "Question Set ID is required" }, { status: 400 });
    }

    await db.questionSet.delete({ where: { id } });

    return NextResponse.json({ success: true, message: "Question Set deleted" });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
