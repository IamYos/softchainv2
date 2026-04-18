import { randomUUID } from "crypto";
import { Timestamp, Transaction } from "firebase-admin/firestore";
import { generateToken } from "./tokens";
import {
  bookingsCollectionRef,
  findActiveBookingForEmail,
} from "../firestore/bookings";
import type { Booking, ContactMethod } from "./types";

// Deterministic slot-hold collection ensures race-safe slot uniqueness without
// a composite Firestore index. A doc at activeSlots/{slotId} exists while a
// booking is confirmed; it's deleted on cancel so the slot can be rebooked.
// The bookings collection itself keeps full history (including cancelled).
export const ACTIVE_SLOTS_COLLECTION = "activeSlots";

export function slotIdFromStart(startUtc: Date): string {
  // e.g. "2026-05-04T13:00:00Z" — deterministic, minute-precise, URL-safe.
  return startUtc.toISOString().replace(/\.\d{3}Z$/, "Z");
}

export type BookingInput = {
  visitorName: string;
  visitorEmail: string;
  visitorCompany: string | null;
  topic: string;
  contactMethod: ContactMethod;
  visitorPhone: string | null;
  visitorTimezone: string;
  startUtc: Date;
  endUtc: Date;
};

export type CreatedBooking = Booking & { id: string };

export function buildBookingDocFromInput(input: BookingInput): Booking {
  const now = Timestamp.now();
  return {
    visitorName: input.visitorName.trim(),
    visitorEmail: input.visitorEmail.toLowerCase().trim(),
    visitorCompany: input.visitorCompany?.trim() || null,
    topic: input.topic.trim(),
    contactMethod: input.contactMethod,
    visitorPhone: input.visitorPhone?.trim() || null,
    visitorTimezone: input.visitorTimezone,
    startAt: Timestamp.fromDate(input.startUtc),
    endAt: Timestamp.fromDate(input.endUtc),
    status: "confirmed",
    noShow: false,
    adminNotes: null,
    rescheduleToken: generateToken(),
    cancelToken: generateToken(),
    icsUid: `${randomUUID()}@softchain.ae`,
    icsSequence: 0,
    reminderJobIds: { h24: null, m15: null },
    previousSlots: [],
    createdAt: now,
    updatedAt: now,
  };
}

export type CreateOutcome =
  | { kind: "created"; booking: CreatedBooking }
  | { kind: "already_booked"; existingStartUtc: Date }
  | { kind: "slot_taken" };

export async function createBookingTransaction(input: BookingInput): Promise<CreateOutcome> {
  const { firestoreAdmin } = await import("../firebase/admin");
  const db = firestoreAdmin();

  const doc = buildBookingDocFromInput(input);
  const now = new Date();

  return db.runTransaction(async (tx: Transaction): Promise<CreateOutcome> => {
    // 1. One-active-booking-per-visitor check — race-safe via tx.get.
    const existing = await findActiveBookingForEmail(doc.visitorEmail, now, tx);
    if (existing) {
      return { kind: "already_booked", existingStartUtc: existing.startAt.toDate() };
    }

    // 2. Slot uniqueness via activeSlots/{slotId} — race-safe single-doc read.
    const slotRef = db.collection(ACTIVE_SLOTS_COLLECTION).doc(slotIdFromStart(input.startUtc));
    const slotSnap = await tx.get(slotRef);
    if (slotSnap.exists) {
      return { kind: "slot_taken" };
    }

    // 3. Write booking (auto id) + slot hold.
    const bookingRef = bookingsCollectionRef().doc();
    tx.set(bookingRef, doc);
    tx.set(slotRef, {
      bookingId: bookingRef.id,
      startAt: doc.startAt,
      endAt: doc.endAt,
      createdAt: doc.createdAt,
    });

    return { kind: "created", booking: { id: bookingRef.id, ...doc } };
  });
}
