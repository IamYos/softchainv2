import { NextResponse } from "next/server";
import { z } from "zod";
import { createSession, SESSION_COOKIE_NAME, SESSION_EXPIRES_MS } from "@/lib/auth/adminSession";
import { cookies } from "next/headers";
import { checkRateLimit } from "@/lib/ratelimit";
import { extractIp } from "@/lib/http/ip";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const createSchema = z.object({ idToken: z.string().min(100) });

const LOGIN_MAX = 10;
const LOGIN_WINDOW_MS = 10 * 60 * 1000;

export async function POST(req: Request): Promise<Response> {
  const ip = extractIp(req);
  const rl = checkRateLimit(`admin-login:${ip}`, LOGIN_MAX, LOGIN_WINDOW_MS);
  if (!rl.allowed) {
    return NextResponse.json(
      { error: "Too many sign-in attempts. Try again in a few minutes." },
      {
        status: 429,
        headers: { "Retry-After": Math.ceil(rl.retryAfterMs / 1000).toString() },
      }
    );
  }

  let json: unknown;
  try {
    json = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }
  const parsed = createSchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid input" }, { status: 400 });
  }

  try {
    const { cookie } = await createSession(parsed.data.idToken);
    const jar = await cookies();
    jar.set(SESSION_COOKIE_NAME, cookie, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: Math.floor(SESSION_EXPIRES_MS / 1000),
    });
    return NextResponse.json({ ok: true });
  } catch (err) {
    const e = err as Error & { status?: number };
    return NextResponse.json(
      { error: e.message ?? "Failed to create session" },
      { status: e.status ?? 401 }
    );
  }
}

export async function DELETE(): Promise<Response> {
  const jar = await cookies();
  jar.delete(SESSION_COOKIE_NAME);
  return NextResponse.json({ ok: true });
}
