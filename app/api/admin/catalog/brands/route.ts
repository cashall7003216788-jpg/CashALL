import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get("category");

    const brands = await db.brand.findMany({
      where: category ? ({ category } as any) : undefined,
      orderBy: { sortOrder: "asc" },
      include: {
        _count: {
          select: { models: true },
        },
      },
    });

    return NextResponse.json({ success: true, data: brands });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, slug, logoUrl, category, active, sortOrder } = body;

    if (!name || !slug) {
      return NextResponse.json({ success: false, error: "Name and slug are required" }, { status: 400 });
    }

    const brand = await db.brand.create({
      data: {
        name,
        slug: slug.toLowerCase().trim(),
        logoUrl: logoUrl || null,
        category: category || "MOBILE",
        active: active !== undefined ? active : true,
        sortOrder: sortOrder || 0,
      },
    });

    return NextResponse.json({ success: true, data: brand }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, name, slug, logoUrl, category, active, sortOrder } = body;

    if (!id) {
      return NextResponse.json({ success: false, error: "Brand ID is required" }, { status: 400 });
    }

    const updated = await db.brand.update({
      where: { id },
      data: {
        name,
        slug: slug ? slug.toLowerCase().trim() : undefined,
        logoUrl,
        category,
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
      return NextResponse.json({ success: false, error: "Brand ID is required" }, { status: 400 });
    }

    await db.brand.delete({ where: { id } });

    return NextResponse.json({ success: true, message: "Brand deleted successfully" });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
