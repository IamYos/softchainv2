import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";
import { SESSION_COOKIE_NAME, verifySession } from "@/lib/auth/adminSession";
import { AdminShell } from "@/components/admin/AdminShell";
import type { ReactNode } from "react";

export const dynamic = "force-dynamic";

function pathFromHeaders(h: Headers): string {
  return (
    h.get("x-invoke-path") ??
    h.get("x-matched-path") ??
    h.get("next-url") ??
    ""
  );
}

export default async function AdminLayout({ children }: { children: ReactNode }) {
  const hdrs = await headers();
  const pathname = pathFromHeaders(hdrs);
  const isLogin = pathname.endsWith("/admin/login");

  const jar = await cookies();
  const cookieValue = jar.get(SESSION_COOKIE_NAME)?.value ?? "";
  const verified = await verifySession(cookieValue);

  if (!verified && !isLogin) {
    redirect("/admin/login");
  }

  if (isLogin) {
    return <>{children}</>;
  }
  return <AdminShell>{children}</AdminShell>;
}
