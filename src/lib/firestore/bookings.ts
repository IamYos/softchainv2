import { firestoreAdmin } from "../firebase/admin";
import { FieldValue, Timestamp, Transaction } from "firebase-admin/firestore";
import type { Booking } from "../booking/types";

export async function listConfirmedBookingsInRange(
  startUtc: Date,
  endUtc: Date
): Promise<Array<Pick<Booking, "startAt" | "endAt" | "visitorEmail">>> {
  // Single-field range query avoids needing a composite index. Status filter
  // runs in memory — fine for low volume; add a composite index if it grows.
  const snap = await firestoreAdmin()
    .collection("bookings")
    .where("startAt", ">=", Timestamp.fromDate(startUtc))
    .where("startAt", "<", Timestamp.fromDate(endUtc))
    .get();
  return snap.docs
    .map((d) => d.data() as Booking)
    .filter((b) => b.status === "confirmed");
}

export async function findActiveBookingForEmail(
  email: string,
  now: Date,
  tx?: Transaction
): Promise<Booking | null> {
  // Query on single field (email) to avoid composite index; filter the rest in memory.
  const normalized = email.toLowerCase().trim();
  const query = firestoreAdmin()
    .collection("bookings")
    .where("visitorEmail", "==", normalized);
  const snap = tx ? await tx.get(query) : await query.get();
  if (snap.empty) return null;
  const nowMs = now.getTime();
  const active = snap.docs
    .map((d) => d.data() as Booking)
    .find((b) => b.status === "confirmed" && b.endAt.toMillis() > nowMs);
  return active ?? null;
}

export async function findBookingByRescheduleToken(token: string): Promise<(Booking & { id: string }) | null> {
  const snap = await firestoreAdmin()
    .collection("bookings")
    .where("rescheduleToken", "==", token)
    .limit(1)
    .get();
  if (snap.empty) return null;
  const doc = snap.docs[0];
  return { id: doc.id, ...(doc.data() as Booking) };
}

export async function findBookingByCancelToken(token: string): Promise<(Booking & { id: string }) | null> {
  const snap = await firestoreAdmin()
    .collection("bookings")
    .where("cancelToken", "==", token)
    .limit(1)
    .get();
  if (snap.empty) return null;
  const doc = snap.docs[0];
  return { id: doc.id, ...(doc.data() as Booking) };
}

export async function getBookingById(id: string): Promise<(Booking & { id: string }) | null> {
  const snap = await firestoreAdmin().collection("bookings").doc(id).get();
  if (!snap.exists) return null;
  return { id: snap.id, ...(snap.data() as Booking) };
}

export function bookingsCollectionRef() {
  return firestoreAdmin().collection("bookings");
}

export { FieldValue, Timestamp };

export type AdminBookingTab = "upcoming" | "past" | "cancelled";

export async function listBookingsForAdmin(
  tab: AdminBookingTab,
  limit = 100
): Promise<Array<Booking & { id: string }>> {
  const now = Timestamp.fromDate(new Date());
  const col = firestoreAdmin().collection("bookings");
  let snap;
  if (tab === "cancelled") {
    snap = await col.where("status", "==", "cancelled").orderBy("startAt", "desc").limit(limit).get();
  } else if (tab === "past") {
    snap = await col
      .where("startAt", "<", now)
      .orderBy("startAt", "desc")
      .limit(limit)
      .get();
  } else {
    snap = await col
      .where("startAt", ">=", now)
      .orderBy("startAt", "asc")
      .limit(limit)
      .get();
  }
  return snap.docs
    .map((d) => ({ id: d.id, ...(d.data() as Booking) }))
    .filter((b) => (tab === "cancelled" ? true : b.status === "confirmed"));
}

export async function updateBookingAdminFields(
  id: string,
  patch: { adminNotes?: string | null; noShow?: boolean }
): Promise<void> {
  await firestoreAdmin().collection("bookings").doc(id).update({
    ...patch,
    updatedAt: FieldValue.serverTimestamp(),
  });
}
