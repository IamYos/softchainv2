import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth/adminSession";
import { cancelBooking } from "@/lib/booking/cancel";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(_req: Request, ctx: { params: Promise<{ id: string }> }): Promise<Response> {
  try { await requireAdmin(); } catch (e) {
    const err = e as Error & { status?: number };
    return NextResponse.json({ error: err.message }, { status: err.status ?? 401 });
  }
  const { id } = await ctx.params;
  const outcome = await cancelBooking(id);
  if (outcome.kind === "not_found") return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (outcome.kind === "already_cancelled") return NextResponse.json({ error: "Already cancelled" }, { status: 409 });
  return NextResponse.json({ ok: true });
}
