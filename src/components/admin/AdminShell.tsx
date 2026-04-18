"use client";

import { useEffect, useState, type ReactNode } from "react";
import { usePathname } from "next/navigation";
import { AdminNav } from "./AdminNav";

// Admin-scoped palette tokens. Defined once on the shell root so every
// nested surface (sidebar, drawer, modal, calendar popover) reads from the
// same variables. Kept in sync with marketing site's mf-* tokens.
const adminVars: React.CSSProperties = {
  ["--sc-admin-bg" as string]: "var(--mf-bg-base, #0a0a0a)",
  ["--sc-admin-surface" as string]: "var(--mf-surface, #111111)",
  ["--sc-admin-surface-hover" as string]: "var(--mf-surface-hover, #1a1a1a)",
  ["--sc-admin-border" as string]: "var(--mf-border, #262626)",
  ["--sc-admin-border-subtle" as string]: "var(--mf-border-subtle, #404040)",
  ["--sc-admin-text" as string]: "var(--mf-text-heading, #ffffff)",
  ["--sc-admin-muted" as string]: "var(--mf-text-muted, #a3a3a3)",
  ["--sc-admin-dim" as string]: "var(--mf-text-dim, #737373)",
  ["--sc-admin-accent" as string]: "var(--mf-brand-red, #dc2626)",
  ["--sc-admin-accent-soft" as string]: "var(--mf-brand-green-soft, #14532d)",
};

export function AdminShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    setMenuOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (menuOpen) {
      const prev = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = prev;
      };
    }
  }, [menuOpen]);

  return (
    <div
      className="admin-shell"
      style={{
        ...adminVars,
        minHeight: "100vh",
        fontFamily: "inherit",
        background: "var(--sc-admin-bg)",
        color: "var(--sc-admin-text)",
      }}
    >
      <aside
        className="admin-sidebar"
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          bottom: 0,
          width: "13rem",
          borderRight: "1px solid var(--sc-admin-border)",
          background: "var(--sc-admin-surface)",
          zIndex: 20,
        }}
      >
        <AdminNav />
      </aside>

      <header
        className="admin-mobile-bar"
        style={{
          position: "sticky",
          top: 0,
          zIndex: 30,
          display: "none",
          justifyContent: "space-between",
          alignItems: "center",
          padding: "0.75rem 1rem",
          borderBottom: "1px solid var(--sc-admin-border)",
          background: "var(--sc-admin-surface)",
        }}
      >
        <span style={{ fontSize: "0.9rem", fontWeight: 500 }}>Softchain admin</span>
        <button
          type="button"
          aria-label={menuOpen ? "Close menu" : "Open menu"}
          aria-expanded={menuOpen}
          onClick={() => setMenuOpen((v) => !v)}
          style={{
            padding: "0.4rem 0.75rem",
            border: "1px solid var(--sc-admin-border-subtle)",
            borderRadius: "8px",
            background: "transparent",
            color: "inherit",
            cursor: "pointer",
            fontFamily: "inherit",
            fontSize: "0.85rem",
          }}
        >
          {menuOpen ? "Close" : "Menu"}
        </button>
      </header>

      {menuOpen && (
        <>
          <div
            role="presentation"
            onClick={() => setMenuOpen(false)}
            style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.6)", zIndex: 40 }}
          />
          <aside
            className="admin-mobile-drawer"
            role="dialog"
            aria-label="Admin navigation"
            style={{
              position: "fixed",
              top: 0,
              left: 0,
              bottom: 0,
              width: "min(18rem, 85vw)",
              background: "var(--sc-admin-surface)",
              borderRight: "1px solid var(--sc-admin-border)",
              zIndex: 50,
              overflowY: "auto",
            }}
          >
            <AdminNav onNavigate={() => setMenuOpen(false)} />
          </aside>
        </>
      )}

      <main
        className="admin-main"
        style={{ marginLeft: "13rem", padding: "1.5rem", minHeight: "100vh" }}
      >
        {children}
      </main>

      <style>{`
        @media (max-width: 768px) {
          .admin-shell .admin-sidebar { display: none; }
          .admin-shell .admin-mobile-bar { display: flex !important; }
          .admin-shell .admin-main { margin-left: 0; padding: 1rem; }
        }
      `}</style>
    </div>
  );
}
