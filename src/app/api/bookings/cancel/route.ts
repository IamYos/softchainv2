import { NextResponse } from "next/server";
import { z } from "zod";
import { findBookingByCancelToken } from "@/lib/firestore/bookings";
import { cancelBooking } from "@/lib/booking/cancel";
import { isValidTokenShape } from "@/lib/booking/tokens";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const bodySchema = z.object({
  token: z.string().refine(isValidTokenShape, "Invalid token shape"),
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

  const booking = await findBookingByCancelToken(parsed.data.token);
  if (!booking) {
    return NextResponse.json(
      { error: "This cancel link is no longer valid." },
      { status: 404 }
    );
  }

  const outcome = await cancelBooking(booking.id);
  if (outcome.kind === "not_found") {
    return NextResponse.json({ error: "Booking not found" }, { status: 404 });
  }
  if (outcome.kind === "already_cancelled") {
    return NextResponse.json({ error: "Already cancelled" }, { status: 409 });
  }
  return NextResponse.json({ ok: true });
}
