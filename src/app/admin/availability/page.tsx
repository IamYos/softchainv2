import { AvailabilityEditor } from "@/components/admin/AvailabilityEditor";
import { getSettings } from "@/lib/firestore/settings";

export const dynamic = "force-dynamic";

export default async function AvailabilityPage() {
  const settings = await getSettings();
  return (
    <div>
      <h1 style={{ fontSize: "1.25rem", marginBottom: "1rem" }}>Availability</h1>
      <AvailabilityEditor ownerTimezone={settings.ownerTimezone} />
    </div>
  );
}
