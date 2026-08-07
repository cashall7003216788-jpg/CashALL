import { NextRequest, NextResponse } from "next/server";
import { apiWrapper } from "@/lib/utils/api-wrapper";
import { verifyAuthToken } from "@/lib/middlewares/auth";
import { StorageService } from "@/lib/services/storage.service";
import { AppError } from "@/lib/utils/AppError";
import { prisma } from "@/lib/db";
import { v4 as uuidv4 } from "uuid";

export const POST = apiWrapper(async (req: NextRequest) => {
  // Validate authorization
  const decodedUser = await verifyAuthToken(req);

  const formData = await req.formData();
  const file = formData.get("file") as File | null;
  const bucket = formData.get("bucket") as string | null; // e.g. "customer-devices", "qc-reports"
  const orderId = formData.get("orderId") as string | null;

  if (!file) {
    throw new AppError("No file uploaded.", 400);
  }
  if (!bucket) {
    throw new AppError("Storage bucket name is required.", 400);
  }

  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);
  const mimeType = file.type;

  const fileExt = file.name.split(".").pop();
  const uniqueId = uuidv4();
  const fileName = `${uniqueId}.${fileExt}`;
  const filePath = `${decodedUser.uid}/${fileName}`;

  // Upload file buffer
  const path = await StorageService.uploadFile(bucket, filePath, buffer, mimeType);

  // Generate signed URL (expires in 1 year)
  const signedUrl = await StorageService.getSignedUrl(bucket, path, 31536000);

  // If orderId is provided, save image reference in database
  if (orderId) {
    const order = await prisma.order.findUnique({
      where: { id: orderId },
    });

    if (order && (order.userId === decodedUser.uid || decodedUser.role === "ADMIN" || decodedUser.role === "SUPER_ADMIN")) {
      await prisma.imageReference.create({
        data: {
          url: signedUrl,
          bucket,
          key: path,
          entityType: bucket === "qc-reports" ? "QC_REPORT" : "ORDER",
          entityId: orderId,
        },
      });
    }
  }

  return NextResponse.json({
    success: true,
    data: {
      path,
      url: signedUrl,
    },
  });
});
