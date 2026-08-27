import { NextRequest, NextResponse } from "next/server";
import { INITIAL_MODELS } from "@/lib/store";

export const dynamic = "force-dynamic";

export async function GET(
  req: NextRequest,
  { params }: { params: { slug: string } }
) {
  const slug = params?.slug;
  if (!slug) {
    return new NextResponse("Model slug required", { status: 400 });
  }

  const model = INITIAL_MODELS.find(
    (m) => m.slug.toLowerCase() === slug.toLowerCase()
  );

  const fallbackUrl = "https://www.cashall.in/photos/CashALL_logo.png";
  const targetUrl =
    model?.imageUrl && model.imageUrl.startsWith("http")
      ? model.imageUrl
      : fallbackUrl;

  try {
    const response = await fetch(targetUrl, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
      },
    });

    if (!response.ok) {
      return NextResponse.redirect(fallbackUrl, 307);
    }

    const contentType = response.headers.get("content-type") || "image/png";
    const buffer = await response.arrayBuffer();

    return new NextResponse(buffer, {
      status: 200,
      headers: {
        "Content-Type": contentType,
        "Cache-Control": "public, max-age=86400, s-maxage=604800, stale-while-revalidate=86400",
      },
    });
  } catch (error) {
    return NextResponse.redirect(fallbackUrl, 307);
  }
}
