import { firestoreAdmin } from "../src/lib/firebase/admin";
import type { SettingsDoc } from "../src/lib/booking/types";
import { randomBytes } from "crypto";

async function main() {
  const db = firestoreAdmin();
  const ref = db.collection("settings").doc("config");
  const existing = await ref.get();
  if (existing.exists) {
    console.log("settings/config already exists — skipping seed.");
    return;
  }
  const seed: Omit<SettingsDoc, "icsFeedSecret"> & { icsFeedSecret: string } = {
    ownerEmail: "yosmouawad@gmail.com",
    ownerTimezone: "Asia/Dubai",
    defaultHours: {
      mon: { start: "09:00", end: "17:00" },
      tue: { start: "09:00", end: "17:00" },
      wed: { start: "09:00", end: "17:00" },
      thu: { start: "09:00", end: "17:00" },
      fri: { start: "09:00", end: "17:00" },
      sat: null,
      sun: null,
    },
    contactLinks: {
      zoom: "",
      meet: "",
      teams: "",
      whatsappNumber: "",
    },
    rules: {
      minNoticeHours: 4,
      maxLookaheadDays: 30,
      slotDurationMinutes: 30,
    },
    icsFeedSecret: randomBytes(32).toString("hex"),
  };
  await ref.set(seed);
  console.log("Seeded settings/config.");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
