import { FieldValue, Transaction } from "firebase-admin/firestore";
import { firestoreAdmin } from "@/lib/firebase/admin";
import { getSettings } from "@/lib/firestore/settings";
import { cancel as qstashCancel } from "@/lib/qstash/client";
import { ACTIVE_SLOTS_COLLECTION, slotIdFromStart } from "./create";
import { buildIcs } from "./ics";
import { sendBookingEmail } from "@/lib/email/send";
import { cancel as cancelTemplate } from "@/lib/email/templates/cancel";
import type { Booking } from "./types";

export type CancelOutcome =
  | { kind: "ok"; booking: Booking & { id: string } }
  | { kind: "not_found" }
  | { kind: "already_cancelled" };

export async function cancelBooking(bookingId: string): Promise<CancelOutcome> {
  const db = firestoreAdmin();
  const ref = db.collection("bookings").doc(bookingId);

  // Atomic: re-check status inside transaction, flip to cancelled, release
  // activeSlots hold so the slot can be rebooked. Two concurrent cancels race
  // cleanly — only one sees `status: "confirmed"` and mutates.
  const txOutcome = await db.runTransaction(async (tx: Transaction): Promise<
    { kind: "ok"; current: Booking; newSequence: number }
    | { kind: "not_found" }
    | { kind: "already_cancelled" }
  > => {
    const snap = await tx.get(ref);
    if (!snap.exists) return { kind: "not_found" };
    const current = snap.data() as Booking;
    if (current.status === "cancelled") return { kind: "already_cancelled" };

    const newSequence = current.icsSequence + 1;
    tx.update(ref, {
      status: "cancelled",
      icsSequence: newSequence,
      updatedAt: FieldValue.serverTimestamp(),
    });

    // Release the slot hold so it can be rebooked.
    const slotId = slotIdFromStart(current.startAt.toDate());
    tx.delete(db.collection(ACTIVE_SLOTS_COLLECTION).doc(slotId));

    return { kind: "ok", current, newSequence };
  });

  if (txOutcome.kind === "not_found") return { kind: "not_found" };
  if (txOutcome.kind === "already_cancelled") return { kind: "already_cancelled" };

  const { current, newSequence } = txOutcome;

  // Kill reminder jobs (best-effort).
  const jobIds = current.reminderJobIds ?? { h24: null, m15: null };
  const cancelJobs: Promise<unknown>[] = [];
  if (jobIds.h24) cancelJobs.push(qstashCancel(jobIds.h24).catch((e) => console.error("[cancel] qstash h24", e)));
  if (jobIds.m15) cancelJobs.push(qstashCancel(jobIds.m15).catch((e) => console.error("[cancel] qstash m15", e)));
  await Promise.allSettled(cancelJobs);

  // Send cancel emails.
  const settings = await getSettings();
  const startUtc = current.startAt.toDate();
  const endUtc = current.endAt.toDate();
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

  const ics = buildIcs({
    method: "CANCEL",
    uid: current.icsUid,
    sequence: newSequence,
    startUtc,
    endUtc,
    summary: "Call with Softchain",
    description: "Cancelled",
    location: "",
    organizerEmail: "info@softchain.ae",
    attendeeEmail: current.visitorEmail,
    attendeeName: current.visitorName,
  });

  const templateCtx = {
    visitorName: current.visitorName,
    visitorEmail: current.visitorEmail,
    visitorTimezone: current.visitorTimezone,
    ownerTimezone: settings.ownerTimezone,
    startUtc,
    endUtc,
    contactMethod: current.contactMethod,
    meetingLink: "",
    topic: current.topic,
    rescheduleUrl: `${siteUrl}/reschedule/${current.rescheduleToken}`,
    cancelUrl: `${siteUrl}/cancel/${current.cancelToken}`,
    siteUrl,
  };
  const { subject, html, text } = cancelTemplate(templateCtx);
  const results = await Promise.allSettled([
    sendBookingEmail({ to: current.visitorEmail, subject, html, text, icsContent: ics, icsMethod: "CANCEL" }),
    sendBookingEmail({ to: settings.ownerEmail, subject, html, text, icsContent: ics, icsMethod: "CANCEL" }),
  ]);
  results.forEach((r, i) => {
    if (r.status === "rejected") {
      console.error(`[cancel] email ${i} failed`, r.reason);
    }
  });

  return {
    kind: "ok",
    booking: { id: bookingId, ...current, status: "cancelled", icsSequence: newSequence },
  };
}
