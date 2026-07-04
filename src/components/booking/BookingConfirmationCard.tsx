"use client";

import styles from "@/components/marketing/sf/SFPostFrame.module.css";
import type { BookingData, SubmitResult } from "./useBookingState";

function fmtDate(iso: string, tz: string): string {
  return new Intl.DateTimeFormat(undefined, {
    weekday: "short",
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
    timeZone: tz,
  }).format(new Date(iso));
}

type Props = {
  data: BookingData;
  result: SubmitResult;
  ownerTimezone: string;
};

const linkStyle: React.CSSProperties = {
  color: "inherit",
  textDecoration: "underline",
  textUnderlineOffset: "3px",
};

export function BookingConfirmationCard({ data, result, ownerTimezone }: Props) {
  const contactCopy =
    data.contactMethod === "whatsapp"
      ? `We'll WhatsApp you at ${data.visitorPhone} at the scheduled time.`
      : `You'll receive a meeting link by email.`;

  return (
    <div style={{ textAlign: "center" }}>
      <p className={styles.p2} style={{ margin: "0 0 1rem" }}>
        Thank you — you&apos;re booked.
      </p>
      <p className={styles.p} style={{ opacity: 0.8, margin: "0.5rem 0" }}>
        {fmtDate(result.startUtc, data.visitorTimezone)}
        {data.visitorTimezone !== ownerTimezone && (
          <>
            <br />
            <span style={{ opacity: 0.7 }}>
              = {fmtDate(result.startUtc, ownerTimezone)} (Dubai)
            </span>
          </>
        )}
      </p>
      <p className={styles.p} style={{ opacity: 0.8, margin: "0.5rem 0" }}>
        {contactCopy}
      </p>
      <p className={styles.p} style={{ opacity: 0.8, margin: "0.5rem 0 1.25rem" }}>
        Check your inbox for the calendar invite.
      </p>
      <p className={styles.p} style={{ margin: 0 }}>
        <a href={result.rescheduleUrl} style={linkStyle}>
          Reschedule
        </a>
        <span aria-hidden="true" style={{ opacity: 0.5, padding: "0 0.75rem" }}>
          /
        </span>
        <a href={result.cancelUrl} style={linkStyle}>
          Cancel
        </a>
      </p>
    </div>
  );
}
