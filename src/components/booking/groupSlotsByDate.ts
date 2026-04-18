import { utcToIsoDateInTz } from "@/lib/booking/timezone";

export type SlotIso = { startUtc: string; endUtc: string };

export function groupSlotsByDate(
  slots: SlotIso[],
  timezone: string
): Record<string, SlotIso[]> {
  const grouped: Record<string, SlotIso[]> = {};
  for (const slot of slots) {
    const dateKey = utcToIsoDateInTz(new Date(slot.startUtc), timezone);
    if (!grouped[dateKey]) grouped[dateKey] = [];
    grouped[dateKey].push(slot);
  }
  return grouped;
}
