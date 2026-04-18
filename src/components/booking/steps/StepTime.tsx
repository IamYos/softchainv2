"use client";

import { useEffect, useMemo, useRef } from "react";
import { StepShell } from "../StepShell";
import { TimeGrid } from "../SlotPicker/TimeGrid";
import { groupSlotsByDate } from "../groupSlotsByDate";
import type { SlotsFetchState } from "../useAvailableSlots";
import type { Action } from "../useBookingState";
import type { Dispatch } from "react";

type Props = {
  timezone: string;
  selectedDate: string;
  startAtIso: string;
  error: string | null;
  dispatch: Dispatch<Action>;
  slots: SlotsFetchState;
};

export function StepTime({ timezone, selectedDate, startAtIso, error, dispatch, slots }: Props) {
  const gridRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (slots.status !== "ready" || startAtIso) return;
    const first = gridRef.current?.querySelector<HTMLButtonElement>(
      "button:not([disabled])"
    );
    first?.focus();
  }, [slots.status, selectedDate, startAtIso]);

  const { daySlots, ownerTz } = useMemo(() => {
    if (slots.status !== "ready") return { daySlots: [], ownerTz: "Asia/Dubai" };
    const grouped = groupSlotsByDate(slots.slots, timezone);
    return {
      daySlots: grouped[selectedDate] ?? [],
      ownerTz: slots.ownerTimezone,
    };
  }, [slots, timezone, selectedDate]);

  return (
    <StepShell
      label="Pick a time"
      canContinue={startAtIso.length > 0}
      onContinue={() => dispatch({ type: "advance" })}
      onBack={() => dispatch({ type: "back" })}
      error={error ?? (slots.status === "error" ? slots.message : null)}
      footnote={
        slots.status === "loading"
          ? "Loading times…"
          : timezone === ownerTz
            ? "All slots are 30 minutes."
            : "All slots are 30 minutes. Times in your local zone; Dubai shown below."
      }
    >
      <div ref={gridRef} style={{ width: "100%" }}>
        <TimeGrid
          slots={daySlots}
          selectedStartIso={startAtIso}
          onSelect={(iso) => dispatch({ type: "setField", field: "startAtIso", value: iso })}
          timezone={timezone}
          ownerTimezone={ownerTz}
        />
      </div>
    </StepShell>
  );
}
