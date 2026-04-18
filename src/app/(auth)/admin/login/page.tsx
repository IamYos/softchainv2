import { Suspense } from "react";
import Image from "next/image";
import type { Metadata } from "next";
import { SignInButton } from "@/components/admin/SignInButton";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Admin · Softchain",
  robots: { index: false, follow: false, noarchive: true, nosnippet: true, noimageindex: true },
};

export default function LoginPage() {
  return (
    <main
      style={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: "2rem",
        padding: "2rem",
        fontFamily: "inherit",
      }}
    >
      <div style={{ position: "relative", width: "160px", height: "36px" }}>
        <Image src="/softchain-logo.png" alt="Softchain" fill sizes="160px" style={{ objectFit: "contain" }} priority />
      </div>
      <div style={{ textAlign: "center" }}>
        <h1 style={{ fontSize: "1.5rem", marginBottom: "0.5rem" }}>Admin</h1>
        <p style={{ opacity: 0.6, fontSize: "0.9rem" }}>
          Signed-in access restricted to authorized accounts.
        </p>
      </div>
      <Suspense fallback={<p>Loading…</p>}>
        <SignInButton />
      </Suspense>
    </main>
  );
}
