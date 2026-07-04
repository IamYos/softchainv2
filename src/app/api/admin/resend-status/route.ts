import { resolveTxt } from "node:dns/promises";
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

// The Resend API key may be restricted to sending only, in which case
// domains.list() 401s. Fall back to checking the domain's Resend DKIM
// record in DNS — if it exists, the domain was set up for sending.
async function dnsDkimConfigured(domain: string): Promise<boolean> {
  try {
    const records = await resolveTxt(`resend._domainkey.${domain}`);
    return records.flat().join("").includes("p=");
  } catch {
    return false;
  }
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
      if (await dnsDkimConfigured(target)) {
        return NextResponse.json({ domain: target, status: "verified_dns", reason: error.message });
      }
      return NextResponse.json({ domain: target, status: "unknown", reason: error.message });
    }
    const list = data?.data ?? [];
    const match = list.find((d) => d.name.toLowerCase() === target.toLowerCase());
    if (!match) {
      return NextResponse.json({ domain: target, status: "not_found" });
    }
    return NextResponse.json({ domain: target, status: match.status });
  } catch (err) {
    if (await dnsDkimConfigured(target)) {
      return NextResponse.json({ domain: target, status: "verified_dns", reason: (err as Error).message });
    }
    return NextResponse.json(
      { domain: target, status: "unknown", reason: (err as Error).message },
      { status: 200 }
    );
  }
}
