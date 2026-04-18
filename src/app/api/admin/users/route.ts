import { NextResponse } from "next/server";
import { z } from "zod";
import { requireAdmin, requireOwner } from "@/lib/auth/adminSession";
import { getSettings, addAdmin, removeAdmin } from "@/lib/firestore/settings";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const emailSchema = z.string().email().max(254).transform((s) => s.toLowerCase().trim());

export async function GET(): Promise<Response> {
  try {
    await requireAdmin();
  } catch (err) {
    const e = err as Error & { status?: number };
    return NextResponse.json({ error: e.message }, { status: e.status ?? 401 });
  }
  const settings = await getSettings();
  return NextResponse.json({
    ownerEmail: settings.ownerEmail,
    admins: settings.admins ?? [],
  });
}

const addSchema = z.object({ email: emailSchema });

export async function POST(req: Request): Promise<Response> {
  try {
    await requireOwner();
  } catch (err) {
    const e = err as Error & { status?: number };
    return NextResponse.json({ error: e.message }, { status: e.status ?? 401 });
  }
  let json: unknown;
  try {
    json = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }
  const parsed = addSchema.safeParse(json);
  if (!parsed.success) return NextResponse.json({ error: "Invalid email" }, { status: 400 });

  const settings = await getSettings();
  if (parsed.data.email === settings.ownerEmail.toLowerCase()) {
    return NextResponse.json({ error: "Owner is already admin implicitly" }, { status: 409 });
  }
  await addAdmin(parsed.data.email);
  const updated = await getSettings();
  return NextResponse.json({ ownerEmail: updated.ownerEmail, admins: updated.admins ?? [] });
}

const removeSchema = z.object({ email: emailSchema });

export async function DELETE(req: Request): Promise<Response> {
  try {
    await requireOwner();
  } catch (err) {
    const e = err as Error & { status?: number };
    return NextResponse.json({ error: e.message }, { status: e.status ?? 401 });
  }
  let json: unknown;
  try {
    json = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }
  const parsed = removeSchema.safeParse(json);
  if (!parsed.success) return NextResponse.json({ error: "Invalid email" }, { status: 400 });

  try {
    await removeAdmin(parsed.data.email);
  } catch (err) {
    const e = err as Error & { status?: number };
    return NextResponse.json({ error: e.message }, { status: e.status ?? 403 });
  }
  const updated = await getSettings();
  return NextResponse.json({ ownerEmail: updated.ownerEmail, admins: updated.admins ?? [] });
}
