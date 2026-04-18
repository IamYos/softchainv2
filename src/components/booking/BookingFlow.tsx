"use client";

import { useEffect, useState } from "react";
import styles from "@/components/marketing/sf/SFPostFrame.module.css";
import { useBookingState } from "./useBookingState";
import { StepSummaryStack } from "./StepSummaryStack";
import { StepEmail } from "./steps/StepEmail";
import { StepName } from "./steps/StepName";
import { StepCompany } from "./steps/StepCompany";
import { StepTimezone } from "./steps/StepTimezone";
import { StepDate } from "./steps/StepDate";
import { StepTime } from "./steps/StepTime";
import { StepContactMethod } from "./steps/StepContactMethod";
import { StepPhone } from "./steps/StepPhone";
import { StepTopic } from "./steps/StepTopic";
import { StepSubmit } from "./steps/StepSubmit";
import { BookingConfirmationCard } from "./BookingConfirmationCard";
import { useVisitorTimezone } from "./useVisitorTimezone";

export function BookingFlow() {
  const [state, dispatch] = useBookingState();
  const detected = useVisitorTimezone();
  const [ownerTimezone, setOwnerTimezone] = useState("Asia/Dubai");

  // Fetch owner timezone once so the confirmation card can show "= Dubai".
  useEffect(() => {
    if (!detected) return;
    const fromIso = new Date().toISOString().slice(0, 10);
    const toDate = new Date(Date.now() + 86400 * 1000);
    const toIso = toDate.toISOString().slice(0, 10);
    fetch(`/api/slots?from=${fromIso}&to=${toIso}&tz=${encodeURIComponent(detected)}`)
      .then((res) => (res.ok ? res.json() : null))
      .then((body: { ownerTimezone?: string } | null) => {
        if (body?.ownerTimezone) setOwnerTimezone(body.ownerTimezone);
      })
      .catch(() => {
        /* non-fatal — keep the default */
      });
  }, [detected]);

  const { currentStep, data, stepError, isSubmitting, result, completedSteps } = state;

  const showStack = currentStep !== "email" && currentStep !== "confirmation";

  return (
    <>
      <h2 className={`${styles.contactTitle} ${styles.t4}`}>
        <span>Book a 30-minute call</span>
        <span className={styles.contactTitleSlash}> / </span>
        <span>
          {currentStep === "confirmation"
            ? "see you soon."
            : "start with your email."}
        </span>
      </h2>

      {showStack && (
        <StepSummaryStack
          completedSteps={completedSteps}
          data={data}
          onEdit={(step) => dispatch({ type: "edit", step })}
        />
      )}

      {currentStep === "email" && (
        <StepEmail value={data.visitorEmail} error={stepError} dispatch={dispatch} />
      )}
      {currentStep === "name" && (
        <StepName value={data.visitorName} error={stepError} dispatch={dispatch} />
      )}
      {currentStep === "company" && (
        <StepCompany value={data.visitorCompany} error={stepError} dispatch={dispatch} />
      )}
      {currentStep === "timezone" && (
        <StepTimezone value={data.visitorTimezone} error={stepError} dispatch={dispatch} />
      )}
      {currentStep === "date" && (
        <StepDate
          timezone={data.visitorTimezone}
          selectedDate={data.selectedDate}
          error={stepError}
          dispatch={dispatch}
        />
      )}
      {currentStep === "time" && (
        <StepTime
          timezone={data.visitorTimezone}
          selectedDate={data.selectedDate}
          startAtIso={data.startAtIso}
          error={stepError}
          dispatch={dispatch}
        />
      )}
      {currentStep === "contactMethod" && (
        <StepContactMethod value={data.contactMethod} error={stepError} dispatch={dispatch} />
      )}
      {currentStep === "phone" && (
        <StepPhone value={data.visitorPhone} error={stepError} dispatch={dispatch} />
      )}
      {currentStep === "topic" && (
        <StepTopic value={data.topic} error={stepError} dispatch={dispatch} />
      )}
      {currentStep === "submit" && (
        <StepSubmit
          data={data}
          error={stepError}
          isSubmitting={isSubmitting}
          dispatch={dispatch}
        />
      )}
      {currentStep === "confirmation" && result && (
        <BookingConfirmationCard
          data={data}
          result={result}
          ownerTimezone={ownerTimezone}
        />
      )}
    </>
  );
}
