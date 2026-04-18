"use client";

import { useEffect, useMemo, useRef } from "react";
import { utcToIsoDateInTz } from "@/lib/booking/timezone";
import styles from "@/components/marketing/sf/SFPostFrame.module.css";
import { StepShell } from "../StepShell";
import { DateStrip } from "../SlotPicker/DateStrip";
import { groupSlotsByDate } from "../groupSlotsByDate";
import type { SlotsFetchState } from "../useAvailableSlots";
import type { Action } from "../useBookingState";
import type { Dispatch } from "react";

type Props = {
  timezone: string;
  selectedDate: string;
  error: string | null;
  dispatch: Dispatch<Action>;
  slots: SlotsFetchState;
};

const LOOKAHEAD_DAYS = 14;

export function StepDate({ timezone, selectedDate, error, dispatch, slots }: Props) {
  const stripRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (slots.status !== "ready" || selectedDate) return;
    const first = stripRef.current?.querySelector<HTMLButtonElement>(
      "button:not([disabled])"
    );
    first?.focus();
  }, [slots.status, selectedDate]);

  const { days, availability } = useMemo(() => {
    const out: string[] = [];
    const now = new Date();
    for (let i = 0; i < LOOKAHEAD_DAYS; i++) {
      const d = new Date(now.getTime() + i * 86400 * 1000);
      out.push(utcToIsoDateInTz(d, timezone));
    }
    if (slots.status !== "ready") {
      return { days: out, availability: {} as Record<string, boolean> };
    }
    const grouped = groupSlotsByDate(slots.slots, timezone);
    const map: Record<string, boolean> = {};
    for (const iso of out) map[iso] = (grouped[iso]?.length ?? 0) > 0;
    return { days: out, availability: map };
  }, [slots, timezone]);

  return (
    <StepShell
      label="Pick a date"
      canContinue={selectedDate.length > 0}
      onContinue={() => dispatch({ type: "advance" })}
      onBack={() => dispatch({ type: "back" })}
      error={error ?? (slots.status === "error" ? slots.message : null)}
      footnote={
        slots.status === "loading" ? "Finding available days…" : "Pick a day with open slots."
      }
    >
      <div ref={stripRef} className={styles.p} style={{ width: "100%", overflowX: "auto" }}>
        <DateStrip
          days={days}
          availability={availability}
          selected={selectedDate}
          onSelect={(d) => dispatch({ type: "setField", field: "selectedDate", value: d })}
          timezone={timezone}
        />
      </div>
    </StepShell>
  );
}
