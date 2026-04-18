"use client";

import { useEffect, useState } from "react";
import styles from "@/components/marketing/sf/SFPostFrame.module.css";
import { localDateTimeToUtc } from "@/lib/booking/timezone";

type DateStripProps = {
  days: string[];                // ["YYYY-MM-DD", ...]
  availability: Record<string, boolean>;
  selected: string;
  onSelect: (date: string) => void;
  timezone: string;
};

const MOBILE_WINDOW = 7;
const MOBILE_MQ = "(max-width: 749px)";

function labelForIsoDate(iso: string, timezone: string): { weekday: string; day: string } {
  // Anchor on noon in the visitor's timezone to avoid DST / date-rollover
  // edge cases. localDateTimeToUtc interprets "12:00" as wall-clock in tz.
  const anchor = localDateTimeToUtc(iso, "12:00", timezone);
  const weekday = new Intl.DateTimeFormat(undefined, {
    weekday: "short",
    timeZone: timezone,
  }).format(anchor);
  const day = new Intl.DateTimeFormat(undefined, {
    day: "numeric",
    timeZone: timezone,
  }).format(anchor);
  return { weekday, day };
}

function useIsMobile(): boolean {
  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    if (typeof window === "undefined") return;
    const mq = window.matchMedia(MOBILE_MQ);
    const update = () => setIsMobile(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);
  return isMobile;
}

export function DateStrip({ days, availability, selected, onSelect, timezone }: DateStripProps) {
  const isMobile = useIsMobile();
  const [offset, setOffset] = useState(0);

  const visibleDays = isMobile
    ? days.slice(offset, offset + MOBILE_WINDOW)
    : days;

  const canPrev = isMobile && offset > 0;
  const canNext = isMobile && offset + MOBILE_WINDOW < days.length;

  return (
    <div style={{ display: "flex", alignItems: "center", gap: "0.25rem", width: "100%" }}>
      {isMobile && (
        <button
          type="button"
          aria-label="Previous days"
          disabled={!canPrev}
          onClick={() => setOffset((o) => Math.max(0, o - MOBILE_WINDOW))}
          style={{
            padding: "0.4rem 0.5rem",
            border: "1px solid rgba(0,0,0,0.12)",
            borderRadius: "999px",
            background: "transparent",
            cursor: canPrev ? "pointer" : "not-allowed",
            opacity: canPrev ? 1 : 0.3,
            fontFamily: "inherit",
            flexShrink: 0,
          }}
        >
          ‹
        </button>
      )}

      <div
        role="radiogroup"
        aria-label="Pick a date"
        style={{
          display: "flex",
          gap: "0.5rem",
          overflowX: isMobile ? "hidden" : "auto",
          padding: "0.25rem 0",
          flex: 1,
          minWidth: 0,
          justifyContent: isMobile ? "space-between" : "flex-start",
        }}
      >
        {visibleDays.map((iso) => {
          const { weekday, day } = labelForIsoDate(iso, timezone);
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
                flexShrink: 0,
              }}
            >
              <span style={{ fontSize: "0.75rem", opacity: 0.7 }}>{weekday}</span>
              <span style={{ fontSize: "1.1rem", fontWeight: 500 }}>{day}</span>
            </button>
          );
        })}
      </div>

      {isMobile && (
        <button
          type="button"
          aria-label="Next days"
          disabled={!canNext}
          onClick={() => setOffset((o) => Math.min(days.length - MOBILE_WINDOW, o + MOBILE_WINDOW))}
          style={{
            padding: "0.4rem 0.5rem",
            border: "1px solid rgba(0,0,0,0.12)",
            borderRadius: "999px",
            background: "transparent",
            cursor: canNext ? "pointer" : "not-allowed",
            opacity: canNext ? 1 : 0.3,
            fontFamily: "inherit",
            flexShrink: 0,
          }}
        >
          ›
        </button>
      )}
    </div>
  );
}
