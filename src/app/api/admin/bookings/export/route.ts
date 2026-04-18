import { requireAdmin } from "@/lib/auth/adminSession";
import { listBookingsForAdmin } from "@/lib/firestore/bookings";
import { buildCsv } from "@/lib/csv/buildCsv";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(): Promise<Response> {
  try { await requireAdmin(); } catch (e) {
    const err = e as Error & { status?: number };
    return new Response(JSON.stringify({ error: err.message }), { status: err.status ?? 401 });
  }

  const [upcoming, past, cancelled] = await Promise.all([
    listBookingsForAdmin("upcoming", 500),
    listBookingsForAdmin("past", 500),
    listBookingsForAdmin("cancelled", 500),
  ]);
  const all = [...upcoming, ...past, ...cancelled];

  const rows = all.map((b) => ({
    id: b.id,
    status: b.status,
    startAtUtc: b.startAt.toDate().toISOString(),
    endAtUtc: b.endAt.toDate().toISOString(),
    visitorName: b.visitorName,
    visitorEmail: b.visitorEmail,
    visitorCompany: b.visitorCompany ?? "",
    visitorTimezone: b.visitorTimezone,
    contactMethod: b.contactMethod,
    visitorPhone: b.visitorPhone ?? "",
    topic: b.topic,
    noShow: b.noShow ? "yes" : "no",
    adminNotes: b.adminNotes ?? "",
    createdAtUtc: b.createdAt.toDate().toISOString(),
  }));

  const csv = buildCsv(
    [
      "id", "status", "startAtUtc", "endAtUtc",
      "visitorName", "visitorEmail", "visitorCompany", "visitorTimezone",
      "contactMethod", "visitorPhone", "topic", "noShow", "adminNotes", "createdAtUtc",
    ],
    rows
  );

  return new Response(csv, {
    status: 200,
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="softchain-bookings-${new Date().toISOString().slice(0, 10)}.csv"`,
    },
  });
}
