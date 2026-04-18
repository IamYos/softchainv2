import { cookies } from "next/headers";
import { authAdmin } from "@/lib/firebase/admin";
import { getSettings } from "@/lib/firestore/settings";

export const SESSION_COOKIE_NAME = "sc_admin_session";
export const SESSION_EXPIRES_MS = 14 * 24 * 60 * 60 * 1000; // 14 days

type DecodedLike = { email?: string; email_verified?: boolean };

function normalize(email: string): string {
  return email.trim().toLowerCase();
}

export function isAllowedOwner(decoded: DecodedLike, ownerEmail: string): boolean {
  if (!decoded.email) return false;
  if (!decoded.email_verified) return false;
  return normalize(decoded.email) === normalize(ownerEmail);
}

export function isAllowedAdmin(
  decoded: DecodedLike,
  ownerEmail: string,
  admins: string[] = []
): boolean {
  if (!decoded.email) return false;
  if (!decoded.email_verified) return false;
  const email = normalize(decoded.email);
  if (email === normalize(ownerEmail)) return true;
  return admins.some((a) => normalize(a) === email);
}

export async function createSession(idToken: string): Promise<{ cookie: string; expiresAt: Date }> {
  const auth = authAdmin();
  const decoded = await auth.verifyIdToken(idToken, true);
  const settings = await getSettings();
  if (!isAllowedAdmin(decoded, settings.ownerEmail, settings.admins ?? [])) {
    const err = new Error("Not authorized") as Error & { status?: number };
    err.status = 403;
    throw err;
  }
  const cookie = await auth.createSessionCookie(idToken, { expiresIn: SESSION_EXPIRES_MS });
  return { cookie, expiresAt: new Date(Date.now() + SESSION_EXPIRES_MS) };
}

export async function verifySession(
  sessionCookie: string
): Promise<{ email: string; uid: string; isOwner: boolean } | null> {
  if (!sessionCookie) return null;
  try {
    const decoded = await authAdmin().verifySessionCookie(sessionCookie, true);
    const settings = await getSettings();
    if (!isAllowedAdmin(decoded, settings.ownerEmail, settings.admins ?? [])) return null;
    const isOwner = normalize(decoded.email ?? "") === normalize(settings.ownerEmail);
    return { email: decoded.email!, uid: decoded.uid, isOwner };
  } catch {
    return null;
  }
}

export async function requireAdmin(): Promise<{ email: string; uid: string; isOwner: boolean }> {
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

export async function requireOwner(): Promise<{ email: string; uid: string }> {
  const v = await requireAdmin();
  if (!v.isOwner) {
    const err = new Error("Owner-only action") as Error & { status?: number };
    err.status = 403;
    throw err;
  }
  return { email: v.email, uid: v.uid };
}
