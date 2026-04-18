import { NextResponse } from "next/server";
import { z } from "zod";
import { qstashReceiver } from "@/lib/qstash/client";
import { getBookingById } from "@/lib/firestore/bookings";
import { getSettings } from "@/lib/firestore/settings";
import { sendBookingEmail } from "@/lib/email/send";
import { reminder24h } from "@/lib/email/templates/reminder-24h";
import { reminder15m } from "@/lib/email/templates/reminder-15m";
import { adminWhatsappPrompt } from "@/lib/email/templates/admin-whatsapp-prompt";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

const bodySchema = z.object({
  bookingId: z.string().min(1),
  kind: z.enum(["h24", "m15"]),
});

export async function POST(req: Request): Promise<Response> {
  const sig = req.headers.get("upstash-signature");
  const rawBody = await req.text();
  if (!sig) {
    return NextResponse.json({ error: "Missing signature" }, { status: 401 });
  }
  try {
    const ok = await qstashReceiver().verify({
      signature: sig,
      body: rawBody,
    });
    if (!ok) return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
  } catch {
    return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
  }

  let json: unknown;
  try {
    json = JSON.parse(rawBody);
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }
  const parsed = bodySchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid body" }, { status: 400 });
  }

  const booking = await getBookingById(parsed.data.bookingId);
  if (!booking) {
    return NextResponse.json({ ok: true, skipped: "booking-missing" });
  }
  if (booking.status !== "confirmed") {
    return NextResponse.json({ ok: true, skipped: "not-confirmed" });
  }

  const settings = await getSettings();
  const meetingLink = booking.contactMethod === "zoom" ? settings.contactLinks.zoom
    : booking.contactMethod === "meet" ? settings.contactLinks.meet
    : booking.contactMethod === "teams" ? settings.contactLinks.teams
    : "";

  const ctx = {
    visitorName: booking.visitorName,
    visitorEmail: booking.visitorEmail,
    visitorTimezone: booking.visitorTimezone,
    ownerTimezone: settings.ownerTimezone,
    startUtc: booking.startAt.toDate(),
    endUtc: booking.endAt.toDate(),
    contactMethod: booking.contactMethod,
    meetingLink,
    topic: booking.topic,
    rescheduleUrl: `${SITE_URL}/reschedule/${booking.rescheduleToken}`,
    cancelUrl: `${SITE_URL}/cancel/${booking.cancelToken}`,
    siteUrl: SITE_URL,
  };

  if (parsed.data.kind === "h24") {
    const email = reminder24h(ctx);
    await sendBookingEmail({ to: booking.visitorEmail, ...email });
    return NextResponse.json({ ok: true, sent: "reminder-24h" });
  }

  if (booking.contactMethod === "whatsapp") {
    if (!booking.visitorPhone) {
      return NextResponse.json({ ok: true, skipped: "whatsapp-no-phone" });
    }
    const email = adminWhatsappPrompt({ ...ctx, visitorPhone: booking.visitorPhone });
    await sendBookingEmail({ to: settings.ownerEmail, ...email });
    return NextResponse.json({ ok: true, sent: "admin-whatsapp-prompt" });
  }

  const email = reminder15m(ctx);
  await sendBookingEmail({ to: booking.visitorEmail, ...email });
  return NextResponse.json({ ok: true, sent: "reminder-15m" });
}
