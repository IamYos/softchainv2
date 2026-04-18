import { getSettings } from "@/lib/firestore/settings";
import { listBookingsForAdmin } from "@/lib/firestore/bookings";
import { buildIcsFeed } from "@/lib/booking/ics";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// Public ICS feed. Authenticated via an unguessable secret in the URL
// (rotatable from /admin/settings). Emits all confirmed bookings upcoming +
// the last 90 days past, so subscribers see recent history too.
export async function GET(
  _req: Request,
  ctx: { params: Promise<{ secret: string }> }
): Promise<Response> {
  const { secret } = await ctx.params;
  const settings = await getSettings();
  if (!settings.icsFeedSecret || secret !== settings.icsFeedSecret) {
    return new Response("Not found", { status: 404 });
  }

  const upcoming = await listBookingsForAdmin("upcoming", 500);
  const past = await listBookingsForAdmin("past", 500);
  const cutoff = Date.now() - 90 * 86400 * 1000;
  const pastWindow = past.filter((b) => b.startAt.toMillis() > cutoff);

  const events = [...upcoming, ...pastWindow].map((b) => ({
    uid: b.icsUid,
    sequence: b.icsSequence,
    startUtc: b.startAt.toDate(),
    endUtc: b.endAt.toDate(),
    summary: `Call: ${b.visitorName}`,
    description: `${b.topic}\n\nvia ${b.contactMethod}${b.visitorEmail ? ` · ${b.visitorEmail}` : ""}`,
    location: "",
    status: "CONFIRMED" as const,
  }));

  const ics = buildIcsFeed(events);
  return new Response(ics, {
    status: 200,
    headers: {
      "Content-Type": "text/calendar; charset=utf-8",
      "Content-Disposition": 'inline; filename="softchain-bookings.ics"',
      "Cache-Control": "private, max-age=60",
    },
  });
}
