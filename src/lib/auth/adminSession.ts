import { cookies } from "next/headers";
import { authAdmin } from "@/lib/firebase/admin";
import { getSettings } from "@/lib/firestore/settings";

export const SESSION_COOKIE_NAME = "sc_admin_session";
export const SESSION_EXPIRES_MS = 14 * 24 * 60 * 60 * 1000; // 14 days

type DecodedLike = { email?: string; email_verified?: boolean };

export function isAllowedOwner(decoded: DecodedLike, ownerEmail: string): boolean {
  if (!decoded.email) return false;
  if (!decoded.email_verified) return false;
  return decoded.email.trim().toLowerCase() === ownerEmail.trim().toLowerCase();
}

export async function createSession(idToken: string): Promise<{ cookie: string; expiresAt: Date }> {
  const auth = authAdmin();
  const decoded = await auth.verifyIdToken(idToken, true);
  const settings = await getSettings();
  if (!isAllowedOwner(decoded, settings.ownerEmail)) {
    const err = new Error("Not authorized") as Error & { status?: number };
    err.status = 403;
    throw err;
  }
  const cookie = await auth.createSessionCookie(idToken, { expiresIn: SESSION_EXPIRES_MS });
  return { cookie, expiresAt: new Date(Date.now() + SESSION_EXPIRES_MS) };
}

export async function verifySession(sessionCookie: string): Promise<{ email: string; uid: string } | null> {
  if (!sessionCookie) return null;
  try {
    const decoded = await authAdmin().verifySessionCookie(sessionCookie, true);
    const settings = await getSettings();
    if (!isAllowedOwner(decoded, settings.ownerEmail)) return null;
    return { email: decoded.email!, uid: decoded.uid };
  } catch {
    return null;
  }
}

export async function requireAdmin(): Promise<{ email: string; uid: string }> {
  const jar = await cookies();
  const value = jar.get(SESSION_COOKIE_NAME)?.value ?? "";
  const verified = await verifySession(value);
  if (!verified) {
    const err = new Error("Unauthorized") as Error & { status?: number };
    err.status = 401;
    throw err;
  }
  return verified;
}
