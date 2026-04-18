import { randomUUID } from "crypto";
import { Timestamp, Transaction } from "firebase-admin/firestore";
import { generateToken } from "./tokens";
import {
  bookingsCollectionRef,
  findActiveBookingForEmail,
  listConfirmedBookingsInRange,
} from "../firestore/bookings";
import type { Booking, ContactMethod } from "./types";

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
    const existing = await findActiveBookingForEmail(doc.visitorEmail, now, tx);
    if (existing) {
      return { kind: "already_booked", existingStartUtc: existing.startAt.toDate() };
    }

    // Non-transactional overlap check: acceptable for low-volume booking.
    // Upgrade to transactional by wrapping via tx.get if high contention emerges.
    const overlaps = await listConfirmedBookingsInRange(input.startUtc, input.endUtc);
    if (overlaps.length > 0) {
      return { kind: "slot_taken" };
    }

    const ref = bookingsCollectionRef().doc();
    tx.set(ref, doc);
    return { kind: "created", booking: { id: ref.id, ...doc } };
  });
}
