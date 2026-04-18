import { Suspense } from "react";
import { SignInButton } from "@/components/admin/SignInButton";

export const dynamic = "force-dynamic";

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
      <div style={{ textAlign: "center" }}>
        <h1 style={{ fontSize: "1.5rem", marginBottom: "0.5rem" }}>Softchain admin</h1>
        <p style={{ opacity: 0.6, fontSize: "0.9rem" }}>
          Signed-in access restricted to the owner account.
        </p>
      </div>
      <Suspense fallback={<p>Loading…</p>}>
        <SignInButton />
      </Suspense>
    </main>
  );
}
