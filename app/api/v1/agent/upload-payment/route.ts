import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { StorageService } from "@/lib/services/storage.service";

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const orderId = formData.get("orderId") as string;
    const urn = formData.get("urn") as string;
    const file = formData.get("file") as File | null;
    const agentId = formData.get("agentId") as string | null;

    if (!orderId) {
      return NextResponse.json(
        { success: false, error: "Order ID is required" },
        { status: 400 }
      );
    }

    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(orderId);
    const cleanOrderNum = orderId.replace(/^#/, "");

    // Find target order safely without Prisma UUID cast error
    const order = await prisma.order.findFirst({
      where: {
        OR: isUuid
          ? [{ id: orderId }, { orderNumber: cleanOrderNum }]
          : [{ orderNumber: cleanOrderNum }, { orderNumber: `#${cleanOrderNum}` }],
        deletedAt: null,
      },
      include: {
        user: true,
        agent: true,
      },
    });

    if (!order) {
      return NextResponse.json(
        { success: false, error: "Order not found" },
        { status: 404 }
      );
    }

    // 1. Upload payment screenshot to Supabase Storage bucket payment-screenshots
    let paymentScreenshotUrl: string | null = null;
    if (file) {
      try {
        const buffer = Buffer.from(await file.arrayBuffer());
        const ext = file.name.substring(file.name.lastIndexOf(".")) || ".png";
        const filePath = `urn_${order.orderNumber}_${Date.now()}${ext}`;

        const bucket = "payment-screenshots";
        try {
          const path = await StorageService.uploadFile(
            bucket,
            filePath,
            buffer,
            file.type || "image/png"
          );
          const signedUrl = await StorageService.getSignedUrl(bucket, path, 604800); // 7 days
          paymentScreenshotUrl = signedUrl;
        } catch (storageErr) {
          console.warn(
            "Supabase Storage bucket upload warning (using fallback data URL):",
            storageErr
          );
          const base64 = buffer.toString("base64");
          paymentScreenshotUrl = `data:${file.type || "image/png"};base64,${base64}`;
        }
      } catch (err: any) {
        console.error("Error processing file upload:", err);
      }
    }

    const cleanUrn = urn ? urn.trim() : null;

    // 2. Save URN & screenshot URL to Order in Prisma WITHOUT updating status to COMPLETED
    const updatedOrder = await prisma.order.update({
      where: { id: order.id },
      data: {
        urn: cleanUrn || order.urn,
        paymentScreenshotUrl: paymentScreenshotUrl || order.paymentScreenshotUrl,
        ...(agentId ? { agentId } : {}),
      },
      include: {
        user: true,
        agent: true,
      },
    });

    // Update payment record transaction reference if present
    if (cleanUrn) {
      try {
        const existingPayment = await prisma.payment.findFirst({
          where: { orderId: order.id },
        });
        if (existingPayment) {
          await prisma.payment.update({
            where: { id: existingPayment.id },
            data: {
              transactionRef: cleanUrn,
            },
          });
        }
      } catch (payErr) {
        console.warn("Payment transactionRef update notice:", payErr);
      }
    }

    return NextResponse.json({
      success: true,
      message: "Payment screenshot & 12-digit URN uploaded and saved. Awaiting manual Admin approval.",
      order: updatedOrder,
      urn: cleanUrn,
      paymentScreenshotUrl,
    });
  } catch (error: any) {
    console.error("Error in upload-payment route:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to upload payment" },
      { status: 500 }
    );
  }
}
