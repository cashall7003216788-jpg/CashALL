import * as admin from "firebase-admin";

const adminAny = admin as any;

if (!adminAny.apps || !adminAny.apps.length) {
  try {
    adminAny.initializeApp({
      projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    });
  } catch (error: any) {
    console.error("Firebase Admin initialization error:", error);
  }
}

export const firebaseAdmin = admin;
