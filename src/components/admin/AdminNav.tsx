"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

const LINKS = [
  { href: "/admin/bookings", label: "Bookings" },
  { href: "/admin/availability", label: "Availability" },
  { href: "/admin/settings", label: "Settings" },
];

export function AdminNav() {
  const pathname = usePathname();
  const router = useRouter();

  const signOut = async () => {
    await fetch("/api/admin/session", { method: "DELETE" });
    router.replace("/admin/login");
  };

  return (
    <nav
      aria-label="Admin"
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "0.5rem",
        padding: "1rem",
        borderRight: "1px solid rgba(0,0,0,0.1)",
        minWidth: "12rem",
        fontFamily: "inherit",
      }}
    >
      <p style={{ fontSize: "0.75rem", opacity: 0.5, letterSpacing: "0.08em", textTransform: "uppercase" }}>
        Softchain Admin
      </p>
      {LINKS.map((l) => {
        const active = pathname === l.href || pathname.startsWith(l.href + "/");
        return (
          <Link
            key={l.href}
            href={l.href}
            style={{
              padding: "0.5rem 0.75rem",
              borderRadius: "8px",
              textDecoration: "none",
              background: active ? "rgba(0,0,0,0.08)" : "transparent",
              color: "inherit",
              fontSize: "0.95rem",
            }}
          >
            {l.label}
          </Link>
        );
      })}
      <div style={{ flex: 1 }} />
      <button
        type="button"
        onClick={signOut}
        style={{
          marginTop: "auto",
          padding: "0.5rem 0.75rem",
          background: "transparent",
          border: "1px solid rgba(0,0,0,0.1)",
          borderRadius: "8px",
          cursor: "pointer",
          fontSize: "0.85rem",
          fontFamily: "inherit",
        }}
      >
        Sign out
      </button>
    </nav>
  );
}
