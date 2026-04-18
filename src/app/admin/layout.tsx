import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { SESSION_COOKIE_NAME, verifySession } from "@/lib/auth/adminSession";
import { AdminShell } from "@/components/admin/AdminShell";
import type { ReactNode } from "react";

export const dynamic = "force-dynamic";

export default async function AdminLayout({ children }: { children: ReactNode }) {
  const jar = await cookies();
  const cookieValue = jar.get(SESSION_COOKIE_NAME)?.value ?? "";
  const verified = await verifySession(cookieValue);

  if (!verified) {
    redirect("/admin/login");
  }

  return <AdminShell>{children}</AdminShell>;
}
