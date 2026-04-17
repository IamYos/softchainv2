import { getApps, initializeApp, cert, App } from "firebase-admin/app";
import { getFirestore, Firestore } from "firebase-admin/firestore";
import { getAuth, Auth } from "firebase-admin/auth";

let cachedApp: App | null = null;

function getApp(): App {
  if (cachedApp) return cachedApp;
  const existing = getApps();
  if (existing.length) {
    cachedApp = existing[0];
    return cachedApp;
  }
  const projectId = process.env.FIREBASE_ADMIN_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_ADMIN_CLIENT_EMAIL;
  const privateKey = process.env.FIREBASE_ADMIN_PRIVATE_KEY?.replace(/\\n/g, "\n");

  if (!projectId || !clientEmail || !privateKey) {
    throw new Error("Missing FIREBASE_ADMIN_* env vars");
  }

  cachedApp = initializeApp({
    credential: cert({ projectId, clientEmail, privateKey }),
  });
  return cachedApp;
}

export function firestoreAdmin(): Firestore {
  return getFirestore(getApp());
}

export function authAdmin(): Auth {
  return getAuth(getApp());
}
