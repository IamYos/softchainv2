import type { ReactNode } from "react";
import { AdminNav } from "./AdminNav";

export function AdminShell({ children }: { children: ReactNode }) {
  return (
    <div style={{ display: "flex", minHeight: "100vh", fontFamily: "inherit" }}>
      <AdminNav />
      <main style={{ flex: 1, padding: "1.5rem", overflow: "auto" }}>{children}</main>
    </div>
  );
}
