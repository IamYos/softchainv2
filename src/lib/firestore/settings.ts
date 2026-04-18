import { firestoreAdmin } from "../firebase/admin";
import type { SettingsDoc } from "../booking/types";

export async function getSettings(): Promise<SettingsDoc> {
  const snap = await firestoreAdmin().collection("settings").doc("config").get();
  if (!snap.exists) throw new Error("settings/config document missing");
  return snap.data() as SettingsDoc;
}
