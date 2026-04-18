#!/usr/bin/env bash
set -euo pipefail

# Phase 2 end-to-end smoke.
# Preconditions:
#   1. `.env.local` has Cloudflare Turnstile ALWAYS-PASS TEST KEYS temporarily:
#        NEXT_PUBLIC_TURNSTILE_SITE_KEY=1x00000000000000000000AA
#        TURNSTILE_SECRET_KEY=1x0000000000000000000000000000000AA
#      (revert to real keys after testing).
#   2. `bun run dev` is running in another terminal.
#   3. `settings/config.contactLinks.meet` has a valid Google Meet URL.

BASE_URL="${BASE_URL:-http://localhost:3000}"

echo "=== 1. GET /api/slots ==="
FROM=$(date -v+7d '+%Y-%m-%d' 2>/dev/null || date -d '+7 days' '+%Y-%m-%d')
TO=$(date -v+10d '+%Y-%m-%d' 2>/dev/null || date -d '+10 days' '+%Y-%m-%d')

SLOTS_RES=$(curl -sf "$BASE_URL/api/slots?from=$FROM&to=$TO&tz=Asia/Dubai")
echo "$SLOTS_RES" | head -c 200
echo "..."

FIRST_SLOT=$(echo "$SLOTS_RES" | sed -n 's/.*"startUtc":"\([^"]*\)".*/\1/p' | head -n 1)
if [[ -z "$FIRST_SLOT" ]]; then
  echo "No slots available in the next few days. Add availability or adjust the date range."
  exit 1
fi
echo "First available slot (UTC): $FIRST_SLOT"

echo ""
echo "=== 2. POST /api/bookings/create ==="
TEST_EMAIL="smoke-test-$(date +%s)@softchain.ae"
BOOK_RES=$(curl -sf -X POST "$BASE_URL/api/bookings/create" \
  -H 'Content-Type: application/json' \
  -d "{
    \"visitorName\": \"Smoke Test\",
    \"visitorEmail\": \"$TEST_EMAIL\",
    \"visitorCompany\": null,
    \"topic\": \"Phase 2 smoke test booking, please ignore.\",
    \"contactMethod\": \"meet\",
    \"visitorPhone\": null,
    \"visitorTimezone\": \"Asia/Dubai\",
    \"startAtIso\": \"$FIRST_SLOT\",
    \"turnstileToken\": \"XXXX.DUMMY.TOKEN.XXXX\",
    \"honeypot\": \"\"
  }")
echo "$BOOK_RES"

BOOKING_ID=$(echo "$BOOK_RES" | sed -n 's/.*"bookingId":"\([^"]*\)".*/\1/p')
if [[ -z "$BOOKING_ID" ]]; then
  echo "No bookingId returned. Check response above."
  exit 1
fi
echo "Booking created: $BOOKING_ID"

echo ""
echo "=== 3. Verify one-per-visitor — booking again with same email should 409 ==="
BOOK_AGAIN=$(curl -s -o /dev/null -w "%{http_code}" -X POST "$BASE_URL/api/bookings/create" \
  -H 'Content-Type: application/json' \
  -d "{
    \"visitorName\": \"Smoke Test\",
    \"visitorEmail\": \"$TEST_EMAIL\",
    \"visitorCompany\": null,
    \"topic\": \"Second attempt, should be rejected.\",
    \"contactMethod\": \"meet\",
    \"visitorPhone\": null,
    \"visitorTimezone\": \"Asia/Dubai\",
    \"startAtIso\": \"$FIRST_SLOT\",
    \"turnstileToken\": \"XXXX.DUMMY.TOKEN.XXXX\",
    \"honeypot\": \"\"
  }")
if [[ "$BOOK_AGAIN" != "409" ]]; then
  echo "Expected 409 for duplicate booking, got $BOOK_AGAIN"
  exit 1
fi
echo "OK: duplicate booking rejected with 409"

echo ""
echo "=== 4. Cleanup note ==="
echo "Booking ID $BOOKING_ID is live in Firestore. Delete manually via Firebase console if desired."
echo "Check your inbox for the confirmation email (visitor copy) and info@softchain.ae's inbox (admin copy)."
echo ""
echo "Phase 2 smoke complete."
