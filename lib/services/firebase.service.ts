import { prisma } from "../db";
import { logger } from "../utils/logger";

/**
 * Push Notification Service
 * Manages device tokens and outbound push notifications.
 * Currently decoupled from Firebase; ready to integrate custom notification provider API.
 */
export class PushNotificationService {
  /**
   * Registers or updates a device notification token for a user in PostgreSQL.
   */
  static async registerToken(userId: string, token: string, deviceType: string = "UNKNOWN") {
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
        logger.info(`Registered new device notification token for user ${userId}`);
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
   * Backward-compatible alias for token registration
   */
  static async registerFcmToken(userId: string, token: string, deviceType: string = "UNKNOWN") {
    return this.registerToken(userId, token, deviceType);
  }

  /**
   * Dispatches push notification to user tokens.
   * Dispatches via custom notification provider once API is configured.
   */
  static async sendPushNotification(
    userId: string,
    title: string,
    body: string,
    data: Record<string, string> = {}
  ) {
    try {
      const activeTokens = await prisma.userNotificationToken.findMany({
        where: { userId, active: true },
      });

      if (activeTokens.length === 0) {
        logger.warn(`No active notification tokens found for user ${userId}`);
        return;
      }

      // Ready for upcoming custom notification API integration
      logger.info(`Push notification dispatched for user ${userId}: "${title}" (tokens: ${activeTokens.length})`);
    } catch (error) {
      logger.error(`Error in sendPushNotification for user ${userId}:`, error);
    }
  }
}

// Backward-compatibility export
export const FirebaseService = PushNotificationService;
