import { NextResponse } from "next/server";
import { z } from "zod";
import { getSettings } from "@/lib/firestore/settings";
import { listExceptions } from "@/lib/firestore/availability";
import { listConfirmedBookingsInRange } from "@/lib/firestore/bookings";
import { computeAvailableSlots } from "@/lib/booking/slots";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const querySchema = z.object({
  fromIso: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  toIso: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  tz: z.string().min(1),
});

export async function GET(req: Request): Promise<Response> {
  const url = new URL(req.url);
  const parsed = querySchema.safeParse({
    fromIso: url.searchParams.get("from") ?? "",
    toIso: url.searchParams.get("to") ?? "",
    tz: url.searchParams.get("tz") ?? "",
  });
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid query params" }, { status: 400 });
  }

  try {
    new Intl.DateTimeFormat(undefined, { timeZone: parsed.data.tz });
  } catch {
    return NextResponse.json({ error: "Invalid timezone" }, { status: 400 });
  }

  const settings = await getSettings();
  const rangeStart = new Date(`${parsed.data.fromIso}T00:00:00Z`);
  const rangeEnd = new Date(`${parsed.data.toIso}T00:00:00Z`);
  if (rangeEnd <= rangeStart) {
    return NextResponse.json({ error: "to must be after from" }, { status: 400 });
  }

  const MAX_RANGE_DAYS = 45;
  if (rangeEnd.getTime() - rangeStart.getTime() > MAX_RANGE_DAYS * 86400 * 1000) {
    return NextResponse.json({ error: "Range too large" }, { status: 400 });
  }

  const [exceptions, existing] = await Promise.all([
    listExceptions(parsed.data.fromIso, parsed.data.toIso),
    listConfirmedBookingsInRange(rangeStart, rangeEnd),
  ]);

  const now = new Date();
  const slots = computeAvailableSlots({
    settings,
    rangeStart,
    rangeEnd,
    exceptions,
    existingBookings: existing.map((b) => ({ startAt: b.startAt.toDate(), endAt: b.endAt.toDate() })),
    now,
  });

  return NextResponse.json({
    visitorTimezone: parsed.data.tz,
    ownerTimezone: settings.ownerTimezone,
    slots: slots.map((s) => ({
      startUtc: s.startUtc.toISOString(),
      endUtc: s.endUtc.toISOString(),
    })),
  });
}
