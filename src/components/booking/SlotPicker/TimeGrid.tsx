"use client";

import styles from "@/components/marketing/sf/SFPostFrame.module.css";
import gridStyles from "./TimeGrid.module.css";
import type { SlotIso } from "../groupSlotsByDate";

type TimeGridProps = {
  slots: SlotIso[];
  selectedStartIso: string;
  onSelect: (startIso: string) => void;
  timezone: string;
  ownerTimezone: string;
};

function fmtHHMM(iso: string, tz: string): string {
  return new Intl.DateTimeFormat(undefined, {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
    timeZone: tz,
  }).format(new Date(iso));
}

export function TimeGrid({ slots, selectedStartIso, onSelect, timezone, ownerTimezone }: TimeGridProps) {
  if (slots.length === 0) {
    return (
      <p className={styles.p} style={{ opacity: 0.6, textAlign: "center", margin: "1rem 0" }}>
        No slots on this day — pick another.
      </p>
    );
  }

  const showOwnerHint = timezone !== ownerTimezone;

  return (
    <div role="radiogroup" aria-label="Pick a time" className={gridStyles.grid}>
      {slots.map((s) => {
        const label = fmtHHMM(s.startUtc, timezone);
        const ownerLabel = fmtHHMM(s.startUtc, ownerTimezone);
        const isSelected = s.startUtc === selectedStartIso;
        return (
          <button
            key={s.startUtc}
            type="button"
            role="radio"
            aria-checked={isSelected}
            onClick={() => onSelect(s.startUtc)}
            className={styles.p}
            style={{
              padding: "0.5rem",
              border: `1px solid ${isSelected ? "var(--color-foreground, currentColor)" : "rgba(0,0,0,0.12)"}`,
              borderRadius: "999px",
              background: isSelected ? "var(--color-foreground, currentColor)" : "transparent",
              color: isSelected ? "var(--color-background, white)" : "inherit",
              cursor: "pointer",
              fontFamily: "inherit",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              lineHeight: 1.1,
            }}
            title={showOwnerHint ? `= ${ownerLabel} ${ownerTimezone}` : undefined}
          >
            <span style={{ fontSize: "1rem", fontWeight: 500 }}>{label}</span>
            {showOwnerHint && (
              <span style={{ fontSize: "0.7rem", opacity: 0.6 }}>
                = {ownerLabel} {ownerTimezone}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
