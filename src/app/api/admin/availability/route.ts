import { NextResponse } from "next/server";
import { z } from "zod";
import { requireAdmin } from "@/lib/auth/adminSession";
import { addException, listExceptionsForAdmin } from "@/lib/firestore/availability";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const querySchema = z.object({
  from: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  to: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
});

const hhmm = z.string().regex(/^\d{2}:\d{2}$/);

const createSchema = z.object({
  type: z.enum(["block", "extra"]),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  startTime: hhmm.optional(),
  endTime: hhmm.optional(),
  note: z.string().max(200).optional(),
}).refine(
  (d) => d.type !== "extra" || (!!d.startTime && !!d.endTime),
  { path: ["startTime"], message: "Extra windows require startTime + endTime" }
);

export async function GET(req: Request): Promise<Response> {
  try { await requireAdmin(); } catch (e) {
    const err = e as Error & { status?: number };
    return NextResponse.json({ error: err.message }, { status: err.status ?? 401 });
  }
  const url = new URL(req.url);
  const parsed = querySchema.safeParse({ from: url.searchParams.get("from") ?? "", to: url.searchParams.get("to") ?? "" });
  if (!parsed.success) return NextResponse.json({ error: "Invalid query" }, { status: 400 });
  const exceptions = await listExceptionsForAdmin(parsed.data.from, parsed.data.to);
  return NextResponse.json({ exceptions });
}

export async function POST(req: Request): Promise<Response> {
  try { await requireAdmin(); } catch (e) {
    const err = e as Error & { status?: number };
    return NextResponse.json({ error: err.message }, { status: err.status ?? 401 });
  }
  let json: unknown;
  try { json = await req.json(); } catch { return NextResponse.json({ error: "Invalid JSON" }, { status: 400 }); }
  const parsed = createSchema.safeParse(json);
  if (!parsed.success) return NextResponse.json({ error: "Invalid input", details: parsed.error.flatten() }, { status: 400 });
  const id = await addException(parsed.data);
  return NextResponse.json({ ok: true, id });
}
