import { NextResponse } from "next/server";
import { createBookingInputSchema } from "@/lib/validation/booking";
import { verifyTurnstile } from "@/lib/turnstile/verify";
import { checkRateLimit } from "@/lib/ratelimit";
import { extractIp } from "@/lib/http/ip";
import { getSettings } from "@/lib/firestore/settings";
import { createBookingTransaction } from "@/lib/booking/create";
import { buildIcs } from "@/lib/booking/ics";
import { sendBookingEmail } from "@/lib/email/send";
import { bookingConfirmation } from "@/lib/email/templates/booking-confirmation";
import { adminNewBooking } from "@/lib/email/templates/admin-new-booking";
import { scheduleReminders } from "@/lib/qstash/reminders";
import { firestoreAdmin } from "@/lib/firebase/admin";
import { FieldValue } from "firebase-admin/firestore";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
const RATE_LIMIT_MAX = 3;
const RATE_LIMIT_WINDOW_MS = 10 * 60 * 1000;

function meetingLinkFor(contactLinks: Awaited<ReturnType<typeof getSettings>>["contactLinks"], method: string): string {
  if (method === "zoom") return contactLinks.zoom;
  if (method === "meet") return contactLinks.meet;
  if (method === "teams") return contactLinks.teams;
  return "";
}

export async function POST(req: Request): Promise<Response> {
  let json: unknown;
  try {
    json = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = createBookingInputSchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid input", details: parsed.error.flatten() }, { status: 400 });
  }
  const input = parsed.data;

  if (input.honeypot && input.honeypot.trim().length > 0) {
    return NextResponse.json({ ok: true }, { status: 200 });
  }

  const ip = extractIp(req);
  const rl = checkRateLimit(`book:${ip}`, RATE_LIMIT_MAX, RATE_LIMIT_WINDOW_MS);
  if (!rl.allowed) {
    return NextResponse.json({ error: "Too many attempts, try again later" }, {
      status: 429,
      headers: { "Retry-After": Math.ceil(rl.retryAfterMs / 1000).toString() },
    });
  }

  const turnstileOk = await verifyTurnstile(input.turnstileToken, ip);
  if (!turnstileOk) {
    return NextResponse.json({ error: "Captcha verification failed" }, { status: 400 });
  }

  const settings = await getSettings();
  const startUtc = new Date(input.startAtIso);
  const alignMs = settings.rules.slotDurationMinutes * 60 * 1000;

  // Slot must be aligned to the configured duration (default 30 min). Prevents
  // clients bypassing the UI and booking arbitrary timestamps like 13:07:00Z.
  if (startUtc.getTime() % alignMs !== 0) {
    return NextResponse.json({ error: "Slot must be aligned to the slot duration" }, { status: 400 });
  }

  // Enforce minNoticeHours / maxLookaheadDays — the slot engine applies these
  // in /api/slots; here we defend against direct POSTs bypassing the UI.
  const now = Date.now();
  const minStart = now + settings.rules.minNoticeHours * 3600 * 1000;
  const maxStart = now + settings.rules.maxLookaheadDays * 86400 * 1000;
  if (startUtc.getTime() < minStart) {
    return NextResponse.json({ error: "Slot is too soon" }, { status: 400 });
  }
  if (startUtc.getTime() > maxStart) {
    return NextResponse.json({ error: "Slot is beyond the booking window" }, { status: 400 });
  }

  const endUtc = new Date(startUtc.getTime() + alignMs);

  const outcome = await createBookingTransaction({
    visitorName: input.visitorName,
    visitorEmail: input.visitorEmail,
    visitorCompany: input.visitorCompany,
    topic: input.topic,
    contactMethod: input.contactMethod,
    visitorPhone: input.visitorPhone,
    visitorTimezone: input.visitorTimezone,
    startUtc,
    endUtc,
  });

  if (outcome.kind === "already_booked") {
    return NextResponse.json(
      { error: "You already have an upcoming call — cancel or reschedule it first." },
      { status: 409 }
    );
  }
  if (outcome.kind === "slot_taken") {
    return NextResponse.json({ error: "That slot was just taken. Please pick another." }, { status: 409 });
  }

  const booking = outcome.booking;
  const meetingLink = meetingLinkFor(settings.contactLinks, booking.contactMethod);

  const templateCtx = {
    visitorName: booking.visitorName,
    visitorEmail: booking.visitorEmail,
    visitorTimezone: booking.visitorTimezone,
    ownerTimezone: settings.ownerTimezone,
    startUtc,
    endUtc,
    contactMethod: booking.contactMethod,
    meetingLink,
    topic: booking.topic,
    rescheduleUrl: `${SITE_URL}/reschedule/${booking.rescheduleToken}`,
    cancelUrl: `${SITE_URL}/cancel/${booking.cancelToken}`,
    siteUrl: SITE_URL,
  };

  const ics = buildIcs({
    method: "REQUEST",
    uid: booking.icsUid,
    sequence: 0,
    startUtc,
    endUtc,
    summary: "Call with Softchain",
    description: booking.contactMethod === "whatsapp" ? "Softchain will WhatsApp you." : meetingLink,
    location: meetingLink,
    organizerEmail: "info@softchain.ae",
    attendeeEmail: booking.visitorEmail,
    attendeeName: booking.visitorName,
  });

  const visitor = bookingConfirmation(templateCtx);
  const admin = adminNewBooking({
    ...templateCtx,
    visitorPhone: booking.visitorPhone,
    visitorCompany: booking.visitorCompany,
  });

  const emailResults = await Promise.allSettled([
    sendBookingEmail({ to: booking.visitorEmail, ...visitor, icsContent: ics, icsMethod: "REQUEST" }),
    sendBookingEmail({ to: settings.ownerEmail, ...admin, icsContent: ics, icsMethod: "REQUEST" }),
  ]);
  emailResults.forEach((r, i) => {
    if (r.status === "rejected") {
      console.error(`[create-booking] email ${i} failed`, r.reason);
    }
  });

  let reminderIds: { h24: string | null; m15: string | null } = { h24: null, m15: null };
  try {
    reminderIds = await scheduleReminders({ bookingId: booking.id, startAt: startUtc, siteUrl: SITE_URL });
    await firestoreAdmin().collection("bookings").doc(booking.id).update({
      reminderJobIds: reminderIds,
      updatedAt: FieldValue.serverTimestamp(),
    });
  } catch (err) {
    console.error("[create-booking] scheduleReminders failed", err);
  }

  return NextResponse.json({
    ok: true,
    bookingId: booking.id,
    rescheduleUrl: templateCtx.rescheduleUrl,
    cancelUrl: templateCtx.cancelUrl,
    startUtc: startUtc.toISOString(),
    endUtc: endUtc.toISOString(),
  });
}
