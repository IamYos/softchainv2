"use client";

import { useEffect, useRef } from "react";
import styles from "@/components/marketing/sf/SFPostFrame.module.css";
import { localDateTimeToUtc } from "@/lib/booking/timezone";

type DateStripProps = {
  days: string[]; // ["YYYY-MM-DD", ...]
  availability: Record<string, boolean>;
  selected: string;
  onSelect: (date: string) => void;
  timezone: string;
};

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

export function DateStrip({ days, availability, selected, onSelect, timezone }: DateStripProps) {
  const scrollerRef = useRef<HTMLDivElement>(null);

  // Scroll the currently-selected chip into view whenever the selection
  // changes — keeps touch users oriented when they edit back to this step.
  useEffect(() => {
    if (!selected || !scrollerRef.current) return;
    const el = scrollerRef.current.querySelector<HTMLButtonElement>(
      `[data-iso="${selected}"]`,
    );
    el?.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "center" });
  }, [selected]);

  return (
    <div
      ref={scrollerRef}
      role="radiogroup"
      aria-label="Pick a date"
      className="no-scrollbar"
      style={{
        display: "flex",
        gap: "0.5rem",
        overflowX: "auto",
        padding: "0.25rem 0.25rem",
        width: "100%",
        scrollSnapType: "x mandatory",
        WebkitOverflowScrolling: "touch",
        touchAction: "pan-x",
      }}
    >
      {days.map((iso) => {
        const { weekday, day } = labelForIsoDate(iso, timezone);
        const hasSlots = availability[iso] === true;
        const isSelected = selected === iso;
        return (
          <button
            key={iso}
            type="button"
            role="radio"
            data-iso={iso}
            aria-checked={isSelected}
            disabled={!hasSlots}
            onClick={() => hasSlots && onSelect(iso)}
            className={styles.p}
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              minWidth: "3.75rem",
              padding: "0.5rem 0.5rem",
              border: `1px solid ${isSelected ? "#202020" : "rgba(32,32,32,0.2)"}`,
              borderRadius: "999px",
              background: isSelected ? "#202020" : "transparent",
              color: isSelected ? "#ff5841" : "inherit",
              opacity: hasSlots ? 1 : 0.3,
              cursor: hasSlots ? "pointer" : "not-allowed",
              fontFamily: "inherit",
              lineHeight: 1.1,
              flexShrink: 0,
              scrollSnapAlign: "center",
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
