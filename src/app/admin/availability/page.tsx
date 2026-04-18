import { AvailabilityEditor } from "@/components/admin/AvailabilityEditor";

export const dynamic = "force-dynamic";

export default function AvailabilityPage() {
  return (
    <div>
      <h1 style={{ fontSize: "1.25rem", marginBottom: "1rem" }}>Availability</h1>
      <AvailabilityEditor />
    </div>
  );
}
