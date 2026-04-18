"use client";

import styles from "@/components/marketing/sf/SFPostFrame.module.css";

type DateStripProps = {
  days: string[];                // ["YYYY-MM-DD", ...] — 14 entries
  availability: Record<string, boolean>;
  selected: string;
  onSelect: (date: string) => void;
  timezone: string;
};

function formatDayLabel(iso: string, timezone: string): { weekday: string; day: string } {
  const d = new Date(`${iso}T12:00:00Z`); // noon avoids DST boundary issues
  const weekday = new Intl.DateTimeFormat(undefined, { weekday: "short", timeZone: timezone }).format(d);
  const day = new Intl.DateTimeFormat(undefined, { day: "numeric", timeZone: timezone }).format(d);
  return { weekday, day };
}

export function DateStrip({ days, availability, selected, onSelect, timezone }: DateStripProps) {
  return (
    <div
      role="radiogroup"
      aria-label="Pick a date"
      style={{
        display: "flex",
        gap: "0.5rem",
        overflowX: "auto",
        padding: "0.25rem 0",
        width: "100%",
      }}
    >
      {days.map((iso) => {
        const { weekday, day } = formatDayLabel(iso, timezone);
        const hasSlots = availability[iso] === true;
        const isSelected = selected === iso;
        return (
          <button
            key={iso}
            type="button"
            role="radio"
            aria-checked={isSelected}
            disabled={!hasSlots}
            onClick={() => hasSlots && onSelect(iso)}
            className={styles.p}
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              minWidth: "3.5rem",
              padding: "0.5rem 0.5rem",
              border: `1px solid ${isSelected ? "var(--color-foreground, currentColor)" : "rgba(0,0,0,0.12)"}`,
              borderRadius: "999px",
              background: isSelected ? "var(--color-foreground, currentColor)" : "transparent",
              color: isSelected ? "var(--color-background, white)" : "inherit",
              opacity: hasSlots ? 1 : 0.3,
              cursor: hasSlots ? "pointer" : "not-allowed",
              fontFamily: "inherit",
              lineHeight: 1.1,
            }}
          >
            <span style={{ fontSize: "0.75rem", opacity: 0.7 }}>{weekday}</span>
            <span style={{ fontSize: "1.1rem", fontWeight: 500 }}>{day}</span>
          </button>
        );
      })}
    </div>
  );
}
