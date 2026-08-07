import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const questionSetId = searchParams.get("questionSetId");

    const questions = await db.conditionQuestion.findMany({
      where: questionSetId ? { questionSetId } : undefined,
      orderBy: { sortOrder: "asc" },
      include: {
        options: {
          orderBy: { sortOrder: "asc" },
          include: {
            pricingRules: true,
          },
        },
        pricingRules: true,
      },
    });

    return NextResponse.json({ success: true, data: questions });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { questionSetId, title, subtitle, group, type, sortOrder, isRequired, active, options } = body;

    if (!title || !group) {
      return NextResponse.json({ success: false, error: "Title and group are required" }, { status: 400 });
    }

    const question = await db.conditionQuestion.create({
      data: {
        questionSetId: questionSetId || null,
        title,
        subtitle: subtitle || null,
        group,
        type: type || "SINGLE",
        sortOrder: sortOrder || 1,
        isRequired: isRequired !== undefined ? isRequired : true,
        active: active !== undefined ? active : true,
        options: options && Array.isArray(options) ? {
          create: options.map((opt: any, idx: number) => ({
            label: opt.label,
            description: opt.description || null,
            iconName: opt.iconName || null,
            sortOrder: opt.sortOrder || idx + 1,
            active: opt.active !== undefined ? opt.active : true,
          })),
        } : undefined,
      },
      include: {
        options: true,
      },
    });

    return NextResponse.json({ success: true, data: question }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, questionSetId, title, subtitle, group, type, sortOrder, isRequired, active } = body;

    if (!id) {
      return NextResponse.json({ success: false, error: "Question ID is required" }, { status: 400 });
    }

    const updated = await db.conditionQuestion.update({
      where: { id },
      data: {
        questionSetId,
        title,
        subtitle,
        group,
        type,
        sortOrder,
        isRequired,
        active,
      },
      include: {
        options: true,
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
      return NextResponse.json({ success: false, error: "Question ID is required" }, { status: 400 });
    }

    await db.conditionQuestion.delete({ where: { id } });

    return NextResponse.json({ success: true, message: "Question deleted successfully" });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
