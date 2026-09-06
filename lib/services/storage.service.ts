import { createClient } from "@supabase/supabase-js";
import { AppError } from "../utils/AppError";
import { logger } from "../utils/logger";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL || "https://jqysknhobtpcbyyltnfc.supabase.co";
const rawServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const effectiveKey = (rawServiceKey && !rawServiceKey.includes("mock"))
  ? rawServiceKey
  : (process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpxeXNrbmhvYnRwY2J5eWx0bmZjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODYwODU2NzMsImV4cCI6MjEwMTY2MTY3M30.7MiQZ6ARgbkT4vlBrTkSKFn1SpKvWKUbXs7OLlJkZhA");

export const supabaseAdmin = createClient(supabaseUrl, effectiveKey, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
  },
});

export class StorageService {
  private static readonly ALLOWED_MIME_TYPES = [
    "image/jpeg",
    "image/png",
    "image/webp",
    "audio/mp4",
    "audio/m4a",
    "audio/x-m4a",
    "audio/mpeg",
    "audio/mp3",
    "audio/aac",
    "audio/wav",
    "audio/3gpp",
    "audio/ogg",
    "audio/webm",
    "application/octet-stream",
  ];
  private static readonly MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB (sufficient for long calls)

  /**
   * Validates file size and type.
   */
  static validateFile(size: number, mimeType: string) {
    const cleanType = (mimeType || "audio/m4a").toLowerCase();
    const isAllowed =
      this.ALLOWED_MIME_TYPES.includes(cleanType) ||
      cleanType.startsWith("audio/") ||
      cleanType.startsWith("image/");
    if (!isAllowed) {
      throw new AppError(`Invalid file type (${mimeType}). Only images and audio files are allowed.`, 400);
    }
    if (size > this.MAX_FILE_SIZE) {
      throw new AppError("File size exceeds the maximum limit of 50MB.", 400);
    }
  }

  /**
   * Uploads file buffer to Supabase Storage bucket.
   */
  static async uploadFile(
    bucket: string,
    filePath: string,
    fileBuffer: Buffer,
    mimeType: string
  ) {
    try {
      this.validateFile(fileBuffer.length, mimeType);

      const { data, error } = await supabaseAdmin.storage
        .from(bucket)
        .upload(filePath, fileBuffer, {
          contentType: mimeType || "audio/m4a",
          upsert: true,
        });

      if (error) {
        throw new AppError(`Supabase Storage upload error: ${error.message}`, 500);
      }

      logger.info(`Uploaded file successfully: ${filePath} in bucket: ${bucket}`);
      return data.path;
    } catch (error: any) {
      logger.error("Error in uploadFile service:", error);
      if (error instanceof AppError) throw error;
      throw new AppError(`Upload failed: ${error.message}`, 500);
    }
  }

  /**
   * Generates a signed or public URL for secure asset retrieval.
   */
  static async getSignedUrl(bucket: string, filePath: string, expiresInSeconds: number = 31536000) {
    try {
      // Public bucket direct URL (permanent and instant)
      if (bucket === "support-recordings") {
        const { data } = supabaseAdmin.storage.from(bucket).getPublicUrl(filePath);
        if (data?.publicUrl) return data.publicUrl;
      }

      const { data, error } = await supabaseAdmin.storage
        .from(bucket)
        .createSignedUrl(filePath, expiresInSeconds);

      if (error) {
        const { data: pubData } = supabaseAdmin.storage.from(bucket).getPublicUrl(filePath);
        if (pubData?.publicUrl) return pubData.publicUrl;
        throw new AppError(`Failed to generate signed URL: ${error.message}`, 500);
      }

      return data.signedUrl;
    } catch (error: any) {
      logger.error("Error generating signed URL:", error);
      const { data: pubData } = supabaseAdmin.storage.from(bucket).getPublicUrl(filePath);
      if (pubData?.publicUrl) return pubData.publicUrl;
      if (error instanceof AppError) throw error;
      throw new AppError(`Signed URL generation failed: ${error.message}`, 500);
    }
  }

  /**
   * Deletes a file from Supabase Storage bucket.
   */
  static async deleteFile(bucket: string, filePath: string) {
    try {
      const { error } = await supabaseAdmin.storage.from(bucket).remove([filePath]);
      if (error) {
        throw new AppError(`Failed to delete file: ${error.message}`, 500);
      }
      logger.info(`Deleted file: ${filePath} from bucket: ${bucket}`);
    } catch (error: any) {
      logger.error("Error deleting file:", error);
      if (error instanceof AppError) throw error;
      throw new AppError(`File deletion failed: ${error.message}`, 500);
    }
  }
}
