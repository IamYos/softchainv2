import { NextResponse } from "next/server";
import { z } from "zod";
import { findBookingByRescheduleToken } from "@/lib/firestore/bookings";
import { rescheduleBooking } from "@/lib/booking/reschedule";
import { requireAdmin } from "@/lib/auth/adminSession";
import { isValidTokenShape } from "@/lib/booking/tokens";
import { getSettings } from "@/lib/firestore/settings";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const utcIsoSchema = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d{3})?Z$/, "newStartAtIso must be UTC (end in Z)")
  .refine((s) => !Number.isNaN(new Date(s).getTime()), "Invalid date");

const bodySchema = z
  .object({
    newStartAtIso: utcIsoSchema,
    token: z.string().refine(isValidTokenShape).optional(),
    bookingId: z.string().min(1).optional(),
  })
  .refine((d) => !!d.token || !!d.bookingId, {
    message: "Provide either token or bookingId",
  });

export async function POST(req: Request): Promise<Response> {
  let json: unknown;
  try {
    json = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }
  const parsed = bodySchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid input" }, { status: 400 });
  }
  const { newStartAtIso, token, bookingId } = parsed.data;

  // Resolve booking id via either the visitor token or admin session.
  let resolvedId: string;
  if (token) {
    const booking = await findBookingByRescheduleToken(token);
    if (!booking) {
      return NextResponse.json(
        { error: "This reschedule link is no longer valid." },
        { status: 404 }
      );
    }
    resolvedId = booking.id;
  } else {
    try {
      await requireAdmin();
    } catch (e) {
      const err = e as Error & { status?: number };
      return NextResponse.json({ error: err.message }, { status: err.status ?? 401 });
    }
    resolvedId = bookingId!;
  }

  // Enforce slot alignment + rules (minNotice, maxLookahead).
  const settings = await getSettings();
  const newStartUtc = new Date(newStartAtIso);
  const alignMs = settings.rules.slotDurationMinutes * 60 * 1000;
  if (newStartUtc.getTime() % alignMs !== 0) {
    return NextResponse.json({ error: "Slot must be aligned to the slot duration" }, { status: 400 });
  }
  const now = Date.now();
  if (newStartUtc.getTime() < now + settings.rules.minNoticeHours * 3600 * 1000) {
    return NextResponse.json({ error: "New slot is too soon" }, { status: 400 });
  }
  if (newStartUtc.getTime() > now + settings.rules.maxLookaheadDays * 86400 * 1000) {
    return NextResponse.json({ error: "New slot is beyond the booking window" }, { status: 400 });
  }

  const outcome = await rescheduleBooking(resolvedId, newStartUtc);
  if (outcome.kind === "not_found") {
    return NextResponse.json({ error: "Booking not found" }, { status: 404 });
  }
  if (outcome.kind === "already_cancelled") {
    return NextResponse.json({ error: "Booking already cancelled" }, { status: 409 });
  }
  if (outcome.kind === "past_booking") {
    return NextResponse.json({ error: "Cannot reschedule past bookings" }, { status: 409 });
  }
  if (outcome.kind === "slot_taken") {
    return NextResponse.json({ error: "That slot was just taken. Please pick another." }, { status: 409 });
  }

  return NextResponse.json({
    ok: true,
    startUtc: outcome.booking.startAt.toDate().toISOString(),
    endUtc: outcome.booking.endAt.toDate().toISOString(),
  });
}
