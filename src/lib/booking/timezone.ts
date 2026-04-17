import { fromZonedTime, toZonedTime, format } from "date-fns-tz";

export function localDateTimeToUtc(
  isoDate: string,
  hhmm: string,
  timeZone: string
): Date {
  const [hours, minutes] = hhmm.split(":").map(Number);
  const [y, m, d] = isoDate.split("-").map(Number);
  const local = new Date(y, m - 1, d, hours, minutes, 0, 0);
  return fromZonedTime(local, timeZone);
}

export function utcToLocalHHMM(utc: Date, timeZone: string): string {
  return format(toZonedTime(utc, timeZone), "HH:mm", { timeZone });
}

export function utcToIsoDateInTz(utc: Date, timeZone: string): string {
  return format(toZonedTime(utc, timeZone), "yyyy-MM-dd", { timeZone });
}
