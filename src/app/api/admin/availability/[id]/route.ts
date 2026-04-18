import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth/adminSession";
import { deleteExceptionById } from "@/lib/firestore/availability";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function DELETE(_req: Request, ctx: { params: Promise<{ id: string }> }): Promise<Response> {
  try { await requireAdmin(); } catch (e) {
    const err = e as Error & { status?: number };
    return NextResponse.json({ error: err.message }, { status: err.status ?? 401 });
  }
  const { id } = await ctx.params;
  await deleteExceptionById(id);
  return NextResponse.json({ ok: true });
}
