"use client";

import { useMemo } from "react";
import { StepShell } from "../StepShell";
import { TimeGrid } from "../SlotPicker/TimeGrid";
import { useAvailableSlots } from "../useAvailableSlots";
import { groupSlotsByDate } from "../groupSlotsByDate";
import type { Action } from "../useBookingState";
import type { Dispatch } from "react";

type Props = {
  timezone: string;
  selectedDate: string;
  startAtIso: string;
  error: string | null;
  dispatch: Dispatch<Action>;
};

const LOOKAHEAD_DAYS = 14;

export function StepTime({ timezone, selectedDate, startAtIso, error, dispatch }: Props) {
  const state = useAvailableSlots(timezone, LOOKAHEAD_DAYS);

  const { slots, ownerTz } = useMemo(() => {
    if (state.status !== "ready") return { slots: [], ownerTz: "Asia/Dubai" };
    const grouped = groupSlotsByDate(state.slots, timezone);
    return {
      slots: grouped[selectedDate] ?? [],
      ownerTz: state.ownerTimezone,
    };
  }, [state, timezone, selectedDate]);

  return (
    <StepShell
      label="Pick a time"
      canContinue={startAtIso.length > 0}
      onContinue={() => dispatch({ type: "advance" })}
      onBack={() => dispatch({ type: "back" })}
      error={error ?? (state.status === "error" ? state.message : null)}
      footnote={
        state.status === "loading"
          ? "Loading times…"
          : timezone === ownerTz
            ? "All slots are 30 minutes."
            : "All slots are 30 minutes. Times in your local zone; Dubai shown below."
      }
    >
      <TimeGrid
        slots={slots}
        selectedStartIso={startAtIso}
        onSelect={(iso) => dispatch({ type: "setField", field: "startAtIso", value: iso })}
        timezone={timezone}
        ownerTimezone={ownerTz}
      />
    </StepShell>
  );
}
