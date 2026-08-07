import { createClient } from "@supabase/supabase-js";
import { AppError } from "../utils/AppError";
import { logger } from "../utils/logger";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  throw new Error("Missing Supabase configuration environment variables.");
}

export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
  },
});

export class StorageService {
  private static readonly ALLOWED_MIME_TYPES = ["image/jpeg", "image/png", "image/webp"];
  private static readonly MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

  /**
   * Validates file size and type.
   */
  static validateFile(size: number, mimeType: string) {
    if (!this.ALLOWED_MIME_TYPES.includes(mimeType)) {
      throw new AppError("Invalid file type. Only JPEG, PNG, and WebP are allowed.", 400);
    }
    if (size > this.MAX_FILE_SIZE) {
      throw new AppError("File size exceeds the maximum limit of 5MB.", 400);
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
          contentType: mimeType,
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
   * Generates a signed URL for secure asset retrieval.
   */
  static async getSignedUrl(bucket: string, filePath: string, expiresInSeconds: number = 3600) {
    try {
      const { data, error } = await supabaseAdmin.storage
        .from(bucket)
        .createSignedUrl(filePath, expiresInSeconds);

      if (error) {
        throw new AppError(`Failed to generate signed URL: ${error.message}`, 500);
      }

      return data.signedUrl;
    } catch (error: any) {
      logger.error("Error generating signed URL:", error);
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
