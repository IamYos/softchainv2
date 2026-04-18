import { cookies } from "next/headers";
import { SESSION_COOKIE_NAME, verifySession } from "@/lib/auth/adminSession";
import { AdminUsers } from "@/components/admin/AdminUsers";

export const dynamic = "force-dynamic";

export default async function UsersPage() {
  const jar = await cookies();
  const verified = await verifySession(jar.get(SESSION_COOKIE_NAME)?.value ?? "");
  // Layout guard already redirects if not authenticated; this is belt-and-suspenders.
  if (!verified) return null;

  return (
    <div>
      <h1 style={{ fontSize: "1.25rem", marginBottom: "1rem" }}>Team</h1>
      <AdminUsers currentEmail={verified.email} isOwner={verified.isOwner} />
    </div>
  );
}
