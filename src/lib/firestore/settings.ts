import { randomBytes } from "crypto";
import { firestoreAdmin } from "../firebase/admin";
import type { SettingsDoc } from "../booking/types";
import { FieldValue } from "firebase-admin/firestore";
import type { ContactLinks, BookingRules, DefaultHours } from "../booking/types";

export async function getSettings(): Promise<SettingsDoc> {
  const snap = await firestoreAdmin().collection("settings").doc("config").get();
  if (!snap.exists) throw new Error("settings/config document missing");
  return snap.data() as SettingsDoc;
}

export type SettingsPatch = Partial<{
  contactLinks: ContactLinks;
  rules: BookingRules;
  defaultHours: DefaultHours;
  ownerTimezone: string;
}>;

export async function updateSettings(patch: SettingsPatch): Promise<void> {
  await firestoreAdmin()
    .collection("settings")
    .doc("config")
    .update({ ...patch, updatedAt: FieldValue.serverTimestamp() });
}

export async function regenerateIcsFeedSecret(): Promise<string> {
  const secret = randomBytes(32).toString("hex");
  await firestoreAdmin()
    .collection("settings")
    .doc("config")
    .update({ icsFeedSecret: secret, updatedAt: FieldValue.serverTimestamp() });
  return secret;
}

function normalize(email: string): string {
  return email.trim().toLowerCase();
}

export async function addAdmin(email: string): Promise<void> {
  const e = normalize(email);
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e)) throw new Error("Invalid email");
  await firestoreAdmin()
    .collection("settings")
    .doc("config")
    .update({ admins: FieldValue.arrayUnion(e), updatedAt: FieldValue.serverTimestamp() });
}

export async function removeAdmin(email: string): Promise<void> {
  const e = normalize(email);
  const settings = await getSettings();
  if (normalize(settings.ownerEmail) === e) {
    const err = new Error("Cannot remove the owner") as Error & { status?: number };
    err.status = 403;
    throw err;
  }
  await firestoreAdmin()
    .collection("settings")
    .doc("config")
    .update({ admins: FieldValue.arrayRemove(e), updatedAt: FieldValue.serverTimestamp() });
}
