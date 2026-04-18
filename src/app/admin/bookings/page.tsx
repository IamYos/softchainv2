import { BookingsTable } from "@/components/admin/BookingsTable";

export const dynamic = "force-dynamic";

export default function BookingsPage() {
  return (
    <div>
      <h1 style={{ fontSize: "1.25rem", marginBottom: "1rem" }}>Bookings</h1>
      <BookingsTable />
    </div>
  );
}
