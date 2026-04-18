import { NextResponse } from "next/server";
import { z } from "zod";
import { requireAdmin } from "@/lib/auth/adminSession";
import { getSettings, updateSettings, regenerateIcsFeedSecret } from "@/lib/firestore/settings";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const hhmmSchema = z.string().regex(/^\d{2}:\d{2}$/);
const hoursRangeOrNull = z
  .object({ start: hhmmSchema, end: hhmmSchema })
  .nullable();

const patchSchema = z.object({
  contactLinks: z
    .object({
      zoom: z.string().trim(),
      meet: z.string().trim(),
      teams: z.string().trim(),
      whatsappNumber: z.string().trim(),
    })
    .optional(),
  rules: z
    .object({
      minNoticeHours: z.number().int().min(0).max(168),
      maxLookaheadDays: z.number().int().min(1).max(180),
      slotDurationMinutes: z.literal(30),
    })
    .optional(),
  defaultHours: z
    .object({
      mon: hoursRangeOrNull,
      tue: hoursRangeOrNull,
      wed: hoursRangeOrNull,
      thu: hoursRangeOrNull,
      fri: hoursRangeOrNull,
      sat: hoursRangeOrNull,
      sun: hoursRangeOrNull,
    })
    .optional(),
  ownerTimezone: z.string().min(1).optional(),
  regenerateIcsFeedSecret: z.literal(true).optional(),
});

export async function GET(): Promise<Response> {
  try {
    await requireAdmin();
  } catch (err) {
    const e = err as Error & { status?: number };
    return NextResponse.json({ error: e.message }, { status: e.status ?? 401 });
  }
  const settings = await getSettings();
  return NextResponse.json(settings);
}

export async function PATCH(req: Request): Promise<Response> {
  try {
    await requireAdmin();
  } catch (err) {
    const e = err as Error & { status?: number };
    return NextResponse.json({ error: e.message }, { status: e.status ?? 401 });
  }
  let json: unknown;
  try { json = await req.json(); } catch { return NextResponse.json({ error: "Invalid JSON" }, { status: 400 }); }
  const parsed = patchSchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid input", details: parsed.error.flatten() }, { status: 400 });
  }

  // Separate side-channel: regenerate feed secret before applying other fields.
  if (parsed.data.regenerateIcsFeedSecret) {
    await regenerateIcsFeedSecret();
  }

  const { regenerateIcsFeedSecret: _discard, ...fieldPatch } = parsed.data;
  void _discard;
  // Only call updateSettings if there are real fields to patch.
  if (Object.keys(fieldPatch).length > 0) {
    await updateSettings(fieldPatch);
  }
  const updated = await getSettings();
  return NextResponse.json(updated);
}
