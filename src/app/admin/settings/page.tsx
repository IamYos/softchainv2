import { getSettings } from "@/lib/firestore/settings";
import { SettingsForm } from "@/components/admin/SettingsForm";

export const dynamic = "force-dynamic";

export default async function SettingsPage() {
  const settings = await getSettings();
  return (
    <div>
      <h1 style={{ fontSize: "1.25rem", marginBottom: "1rem" }}>Settings</h1>
      <SettingsForm initial={settings} />
    </div>
  );
}
