import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth/adminSession";
import { resendClient, fromAddress } from "@/lib/email/resend";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// Parse the from address (e.g. 'Softchain <info@softchain.ae>' or plain email)
// to the domain part so we can match against the Resend domains list.
function domainFromAddress(addr: string): string | null {
  const match = addr.match(/<?([^\s<>@]+@([^\s<>]+))>?/);
  if (!match) return null;
  return match[2] ?? null;
}

export async function GET(): Promise<Response> {
  try {
    await requireAdmin();
  } catch (e) {
    const err = e as Error & { status?: number };
    return NextResponse.json({ error: err.message }, { status: err.status ?? 401 });
  }

  const target = domainFromAddress(fromAddress());
  if (!target) {
    return NextResponse.json({ domain: null, status: "unknown", reason: "RESEND_FROM not parseable" });
  }

  try {
    const { data, error } = await resendClient().domains.list();
    if (error) {
      return NextResponse.json({ domain: target, status: "unknown", reason: error.message });
    }
    const list = data?.data ?? [];
    const match = list.find((d) => d.name.toLowerCase() === target.toLowerCase());
    if (!match) {
      return NextResponse.json({ domain: target, status: "not_found" });
    }
    return NextResponse.json({ domain: target, status: match.status });
  } catch (err) {
    return NextResponse.json(
      { domain: target, status: "unknown", reason: (err as Error).message },
      { status: 200 }
    );
  }
}
