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
