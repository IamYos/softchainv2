"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

const LINKS = [
  { href: "/admin/bookings", label: "Bookings" },
  { href: "/admin/availability", label: "Availability" },
  { href: "/admin/settings", label: "Settings" },
  { href: "/admin/users", label: "Team" },
];

type Props = {
  onNavigate?: () => void;
};

export function AdminNav({ onNavigate }: Props) {
  const pathname = usePathname();
  const router = useRouter();
  const [unread, setUnread] = useState(0);

  useEffect(() => {
    void fetch("/api/admin/bookings/unread")
      .then((r) => (r.ok ? r.json() : { count: 0 }))
      .then((b: { count?: number }) => setUnread(b.count ?? 0))
      .catch(() => setUnread(0));
  }, [pathname]);

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
        height: "100%",
        fontFamily: "inherit",
      }}
    >
      <Link
        href="/admin/bookings"
        onClick={onNavigate}
        style={{ display: "block", marginBottom: "0.75rem", position: "relative", height: "28px", width: "130px" }}
        aria-label="Softchain admin home"
      >
        <Image src="/softchain-logo.png" alt="Softchain" fill sizes="130px" style={{ objectFit: "contain", objectPosition: "left" }} />
      </Link>
      <p style={{ fontSize: "0.7rem", opacity: 0.5, letterSpacing: "0.08em", textTransform: "uppercase", margin: "0 0 0.25rem" }}>
        Admin
      </p>
      {LINKS.map((l) => {
        const active = pathname === l.href || pathname.startsWith(l.href + "/");
        const showBadge = l.href === "/admin/bookings" && unread > 0;
        return (
          <Link
            key={l.href}
            href={l.href}
            onClick={onNavigate}
            style={{
              padding: "0.6rem 0.75rem",
              borderRadius: "8px",
              textDecoration: "none",
              background: active ? "rgba(0,0,0,0.08)" : "transparent",
              color: "inherit",
              fontSize: "0.95rem",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <span>{l.label}</span>
            {showBadge && (
              <span style={{ background: "#f60", color: "white", borderRadius: "999px", fontSize: "0.7rem", padding: "0.1rem 0.45rem" }}>
                {unread}
              </span>
            )}
          </Link>
        );
      })}
      <div style={{ flex: 1 }} />
      <button
        type="button"
        onClick={signOut}
        style={{
          padding: "0.55rem 0.75rem",
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
