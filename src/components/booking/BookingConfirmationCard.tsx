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

export function BookingConfirmationCard({ data, result, ownerTimezone }: Props) {
  const contactCopy =
    data.contactMethod === "whatsapp"
      ? `We'll WhatsApp you at ${data.visitorPhone} at the scheduled time.`
      : `You'll receive a meeting link by email.`;

  return (
    <div className={styles.formSuccess + " " + styles.formSuccessVisible} style={{ position: "static" }}>
      <p className={`${styles.successMessage} ${styles.p2}`}>
        You&apos;re booked.
      </p>
      <p className={styles.p} style={{ opacity: 0.8, margin: "0.5rem 0" }}>
        {fmtDate(result.startUtc, data.visitorTimezone)}
        {data.visitorTimezone !== ownerTimezone && (
          <>
            <br />
            <span style={{ opacity: 0.6 }}>
              = {fmtDate(result.startUtc, ownerTimezone)} (Dubai)
            </span>
          </>
        )}
      </p>
      <p className={styles.p} style={{ opacity: 0.8, margin: "0.5rem 0" }}>
        {contactCopy}
      </p>
      <p className={styles.successClosing + " " + styles.p}>
        Check your inbox for the calendar invite.
      </p>
      <div style={{ display: "flex", gap: "0.5rem", justifyContent: "center", marginTop: "1rem" }}>
        <a
          href={result.rescheduleUrl}
          className={`${styles.monoPillWide} ${styles.p}`}
          style={{ textDecoration: "none" }}
        >
          Reschedule
        </a>
        <a
          href={result.cancelUrl}
          className={`${styles.monoPillWide} ${styles.monoPillOrange} ${styles.p}`}
          style={{ textDecoration: "none" }}
        >
          Cancel
        </a>
      </div>
    </div>
  );
}
