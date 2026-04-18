/**
 * Phase 5 smoke: reschedule + cancel round-trip via visitor tokens.
 *
 * Requires a live, future-dated, confirmed booking. Pass its tokens and
 * a candidate new slot via args or env:
 *   - RESCHEDULE_TOKEN: the booking's rescheduleToken (64-char hex)
 *   - CANCEL_TOKEN: the booking's cancelToken (64-char hex)
 *   - NEW_START_AT_ISO: UTC ISO timestamp of a free, 30-min-aligned future slot
 *   - SITE_URL: defaults to http://localhost:3000
 *
 * Usage:
 *   RESCHEDULE_TOKEN=... CANCEL_TOKEN=... NEW_START_AT_ISO=... \
 *     bun --env-file=.env.local scripts/smoke-phase5.ts
 *
 * NOTE: this actually mutates the booking and sends real emails. Use a test
 * booking. The script reschedules first, then cancels — leaving the booking
 * cancelled at the end.
 */

const SITE = process.env.SITE_URL ?? "http://localhost:3000";
const rescheduleToken = process.env.RESCHEDULE_TOKEN;
const cancelToken = process.env.CANCEL_TOKEN;
const newStartAtIso = process.env.NEW_START_AT_ISO;

async function main() {
  if (!rescheduleToken || !cancelToken || !newStartAtIso) {
    throw new Error(
      "Missing RESCHEDULE_TOKEN / CANCEL_TOKEN / NEW_START_AT_ISO env vars. " +
        "Get them from a test booking's /api/bookings/create response or the admin UI."
    );
  }

  console.log("1. Reschedule via visitor token →", newStartAtIso);
  const rRes = await fetch(`${SITE}/api/bookings/reschedule`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ token: rescheduleToken, newStartAtIso }),
  });
  console.log("   HTTP", rRes.status);
  const rBody = await rRes.json();
  console.log("   body:", rBody);
  if (!rRes.ok) throw new Error(`reschedule failed: ${JSON.stringify(rBody)}`);

  console.log("2. Cancel via visitor token");
  const cRes = await fetch(`${SITE}/api/bookings/cancel`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ token: cancelToken }),
  });
  console.log("   HTTP", cRes.status);
  const cBody = await cRes.json();
  console.log("   body:", cBody);
  if (!cRes.ok) throw new Error(`cancel failed: ${JSON.stringify(cBody)}`);

  console.log("\nPhase 5 smoke passed. Check your inbox for reschedule + cancel emails.");
}

main().catch((err) => {
  console.error("SMOKE FAILED:", err.message);
  process.exit(1);
});
