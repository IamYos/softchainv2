import { firestoreAdmin } from "../firebase/admin";
import type { AvailabilityException } from "../booking/types";

export async function listExceptions(fromIsoDate: string, toIsoDate: string): Promise<AvailabilityException[]> {
  const snap = await firestoreAdmin()
    .collection("availability")
    .where("date", ">=", fromIsoDate)
    .where("date", "<=", toIsoDate)
    .get();
  return snap.docs.map((d) => d.data() as AvailabilityException);
}
