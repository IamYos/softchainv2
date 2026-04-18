import { NextResponse } from "next/server";
import { z } from "zod";
import { requireAdmin } from "@/lib/auth/adminSession";
import { listBookingsForAdmin, type AdminBookingTab } from "@/lib/firestore/bookings";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const querySchema = z.object({
  tab: z.enum(["upcoming", "past", "cancelled"]).default("upcoming"),
  limit: z.coerce.number().int().min(1).max(500).default(100),
});

export async function GET(req: Request): Promise<Response> {
  try { await requireAdmin(); } catch (e) {
    const err = e as Error & { status?: number };
    return NextResponse.json({ error: err.message }, { status: err.status ?? 401 });
  }
  const url = new URL(req.url);
  const parsed = querySchema.safeParse({
    tab: url.searchParams.get("tab") ?? "upcoming",
    limit: url.searchParams.get("limit") ?? 100,
  });
  if (!parsed.success) return NextResponse.json({ error: "Invalid query" }, { status: 400 });
  const bookings = await listBookingsForAdmin(parsed.data.tab as AdminBookingTab, parsed.data.limit);
  const serialized = bookings.map((b) => ({
    id: b.id,
    visitorName: b.visitorName,
    visitorEmail: b.visitorEmail,
    visitorCompany: b.visitorCompany,
    topic: b.topic,
    contactMethod: b.contactMethod,
    visitorPhone: b.visitorPhone,
    visitorTimezone: b.visitorTimezone,
    startAt: b.startAt.toDate().toISOString(),
    endAt: b.endAt.toDate().toISOString(),
    status: b.status,
    noShow: b.noShow,
    adminNotes: b.adminNotes,
    rescheduleToken: b.rescheduleToken,
    cancelToken: b.cancelToken,
    createdAt: b.createdAt.toDate().toISOString(),
    updatedAt: b.updatedAt.toDate().toISOString(),
  }));
  return NextResponse.json({ bookings: serialized });
}
