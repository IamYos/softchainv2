import { findBookingByRescheduleToken } from "@/lib/firestore/bookings";
import { getSettings } from "@/lib/firestore/settings";
import { RescheduleFlow } from "./RescheduleFlow";
import Link from "next/link";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Reschedule booking · Softchain",
  robots: { index: false, follow: false },
};

export default async function ReschedulePage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;
  const booking = await findBookingByRescheduleToken(token);

  if (!booking) {
    return (
      <main style={{ maxWidth: "36rem", margin: "4rem auto", padding: "1.5rem", fontFamily: "inherit" }}>
        <h1 style={{ fontSize: "1.5rem", marginBottom: "1rem" }}>This reschedule link is no longer valid</h1>
        <p style={{ opacity: 0.7, marginBottom: "1.5rem" }}>
          The booking may already have been cancelled, rescheduled, or past its time.
        </p>
        <Link href="/#closing-cta" style={{ color: "inherit" }}>
          Book a new call →
        </Link>
      </main>
    );
  }

  const settings = await getSettings();
  return (
    <RescheduleFlow
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
