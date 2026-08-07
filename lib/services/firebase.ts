import { initializeApp, getApps, getApp } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";

const app = getApps().length > 0
  ? getApp()
  : initializeApp({
      projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    });

export const auth = getAuth(app);
export const firebaseAdmin = {
  auth: () => getAuth(app),
  apps: getApps(),
};

