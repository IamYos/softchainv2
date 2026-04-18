import { NextResponse } from "next/server";
import { z } from "zod";
import { requireAdmin } from "@/lib/auth/adminSession";
import { updateBookingAdminFields, getBookingById } from "@/lib/firestore/bookings";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const patchSchema = z.object({
  adminNotes: z.string().max(2000).nullable().optional(),
  noShow: z.boolean().optional(),
});

export async function PATCH(req: Request, ctx: { params: Promise<{ id: string }> }): Promise<Response> {
  try { await requireAdmin(); } catch (e) {
    const err = e as Error & { status?: number };
    return NextResponse.json({ error: err.message }, { status: err.status ?? 401 });
  }
  const { id } = await ctx.params;
  let json: unknown;
  try { json = await req.json(); } catch { return NextResponse.json({ error: "Invalid JSON" }, { status: 400 }); }
  const parsed = patchSchema.safeParse(json);
  if (!parsed.success) return NextResponse.json({ error: "Invalid input" }, { status: 400 });
  const existing = await getBookingById(id);
  if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });
  await updateBookingAdminFields(id, parsed.data);
  return NextResponse.json({ ok: true });
}
