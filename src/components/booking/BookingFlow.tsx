"use client";

import styles from "@/components/marketing/sf/SFPostFrame.module.css";
import { useBookingState } from "./useBookingState";
import { useAvailableSlots } from "./useAvailableSlots";
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

const LOOKAHEAD_DAYS = 14;

export function BookingFlow() {
  const [state, dispatch] = useBookingState();
  const { currentStep, data, stepError, isSubmitting, result, completedSteps } = state;

  // Single slots fetch for the whole flow. Idle until visitorTimezone is set,
  // then /api/slots is hit once; StepDate/StepTime read from this shared state.
  // Also serves as the source of truth for ownerTimezone (used by the
  // confirmation card) — no separate fetch needed.
  const slots = useAvailableSlots(data.visitorTimezone, LOOKAHEAD_DAYS);
  const ownerTimezone = slots.status === "ready" ? slots.ownerTimezone : "Asia/Dubai";

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
          slots={slots}
        />
      )}
      {currentStep === "time" && (
        <StepTime
          timezone={data.visitorTimezone}
          selectedDate={data.selectedDate}
          startAtIso={data.startAtIso}
          error={stepError}
          dispatch={dispatch}
          slots={slots}
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
