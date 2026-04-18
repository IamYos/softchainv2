"use client";

import { useState } from "react";
import styles from "@/components/marketing/sf/SFPostFrame.module.css";
import { StepShell } from "../StepShell";
import { TurnstileWidget } from "../TurnstileWidget";
import type { Action, BookingData, SubmitResult } from "../useBookingState";
import type { Dispatch } from "react";

type Props = {
  data: BookingData;
  error: string | null;
  isSubmitting: boolean;
  dispatch: Dispatch<Action>;
};

export function StepSubmit({ data, error, isSubmitting, dispatch }: Props) {
  const [turnstileToken, setTurnstileToken] = useState("");
  const [websiteUrl, setWebsiteUrl] = useState("");

  const canSubmit = turnstileToken.length > 0 && !isSubmitting;

  const onSubmit = async () => {
    if (!canSubmit) return;
    dispatch({ type: "submitStart" });
    try {
      const res = await fetch("/api/bookings/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          visitorName: data.visitorName.trim(),
          visitorEmail: data.visitorEmail.trim(),
          visitorCompany: data.visitorCompany.trim() ? data.visitorCompany.trim() : null,
          topic: data.topic.trim(),
          contactMethod: data.contactMethod,
          visitorPhone: data.contactMethod === "whatsapp" ? data.visitorPhone.trim() : null,
          visitorTimezone: data.visitorTimezone,
          startAtIso: data.startAtIso,
          turnstileToken,
          website_url: websiteUrl,
        }),
      });

      if (!res.ok) {
        const body = (await res.json().catch(() => ({}))) as { error?: string };
        dispatch({ type: "submitError", message: body.error ?? `HTTP ${res.status}` });
        return;
      }

      const result = (await res.json()) as { ok: true } & SubmitResult;
      dispatch({ type: "submitSuccess", result });
    } catch (e) {
      dispatch({ type: "submitError", message: (e as Error).message });
    }
  };

  return (
    <StepShell
      label="Confirm your booking"
      continueLabel={isSubmitting ? "Booking…" : "Book the call"}
      canContinue={canSubmit}
      onContinue={onSubmit}
      onBack={() => dispatch({ type: "back" })}
      error={error}
      footnote="We'll email a confirmation with the calendar invite."
    >
      {/* Hidden honeypot field — bots fill this, humans don't see it. The
          `website_url` name matches the field shape bots look for. */}
      <label className={styles.srOnly} htmlFor="book-website-url">Leave this empty</label>
      <input
        id="book-website-url"
        name="website_url"
        type="text"
        tabIndex={-1}
        autoComplete="off"
        value={websiteUrl}
        onChange={(e) => setWebsiteUrl(e.target.value)}
        style={{ position: "absolute", left: "-9999px", width: 1, height: 1, opacity: 0 }}
        aria-hidden="true"
      />
      <div style={{ marginTop: "0.5rem", display: "flex", justifyContent: "center" }}>
        <TurnstileWidget
          onToken={setTurnstileToken}
          onExpire={() => setTurnstileToken("")}
        />
      </div>
    </StepShell>
  );
}
