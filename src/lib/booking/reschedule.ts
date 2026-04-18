import { FieldValue, Timestamp, Transaction } from "firebase-admin/firestore";
import { firestoreAdmin } from "@/lib/firebase/admin";
import { getSettings } from "@/lib/firestore/settings";
import { cancel as qstashCancel } from "@/lib/qstash/client";
import { scheduleReminders } from "@/lib/qstash/reminders";
import { sendBookingEmail } from "@/lib/email/send";
import { reschedule as rescheduleTemplate } from "@/lib/email/templates/reschedule";
import { ACTIVE_SLOTS_COLLECTION, slotIdFromStart } from "./create";
import { buildIcs } from "./ics";
import type { Booking, ContactMethod } from "./types";

export type RescheduleOutcome =
  | { kind: "ok"; booking: Booking & { id: string } }
  | { kind: "not_found" }
  | { kind: "already_cancelled" }
  | { kind: "slot_taken" }
  | { kind: "past_booking" };

function meetingLinkFor(
  contactLinks: { zoom: string; meet: string; teams: string; whatsappNumber: string },
  method: ContactMethod
): string {
  if (method === "zoom") return contactLinks.zoom;
  if (method === "meet") return contactLinks.meet;
  if (method === "teams") return contactLinks.teams;
  return "";
}

export async function rescheduleBooking(
  bookingId: string,
  newStartUtc: Date
): Promise<RescheduleOutcome> {
  const db = firestoreAdmin();
  const bookingRef = db.collection("bookings").doc(bookingId);
  const settings = await getSettings();
  const slotDurationMs = settings.rules.slotDurationMinutes * 60 * 1000;
  const newEndUtc = new Date(newStartUtc.getTime() + slotDurationMs);
  const newSlotId = slotIdFromStart(newStartUtc);

  // Atomic: re-check booking status + slot freshness, swap activeSlots hold,
  // push previous slot to history, bump icsSequence.
  const txResult = await db.runTransaction(async (tx: Transaction): Promise<
    | { kind: "ok"; prev: Booking; newSequence: number; noop: boolean }
    | { kind: "not_found" }
    | { kind: "already_cancelled" }
    | { kind: "slot_taken" }
    | { kind: "past_booking" }
  > => {
    const snap = await tx.get(bookingRef);
    if (!snap.exists) return { kind: "not_found" };
    const prev = snap.data() as Booking;
    if (prev.status === "cancelled") return { kind: "already_cancelled" };
    if (prev.endAt.toDate() < new Date()) return { kind: "past_booking" };

    const oldSlotId = slotIdFromStart(prev.startAt.toDate());
    if (oldSlotId === newSlotId) {
      // No-op — same time. Return success without mutating.
      return { kind: "ok", prev, newSequence: prev.icsSequence, noop: true };
    }

    const newSlotRef = db.collection(ACTIVE_SLOTS_COLLECTION).doc(newSlotId);
    const newSlotSnap = await tx.get(newSlotRef);
    if (newSlotSnap.exists) return { kind: "slot_taken" };

    const oldSlotRef = db.collection(ACTIVE_SLOTS_COLLECTION).doc(oldSlotId);
    tx.delete(oldSlotRef);
    tx.set(newSlotRef, {
      bookingId,
      startAt: Timestamp.fromDate(newStartUtc),
      endAt: Timestamp.fromDate(newEndUtc),
      createdAt: FieldValue.serverTimestamp(),
    });

    const newSequence = prev.icsSequence + 1;
    tx.update(bookingRef, {
      previousSlots: FieldValue.arrayUnion({
        startAt: prev.startAt,
        endAt: prev.endAt,
      }),
      startAt: Timestamp.fromDate(newStartUtc),
      endAt: Timestamp.fromDate(newEndUtc),
      icsSequence: newSequence,
      updatedAt: FieldValue.serverTimestamp(),
    });

    return { kind: "ok", prev, newSequence, noop: false };
  });

  if (txResult.kind !== "ok") return txResult;

  const { prev, newSequence, noop } = txResult;

  if (noop) {
    return {
      kind: "ok",
      booking: { id: bookingId, ...prev },
    };
  }

  // Swap QStash reminder jobs: cancel old, schedule new.
  const oldJobs = prev.reminderJobIds ?? { h24: null, m15: null };
  await Promise.allSettled([
    oldJobs.h24
      ? qstashCancel(oldJobs.h24).catch((e) => console.error("[reschedule] qstash h24", e))
      : Promise.resolve(),
    oldJobs.m15
      ? qstashCancel(oldJobs.m15).catch((e) => console.error("[reschedule] qstash m15", e))
      : Promise.resolve(),
  ]);

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
  let newJobs: { h24: string | null; m15: string | null } = { h24: null, m15: null };
  try {
    newJobs = await scheduleReminders({ bookingId, startAt: newStartUtc, siteUrl });
  } catch (err) {
    console.error("[reschedule] scheduleReminders failed", err);
  }
  await bookingRef.update({ reminderJobIds: newJobs, updatedAt: FieldValue.serverTimestamp() });

  // Send reschedule emails + updated .ics (same UID, SEQUENCE+1, METHOD:REQUEST).
  const meetingLink = meetingLinkFor(settings.contactLinks, prev.contactMethod);
  const ics = buildIcs({
    method: "REQUEST",
    uid: prev.icsUid,
    sequence: newSequence,
    startUtc: newStartUtc,
    endUtc: newEndUtc,
    summary: "Call with Softchain",
    description: prev.contactMethod === "whatsapp"
      ? "Softchain will WhatsApp you."
      : meetingLink,
    location: meetingLink,
    organizerEmail: "info@softchain.ae",
    attendeeEmail: prev.visitorEmail,
    attendeeName: prev.visitorName,
  });

  const templateCtx = {
    visitorName: prev.visitorName,
    visitorEmail: prev.visitorEmail,
    visitorTimezone: prev.visitorTimezone,
    ownerTimezone: settings.ownerTimezone,
    startUtc: newStartUtc,
    endUtc: newEndUtc,
    contactMethod: prev.contactMethod,
    meetingLink,
    topic: prev.topic,
    rescheduleUrl: `${siteUrl}/reschedule/${prev.rescheduleToken}`,
    cancelUrl: `${siteUrl}/cancel/${prev.cancelToken}`,
    siteUrl,
    wasScheduledFor: prev.startAt.toDate(),
  };
  const tpl = rescheduleTemplate(templateCtx);

  const emailResults = await Promise.allSettled([
    sendBookingEmail({
      to: prev.visitorEmail,
      ...tpl,
      icsContent: ics,
      icsMethod: "REQUEST",
    }),
    sendBookingEmail({
      to: settings.ownerEmail,
      ...tpl,
      icsContent: ics,
      icsMethod: "REQUEST",
    }),
  ]);
  emailResults.forEach((r, i) => {
    if (r.status === "rejected") {
      console.error(`[reschedule] email ${i} failed`, r.reason);
    }
  });

  return {
    kind: "ok",
    booking: {
      id: bookingId,
      ...prev,
      startAt: Timestamp.fromDate(newStartUtc),
      endAt: Timestamp.fromDate(newEndUtc),
      icsSequence: newSequence,
      previousSlots: [
        ...prev.previousSlots,
        { startAt: prev.startAt, endAt: prev.endAt },
      ],
      reminderJobIds: newJobs,
    },
  };
}
