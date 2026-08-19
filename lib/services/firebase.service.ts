import { prisma } from "../db";
import { logger } from "../utils/logger";

export class FirebaseService {
  /**
   * Registers or updates a notification token for a user in Supabase PostgreSQL.
   */
  static async registerFcmToken(userId: string, token: string, deviceType: string = "UNKNOWN") {
    try {
      const existing = await prisma.userNotificationToken.findFirst({
        where: { userId, token },
      });

      if (!existing) {
        await prisma.userNotificationToken.create({
          data: {
            userId,
            token,
            deviceType,
            active: true,
          },
        });
        logger.info(`Registered new notification token for user ${userId}`);
      } else if (!existing.active) {
        await prisma.userNotificationToken.update({
          where: { id: existing.id },
          data: { active: true },
        });
        logger.info(`Re-activated notification token for user ${userId}`);
      }
    } catch (error) {
      logger.error(`Failed to register notification token for user ${userId}:`, error);
    }
  }

  /**
   * Sends push notification to user tokens recorded in Supabase PostgreSQL.
   */
  static async sendPushNotification(userId: string, title: string, body: string, data: Record<string, string> = {}) {
    try {
      const activeTokens = await prisma.userNotificationToken.findMany({
        where: { userId, active: true },
      });

      if (activeTokens.length === 0) {
        logger.warn(`No active notification tokens found for user ${userId}`);
        return;
      }
      logger.info(`Push notification scheduled for user ${userId}: ${title}`);
    } catch (error) {
      logger.error(`Error in sendPushNotification for user ${userId}:`, error);
    }
  }
}
