"use client";

import type { BookingData, StepId } from "./useBookingState";

type SummaryEntry = { step: StepId; label: string; value: string };

function buildEntries(completed: StepId[], data: BookingData): SummaryEntry[] {
  const entries: SummaryEntry[] = [];
  for (const step of completed) {
    switch (step) {
      case "email":    entries.push({ step, label: "email",    value: data.visitorEmail }); break;
      case "name":     entries.push({ step, label: "name",     value: data.visitorName }); break;
      case "company":  entries.push({ step, label: "company",  value: data.visitorCompany || "—" }); break;
      case "timezone": entries.push({ step, label: "timezone", value: data.visitorTimezone }); break;
      case "date":     entries.push({ step, label: "date",     value: data.selectedDate }); break;
      case "time":     entries.push({ step, label: "time",     value: new Date(data.startAtIso).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", timeZone: data.visitorTimezone }) }); break;
      case "contactMethod": entries.push({ step, label: "via", value: data.contactMethod }); break;
      case "phone":    entries.push({ step, label: "phone",    value: data.visitorPhone }); break;
      case "topic":    entries.push({ step, label: "topic",    value: data.topic.length > 40 ? `${data.topic.slice(0, 40)}…` : data.topic }); break;
      default: break;
    }
  }
  return entries;
}

type Props = {
  completedSteps: StepId[];
  data: BookingData;
  onEdit: (step: StepId) => void;
};

export function StepSummaryStack({ completedSteps, data, onEdit }: Props) {
  const entries = buildEntries(completedSteps, data);
  if (entries.length === 0) return null;

  return (
    <ul
      aria-label="Completed steps"
      style={{
        listStyle: "none",
        padding: 0,
        margin: "0 0 1.5rem 0",
        display: "flex",
        flexDirection: "column",
        gap: "0.35rem",
        alignItems: "center",
      }}
    >
      {entries.map((e) => (
        <li key={e.step}>
          <button
            type="button"
            onClick={() => onEdit(e.step)}
            aria-label={`Edit ${e.label}`}
            style={{
              alignItems: "baseline",
              background: "transparent",
              border: "none",
              color: "#202020",
              cursor: "pointer",
              display: "inline-flex",
              fontFamily: "inherit",
              fontSize: "15px",
              gap: "0.6rem",
              lineHeight: 1.35,
              padding: "0.25rem 0.5rem",
            }}
          >
            <span
              style={{
                fontFamily: "var(--font-aux-mono), monospace",
                fontSize: "11px",
                letterSpacing: "0.04em",
                opacity: 0.6,
                textTransform: "uppercase",
              }}
            >
              {e.label}
            </span>
            <span style={{ fontWeight: 500 }}>{e.value}</span>
            <span
              aria-hidden
              style={{
                fontSize: "12px",
                opacity: 0.55,
              }}
            >
              ✎
            </span>
          </button>
        </li>
      ))}
    </ul>
  );
}
