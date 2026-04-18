import { schedule, cancel } from "./client";

export type ReminderKind = "h24" | "m15";

function reminderUrl(siteUrl: string): string {
  return `${siteUrl.replace(/\/$/, "")}/api/bookings/reminder`;
}

export async function scheduleReminders(args: {
  bookingId: string;
  startAt: Date;
  siteUrl: string;
}): Promise<{ h24: string | null; m15: string | null }> {
  const { bookingId, startAt, siteUrl } = args;
  const now = Date.now();

  const h24At = new Date(startAt.getTime() - 24 * 3600 * 1000);
  const m15At = new Date(startAt.getTime() - 15 * 60 * 1000);

  const url = reminderUrl(siteUrl);

  const h24Id = h24At.getTime() > now
    ? await schedule({ url, body: { bookingId, kind: "h24" }, notBefore: h24At })
    : null;
  const m15Id = m15At.getTime() > now
    ? await schedule({ url, body: { bookingId, kind: "m15" }, notBefore: m15At })
    : null;

  return { h24: h24Id, m15: m15Id };
}

export async function cancelReminders(reminderJobIds: { h24: string | null; m15: string | null }): Promise<void> {
  const ids = [reminderJobIds.h24, reminderJobIds.m15].filter((v): v is string => !!v);
  await Promise.all(ids.map((id) => cancel(id).catch(() => undefined)));
}
