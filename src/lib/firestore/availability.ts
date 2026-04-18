import { firestoreAdmin } from "../firebase/admin";
import type { AvailabilityException } from "../booking/types";
import { FieldValue } from "firebase-admin/firestore";

export async function listExceptions(fromIsoDate: string, toIsoDate: string): Promise<AvailabilityException[]> {
  const snap = await firestoreAdmin()
    .collection("availability")
    .where("date", ">=", fromIsoDate)
    .where("date", "<=", toIsoDate)
    .get();
  return snap.docs.map((d) => d.data() as AvailabilityException);
}

export type ExceptionInput = {
  type: "block" | "extra";
  date: string;
  startTime?: string;
  endTime?: string;
  note?: string;
};

export async function addException(input: ExceptionInput): Promise<string> {
  const ref = await firestoreAdmin()
    .collection("availability")
    .add({ ...input, createdAt: FieldValue.serverTimestamp() });
  return ref.id;
}

export async function deleteExceptionById(id: string): Promise<void> {
  await firestoreAdmin().collection("availability").doc(id).delete();
}

export async function listExceptionsForAdmin(
  fromIsoDate: string,
  toIsoDate: string
): Promise<Array<AvailabilityException & { id: string }>> {
  const snap = await firestoreAdmin()
    .collection("availability")
    .where("date", ">=", fromIsoDate)
    .where("date", "<=", toIsoDate)
    .get();
  return snap.docs.map((d) => ({ id: d.id, ...(d.data() as AvailabilityException) }));
}
