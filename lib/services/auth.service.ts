import { prisma } from "../db";
import { logger } from "../utils/logger";
import { AppError } from "../utils/AppError";
import { EmailService } from "./email.service";

export class AuthService {
  /**
   * Syncs a Firebase authenticated user with the database.
   */
  static async syncUser(firebaseUid: string, phone: string, email?: string, name?: string) {
    try {
      const cleanPhone = phone.trim();

      // 1. Try to find user by firebaseUid
      let user = await prisma.user.findFirst({
        where: {
          firebaseUid,
          deletedAt: null,
        },
      });

      if (!user) {
        // 2. Try to find by phone
        user = await prisma.user.findFirst({
          where: {
            phone: cleanPhone,
            deletedAt: null,
          },
        });

        if (user) {
          // Update existing user with Firebase UID
          user = await prisma.user.update({
            where: { id: user.id },
            data: {
              firebaseUid,
              lastLogin: new Date(),
            },
          });
          logger.auth(cleanPhone, "SYNC_EXISTING_USER_BY_PHONE", true, { userId: user.id });
        } else {
          // 3. Create brand new user
          user = await prisma.user.create({
            data: {
              firebaseUid,
              phone: cleanPhone,
              email: email || null,
              name: name || "Phone Seller",
              role: "CUSTOMER",
              status: "ACTIVE",
              lastLogin: new Date(),
            },
          });
          logger.auth(cleanPhone, "CREATE_NEW_USER", true, { userId: user.id });

          if (user.email) {
            EmailService.sendEmail(
              user.email,
              "Welcome to CashALL! 👋",
              EmailService.compileWelcomeTemplate(user.name)
            ).catch((err) => logger.error("Failed to send welcome email:", err));
          }
        }
      } else {
        // Update last login
        user = await prisma.user.update({
          where: { id: user.id },
          data: {
            lastLogin: new Date(),
          },
        });
        logger.auth(cleanPhone, "LOGIN_SUCCESS", true, { userId: user.id });
      }

      return user;
    } catch (error: any) {
      logger.error("Error in syncUser service:", error);
      throw new AppError(`Sync user failed: ${error.message}`, 500);
    }
  }

  /**
   * Performs verify/sync logic for admin email users.
   */
  static async verifyAdmin(email: string) {
    try {
      const user = await prisma.user.findFirst({
        where: {
          email: email.trim(),
          deletedAt: null,
        },
      });

      if (!user) {
        throw new AppError("No admin account found with this email.", 404);
      }

      if (user.role !== "ADMIN" && user.role !== "SUPER_ADMIN") {
        throw new AppError("Access denied. Not an admin account.", 403);
      }

      // Update last login
      await prisma.user.update({
        where: { id: user.id },
        data: { lastLogin: new Date() },
      });

      logger.adminAction(user.id, "ADMIN_LOGIN_VERIFIED", { email });
      return user;
    } catch (error: any) {
      if (error instanceof AppError) throw error;
      throw new AppError(`Admin verification failed: ${error.message}`, 500);
    }
  }
}
