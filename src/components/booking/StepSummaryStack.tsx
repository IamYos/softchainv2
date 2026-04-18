"use client";

import styles from "@/components/marketing/sf/SFPostFrame.module.css";
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
        gap: "0.25rem",
        alignItems: "center",
      }}
    >
      {entries.map((e) => (
        <li key={e.step}>
          <button
            type="button"
            onClick={() => onEdit(e.step)}
            className={styles.p}
            style={{
              background: "transparent",
              border: "none",
              padding: "0.25rem 0.5rem",
              opacity: 0.55,
              cursor: "pointer",
              fontFamily: "inherit",
              display: "inline-flex",
              gap: "0.5rem",
              alignItems: "baseline",
            }}
          >
            <span style={{ opacity: 0.7 }}>{e.label} —</span>
            <span>{e.value}</span>
            <span style={{ opacity: 0.4 }}>✎</span>
          </button>
        </li>
      ))}
    </ul>
  );
}
