import { initializeApp, getApps } from "firebase-admin/app";
import { getMessaging } from "firebase-admin/messaging";
import { prisma } from "../db";
import { logger } from "../utils/logger";

const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;

if (getApps().length === 0) {
  initializeApp({
    projectId: projectId || undefined,
  });
}

const messaging = getMessaging();

export class FirebaseService {
  /**
   * Registers or updates an FCM token for a user.
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
        logger.info(`Registered new FCM token for user ${userId}`);
      } else if (!existing.active) {
        await prisma.userNotificationToken.update({
          where: { id: existing.id },
          data: { active: true },
        });
        logger.info(`Re-activated FCM token for user ${userId}`);
      }
    } catch (error) {
      logger.error(`Failed to register FCM token for user ${userId}:`, error);
    }
  }

  /**
   * Sends a push notification to all active tokens of a specific user.
   */
  static async sendPushNotification(userId: string, title: string, body: string, data: Record<string, string> = {}) {
    try {
      const activeTokens = await prisma.userNotificationToken.findMany({
        where: { userId, active: true },
      });

      if (activeTokens.length === 0) {
        logger.warn(`No active FCM tokens found for user ${userId}`);
        return;
      }

      const messages = activeTokens.map((t) => ({
        token: t.token,
        notification: { title, body },
        data,
      }));

      for (const msg of messages) {
        try {
          await messaging.send(msg);
          logger.info(`Push notification sent successfully to token: ${msg.token.substring(0, 15)}...`);
        } catch (err: any) {
          logger.error(`Failed to send push notification to token: ${msg.token.substring(0, 15)}... Error:`, err);
          if (
            err.code === "messaging/invalid-registration-token" ||
            err.code === "messaging/registration-token-not-registered"
          ) {
            await prisma.userNotificationToken.updateMany({
              where: { token: msg.token },
              data: { active: false },
            });
            logger.info(`Marked unregistered token as inactive: ${msg.token.substring(0, 15)}...`);
          }
        }
      }
    } catch (error) {
      logger.error(`Error in sendPushNotification for user ${userId}:`, error);
    }
  }
}
