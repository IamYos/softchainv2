import { firestoreAdmin } from "../src/lib/firebase/admin";
import { resendClient, fromAddress } from "../src/lib/email/resend";
import { computeAvailableSlots } from "../src/lib/booking/slots";
import type { SettingsDoc } from "../src/lib/booking/types";

async function main() {
  const db = firestoreAdmin();

  // 1. Read settings/config.
  const snap = await db.collection("settings").doc("config").get();
  if (!snap.exists) throw new Error("settings/config missing — run seed first");
  const settings = snap.data() as SettingsDoc;
  console.log("OK: read settings/config — ownerTimezone =", settings.ownerTimezone);

  // 2. Compute some slots (the pure function — no external calls).
  const now = new Date();
  const rangeStart = now;
  const rangeEnd = new Date(now.getTime() + 14 * 24 * 3600 * 1000);
  const slots = computeAvailableSlots({
    settings,
    rangeStart,
    rangeEnd,
    exceptions: [],
    existingBookings: [],
    now,
  });
  console.log(`OK: computed ${slots.length} available slots in the next 14 days`);
  if (slots.length) {
    console.log("   first slot (UTC):", slots[0].startUtc.toISOString());
  }

  // 3. Send a test email.
  const resend = resendClient();
  const { data, error } = await resend.emails.send({
    from: fromAddress(),
    to: settings.ownerEmail,
    subject: "Softchain booking system — Phase 1 smoke test",
    text: "If you see this, Resend sending from info@softchain.ae works.",
  });
  if (error) throw error;
  console.log("OK: sent test email — message id =", data?.id);

  console.log("\nPhase 1 foundation verified.");
}

main().catch((err) => {
  console.error("SMOKE FAILED:", err);
  process.exit(1);
});
