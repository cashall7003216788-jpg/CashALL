import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const brandId = searchParams.get("brandId");
    const category = searchParams.get("category");

    const models = await db.deviceModel.findMany({
      where: {
        ...(brandId ? { brandId } : {}),
        ...(category ? { category } : {}),
      },
      orderBy: { createdAt: "desc" },
      include: {
        brand: true,
        questionSet: true,
        variants: true,
        colorVariants: true,
        images: true,
      },
    });

    return NextResponse.json({ success: true, data: models });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      brandId,
      name,
      slug,
      category,
      imageUrl,
      releaseYear,
      basePrice,
      description,
      questionSetId,
      popular,
      active,
    } = body;

    if (!brandId || !name || !slug) {
      return NextResponse.json(
        { success: false, error: "Brand ID, Name, and Slug are required" },
        { status: 400 }
      );
    }

    const model = await db.deviceModel.create({
      data: {
        brandId,
        name,
        slug: slug.toLowerCase().trim(),
        category: category || "MOBILE",
        imageUrl: imageUrl || null,
        releaseYear: releaseYear ? parseInt(releaseYear) : new Date().getFullYear(),
        basePrice: basePrice ? parseFloat(basePrice) : null,
        description: description || null,
        questionSetId: questionSetId || null,
        popular: popular !== undefined ? popular : false,
        active: active !== undefined ? active : true,
      },
      include: {
        brand: true,
        questionSet: true,
      },
    });

    return NextResponse.json({ success: true, data: model }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      id,
      brandId,
      name,
      slug,
      category,
      imageUrl,
      releaseYear,
      basePrice,
      description,
      questionSetId,
      popular,
      active,
    } = body;

    if (!id) {
      return NextResponse.json({ success: false, error: "Model ID is required" }, { status: 400 });
    }

    const updated = await db.deviceModel.update({
      where: { id },
      data: {
        brandId,
        name,
        slug: slug ? slug.toLowerCase().trim() : undefined,
        category,
        imageUrl,
        releaseYear: releaseYear ? parseInt(releaseYear) : undefined,
        basePrice: basePrice !== undefined ? parseFloat(basePrice) : undefined,
        description,
        questionSetId,
        popular,
        active,
      },
      include: {
        brand: true,
        questionSet: true,
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
      return NextResponse.json({ success: false, error: "Model ID is required" }, { status: 400 });
    }

    await db.deviceModel.delete({ where: { id } });

    return NextResponse.json({ success: true, message: "Device Model deleted successfully" });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
