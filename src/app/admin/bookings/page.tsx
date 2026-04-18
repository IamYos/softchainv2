import { BookingsTable } from "@/components/admin/BookingsTable";
import { getSettings } from "@/lib/firestore/settings";

export const dynamic = "force-dynamic";

export default async function BookingsPage() {
  const settings = await getSettings();
  return (
    <div>
      <h1 style={{ fontSize: "1.25rem", marginBottom: "1rem" }}>Bookings</h1>
      <BookingsTable ownerTimezone={settings.ownerTimezone} />
    </div>
  );
}
