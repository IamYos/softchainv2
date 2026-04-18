import { findBookingByCancelToken } from "@/lib/firestore/bookings";
import { getSettings } from "@/lib/firestore/settings";
import { CancelConfirm } from "./CancelConfirm";
import Link from "next/link";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Cancel booking · Softchain",
  robots: { index: false, follow: false },
};

export default async function CancelPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;
  const booking = await findBookingByCancelToken(token);

  if (!booking) {
    return (
      <main style={{ maxWidth: "32rem", margin: "4rem auto", padding: "1.5rem", fontFamily: "inherit" }}>
        <h1 style={{ fontSize: "1.5rem", marginBottom: "1rem" }}>This cancel link is no longer valid</h1>
        <p style={{ opacity: 0.7, marginBottom: "1.5rem" }}>
          The booking may already have been cancelled, or the link may have expired.
        </p>
        <Link href="/#closing-cta" style={{ color: "inherit" }}>
          Book a new call →
        </Link>
      </main>
    );
  }

  const settings = await getSettings();
  return (
    <CancelConfirm
      token={token}
      booking={{
        startAtIso: booking.startAt.toDate().toISOString(),
        endAtIso: booking.endAt.toDate().toISOString(),
        visitorName: booking.visitorName,
        visitorTimezone: booking.visitorTimezone,
        ownerTimezone: settings.ownerTimezone,
        contactMethod: booking.contactMethod,
      }}
    />
  );
}
