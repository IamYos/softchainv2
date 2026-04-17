import { addMinutes } from "date-fns";
import type {
  AvailabilityException,
  DayKey,
  HoursRange,
  SettingsDoc,
  Slot,
} from "./types";
import {
  localDateTimeToUtc,
  utcToIsoDateInTz,
} from "./timezone";

type Interval = { startUtc: Date; endUtc: Date };

const DAY_KEYS: DayKey[] = ["sun", "mon", "tue", "wed", "thu", "fri", "sat"];

function dayKeyFromIsoDate(isoDate: string): DayKey {
  const localDate = new Date(
    Date.UTC(
      Number(isoDate.slice(0, 4)),
      Number(isoDate.slice(5, 7)) - 1,
      Number(isoDate.slice(8, 10))
    )
  );
  return DAY_KEYS[localDate.getUTCDay()];
}

function rangeToIntervalOnDate(
  isoDate: string,
  hours: HoursRange,
  tz: string
): Interval {
  return {
    startUtc: localDateTimeToUtc(isoDate, hours.start, tz),
    endUtc: localDateTimeToUtc(isoDate, hours.end, tz),
  };
}

function subtractInterval(base: Interval, sub: Interval): Interval[] {
  if (sub.endUtc <= base.startUtc || sub.startUtc >= base.endUtc) {
    return [base];
  }
  const out: Interval[] = [];
  if (sub.startUtc > base.startUtc) {
    out.push({ startUtc: base.startUtc, endUtc: sub.startUtc });
  }
  if (sub.endUtc < base.endUtc) {
    out.push({ startUtc: sub.endUtc, endUtc: base.endUtc });
  }
  return out;
}

function splitIntoSlots(interval: Interval, minutes: number): Slot[] {
  const slots: Slot[] = [];
  let cursor = interval.startUtc;
  while (addMinutes(cursor, minutes) <= interval.endUtc) {
    const end = addMinutes(cursor, minutes);
    slots.push({ startUtc: cursor, endUtc: end });
    cursor = end;
  }
  return slots;
}

type Args = {
  settings: SettingsDoc;
  rangeStart: Date;
  rangeEnd: Date;
  exceptions: AvailabilityException[];
  existingBookings: Array<{ startAt: Date; endAt: Date }>;
  now: Date;
};

export function computeAvailableSlots(args: Args): Slot[] {
  const { settings, rangeStart, rangeEnd, exceptions, existingBookings, now } = args;
  const { ownerTimezone, defaultHours, rules } = settings;

  const minStart = new Date(now.getTime() + rules.minNoticeHours * 3600 * 1000);
  const maxStart = new Date(now.getTime() + rules.maxLookaheadDays * 86400 * 1000);

  const allSlots: Slot[] = [];
  let cursor = rangeStart;
  for (let i = 0; i < 90 && cursor < rangeEnd; i++) {
    const isoDate = utcToIsoDateInTz(cursor, ownerTimezone);
    const dayKey = dayKeyFromIsoDate(isoDate);

    const intervals: Interval[] = [];
    const dayDefault = defaultHours[dayKey];
    if (dayDefault) {
      intervals.push(rangeToIntervalOnDate(isoDate, dayDefault, ownerTimezone));
    }

    const dayExceptions = exceptions.filter((e) => e.date === isoDate);

    // Subtract blocks.
    for (const ex of dayExceptions) {
      if (ex.type !== "block") continue;
      if (!ex.startTime || !ex.endTime) {
        intervals.length = 0;
        break;
      }
      const blockInterval: Interval = {
        startUtc: localDateTimeToUtc(isoDate, ex.startTime, ownerTimezone),
        endUtc: localDateTimeToUtc(isoDate, ex.endTime, ownerTimezone),
      };
      const next: Interval[] = [];
      for (const base of intervals) {
        next.push(...subtractInterval(base, blockInterval));
      }
      intervals.length = 0;
      intervals.push(...next);
    }

    // Add extras.
    for (const ex of dayExceptions) {
      if (ex.type !== "extra" || !ex.startTime || !ex.endTime) continue;
      intervals.push({
        startUtc: localDateTimeToUtc(isoDate, ex.startTime, ownerTimezone),
        endUtc: localDateTimeToUtc(isoDate, ex.endTime, ownerTimezone),
      });
    }

    for (const interval of intervals) {
      allSlots.push(...splitIntoSlots(interval, rules.slotDurationMinutes));
    }

    // Advance to next local day at midnight.
    const nextDay = new Date(cursor.getTime() + 24 * 3600 * 1000);
    const nextIso = utcToIsoDateInTz(nextDay, ownerTimezone);
    cursor = localDateTimeToUtc(nextIso, "00:00", ownerTimezone);
  }

  return allSlots.filter((slot) => {
    if (slot.startUtc < minStart) return false;
    if (slot.startUtc > maxStart) return false;
    if (slot.startUtc < rangeStart || slot.startUtc >= rangeEnd) return false;
    for (const b of existingBookings) {
      const overlaps = slot.startUtc < b.endAt && slot.endUtc > b.startAt;
      if (overlaps) return false;
    }
    return true;
  });
}
