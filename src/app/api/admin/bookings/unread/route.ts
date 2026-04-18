import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { requireAdmin } from "@/lib/auth/adminSession";
import { firestoreAdmin } from "@/lib/firebase/admin";
import { Timestamp } from "firebase-admin/firestore";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const COOKIE = "sc_admin_last_bookings_view";

export async function GET(): Promise<Response> {
  try { await requireAdmin(); } catch (e) {
    const err = e as Error & { status?: number };
    return NextResponse.json({ error: err.message }, { status: err.status ?? 401 });
  }
  const jar = await cookies();
  const raw = jar.get(COOKIE)?.value;
  const since = raw ? new Date(raw) : new Date(0);
  const snap = await firestoreAdmin()
    .collection("bookings")
    .where("createdAt", ">", Timestamp.fromDate(since))
    .get();
  // Exclude cancelled bookings so spam/test bookings that were immediately
  // cancelled don't inflate the badge. In-memory filter avoids a composite
  // index on (createdAt, status).
  const count = snap.docs.filter((d) => {
    const data = d.data() as { status?: string };
    return data.status === "confirmed";
  }).length;
  return NextResponse.json({ count });
}

export async function POST(): Promise<Response> {
  try { await requireAdmin(); } catch (e) {
    const err = e as Error & { status?: number };
    return NextResponse.json({ error: err.message }, { status: err.status ?? 401 });
  }
  const jar = await cookies();
  jar.set(COOKIE, new Date().toISOString(), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 30 * 24 * 60 * 60,
  });
  return NextResponse.json({ ok: true });
}
