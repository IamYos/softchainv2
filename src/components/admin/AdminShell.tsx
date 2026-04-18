"use client";

import { useEffect, useState, type ReactNode } from "react";
import { usePathname } from "next/navigation";
import { AdminNav } from "./AdminNav";

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
    <div className="admin-shell" style={{ minHeight: "100vh", fontFamily: "inherit" }}>
      <aside
        className="admin-sidebar"
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          bottom: 0,
          width: "13rem",
          borderRight: "1px solid rgba(0,0,0,0.1)",
          background: "var(--color-background, white)",
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
          borderBottom: "1px solid rgba(0,0,0,0.08)",
          background: "var(--color-background, white)",
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
            border: "1px solid rgba(0,0,0,0.15)",
            borderRadius: "8px",
            background: "transparent",
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
            style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.35)", zIndex: 40 }}
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
              background: "var(--color-background, white)",
              borderRight: "1px solid rgba(0,0,0,0.1)",
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
